import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import Base, engine, SessionLocal
from app.models.schema import Merchant, Issue, Action
from app.services.synthetic_data import seed_synthetic_merchant_data
from app.services.detection import DetectionEngine
from app.services.reasoning import ReasoningEngine
from app.services.action_planner import ActionPlanner

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_test_data():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        merchant = db.query(Merchant).first()
        if not merchant:
            m_id = seed_synthetic_merchant_data(db)
        else:
            m_id = merchant.id

        signals = DetectionEngine.run_detection_pipeline(db, m_id)
        issues = ReasoningEngine.reason_over_signals(db, m_id, signals)
        ActionPlanner.plan_actions_for_issues(db, m_id, issues)
    finally:
        db.close()
    yield

def test_api_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["system"] == "MitraOS"

def test_morning_brief_endpoint():
    response = client.get("/api/v1/morning-brief")
    assert response.status_code == 200
    data = response.json()
    assert "yesterday_summary" in data
    assert "risk_counts" in data
    assert "active_issues" in data
    assert len(data["active_issues"]) > 0

def test_issues_and_underlying_data():
    brief_resp = client.get("/api/v1/morning-brief")
    issues = brief_resp.json()["active_issues"]
    assert len(issues) > 0

    first_issue = issues[0]
    issue_id = first_issue["id"]

    detail_resp = client.get(f"/api/v1/issues/{issue_id}")
    assert detail_resp.status_code == 200
    detail = detail_resp.json()
    assert detail["id"] == issue_id
    assert "root_cause_chain" in detail

    chart_resp = client.get(f"/api/v1/issues/{issue_id}/underlying-data")
    assert chart_resp.status_code == 200
    chart_data = chart_resp.json()
    assert "type" in chart_data

def test_metrics_summary():
    response = client.get("/api/v1/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "summary" in data
    assert "revenue_at_risk_paise" in data["summary"]
    assert "detection_accuracy_pct" in data["summary"]

def test_conversational_chat():
    response = client.post("/api/v1/chat", json={"message": "Handle the payment issue"})
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert data["structured_plan"] is not None
    assert data["structured_plan"]["action_type"] == "retry_payment"

def test_action_execution_flow():
    brief_resp = client.get("/api/v1/morning-brief")
    active_issues = brief_resp.json()["active_issues"]
    assert len(active_issues) > 0

    action_id = active_issues[0]["action"]["id"]
    approve_resp = client.post(f"/api/v1/actions/{action_id}/approve", json={})
    assert approve_resp.status_code == 200
    result = approve_resp.json()
    assert result["status"] == "completed"
    assert "amount_recovered_paise" in result["result"]
