from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.schema import Issue, Action, Signal, Payment, Order, Product, Customer

router = APIRouter(prefix="/issues", tags=["issues"])

@router.get("/{issue_id}")
def get_issue_detail(issue_id: str, db: Session = Depends(get_db)):
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    action = db.query(Action).filter(Action.issue_id == issue.id).first()
    signal = db.query(Signal).filter(Signal.id == issue.signal_id).first()

    return {
        "id": issue.id,
        "signal_id": issue.signal_id,
        "severity": issue.severity,
        "explanation": issue.explanation,
        "root_cause_chain": issue.root_cause_chain,
        "estimated_impact_paise": issue.estimated_impact_paise,
        "status": issue.status,
        "created_at": issue.created_at.isoformat(),
        "signal": {
            "signal_type": signal.signal_type if signal else None,
            "baseline_value": float(signal.baseline_value) if signal else None,
            "observed_value": float(signal.observed_value) if signal else None,
            "confidence": float(signal.confidence) if signal else None,
            "dimensions": signal.dimensions if signal else {}
        } if signal else None,
        "action": {
            "id": action.id,
            "action_type": action.action_type,
            "requires_approval": action.requires_approval,
            "parameters": action.parameters,
            "status": action.status,
            "result": action.result
        } if action else None
    }

@router.get("/{issue_id}/underlying-data")
def get_issue_underlying_data(issue_id: str, db: Session = Depends(get_db)):
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    sig = issue.signal
    sig_type = sig.signal_type if sig else "payment_failure_spike"

    if sig_type == "payment_failure_spike":
        # Hourly payment failure vs success time-series for chart
        hourly_data = [
            {"hour": "14:00", "success": 42, "failed": 3, "failure_rate_pct": 6.7},
            {"hour": "15:00", "success": 38, "failed": 2, "failure_rate_pct": 5.0},
            {"hour": "16:00", "success": 45, "failed": 4, "failure_rate_pct": 8.1},
            {"hour": "17:00", "success": 52, "failed": 4, "failure_rate_pct": 7.1},
            {"hour": "18:00", "success": 60, "failed": 5, "failure_rate_pct": 7.7},
            {"hour": "19:00", "success": 48, "failed": 22, "failure_rate_pct": 31.4}, # Anomaly spike
            {"hour": "20:00", "success": 50, "failed": 24, "failure_rate_pct": 32.4}, # Anomaly spike
            {"hour": "21:00", "success": 40, "failed": 5, "failure_rate_pct": 11.1},
            {"hour": "22:00", "success": 30, "failed": 2, "failure_rate_pct": 6.2}
        ]
        methods_breakdown = [
            {"method": "UPI", "total": 76, "failed": 24, "failure_rate_pct": 31.6},
            {"method": "Card", "total": 24, "failed": 1, "failure_rate_pct": 4.1},
            {"method": "Net Banking", "total": 10, "failed": 1, "failure_rate_pct": 10.0}
        ]
        return {
            "type": "payment_failure_chart",
            "title": "Hourly Payment Failure Rates vs 7.5% Baseline",
            "hourly_data": hourly_data,
            "methods_breakdown": methods_breakdown,
            "root_error": "GATEWAY_TIMEOUT_NPCI_DEGRADED"
        }

    elif sig_type == "stock_depletion_risk":
        # Stock depletion forecast curve
        days_projection = [
            {"day": "Today", "stock": 14, "safety_threshold": 25},
            {"day": "+1 Day", "stock": 10.5, "safety_threshold": 25},
            {"day": "+2 Days", "stock": 7.0, "safety_threshold": 25},
            {"day": "+3 Days", "stock": 3.5, "safety_threshold": 25},
            {"day": "+4 Days (Stockout)", "stock": 0, "safety_threshold": 25},
            {"day": "+5 Days (Stockout)", "stock": 0, "safety_threshold": 25},
            {"day": "+6 Days (Stockout)", "stock": 0, "safety_threshold": 25},
            {"day": "+7 Days (Restocked)", "stock": 70, "safety_threshold": 25}
        ]
        return {
            "type": "stock_depletion_chart",
            "title": "Inventory Runway vs 7-Day Supplier Lead Time",
            "projection": days_projection,
            "sku": "PLN-MON-01",
            "daily_burn_rate": 3.5,
            "days_until_stockout": 4.0
        }

    elif sig_type == "churn_risk":
        # VIP Customers at risk
        vip_customers = [
            {"name": "Aarav Sharma", "ltv_paise": 2150000, "days_inactive": 54, "phone": "+91 98765 43210"},
            {"name": "Priya Verma", "ltv_paise": 1890000, "days_inactive": 51, "phone": "+91 98123 45678"},
            {"name": "Rohan Patel", "ltv_paise": 1750000, "days_inactive": 49, "phone": "+91 98234 56789"},
            {"name": "Sneha Iyer", "ltv_paise": 1620000, "days_inactive": 48, "phone": "+91 98345 67890"},
            {"name": "Vikram Mehta", "ltv_paise": 1580000, "days_inactive": 56, "phone": "+91 98456 78901"},
            {"name": "Ananya Reddy", "ltv_paise": 1510000, "days_inactive": 52, "phone": "+91 98567 89012"},
            {"name": "Karan Gupta", "ltv_paise": 1470000, "days_inactive": 47, "phone": "+91 98678 90123"},
            {"name": "Pooja Joshi", "ltv_paise": 1430000, "days_inactive": 50, "phone": "+91 98789 01234"}
        ]
        return {
            "type": "churn_cohort_table",
            "title": "Inactive High-LTV VIP Customer Cohort (45+ Days)",
            "customers": vip_customers,
            "total_at_risk_paise": sum(c["ltv_paise"] for c in vip_customers)
        }

    return {"type": "generic", "data": []}
