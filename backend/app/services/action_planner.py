import uuid
from datetime import datetime, timezone
from typing import List
from sqlalchemy.orm import Session
from app.models.schema import Issue, Action, AuditLog
from app.services.policy_engine import PolicyEngine

class ActionPlanner:
    """
    Action Planner Layer (Decide)
    Converts reasoned issues into bounded action objects and passes them
    through the policy engine before creating them in the database.
    """

    @classmethod
    def plan_actions_for_issues(cls, db: Session, merchant_id: str, issues: List[Issue]) -> List[Action]:
        actions_created = []
        now = datetime.now(timezone.utc)

        for issue in issues:
            existing_action = db.query(Action).filter(Action.issue_id == issue.id).first()
            if existing_action:
                actions_created.append(existing_action)
                continue

            sig = issue.signal
            sig_type = sig.signal_type if sig else "payment_failure_spike"
            dim = sig.dimensions if sig else {}

            if sig_type == "payment_failure_spike" or "payment" in (issue.explanation or "").lower():
                action_type = "retry_payment"
                params = {
                    "method": dim.get("payment_method", "UPI"),
                    "retry_count": dim.get("failed_transactions", 24),
                    "target_amount_paise": issue.estimated_impact_paise or 1840000,
                    "eligible_customers_count": max(1, int(dim.get("failed_transactions", 24) * 0.85)),
                    "recovery_strategy": "automated_soft_retry_and_sms_link",
                    "channel": "Razorpay Payment Retry API + WhatsApp Reminder"
                }
            elif sig_type == "stock_depletion_risk" or "stock" in (issue.explanation or "").lower():
                action_type = "create_purchase_order"
                rec_qty = dim.get("recommended_order_qty", 70)
                unit_cost = dim.get("unit_cost_paise", 65000)
                params = {
                    "product_id": dim.get("product_id"),
                    "product_name": dim.get("product_name", "Monstera Deliciosa (Large)"),
                    "sku": dim.get("sku", "PLN-MON-01"),
                    "quantity": rec_qty,
                    "supplier_name": "Mysore Exotic Flora Supplies",
                    "unit_cost_paise": unit_cost,
                    "estimated_total_cost_paise": rec_qty * unit_cost,
                    "estimated_lost_revenue_prevented_paise": issue.estimated_impact_paise
                }
            elif sig_type == "churn_risk" or "churn" in (issue.explanation or "").lower():
                action_type = "send_reengagement_campaign"
                count = dim.get("customer_count", 8)
                params = {
                    "target_customer_count": count,
                    "campaign_title": "VIP Nursery Patron Exclusive Reward",
                    "message_template": "Hi {{name}}, we miss you at GreenLeaf Botanics! Enjoy 15% off your next plant order with code VIPGREEN15.",
                    "discount_percent": 15,
                    "estimated_recovery_paise": issue.estimated_impact_paise
                }
            else:
                action_type = "retry_payment"
                params = {"target_amount_paise": issue.estimated_impact_paise}

            # Evaluate policy
            policy_check = PolicyEngine.evaluate_action(db, merchant_id, action_type, params)

            action = Action(
                id=str(uuid.uuid4()),
                issue_id=issue.id,
                action_type=action_type,
                parameters=params,
                requires_approval=policy_check["requires_approval"],
                status="proposed",
                created_at=now
            )
            db.add(action)
            db.add(AuditLog(
                id=str(uuid.uuid4()),
                merchant_id=merchant_id,
                entity_type="action",
                entity_id=action.id,
                event="created",
                actor="llm",
                payload={
                    "action_type": action.action_type,
                    "requires_approval": action.requires_approval,
                    "policy_applied": policy_check["policy_applied"]
                },
                created_at=now
            ))
            actions_created.append(action)

        db.commit()
        return actions_created
