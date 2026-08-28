import uuid
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Dict, Any
from app.core.database import get_db, Base, engine
from app.models.schema import (
    Merchant, Product, Customer, Order, Payment, Issue, Action,
    Signal, AuditLog, WebhookEvent, GroundTruthLabel, User, Policy
)
from app.services.synthetic_data import seed_synthetic_merchant_data
from app.services.detection import DetectionEngine
from app.services.reasoning import ReasoningEngine
from app.services.action_planner import ActionPlanner
from app.core.websockets import manager

router = APIRouter(prefix="/simulator", tags=["simulator"])

class InjectAnomalyRequest(BaseModel):
    anomaly_type: str
    parameters: Optional[Dict[str, Any]] = None

@router.post("/inject-anomaly")
async def inject_live_anomaly(req: InjectAnomalyRequest, db: Session = Depends(get_db)):
    merchant = db.query(Merchant).first()
    if not merchant:
        raise HTTPException(status_code=404, detail="No merchant found")

    m_id = merchant.id
    now = datetime.now(timezone.utc)
    date_str = now.strftime("%Y%m%d%H%M%S")

    if req.anomaly_type == "payment_failure_wave":
        prod = merchant.products[0] if merchant.products else None
        cust = merchant.customers[0] if merchant.customers else None

        for i in range(15):
            o_id = str(uuid.uuid4())
            order = Order(
                id=o_id,
                merchant_id=m_id,
                customer_id=cust.id if cust else str(uuid.uuid4()),
                product_id=prod.id if prod else str(uuid.uuid4()),
                quantity=1,
                amount_paise=189900,
                status="failed",
                created_at=now
            )
            db.add(order)

            payment = Payment(
                id=str(uuid.uuid4()),
                order_id=o_id,
                razorpay_payment_id=f"pay_sim_{uuid.uuid4().hex[:8]}",
                method="card",
                status="failed",
                failure_reason="CARD_NETWORK_OUTAGE_VISA_AUTH_REJECT",
                gateway_response_code="GATEWAY_REJECT_CARD_NETWORK",
                created_at=now
            )
            db.add(payment)
        db.commit()

        fingerprint = f"sig_pay_fail_card_wave_{m_id}_{date_str}"
        signal = Signal(
            id=str(uuid.uuid4()),
            merchant_id=m_id,
            signal_type="payment_failure_spike",
            dimensions={
                "payment_method": "Card",
                "time_window": "Live Injected Spike",
                "total_transactions": 18,
                "failed_transactions": 15,
                "primary_error_code": "GATEWAY_REJECT_CARD_NETWORK",
                "estimated_impact_paise": 2848500
            },
            baseline_value=0.045,
            observed_value=0.833,
            confidence=0.9850,
            fingerprint=fingerprint,
            detected_at=now
        )
        db.add(signal)
        db.commit()

        issues = ReasoningEngine.reason_over_signals(db, m_id, [signal])
        ActionPlanner.plan_actions_for_issues(db, m_id, issues)

        await manager.broadcast("NEW_ANOMALY_DETECTED", {
            "anomaly_type": "Card Payment Outage Wave",
            "message": "Live Anomaly Injected: 15 Card transactions failed due to Visa network rejection. Autonomous issue drafted!"
        })

        return {
            "status": "injected",
            "anomaly": "Card Payment Failure Wave",
            "failed_count": 15,
            "signal_id": signal.id,
            "issues_created": len(issues)
        }

    elif req.anomaly_type == "inventory_stockout":
        prod = db.query(Product).filter(Product.sku == "PLN-FLF-02").first()
        if prod:
            prod.current_stock = 3
            db.commit()

        signals = DetectionEngine.run_detection_pipeline(db, m_id)
        issues = ReasoningEngine.reason_over_signals(db, m_id, signals)
        ActionPlanner.plan_actions_for_issues(db, m_id, issues)

        await manager.broadcast("NEW_ANOMALY_DETECTED", {
            "anomaly_type": "Fiddle Leaf Fig Stock Depletion",
            "message": "Live Anomaly Injected: Stock dropped to 3 units. Purchase order draft generated!"
        })

        return {
            "status": "injected",
            "anomaly": "Fiddle Leaf Fig Stockout Risk",
            "stock_remaining": 3
        }

    return {"status": "unknown_anomaly_type"}

@router.post("/reset")
def reset_database_and_seed(db: Session = Depends(get_db)):
    """
    Clears current tables and regenerates synthetic dataset and ground truth.
    """
    db.query(GroundTruthLabel).delete()
    db.query(AuditLog).delete()
    db.query(WebhookEvent).delete()
    db.query(Action).delete()
    db.query(Issue).delete()
    db.query(Signal).delete()
    db.query(Payment).delete()
    db.query(Order).delete()
    db.query(Customer).delete()
    db.query(Product).delete()
    db.query(Policy).delete()
    db.query(User).delete()
    db.query(Merchant).delete()
    db.commit()

    merchant_id = seed_synthetic_merchant_data(db)
    signals = DetectionEngine.run_detection_pipeline(db, merchant_id)
    issues = ReasoningEngine.reason_over_signals(db, merchant_id, signals)
    actions = ActionPlanner.plan_actions_for_issues(db, merchant_id, issues)

    return {
        "status": "reset_successful",
        "merchant_id": merchant_id,
        "signals_count": len(signals),
        "issues_count": len(issues),
        "actions_count": len(actions)
    }

@router.post("/run-pipeline")
def run_pipeline_manual(db: Session = Depends(get_db)):
    merchant = db.query(Merchant).first()
    if not merchant:
        seed_synthetic_merchant_data(db)
        merchant = db.query(Merchant).first()

    signals = DetectionEngine.run_detection_pipeline(db, merchant.id)
    issues = ReasoningEngine.reason_over_signals(db, merchant.id, signals)
    actions = ActionPlanner.plan_actions_for_issues(db, merchant.id, issues)

    return {
        "status": "pipeline_completed",
        "signals": len(signals),
        "issues": len(issues),
        "actions": len(actions)
    }
