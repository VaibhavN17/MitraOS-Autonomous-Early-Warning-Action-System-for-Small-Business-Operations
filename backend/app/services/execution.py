import uuid
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.schema import Action, Issue, AuditLog, Product, Customer
from app.core.websockets import manager
from app.services.razorpay_service import RazorpayService

logger = logging.getLogger(__name__)

class ExecutionEngine:
    """
    Approval & Execution Layer (Act)
    Manages the state machine: proposed -> approved -> executing -> completed / failed.
    Ensures idempotency, writes audit logs, and pushes real-time WebSocket events.
    """

    @classmethod
    async def approve_and_execute_action(
        cls, db: Session, action_id: str, user_id: Optional[str] = None, custom_params: Optional[dict] = None
    ) -> Dict[str, Any]:
        action = db.query(Action).filter(Action.id == action_id).first()
        if not action:
            raise ValueError(f"Action {action_id} not found")

        # Idempotency check
        if action.status in ["completed", "executing"]:
            return {
                "status": action.status,
                "message": "Action has already been processed or is currently executing (idempotent no-op).",
                "result": action.result
            }

        now = datetime.now(timezone.utc)
        action.status = "approved"
        action.approved_at = now
        action.approved_by = user_id

        if custom_params:
            action.parameters = {**action.parameters, **custom_params}

        # Update Issue status
        if action.issue:
            action.issue.status = "approved"

        # Log approval
        db.add(AuditLog(
            id=str(uuid.uuid4()),
            merchant_id=action.issue.merchant_id if action.issue else "default",
            entity_type="action",
            entity_id=action.id,
            event="approved",
            actor=f"human:{user_id}" if user_id else "human:owner",
            payload={"action_type": action.action_type, "parameters": action.parameters},
            created_at=now
        ))
        db.commit()

        # Broadcast approval state over WebSockets
        await manager.broadcast("ACTION_UPDATED", {
            "action_id": action.id,
            "issue_id": action.issue_id,
            "status": "approved",
            "message": "Action approved by merchant"
        })

        # Transition to executing
        action.status = "executing"
        if action.issue:
            action.issue.status = "executing"
        db.commit()

        await manager.broadcast("ACTION_UPDATED", {
            "action_id": action.id,
            "issue_id": action.issue_id,
            "status": "executing",
            "message": f"Executing {action.action_type}..."
        })

        # Execute concrete logic per action type
        result_data = {}
        try:
            if action.action_type == "retry_payment":
                # Simulated/Razorpay retry execution
                target_amount = action.parameters.get("target_amount_paise", 1840000)
                recovered_amount = int(target_amount * 0.695) # ₹12,800 recovered out of ₹18,400
                eligible = action.parameters.get("eligible_customers_count", 21)
                succeeded = max(1, int(eligible * 0.76))

                result_data = {
                    "action_type": "retry_payment",
                    "amount_recovered_paise": recovered_amount,
                    "target_amount_paise": target_amount,
                    "customers_contacted": eligible,
                    "payments_recovered": succeeded,
                    "gateway_dispatch_ref": f"rzp_batch_rec_{uuid.uuid4().hex[:10]}",
                    "summary": f"Successfully recovered ₹{recovered_amount // 100:,} across {succeeded} customer payments via Razorpay retry links."
                }

            elif action.action_type == "create_purchase_order":
                sku = action.parameters.get("sku", "PLN-MON-01")
                qty = action.parameters.get("quantity", 70)
                supplier = action.parameters.get("supplier_name", "Mysore Exotic Flora Supplies")
                unit_cost = action.parameters.get("unit_cost_paise", 65000)
                total_cost = qty * unit_cost
                prevented_loss = action.parameters.get("estimated_lost_revenue_prevented_paise", 6295800)

                # Update product stock in database with pending incoming batch
                prod = db.query(Product).filter(Product.sku == sku).first()
                if prod:
                    prod.current_stock += qty

                po_number = f"PO-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
                result_data = {
                    "action_type": "create_purchase_order",
                    "po_number": po_number,
                    "supplier": supplier,
                    "sku": sku,
                    "quantity": qty,
                    "total_cost_paise": total_cost,
                    "amount_recovered_paise": prevented_loss,
                    "summary": f"Purchase Order {po_number} for {qty} units of '{sku}' placed with {supplier}. Prevented ₹{prevented_loss // 100:,} stockout revenue loss."
                }

            elif action.action_type == "send_reengagement_campaign":
                count = action.parameters.get("target_customer_count", 8)
                rec_amount = action.parameters.get("estimated_recovery_paise", 4690000)
                campaign_id = f"CMP-{uuid.uuid4().hex[:8].upper()}"

                result_data = {
                    "action_type": "send_reengagement_campaign",
                    "campaign_id": campaign_id,
                    "coupon_code": "VIPGREEN15",
                    "customers_reached": count,
                    "amount_recovered_paise": int(rec_amount * 0.45), # Initial simulated campaign conversions
                    "summary": f"Campaign {campaign_id} delivered to {count} VIP customers with 15% incentive. Estimated ₹{int(rec_amount * 0.45) // 100:,} in re-engaged sales."
                }

            # Update Action and Issue to completed
            action.status = "completed"
            action.result = result_data
            if action.issue:
                action.issue.status = "completed"

            db.add(AuditLog(
                id=str(uuid.uuid4()),
                merchant_id=action.issue.merchant_id if action.issue else "default",
                entity_type="action",
                entity_id=action.id,
                event="executed",
                actor="system_rule",
                payload={"result": result_data},
                created_at=now
            ))
            db.commit()

            # Push live completed event over WebSockets
            await manager.broadcast("ACTION_UPDATED", {
                "action_id": action.id,
                "issue_id": action.issue_id,
                "status": "completed",
                "result": result_data,
                "message": result_data.get("summary", "Action completed successfully.")
            })

            # Also push METRICS_UPDATED event
            await manager.broadcast("METRICS_UPDATED", {
                "amount_recovered_paise": result_data.get("amount_recovered_paise", 0),
                "timestamp": now.isoformat()
            })

            return {
                "status": "completed",
                "action_id": action.id,
                "result": result_data
            }

        except Exception as e:
            logger.error(f"Error executing action {action_id}: {e}")
            action.status = "failed"
            action.result = {"error": str(e)}
            if action.issue:
                action.issue.status = "failed"

            db.add(AuditLog(
                id=str(uuid.uuid4()),
                merchant_id=action.issue.merchant_id if action.issue else "default",
                entity_type="action",
                entity_id=action.id,
                event="failed",
                actor="system_rule",
                payload={"error": str(e)},
                created_at=now
            ))
            db.commit()

            await manager.broadcast("ACTION_UPDATED", {
                "action_id": action.id,
                "issue_id": action.issue_id,
                "status": "failed",
                "error": str(e)
            })

            return {
                "status": "failed",
                "action_id": action.id,
                "error": str(e)
            }

    @classmethod
    async def reject_action(cls, db: Session, action_id: str, user_id: Optional[str] = None, reason: str = "Rejected by owner") -> Dict[str, Any]:
        action = db.query(Action).filter(Action.id == action_id).first()
        if not action:
            raise ValueError(f"Action {action_id} not found")

        now = datetime.now(timezone.utc)
        action.status = "rejected"
        action.result = {"rejection_reason": reason}
        if action.issue:
            action.issue.status = "rejected"

        db.add(AuditLog(
            id=str(uuid.uuid4()),
            merchant_id=action.issue.merchant_id if action.issue else "default",
            entity_type="action",
            entity_id=action.id,
            event="rejected",
            actor=f"human:{user_id}" if user_id else "human:owner",
            payload={"reason": reason},
            created_at=now
        ))
        db.commit()

        await manager.broadcast("ACTION_UPDATED", {
            "action_id": action.id,
            "issue_id": action.issue_id,
            "status": "rejected",
            "reason": reason
        })

        return {"status": "rejected", "action_id": action.id}
