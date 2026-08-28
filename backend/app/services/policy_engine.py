from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models.schema import Policy, Action

class PolicyEngine:
    """
    Policy Engine (Control Layer)
    Answers: 'What is this agent allowed to do?'
    Evaluates actions against merchant policy limits, spend bounds, approval requirements,
    and cooldown windows.
    """

    @classmethod
    def evaluate_action(cls, db: Session, merchant_id: str, action_type: str, parameters: dict) -> dict:
        """
        Returns:
            {
                "requires_approval": bool,
                "is_allowed": bool,
                "rejection_reason": str | None,
                "policy_applied": str
            }
        """
        policy = (
            db.query(Policy)
            .filter(
                Policy.merchant_id == merchant_id,
                Policy.action_type == action_type
            )
            .first()
        )

        now = datetime.now(timezone.utc)

        # 1. Cooldown Check
        cooldown_hours = policy.cooldown_hours if policy else 24
        cooldown_threshold = now - timedelta(hours=cooldown_hours)

        recent_action = (
            db.query(Action)
            .join(Action.issue)
            .filter(
                Action.action_type == action_type,
                Action.status.in_(["executing", "completed"]),
                Action.created_at >= cooldown_threshold
            )
            .first()
        )

        if recent_action:
            return {
                "requires_approval": True,
                "is_allowed": False,
                "rejection_reason": f"Action '{action_type}' is on cooldown ({cooldown_hours}h cooldown). Last run at {recent_action.created_at.isoformat()}.",
                "policy_applied": "cooldown_enforcement"
            }

        # 2. Spend Limit Check
        spend_amount = parameters.get("estimated_total_cost_paise", 0)
        max_auto_spend = policy.max_auto_spend_paise if policy else 0

        requires_approval = True
        if policy and not policy.requires_approval and spend_amount <= max_auto_spend:
            requires_approval = False
        else:
            # By default, financial actions or customer contact require approval (Bounded Autonomy)
            requires_approval = True

        return {
            "requires_approval": requires_approval,
            "is_allowed": True,
            "rejection_reason": None,
            "policy_applied": "bounded_autonomy_gate" if requires_approval else "auto_approved_under_spend_threshold"
        }
