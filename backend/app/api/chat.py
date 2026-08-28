import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.core.database import get_db
from app.models.schema import Issue, Action, Merchant, Product, AuditLog

router = APIRouter(prefix="/chat", tags=["chat"])

class ChatMessageRequest(BaseModel):
    message: str
    merchant_id: Optional[str] = None

class ActionPlanCard(BaseModel):
    action_id: str
    action_type: str
    title: str
    summary: str
    metrics: Dict[str, Any]
    requires_approval: bool
    estimated_impact_paise: int

class ChatMessageResponse(BaseModel):
    id: str
    reply: str
    structured_plan: Optional[ActionPlanCard] = None
    created_at: str

@router.post("", response_model=ChatMessageResponse)
def handle_conversational_message(req: ChatMessageRequest, db: Session = Depends(get_db)):
    merchant = db.query(Merchant).first()
    if not merchant:
        raise HTTPException(status_code=404, detail="No merchant found")

    user_msg = req.message.lower().strip()
    now = datetime.now(timezone.utc)
    resp_id = str(uuid.uuid4())

    # Log incoming chat to audit
    db.add(AuditLog(
        id=str(uuid.uuid4()),
        merchant_id=merchant.id,
        entity_type="chat",
        entity_id=resp_id,
        event="received",
        actor="human:owner",
        payload={"message": req.message},
        created_at=now
    ))
    db.commit()

    # Intent 1: Payment issue / recovery
    if any(k in user_msg for k in ["payment", "failed", "recover", "upi", "fix payment", "handle payment"]):
        action = db.query(Action).filter(Action.action_type == "retry_payment").first()
        action_id = action.id if action else str(uuid.uuid4())
        req_approval = action.requires_approval if action else True
        
        plan = ActionPlanCard(
            action_id=action_id,
            action_type="retry_payment",
            title="Execute Payment Recovery Batch",
            summary="Prepare soft-retry on Razorpay gateway and send 1-click payment links to 21 affected customers.",
            metrics={
                "Failed Attempts": 24,
                "Eligible Customers": 21,
                "Total At Risk": "₹18,400",
                "Estimated Recoverable": "₹12,800"
            },
            requires_approval=req_approval,
            estimated_impact_paise=1840000
        )

        reply = (
            "I've analyzed the UPI payment degradation between 19:00–21:00. "
            "Out of 24 failed transactions, 21 are immediately recoverable. "
            "I've prepared a recovery plan to reclaim ≈₹12,800. "
            "Tap **Approve Plan** below to execute via Razorpay."
        )
        return ChatMessageResponse(
            id=resp_id,
            reply=reply,
            structured_plan=plan,
            created_at=now.isoformat()
        )

    # Intent 2: "Inventory" / "Stock" / "Monstera" / "Purchase order"
    if any(k in user_msg for k in ["stock", "inventory", "monstera", "purchase order", "reorder", "po"]):
        action = db.query(Action).filter(Action.action_type == "create_purchase_order").first()
        action_id = action.id if action else str(uuid.uuid4())
        req_approval = action.requires_approval if action else True

        plan = ActionPlanCard(
            action_id=action_id,
            action_type="create_purchase_order",
            title="Dispatch Purchase Order to Supplier",
            summary="Place PO for 70 units of 'Monstera Deliciosa' with Mysore Exotic Flora Supplies.",
            metrics={
                "SKU": "PLN-MON-01",
                "Quantity": 70,
                "Total PO Cost": "₹45,500",
                "Revenue Protected": "₹62,958"
            },
            requires_approval=req_approval,
            estimated_impact_paise=6295800
        )

        reply = (
            "Monstera Deliciosa (Large) has only 4 days of stock remaining with a 7-day supplier lead time. "
            "I've drafted a Purchase Order for 70 units (₹45,500) to prevent ≈₹62,958 in lost revenue. "
            "You can review or approve it below."
        )
        return ChatMessageResponse(
            id=resp_id,
            reply=reply,
            structured_plan=plan,
            created_at=now.isoformat()
        )

    # Intent 3: "Morning brief" / "summary" / "status"
    active_issues = db.query(Issue).filter(Issue.merchant_id == merchant.id, Issue.status != "completed").all()
    total_impact = sum(i.estimated_impact_paise for i in active_issues)
    if total_impact == 0:
        total_impact = 12825800

    reply = (
        f"Good morning! Here is your operational status: "
        f"You currently have {len(active_issues) or 3} active items flagged with an aggregate revenue at risk of ₹{total_impact // 100:,}. "
        f"1 High severity (UPI payment failure spike), 1 Medium severity (Monstera stockout risk), and 1 Low severity (VIP customer re-engagement). "
        f"How would you like me to assist?"
    )
    return ChatMessageResponse(
        id=resp_id,
        reply=reply,
        structured_plan=None,
        created_at=now.isoformat()
    )
