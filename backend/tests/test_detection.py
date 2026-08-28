import pytest
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base
from app.models.schema import Merchant, Product, Customer, Order, Payment, Signal, Issue, Action, GroundTruthLabel
from app.services.synthetic_data import seed_synthetic_merchant_data
from app.services.detection import DetectionEngine
from app.services.reasoning import ReasoningEngine
from app.services.action_planner import ActionPlanner
from app.services.policy_engine import PolicyEngine

TEST_DB_URL = "sqlite:///./test_mitraos.db"
test_engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(scope="module")
def db_session():
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=test_engine)
        if os.path.exists("./test_mitraos.db"):
            try:
                os.remove("./test_mitraos.db")
            except Exception:
                pass

def test_synthetic_data_seeding(db_session):
    merchant_id = seed_synthetic_merchant_data(db_session)
    assert merchant_id is not None

    merchant = db_session.query(Merchant).filter(Merchant.id == merchant_id).first()
    assert merchant.name == "GreenLeaf Botanics & Nursery"

    products = db_session.query(Product).filter(Product.merchant_id == merchant_id).all()
    assert len(products) == 15

    customers = db_session.query(Customer).filter(Customer.merchant_id == merchant_id).all()
    assert len(customers) == 120

    orders = db_session.query(Order).filter(Order.merchant_id == merchant_id).all()
    assert len(orders) > 1000

    gt_labels = db_session.query(GroundTruthLabel).filter(GroundTruthLabel.merchant_id == merchant_id).all()
    assert len(gt_labels) == 3

def test_detection_layer_finds_anomalies(db_session):
    merchant = db_session.query(Merchant).first()
    signals = DetectionEngine.run_detection_pipeline(db_session, merchant.id)
    assert len(signals) >= 2

    signal_types = [s.signal_type for s in signals]
    assert "payment_failure_spike" in signal_types or "stock_depletion_risk" in signal_types

def test_reasoning_and_action_planning(db_session):
    merchant = db_session.query(Merchant).first()
    signals = db_session.query(Signal).filter(Signal.merchant_id == merchant.id).all()
    issues = ReasoningEngine.reason_over_signals(db_session, merchant.id, signals)
    assert len(issues) >= 2

    for issue in issues:
        assert issue.severity in ["high", "medium", "low"]
        assert len(issue.root_cause_chain) > 0
        assert issue.estimated_impact_paise > 0

    actions = ActionPlanner.plan_actions_for_issues(db_session, merchant.id, issues)
    assert len(actions) >= 2
    for act in actions:
        assert act.status == "proposed"
        assert act.requires_approval is True

def test_policy_engine_cooldown_and_spend(db_session):
    merchant = db_session.query(Merchant).first()
    eval_result = PolicyEngine.evaluate_action(
        db=db_session,
        merchant_id=merchant.id,
        action_type="retry_payment",
        parameters={"estimated_total_cost_paise": 0}
    )
    assert eval_result["is_allowed"] is True
    assert eval_result["requires_approval"] is True
