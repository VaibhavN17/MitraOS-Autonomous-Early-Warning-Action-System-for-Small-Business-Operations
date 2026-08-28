from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.schema import Merchant, Product, Customer, Order, Payment

router = APIRouter(prefix="/data", tags=["data"])

@router.get("/products")
def get_products(db: Session = Depends(get_db)):
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
def get_recent_orders(limit: int = Query(25, le=100), db: Session = Depends(get_db)):
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
def get_customers(limit: int = Query(50, le=100), db: Session = Depends(get_db)):
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
