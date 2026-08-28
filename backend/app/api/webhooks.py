import uuid
import json
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Request, Header, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.schema import WebhookEvent, Payment, Order, Merchant, AuditLog
from app.services.razorpay_service import RazorpayService
from app.services.detection import DetectionEngine
from app.services.reasoning import ReasoningEngine
from app.services.action_planner import ActionPlanner
from app.core.websockets import manager

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/webhooks", tags=["webhooks"])

@router.post("/razorpay")
async def handle_razorpay_webhook(
    request: Request,
    x_razorpay_signature: str = Header(None),
    db: Session = Depends(get_db)
):
    raw_body = await request.body()
    now = datetime.now(timezone.utc)

    # 1. Verify signature
    is_valid = RazorpayService.verify_webhook_signature(raw_body, x_razorpay_signature or "")
    
    try:
        payload = json.loads(raw_body.decode("utf-8"))
    except Exception:
        payload = {"raw": raw_body.decode("utf-8", errors="ignore")}

    event_type = payload.get("event", "payment.failed")
    
    merchant = db.query(Merchant).first()
    m_id = merchant.id if merchant else "default"

    # 2. Record raw webhook in WebhookEvents table
    webhook_event = WebhookEvent(
        id=str(uuid.uuid4()),
        merchant_id=m_id,
        provider="razorpay",
        event_type=event_type,
        signature_verified=is_valid,
        payload=payload,
        processed=False,
        received_at=now
    )
    db.add(webhook_event)
    db.commit()

    # 3. Normalize into Payment / Order records if payload matches Razorpay schema
    payment_entity = payload.get("payload", {}).get("payment", {}).get("entity", {})
    if payment_entity:
        rzp_pay_id = payment_entity.get("id", f"pay_{uuid.uuid4().hex[:10]}")
        status = payment_entity.get("status", "failed")
        method = payment_entity.get("method", "UPI")
        amount = payment_entity.get("amount", 149900)
        err_reason = payment_entity.get("error_reason") or payment_entity.get("error_description")
        err_code = payment_entity.get("error_code")

        order_id = str(uuid.uuid4())
        new_order = Order(
            id=order_id,
            merchant_id=m_id,
            customer_id=db.query(Merchant).first().customers[0].id if db.query(Merchant).first().customers else str(uuid.uuid4()),
            product_id=db.query(Merchant).first().products[0].id if db.query(Merchant).first().products else str(uuid.uuid4()),
            quantity=1,
            amount_paise=amount,
            status="failed" if status == "failed" else "paid",
            created_at=now
        )
        db.add(new_order)

        new_pay = Payment(
            id=str(uuid.uuid4()),
            order_id=order_id,
            razorpay_payment_id=rzp_pay_id,
            method=method,
            status=status,
            failure_reason=err_reason,
            gateway_response_code=err_code,
            created_at=now
        )
        db.add(new_pay)
        webhook_event.processed = True
        db.commit()

    # 4. Trigger anomaly detection & reasoning pipeline
    new_signals = DetectionEngine.run_detection_pipeline(db, m_id)
    if new_signals:
        new_issues = ReasoningEngine.reason_over_signals(db, m_id, new_signals)
        ActionPlanner.plan_actions_for_issues(db, m_id, new_issues)

        # Notify frontend in real-time
        await manager.broadcast("NEW_ANOMALY_DETECTED", {
            "event_type": event_type,
            "signals_count": len(new_signals),
            "message": f"Autonomous agent detected {len(new_signals)} operational anomaly signal(s) from incoming webhook event."
        })

    return {
        "status": "received",
        "event_id": webhook_event.id,
        "signature_verified": is_valid,
        "processed": webhook_event.processed
    }

@router.get("/events")
def list_webhook_events(limit: int = 20, db: Session = Depends(get_db)):
    events = db.query(WebhookEvent).order_by(WebhookEvent.received_at.desc()).limit(limit).all()
    return [
        {
            "id": e.id,
            "provider": e.provider,
            "event_type": e.event_type,
            "signature_verified": e.signature_verified,
            "processed": e.processed,
            "received_at": e.received_at.isoformat(),
            "payload": e.payload
        } for e in events
    ]
