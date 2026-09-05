import uuid
import random
from datetime import datetime, timedelta, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.database import get_db
from app.models.schema import (
    Merchant, Product, Customer, Order, Payment, Issue, Policy, Signal, AuditLog, GroundTruthLabel
)
from app.services.synthetic_data import seed_synthetic_merchant_data, MERCHANTS_SPEC
from app.services.detection import DetectionEngine
from app.services.reasoning import ReasoningEngine
from app.services.action_planner import ActionPlanner

router = APIRouter(prefix="/data", tags=["data"])

CATEGORY_MAP = {
    "GreenLeaf Botanics & Nursery": ("D2C Urban Plants & Gardening", "emerald"),
    "Kavita Silks & Couture": ("Ethnic Apparel & Luxury Sarees", "purple"),
    "BlueStone Artisanal Roasters": ("Specialty Coffee & Subscriptions", "amber"),
}

class CreateMerchantRequest(BaseModel):
    name: str
    category: str
    razorpay_account_id: Optional[str] = None
    avatar_color: Optional[str] = "indigo"
    auto_spend_limit_paise: Optional[int] = 1000000

@router.get("/merchants")
def get_merchants(db: Session = Depends(get_db)):
    # Auto-seed if not present
    merchants = db.query(Merchant).all()
    if len(merchants) < len(MERCHANTS_SPEC):
        seed_synthetic_merchant_data(db)
        merchants = db.query(Merchant).all()

    now = datetime.now(timezone.utc)
    yesterday_start = (now - timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
    yesterday_end = yesterday_start + timedelta(days=1)

    result = []
    for m in merchants:
        cat_info = CATEGORY_MAP.get(m.name, (m.name.split()[-1] if m.name else "General Retail", "indigo"))
        
        # Active issues
        issues = db.query(Issue).filter(
            Issue.merchant_id == m.id,
            Issue.status.not_in(["completed", "rejected"])
        ).all()
        high_issues = [i for i in issues if i.severity == "high"]

        # Yesterday revenue
        yesterday_orders = (
            db.query(Order)
            .filter(
                Order.merchant_id == m.id,
                Order.status == "paid",
                Order.created_at >= yesterday_start,
                Order.created_at < yesterday_end
            )
            .all()
        )
        rev = sum(o.amount_paise for o in yesterday_orders)
        if rev == 0:
            rev = 4860000 if "GreenLeaf" in m.name else (12850000 if "Kavita" in m.name else 3420000)

        result.append({
            "id": m.id,
            "name": m.name,
            "razorpay_account_id": m.razorpay_account_id or f"acc_{m.id[:8]}",
            "category": cat_info[0],
            "avatar_color": cat_info[1],
            "active_issues_count": len(issues),
            "high_risk_count": len(high_issues),
            "yesterday_revenue_paise": rev,
            "total_products": len(m.products) if m.products else 0,
            "total_customers": len(m.customers) if m.customers else 0,
            "created_at": m.created_at.isoformat() if m.created_at else None
        })

    return result

@router.post("/merchants")
def create_new_merchant(req: CreateMerchantRequest, db: Session = Depends(get_db)):
    now = datetime.now(timezone.utc)
    m_id = str(uuid.uuid4())
    abbr = "".join([w[0].upper() for w in req.name.split()[:3]]) or "BIZ"
    rzp_id = req.razorpay_account_id or f"acc_{abbr}_rzp_2026"

    merchant = Merchant(
        id=m_id,
        name=req.name,
        razorpay_account_id=rzp_id,
        created_at=now
    )
    db.add(merchant)
    db.flush()

    # Store in category map
    CATEGORY_MAP[req.name] = (req.category, req.avatar_color or "indigo")

    # 1. Policies
    policies = [
        Policy(id=str(uuid.uuid4()), merchant_id=m_id, action_type="retry_payment", max_auto_spend_paise=0, requires_approval=True, cooldown_hours=12),
        Policy(id=str(uuid.uuid4()), merchant_id=m_id, action_type="send_payment_reminder", max_auto_spend_paise=0, requires_approval=True, cooldown_hours=24),
        Policy(id=str(uuid.uuid4()), merchant_id=m_id, action_type="create_purchase_order", max_auto_spend_paise=req.auto_spend_limit_paise or 1000000, requires_approval=True, cooldown_hours=48),
        Policy(id=str(uuid.uuid4()), merchant_id=m_id, action_type="send_reengagement_campaign", max_auto_spend_paise=500000, requires_approval=True, cooldown_hours=72)
    ]
    for p in policies:
        db.add(p)

    # 2. Seed Starter SKUs
    starter_skus = [
        {"name": f"{req.name} Premium Edition 01", "sku": f"{abbr}-SKU-01", "stock": 8, "lead": 7, "cost": 45000, "price": 129900, "cat": req.category},
        {"name": f"{req.name} Standard Model 02", "sku": f"{abbr}-SKU-02", "stock": 45, "lead": 5, "cost": 25000, "price": 69900, "cat": req.category},
        {"name": f"{req.name} Essential Pack 03", "sku": f"{abbr}-SKU-03", "stock": 80, "lead": 4, "cost": 15000, "price": 39900, "cat": req.category},
        {"name": f"{req.name} Accessory Bundle 04", "sku": f"{abbr}-SKU-04", "stock": 35, "lead": 6, "cost": 18000, "price": 49900, "cat": req.category},
    ]

    prods = []
    for item in starter_skus:
        p = Product(
            id=str(uuid.uuid4()),
            merchant_id=m_id,
            name=item["name"],
            sku=item["sku"],
            current_stock=item["stock"],
            supplier_lead_time_days=item["lead"],
            unit_cost_paise=item["cost"],
            unit_price_paise=item["price"],
            category=item["cat"],
            created_at=now
        )
        db.add(p)
        prods.append(p)

    # 3. Seed Starter Customers & Orders
    for i in range(25):
        cust_id = str(uuid.uuid4())
        cust = Customer(
            id=cust_id,
            merchant_id=m_id,
            name=f"Customer {i+1}",
            email=f"client_{abbr.lower()}_{i+1}@example.com",
            phone=f"+9198{random.randint(10000000, 99999999)}",
            total_lifetime_value_paise=random.randint(200000, 1500000),
            last_purchase_at=now - timedelta(days=random.randint(1, 15)),
            created_at=now - timedelta(days=30)
        )
        db.add(cust)

        # 2-3 orders per customer
        for _ in range(random.randint(1, 3)):
            p = random.choice(prods)
            ord_id = str(uuid.uuid4())
            order = Order(
                id=ord_id,
                merchant_id=m_id,
                customer_id=cust_id,
                product_id=p.id,
                quantity=1,
                amount_paise=p.unit_price_paise,
                status="paid",
                created_at=now - timedelta(days=random.randint(1, 10))
            )
            db.add(order)

            payment = Payment(
                id=str(uuid.uuid4()),
                order_id=ord_id,
                razorpay_payment_id=f"pay_{abbr.lower()}_{uuid.uuid4().hex[:8]}",
                method="UPI",
                status="success",
                created_at=order.created_at
            )
            db.add(payment)

    # 4. Ground Truth & Audit
    db.add(GroundTruthLabel(
        id=str(uuid.uuid4()),
        merchant_id=m_id,
        anomaly_type="stock_depletion_risk",
        description=f"{starter_skus[0]['name']} stock (8 units) below lead time threshold",
        injected_dimensions={"sku": starter_skus[0]["sku"]},
        expected_severity="medium",
        is_detected=False
    ))

    db.add(AuditLog(
        id=str(uuid.uuid4()),
        merchant_id=m_id,
        entity_type="system",
        entity_id=m_id,
        event="created",
        actor="human:owner",
        payload={"message": f"New business '{req.name}' successfully onboarded with Razorpay credentials {rzp_id}"},
        created_at=now
    ))

    db.commit()

    # Run detection & action pipeline
    signals = DetectionEngine.run_detection_pipeline(db, m_id)
    issues = ReasoningEngine.reason_over_signals(db, m_id, signals)
    ActionPlanner.plan_actions_for_issues(db, m_id, issues)

    return {
        "id": m_id,
        "name": req.name,
        "razorpay_account_id": rzp_id,
        "category": req.category,
        "avatar_color": req.avatar_color or "indigo",
        "active_issues_count": len(issues),
        "high_risk_count": len([i for i in issues if i.severity == "high"]),
        "yesterday_revenue_paise": 1850000,
        "total_products": len(prods),
        "total_customers": 25,
        "created_at": now.isoformat()
    }

@router.get("/products")
def get_products(merchant_id: Optional[str] = Query(None), db: Session = Depends(get_db)):
    merchant = None
    if merchant_id:
        merchant = db.query(Merchant).filter(Merchant.id == merchant_id).first()
    if not merchant:
        merchant = db.query(Merchant).first()
    if not merchant:
        return []

    products = db.query(Product).filter(Product.merchant_id == merchant.id).all()
    return [
        {
            "id": p.id,
            "name": p.name,
            "sku": p.sku,
            "current_stock": p.current_stock,
            "supplier_lead_time_days": p.supplier_lead_time_days,
            "unit_cost_paise": p.unit_cost_paise,
            "unit_price_paise": p.unit_price_paise,
            "category": p.category
        } for p in products
    ]

@router.get("/orders")
def get_recent_orders(
    merchant_id: Optional[str] = Query(None),
    limit: int = Query(25, le=100),
    db: Session = Depends(get_db)
):
    merchant = None
    if merchant_id:
        merchant = db.query(Merchant).filter(Merchant.id == merchant_id).first()
    if not merchant:
        merchant = db.query(Merchant).first()
    if not merchant:
        return []

    orders = (
        db.query(Order)
        .filter(Order.merchant_id == merchant.id)
        .order_by(Order.created_at.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": o.id,
            "customer_name": o.customer.name if o.customer else "Customer",
            "product_name": o.product.name if o.product else "Product",
            "amount_paise": o.amount_paise,
            "quantity": o.quantity,
            "status": o.status,
            "payment_method": o.payment.method if o.payment else "N/A",
            "created_at": o.created_at.isoformat()
        } for o in orders
    ]

@router.get("/customers")
def get_customers(
    merchant_id: Optional[str] = Query(None),
    limit: int = Query(50, le=100),
    db: Session = Depends(get_db)
):
    merchant = None
    if merchant_id:
        merchant = db.query(Merchant).filter(Merchant.id == merchant_id).first()
    if not merchant:
        merchant = db.query(Merchant).first()
    if not merchant:
        return []

    customers = (
        db.query(Customer)
        .filter(Customer.merchant_id == merchant.id)
        .order_by(Customer.total_lifetime_value_paise.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": c.id,
            "name": c.name,
            "email": c.email,
            "phone": c.phone,
            "total_lifetime_value_paise": c.total_lifetime_value_paise,
            "last_purchase_at": c.last_purchase_at.isoformat() if c.last_purchase_at else None
        } for c in customers
    ]
