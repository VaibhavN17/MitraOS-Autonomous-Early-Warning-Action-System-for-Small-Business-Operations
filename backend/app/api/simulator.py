import uuid
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
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
    merchant_id: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None

@router.post("/inject-anomaly")
async def inject_live_anomaly(req: InjectAnomalyRequest, db: Session = Depends(get_db)):
    merchant = None
    if req.merchant_id:
        merchant = db.query(Merchant).filter(Merchant.id == req.merchant_id).first()
    if not merchant:
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
            "merchant_id": m_id,
            "merchant_name": merchant.name,
            "message": f"Live Anomaly Injected for {merchant.name}: 15 Card transactions failed. Autonomous issue drafted!"
        })

        return {
            "status": "anomaly_injected",
            "merchant_id": m_id,
            "anomaly_type": "payment_failure_wave",
            "signal_id": signal.id,
            "issues_created": len(issues)
        }

    elif req.anomaly_type == "inventory_stockout":
        target_prod = None
        if merchant.products:
            # find an item with stock > 10
            for p in merchant.products:
                if p.current_stock > 10:
                    target_prod = p
                    break
            if not target_prod:
                target_prod = merchant.products[0]

        if target_prod:
            target_prod.current_stock = 3
            db.commit()

        fingerprint = f"sig_stockout_{m_id}_{date_str}"
        prod_name = target_prod.name if target_prod else "Hero SKU"
        sku_code = target_prod.sku if target_prod else "SKU-HOT-01"

        signal = Signal(
            id=str(uuid.uuid4()),
            merchant_id=m_id,
            signal_type="stock_depletion_risk",
            dimensions={
                "product_id": target_prod.id if target_prod else str(uuid.uuid4()),
                "sku": sku_code,
                "product_name": prod_name,
                "current_stock": 3,
                "daily_burn_rate": 4.2,
                "days_until_stockout": 0.7,
                "lead_time_days": 7,
                "estimated_impact_paise": 4500000
            },
            baseline_value=30.0,
            observed_value=3.0,
            confidence=0.9900,
            fingerprint=fingerprint,
            detected_at=now
        )
        db.add(signal)
        db.commit()

        issues = ReasoningEngine.reason_over_signals(db, m_id, [signal])
        ActionPlanner.plan_actions_for_issues(db, m_id, issues)

        await manager.broadcast("NEW_ANOMALY_DETECTED", {
            "anomaly_type": "Critical Stockout Depletion",
            "merchant_id": m_id,
            "merchant_name": merchant.name,
            "message": f"Inventory Alert for {merchant.name}: '{prod_name}' depleted to 3 units. Supplier PO prepared!"
        })

        return {
            "status": "anomaly_injected",
            "merchant_id": m_id,
            "anomaly_type": "inventory_stockout",
            "signal_id": signal.id,
            "issues_created": len(issues)
        }

    else:
        raise HTTPException(status_code=400, detail=f"Unsupported anomaly_type: {req.anomaly_type}")

@router.post("/reset")
def reset_demo_data(db: Session = Depends(get_db)):
    """
    Resets the database and reseeds all 3 multi-tenant businesses.
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

    primary_id = seed_synthetic_merchant_data(db)
    
    # Count totals across all merchants
    signals_count = db.query(Signal).count()
    issues_count = db.query(Issue).count()
    actions_count = db.query(Action).count()

    return {
        "status": "reset_successful",
        "primary_merchant_id": primary_id,
        "signals_count": signals_count,
        "issues_count": issues_count,
        "actions_count": actions_count
    }

@router.post("/run-pipeline")
def run_pipeline_manual(merchant_id: Optional[str] = Query(None), db: Session = Depends(get_db)):
    merchants = []
    if merchant_id:
        m = db.query(Merchant).filter(Merchant.id == merchant_id).first()
        if m:
            merchants = [m]
    if not merchants:
        merchants = db.query(Merchant).all()

    total_signals = 0
    total_issues = 0
    total_actions = 0

    for m in merchants:
        signals = DetectionEngine.run_detection_pipeline(db, m.id)
        issues = ReasoningEngine.reason_over_signals(db, m.id, signals)
        actions = ActionPlanner.plan_actions_for_issues(db, m.id, issues)
        total_signals += len(signals)
        total_issues += len(issues)
        total_actions += len(actions)

    return {
        "status": "pipeline_completed",
        "merchants_processed": len(merchants),
        "signals": total_signals,
        "issues": total_issues,
        "actions": total_actions
    }
