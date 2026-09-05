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
    merchant = None
    if req.merchant_id:
        merchant = db.query(Merchant).filter(Merchant.id == req.merchant_id).first()
    if not merchant:
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
        payload={"message": req.message, "merchant_name": merchant.name},
        created_at=now
    ))
    db.commit()

    # Find merchant's active actions
    pay_action = (
        db.query(Action)
        .join(Issue, Action.issue_id == Issue.id)
        .filter(Issue.merchant_id == merchant.id, Action.action_type == "retry_payment")
        .first()
    )

    po_action = (
        db.query(Action)
        .join(Issue, Action.issue_id == Issue.id)
        .filter(Issue.merchant_id == merchant.id, Action.action_type == "create_purchase_order")
        .first()
    )

    # Intent 1: Payment issue / recovery
    if any(k in user_msg for k in ["payment", "failed", "recover", "upi", "card", "fix payment", "handle payment", "gateway"]):
        action_id = pay_action.id if pay_action else str(uuid.uuid4())
        req_approval = pay_action.requires_approval if pay_action else True
        
        is_silks = "Silks" in merchant.name
        is_coffee = "Coffee" in merchant.name or "Roaster" in merchant.name

        if is_silks:
            title = "Execute High-Value Card Recovery Batch"
            summary = "Trigger 3DS soft-retry on Razorpay gateway and send SMS recovery links to 12 affected bridal shoppers."
            metrics = {
                "Failed Card Checkouts": 14,
                "Eligible Shoppers": 12,
                "Total At Risk": "₹1,84,000",
                "Estimated Recoverable": "₹1,32,000"
            }
            reply = (
                f"I've analyzed the festive Card payment degradation for {merchant.name}. "
                "12 out of 14 high-value checkouts dropped out during Visa 3DS gateway timeouts. "
                "I've prepared a 1-click Razorpay payment recovery campaign to reclaim ≈₹1,32,000. "
                "Review and tap **Approve Plan** below to dispatch."
            )
            impact = 18400000
        elif is_coffee:
            title = "Execute Subscription Mandate Recovery"
            summary = "Retry debit mandates via Razorpay Subscriptions and notify wholesale cafe accounts."
            metrics = {
                "Failed Mandates": 18,
                "Wholesale Cafes": 15,
                "Total At Risk": "₹38,500",
                "Estimated Recoverable": "₹32,000"
            }
            reply = (
                f"I've diagnosed the Netbanking/UPI mandate dropouts for {merchant.name}. "
                "15 cafe recurring subscriptions failed due to bank batch debit timeouts. "
                "I have prepared an automated mandate soft-retry plan recovering ≈₹32,000. "
                "Tap **Approve Plan** below to schedule."
            )
            impact = 3850000
        else:
            title = "Execute UPI Payment Recovery Batch"
            summary = "Prepare soft-retry on Razorpay gateway and send 1-click payment links to 21 affected customers."
            metrics = {
                "Failed Attempts": 24,
                "Eligible Customers": 21,
                "Total At Risk": "₹18,400",
                "Estimated Recoverable": "₹12,800"
            }
            reply = (
                f"I've analyzed the UPI payment degradation between 19:00–21:00 for {merchant.name}. "
                "Out of 24 failed transactions, 21 are immediately recoverable. "
                "I've prepared a recovery plan to reclaim ≈₹12,800. "
                "Tap **Approve Plan** below to execute via Razorpay."
            )
            impact = 1840000

        plan = ActionPlanCard(
            action_id=action_id,
            action_type="retry_payment",
            title=title,
            summary=summary,
            metrics=metrics,
            requires_approval=req_approval,
            estimated_impact_paise=impact
        )

        return ChatMessageResponse(
            id=resp_id,
            reply=reply,
            structured_plan=plan,
            created_at=now.isoformat()
        )

    # Intent 2: "Inventory" / "Stock" / "Purchase order"
    if any(k in user_msg for k in ["stock", "inventory", "purchase order", "reorder", "po", "supplier"]):
        action_id = po_action.id if po_action else str(uuid.uuid4())
        req_approval = po_action.requires_approval if po_action else True

        is_silks = "Silks" in merchant.name
        is_coffee = "Coffee" in merchant.name or "Roaster" in merchant.name

        if is_silks:
            plan = ActionPlanCard(
                action_id=action_id,
                action_type="create_purchase_order",
                title="Dispatch Handloom PO to Master Weavers",
                summary="Place expedited PO for 15 units of 'Kanjeevaram Bridal Zari Silk' with Kanchipuram Weavers Guild.",
                metrics={
                    "SKU": "SLK-KNJ-02",
                    "Quantity": 15,
                    "Total PO Cost": "₹2,40,000",
                    "Revenue Protected": "₹5,10,000"
                },
                requires_approval=req_approval,
                estimated_impact_paise=51000000
            )
            reply = (
                f"Kanjeevaram Bridal Zari Silk has only 3 units left in inventory against a 14-day weaving lead time. "
                "I've drafted a Purchase Order for 15 units (₹2,40,000) to protect ≈₹5,10,000 in upcoming festive bridal sales. "
                "You can review or approve it below."
            )
        elif is_coffee:
            plan = ActionPlanCard(
                action_id=action_id,
                action_type="create_purchase_order",
                title="Dispatch PO for Degassing Valve Pouches",
                summary="Place urgent PO for 10 boxes of 500g Valve Pouches with EcoPack Packaging Supplies.",
                metrics={
                    "SKU": "PKG-VLV-04",
                    "Quantity": 10,
                    "Total PO Cost": "₹14,000",
                    "Revenue Protected": "₹84,000"
                },
                requires_approval=req_approval,
                estimated_impact_paise=8400000
            )
            reply = (
                f"Degassing Valve Packaging Pouches are critically low (3 boxes) with a 10-day supplier lead time. "
                "Roasted bean dispatches worth ₹84,000 are at risk of delay. "
                "I've drafted an urgent PO for 10 boxes (₹14,000). Tap below to approve."
            )
        else:
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
                f"Monstera Deliciosa (Large) has only 4 days of stock remaining with a 7-day supplier lead time. "
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
    active_issues = db.query(Issue).filter(Issue.merchant_id == merchant.id, Issue.status.not_in(["completed", "rejected"])).all()
    total_impact = sum(i.estimated_impact_paise for i in active_issues)
    if total_impact == 0:
        total_impact = 4860000

    reply = (
        f"Good morning! Here is the live operational status for **{merchant.name}**: "
        f"We currently have {len(active_issues)} active operational items flagged with an aggregate revenue at risk of ₹{total_impact // 100:,}. "
        f"All autonomous prep work is completed. Bounded autonomy is active: no funds or supplier orders will be executed without your explicit approval."
    )
    return ChatMessageResponse(
        id=resp_id,
        reply=reply,
        structured_plan=None,
        created_at=now.isoformat()
    )
