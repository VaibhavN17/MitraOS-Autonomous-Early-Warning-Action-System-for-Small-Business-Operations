import uuid
import random
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models.schema import (
    Merchant, Product, Customer, Order, Payment, Policy,
    User, GroundTruthLabel, AuditLog
)
from app.core.security import get_password_hash

def seed_synthetic_merchant_data(db: Session) -> str:
    """
    Seeds a synthetic merchant with ~2,000 orders across 15 SKUs (approx ₹4.8L+ monthly revenue)
    and deliberately injected anomalies for the demo:
    1. Payment failure spike: 7-9 PM UPI failure rate jumps from baseline ~7.5% to 31.8% (Gateway response: 'BAD_REQUEST_UPI_TIMEOUT')
    2. Stock depletion risk: 'Monstera Deliciosa (Large)' high sales velocity, 4 days stock left vs 7-day supplier lead time (~₹62,000 lost revenue)
    3. Customer churn risk: 8 high-LTV customers with no orders in 45+ days (>₹1.2L aggregate historical value)
    """
    existing_merchant = db.query(Merchant).filter(Merchant.name == "GreenLeaf Botanics & Nursery").first()
    if existing_merchant:
        return existing_merchant.id

    now = datetime.now(timezone.utc)
    merchant_id = str(uuid.uuid4())

    # 1. Create Merchant
    merchant = Merchant(
        id=merchant_id,
        name="GreenLeaf Botanics & Nursery",
        razorpay_account_id="acc_GLN_rzp_2026",
        created_at=now - timedelta(days=90)
    )
    db.add(merchant)

    # 2. Create Default Owner User
    owner_user = User(
        id=str(uuid.uuid4()),
        merchant_id=merchant_id,
        email="owner@greenleafnursery.in",
        role="owner",
        password_hash=get_password_hash("MitraOS@2026"),
        created_at=now - timedelta(days=90)
    )
    db.add(owner_user)

    # 3. Create Default Policies
    policies = [
        Policy(
            id=str(uuid.uuid4()),
            merchant_id=merchant_id,
            action_type="retry_payment",
            max_auto_spend_paise=0,
            requires_approval=True,
            cooldown_hours=12
        ),
        Policy(
            id=str(uuid.uuid4()),
            merchant_id=merchant_id,
            action_type="send_payment_reminder",
            max_auto_spend_paise=0,
            requires_approval=True,
            cooldown_hours=24
        ),
        Policy(
            id=str(uuid.uuid4()),
            merchant_id=merchant_id,
            action_type="create_purchase_order",
            max_auto_spend_paise=1000000, # ₹10,000 auto limit, else requires approval
            requires_approval=True,
            cooldown_hours=48
        ),
        Policy(
            id=str(uuid.uuid4()),
            merchant_id=merchant_id,
            action_type="send_reengagement_campaign",
            max_auto_spend_paise=500000,
            requires_approval=True,
            cooldown_hours=72
        )
    ]
    for p in policies:
        db.add(p)

    # 4. Create 15 Product SKUs
    skus_data = [
        {"name": "Monstera Deliciosa (Large)", "sku": "PLN-MON-01", "stock": 14, "lead": 7, "cost": 65000, "price": 149900, "cat": "Indoor Foliage"}, # Injected stockout risk
        {"name": "Fiddle Leaf Fig (Standard)", "sku": "PLN-FLF-02", "stock": 65, "lead": 5, "cost": 85000, "price": 189900, "cat": "Indoor Trees"},
        {"name": "Snake Plant Laurentii", "sku": "PLN-SNK-03", "stock": 120, "lead": 4, "cost": 25000, "price": 59900, "cat": "Air Purifying"},
        {"name": "ZZ Plant (Zamioculcas)", "sku": "PLN-ZZP-04", "stock": 85, "lead": 5, "cost": 35000, "price": 79900, "cat": "Low Light"},
        {"name": "Areca Palm (5ft Pot)", "sku": "PLN-ARC-05", "stock": 42, "lead": 6, "cost": 55000, "price": 129900, "cat": "Palms"},
        {"name": "Peace Lily Spathiphyllum", "sku": "PLN-PCE-06", "stock": 70, "lead": 4, "cost": 22000, "price": 49900, "cat": "Flowering"},
        {"name": "Golden Pothos Hanging", "sku": "PLN-POT-07", "stock": 110, "lead": 3, "cost": 15000, "price": 34900, "cat": "Hanging Plants"},
        {"name": "Calathea Orbifolia", "sku": "PLN-CLT-08", "stock": 35, "lead": 8, "cost": 45000, "price": 99900, "cat": "Exotic Foliage"},
        {"name": "Rubber Tree Burgundy", "sku": "PLN-RBR-09", "stock": 50, "lead": 5, "cost": 48000, "price": 109900, "cat": "Indoor Trees"},
        {"name": "Bird of Paradise (Reginae)", "sku": "PLN-BOP-10", "stock": 28, "lead": 10, "cost": 95000, "price": 219900, "cat": "Statement Plants"},
        {"name": "Succulent Assortment (Set of 4)", "sku": "PLN-SUC-11", "stock": 90, "lead": 4, "cost": 28000, "price": 64900, "cat": "Succulents & Cacti"},
        {"name": "Bonsai Ficus Microcarpa", "sku": "PLN-BNS-12", "stock": 22, "lead": 12, "cost": 120000, "price": 279900, "cat": "Bonsai"},
        {"name": "Organic Vermicompost 5kg", "sku": "ACC-VMC-13", "stock": 180, "lead": 3, "cost": 11000, "price": 24900, "cat": "Soil & Care"},
        {"name": "Ceramic Glazed Planter 8in", "sku": "POT-CRM-14", "stock": 60, "lead": 6, "cost": 29000, "price": 69900, "cat": "Planters"},
        {"name": "Neem Oil Plant Spray 500ml", "sku": "ACC-NEM-15", "stock": 140, "lead": 4, "cost": 13000, "price": 29900, "cat": "Plant Care"}
    ]

    products_map = {}
    for item in skus_data:
        p = Product(
            id=str(uuid.uuid4()),
            merchant_id=merchant_id,
            name=item["name"],
            sku=item["sku"],
            current_stock=item["stock"],
            supplier_lead_time_days=item["lead"],
            unit_cost_paise=item["cost"],
            unit_price_paise=item["price"],
            category=item["cat"],
            created_at=now - timedelta(days=90)
        )
        db.add(p)
        products_map[item["sku"]] = p

    # 5. Create 120 Realistic Customers
    customers_list = []
    first_names = ["Aarav", "Aditi", "Rohan", "Priya", "Vikram", "Sneha", "Karan", "Ananya", "Rahul", "Pooja", "Arjun", "Neha", "Sameer", "Tanvi", "Amit", "Deepika", "Kunal", "Meera", "Varun", "Rhea"]
    last_names = ["Sharma", "Verma", "Patel", "Mehta", "Iyer", "Nair", "Reddy", "Gupta", "Kulkarni", "Joshi", "Singhania", "Deshmukh", "Kapoor", "Bhatia"]

    for i in range(120):
        c_name = f"{random.choice(first_names)} {random.choice(last_names)}"
        c_email = f"customer_{i+1}@example.com"
        c_phone = f"+9198{random.randint(10000000, 99999999)}"
        # Injected churn: first 8 customers are high LTV (₹15,000+ each) but haven't purchased in 52 days
        if i < 8:
            ltv = random.randint(1400000, 2200000) # ₹14k - ₹22k
            last_p = now - timedelta(days=random.randint(48, 62))
        else:
            ltv = random.randint(100000, 800000)
            last_p = now - timedelta(days=random.randint(1, 40))

        c = Customer(
            id=str(uuid.uuid4()),
            merchant_id=merchant_id,
            name=c_name,
            email=c_email,
            phone=c_phone,
            total_lifetime_value_paise=ltv,
            last_purchase_at=last_p,
            created_at=now - timedelta(days=90)
        )
        db.add(c)
        customers_list.append(c)

    # 6. Generate ~2,000 Orders and Payments across 30 days
    methods = ["UPI", "card", "netbanking", "wallet"]
    method_weights = [0.65, 0.22, 0.09, 0.04] # UPI dominant Indian SMB pattern
    product_keys = list(products_map.keys())

    # Injected payment failure spike parameters (Yesterday / last 24h between 7 PM and 9 PM IST)
    # Baseline UPI failure is ~7.5%. In the spike window, it jumps to ~32%.
    for day_offset in range(30, 0, -1):
        # Base daily order count ~60 to 75
        daily_orders_count = random.randint(62, 78)
        day_date = now - timedelta(days=day_offset)

        for _ in range(daily_orders_count):
            order_hour = random.randint(8, 22) # Orders between 8 AM and 10 PM
            order_minute = random.randint(0, 59)
            order_time = day_date.replace(hour=order_hour, minute=order_minute, second=random.randint(0, 59))

            # Select customer & product
            # High sales velocity on Monstera (PLN-MON-01) in last 5 days
            if day_offset <= 5 and random.random() < 0.28:
                sku_choice = "PLN-MON-01"
            else:
                sku_choice = random.choice(product_keys)

            prod = products_map[sku_choice]
            cust = random.choice(customers_list)
            qty = 1 if prod.unit_price_paise > 100000 else random.randint(1, 2)
            amount = prod.unit_price_paise * qty

            order_id = str(uuid.uuid4())
            method = random.choices(methods, weights=method_weights)[0]

            # Determine payment status with realistic failure baseline vs injected anomaly
            is_anomaly_window = (day_offset == 1 and order_hour in [19, 20] and method == "UPI")
            
            if is_anomaly_window:
                # Spike: ~32% failure rate
                is_failed = random.random() < 0.32
                fail_reason = "BAD_REQUEST_UPI_TIMEOUT" if is_failed else None
                gateway_code = "GATEWAY_TIMEOUT_NPCI_DEGRADED" if is_failed else "SUCCESS"
            else:
                # Baseline failures
                if method == "UPI":
                    is_failed = random.random() < 0.075
                    fail_reason = "INSUFFICIENT_FUNDS" if (is_failed and random.random() < 0.5) else ("BANK_DEGRADED" if is_failed else None)
                elif method == "card":
                    is_failed = random.random() < 0.05
                    fail_reason = "CARD_AUTHENTICATION_FAILED" if is_failed else None
                else:
                    is_failed = random.random() < 0.06
                    fail_reason = "NETBANKING_TIMED_OUT" if is_failed else None
                gateway_code = "ERR_REJECTED" if is_failed else "SUCCESS"

            order_status = "failed" if is_failed else "paid"
            pay_status = "failed" if is_failed else "success"

            order = Order(
                id=order_id,
                merchant_id=merchant_id,
                customer_id=cust.id,
                product_id=prod.id,
                quantity=qty,
                amount_paise=amount,
                status=order_status,
                created_at=order_time
            )
            db.add(order)

            payment = Payment(
                id=str(uuid.uuid4()),
                order_id=order_id,
                razorpay_payment_id=f"pay_mock_{uuid.uuid4().hex[:12]}",
                method=method,
                status=pay_status,
                failure_reason=fail_reason,
                gateway_response_code=gateway_code,
                created_at=order_time + timedelta(seconds=random.randint(10, 45))
            )
            db.add(payment)

    # 7. Add Ground Truth Labels for Evaluation
    gt_labels = [
        GroundTruthLabel(
            id=str(uuid.uuid4()),
            merchant_id=merchant_id,
            anomaly_type="payment_failure_spike",
            description="UPI payment failure spike concentrated between 19:00-21:00 yesterday (failure rate ~31.8% vs 7.5% baseline) due to NPCI timeout",
            injected_dimensions={"method": "UPI", "time_window": "19:00-21:00", "gateway_code": "GATEWAY_TIMEOUT_NPCI_DEGRADED"},
            expected_severity="high",
            is_detected=False
        ),
        GroundTruthLabel(
            id=str(uuid.uuid4()),
            merchant_id=merchant_id,
            anomaly_type="stock_depletion_risk",
            description="Monstera Deliciosa (Large) stock level (14 units) insufficient for 7-day supplier lead time at 3.6 units/day velocity (~₹62,000 revenue at risk)",
            injected_dimensions={"sku": "PLN-MON-01", "days_stock_left": 4, "lead_time_days": 7},
            expected_severity="medium",
            is_detected=False
        ),
        GroundTruthLabel(
            id=str(uuid.uuid4()),
            merchant_id=merchant_id,
            anomaly_type="churn_risk",
            description="8 high-LTV customers inactive for >45 days representing ₹1,34,000 lifetime value",
            injected_dimensions={"customer_count": 8, "inactivity_threshold_days": 45},
            expected_severity="low",
            is_detected=False
        )
    ]
    for gt in gt_labels:
        db.add(gt)

    # 8. Add initial Audit Log
    db.add(AuditLog(
        id=str(uuid.uuid4()),
        merchant_id=merchant_id,
        entity_type="system",
        entity_id=merchant_id,
        event="created",
        actor="system_rule",
        payload={"message": "Synthetic merchant initialized with ground truth anomalies"},
        created_at=now
    ))

    db.commit()
    return merchant_id
