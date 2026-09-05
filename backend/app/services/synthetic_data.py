import uuid
import random
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.schema import (
    Merchant, Product, Customer, Order, Payment, Policy,
    User, GroundTruthLabel, AuditLog
)
from app.core.security import get_password_hash
from app.services.detection import DetectionEngine
from app.services.reasoning import ReasoningEngine
from app.services.action_planner import ActionPlanner

MERCHANTS_SPEC = [
    {
        "name": "GreenLeaf Botanics & Nursery",
        "razorpay_account_id": "acc_GLN_rzp_2026",
        "category": "D2C Plants & Urban Gardening",
        "email": "owner@greenleafnursery.in",
        "avatar_color": "emerald",
        "customer_count": 120,
        "skus": [
            {"name": "Monstera Deliciosa (Large)", "sku": "PLN-MON-01", "stock": 14, "lead": 7, "cost": 65000, "price": 149900, "cat": "Indoor Foliage", "stockout_target": True},
            {"name": "Fiddle Leaf Fig (Standard)", "sku": "PLN-FLF-02", "stock": 65, "lead": 5, "cost": 85000, "price": 189900, "cat": "Indoor Trees"},
            {"name": "Snake Plant Laurentii", "sku": "PLN-SNK-03", "stock": 120, "lead": 4, "cost": 25000, "price": 59900, "cat": "Air Purifying"},
            {"name": "ZZ Plant (Zamioculcas)", "sku": "PLN-ZZP-04", "stock": 85, "lead": 5, "cost": 35000, "price": 79900, "cat": "Low Light"},
            {"name": "Areca Palm (5ft Pot)", "sku": "PLN-ARC-05", "stock": 42, "lead": 6, "cost": 55000, "price": 129900, "cat": "Palms"},
            {"name": "Peace Lily Spathiphyllum", "sku": "PLN-PCE-06", "stock": 70, "lead": 4, "cost": 22000, "price": 49900, "cat": "Flowering"},
            {"name": "Golden Pothos Hanging", "sku": "PLN-POT-07", "stock": 110, "lead": 3, "cost": 15000, "price": 34900, "cat": "Hanging Plants"},
            {"name": "Calathea Orbifolia", "sku": "PLN-CLT-08", "stock": 35, "lead": 8, "cost": 45000, "price": 99900, "cat": "Exotic Foliage"},
            {"name": "Rubber Tree Burgundy", "sku": "PLN-RBR-09", "stock": 50, "lead": 5, "cost": 48000, "price": 109900, "cat": "Indoor Trees"},
            {"name": "Bird of Paradise (Reginae)", "sku": "PLN-BOP-10", "stock": 28, "lead": 10, "cost": 95000, "price": 219900, "cat": "Statement Plants"},
            {"name": "Succulent Assortment (Set of 4)", "sku": "PLN-SUC-11", "stock": 90, "lead": 4, "cost": 28000, "price": 64900, "cat": "Succulents"},
            {"name": "Bonsai Ficus Microcarpa", "sku": "PLN-BNS-12", "stock": 22, "lead": 12, "cost": 120000, "price": 279900, "cat": "Bonsai"},
            {"name": "Organic Vermicompost 5kg", "sku": "ACC-VMC-13", "stock": 180, "lead": 3, "cost": 11000, "price": 24900, "cat": "Care"},
            {"name": "Ceramic Glazed Planter 8in", "sku": "POT-CRM-14", "stock": 60, "lead": 6, "cost": 29000, "price": 69900, "cat": "Planters"},
            {"name": "Neem Oil Plant Spray 500ml", "sku": "ACC-NEM-15", "stock": 140, "lead": 4, "cost": 13000, "price": 29900, "cat": "Care"}
        ],
        "anomaly_spike": {
            "method": "UPI",
            "hours": [19, 20],
            "fail_rate": 0.32,
            "fail_reason": "BAD_REQUEST_UPI_TIMEOUT",
            "gateway_code": "GATEWAY_TIMEOUT_NPCI_DEGRADED"
        },
        "gt_payment_desc": "UPI payment failure spike concentrated between 19:00-21:00 yesterday (failure rate ~31.8% vs 7.5% baseline) due to NPCI timeout",
        "gt_stock_desc": "Monstera Deliciosa (Large) stock level (14 units) insufficient for 7-day supplier lead time (~₹62,000 revenue at risk)",
        "gt_stock_sku": "PLN-MON-01",
        "gt_churn_desc": "8 high-LTV plant enthusiasts inactive for >45 days representing ₹1,34,000 lifetime value"
    },
    {
        "name": "Kavita Silks & Couture",
        "razorpay_account_id": "acc_KSC_rzp_2026",
        "category": "Ethnic Apparel & Luxury Sarees",
        "email": "owner@kavitasilks.in",
        "avatar_color": "purple",
        "customer_count": 80,
        "skus": [
            {"name": "Banarasi Katan Pure Silk Saree", "sku": "SLK-BAN-01", "stock": 25, "lead": 10, "cost": 850000, "price": 1850000, "cat": "Pure Silk Sarees"},
            {"name": "Kanjeevaram Bridal Zari Silk", "sku": "SLK-KNJ-02", "stock": 3, "lead": 14, "cost": 1600000, "price": 3400000, "cat": "Bridal Silk", "stockout_target": True},
            {"name": "Chanderi Handloom Floral Dupatta", "sku": "DPT-CHN-03", "stock": 48, "lead": 5, "cost": 180000, "price": 420000, "cat": "Dupattas"},
            {"name": "Tussar Silk Embroidered Kurta", "sku": "KRT-TSR-04", "stock": 35, "lead": 6, "cost": 320000, "price": 780000, "cat": "Kurtas"},
            {"name": "Raw Silk Bridal Lehenga Choli", "sku": "LHG-RAW-05", "stock": 8, "lead": 18, "cost": 2100000, "price": 4200000, "cat": "Bridal Lehengas"},
            {"name": "Pashmina Cashmere Shawl", "sku": "SHW-PSH-06", "stock": 18, "lead": 12, "cost": 750000, "price": 1650000, "cat": "Shawls"},
            {"name": "Organza Tissue Hand-Painted Saree", "sku": "SLK-ORG-07", "stock": 40, "lead": 7, "cost": 280000, "price": 650000, "cat": "Modern Drapes"},
            {"name": "Handloom Paithani Royal Peacock", "sku": "SLK-PTH-08", "stock": 12, "lead": 15, "cost": 1100000, "price": 2450000, "cat": "Heirloom Weaves"},
            {"name": "Bandhani Georgette Gota Patti", "sku": "SLK-BND-09", "stock": 30, "lead": 8, "cost": 420000, "price": 950000, "cat": "Festive"},
            {"name": "Festive Silk Anarkali Gown", "sku": "GWN-ANK-10", "stock": 22, "lead": 9, "cost": 550000, "price": 1240000, "cat": "Occasion Wear"}
        ],
        "anomaly_spike": {
            "method": "card",
            "hours": [20, 21],
            "fail_rate": 0.36,
            "fail_reason": "CARD_NETWORK_OUTAGE_VISA_AUTH_REJECT",
            "gateway_code": "GATEWAY_REJECT_CARD_NETWORK"
        },
        "gt_payment_desc": "Card payment dropouts concentrated between 20:00-22:00 yesterday (failure rate ~36% vs 4.8% baseline) due to Visa 3DS auth timeout",
        "gt_stock_desc": "Kanjeevaram Bridal Zari Silk stock level (3 units) critically low against 14-day handloom weaving lead time (~₹1,02,000 revenue at risk)",
        "gt_stock_sku": "SLK-KNJ-02",
        "gt_churn_desc": "7 high-value boutique buyers inactive for >60 days representing ₹2,10,000 historical LTV"
    },
    {
        "name": "BlueStone Artisanal Roasters",
        "razorpay_account_id": "acc_BAR_rzp_2026",
        "category": "Specialty Coffee & Cafe Subscriptions",
        "email": "owner@bluestoneroasters.in",
        "avatar_color": "amber",
        "customer_count": 80,
        "skus": [
            {"name": "Chikmagalur Estate Dark Roast 500g", "sku": "COF-CHK-01", "stock": 140, "lead": 4, "cost": 28000, "price": 68000, "cat": "Whole Bean"},
            {"name": "Monsooned Malabar AA 500g", "sku": "COF-MNM-02", "stock": 110, "lead": 4, "cost": 32000, "price": 79000, "cat": "Whole Bean"},
            {"name": "Ethiopian Yirgacheffe Single Origin 250g", "sku": "COF-ETH-03", "stock": 60, "lead": 8, "cost": 45000, "price": 98000, "cat": "Micro-Lot"},
            {"name": "Valve Packaging Pouches (500g) Box", "sku": "PKG-VLV-04", "stock": 3, "lead": 10, "cost": 140000, "price": 340000, "cat": "Packaging", "stockout_target": True},
            {"name": "Barista Oat Milk 1L Pack of 6", "sku": "MLK-OAT-05", "stock": 85, "lead": 5, "cost": 65000, "price": 145000, "cat": "Cafe Supplies"},
            {"name": "Cold Brew Concentrate Bottle 1L", "sku": "BRW-CLD-06", "stock": 70, "lead": 3, "cost": 34000, "price": 85000, "cat": "Ready-to-Drink"},
            {"name": "Ceramic V60 Pour-Over Dripper Set", "sku": "EQU-V60-07", "stock": 45, "lead": 6, "cost": 95000, "price": 220000, "cat": "Brew Gear"},
            {"name": "Manual Conical Burr Coffee Grinder", "sku": "EQU-GRN-08", "stock": 25, "lead": 8, "cost": 160000, "price": 380000, "cat": "Brew Gear"},
            {"name": "Cascara Coffee Cherry Tea 200g", "sku": "TEA-CSC-09", "stock": 90, "lead": 4, "cost": 21000, "price": 52000, "cat": "Cascara"},
            {"name": "Espresso Blend No. 4 Roast 1kg", "sku": "COF-ESP-10", "stock": 80, "lead": 5, "cost": 68000, "price": 155000, "cat": "B2B Wholesale"}
        ],
        "anomaly_spike": {
            "method": "netbanking",
            "hours": [18, 19],
            "fail_rate": 0.29,
            "fail_reason": "MANDATE_EXECUTION_FAILED",
            "gateway_code": "NETBANKING_TIMED_OUT"
        },
        "gt_payment_desc": "Recurring mandate Netbanking debit failures between 18:00-20:00 yesterday (failure rate ~29% vs 5.2% baseline) due to bank core degradation",
        "gt_stock_desc": "Valve Packaging Pouches stock (3 boxes) depleted below 10-day supplier lead time, stalling roasted bean shipments (~₹84,000 revenue at risk)",
        "gt_stock_sku": "PKG-VLV-04",
        "gt_churn_desc": "9 recurring cafe wholesale buyers inactive for >35 days representing ₹1,45,000 monthly subscription revenue at risk"
    }
]

def seed_one_merchant(db: Session, spec: Dict[str, Any], now: datetime) -> str:
    existing = db.query(Merchant).filter(Merchant.name == spec["name"]).first()
    if existing:
        return existing.id

    merchant_id = str(uuid.uuid4())

    # 1. Merchant
    merchant = Merchant(
        id=merchant_id,
        name=spec["name"],
        razorpay_account_id=spec["razorpay_account_id"],
        created_at=now - timedelta(days=90)
    )
    db.add(merchant)
    db.flush()

    # 2. Owner User
    owner_user = User(
        id=str(uuid.uuid4()),
        merchant_id=merchant_id,
        email=spec["email"],
        role="owner",
        password_hash=get_password_hash("MitraOS@2026"),
        created_at=now - timedelta(days=90)
    )
    db.add(owner_user)

    # 3. Default Policies
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
            max_auto_spend_paise=1000000,
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

    # 4. Products
    products_map = {}
    stockout_sku = None
    for item in spec["skus"]:
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
        if item.get("stockout_target"):
            stockout_sku = item["sku"]

    # 5. Customers
    first_names = ["Aarav", "Aditi", "Rohan", "Priya", "Vikram", "Sneha", "Karan", "Ananya", "Rahul", "Pooja", "Arjun", "Neha", "Sameer", "Tanvi", "Amit", "Deepika", "Kunal", "Meera", "Varun", "Rhea", "Gaurav", "Simran", "Naveen", "Shreya"]
    last_names = ["Sharma", "Verma", "Patel", "Mehta", "Iyer", "Nair", "Reddy", "Gupta", "Kulkarni", "Joshi", "Singhania", "Deshmukh", "Kapoor", "Bhatia", "Chopra", "Malhotra"]

    count = spec.get("customer_count", 80)
    customers_list = []
    for i in range(count):
        c_name = f"{random.choice(first_names)} {random.choice(last_names)}"
        c_email = f"buyer_{spec['avatar_color']}_{i+1}@example.com"
        c_phone = f"+9198{random.randint(10000000, 99999999)}"
        if i < 8:
            ltv = random.randint(1500000, 3000000)
            last_p = now - timedelta(days=random.randint(48, 65))
        else:
            ltv = random.randint(150000, 900000)
            last_p = now - timedelta(days=random.randint(1, 35))

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

    # 6. Orders & Payments
    methods = ["UPI", "card", "netbanking", "wallet"]
    method_weights = [0.65, 0.20, 0.10, 0.05]
    product_keys = list(products_map.keys())
    spike = spec["anomaly_spike"]

    for day_offset in range(30, 0, -1):
        daily_orders_count = random.randint(55, 75)
        day_date = now - timedelta(days=day_offset)

        for _ in range(daily_orders_count):
            order_hour = random.randint(8, 22)
            order_time = day_date.replace(hour=order_hour, minute=random.randint(0, 59), second=random.randint(0, 59))

            # Stockout item high velocity in last 5 days
            if stockout_sku and day_offset <= 5 and random.random() < 0.28:
                sku_choice = stockout_sku
            else:
                sku_choice = random.choice(product_keys)

            prod = products_map[sku_choice]
            cust = random.choice(customers_list)
            qty = 1 if prod.unit_price_paise > 100000 else random.randint(1, 2)
            amount = prod.unit_price_paise * qty

            order_id = str(uuid.uuid4())
            method = random.choices(methods, weights=method_weights)[0]

            is_anomaly_window = (
                day_offset == 1 and
                order_hour in spike["hours"] and
                (method.lower() == spike["method"].lower() or method == spike["method"])
            )

            if is_anomaly_window:
                is_failed = random.random() < spike["fail_rate"]
                fail_reason = spike["fail_reason"] if is_failed else None
                gateway_code = spike["gateway_code"] if is_failed else "SUCCESS"
            else:
                if method == "UPI":
                    is_failed = random.random() < 0.075
                    fail_reason = "INSUFFICIENT_FUNDS" if (is_failed and random.random() < 0.5) else ("BANK_DEGRADED" if is_failed else None)
                elif method == "card":
                    is_failed = random.random() < 0.048
                    fail_reason = "CARD_AUTHENTICATION_FAILED" if is_failed else None
                else:
                    is_failed = random.random() < 0.055
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
                razorpay_payment_id=f"pay_{spec['avatar_color']}_{uuid.uuid4().hex[:10]}",
                method=method,
                status=pay_status,
                failure_reason=fail_reason,
                gateway_response_code=gateway_code,
                created_at=order_time + timedelta(seconds=random.randint(10, 45))
            )
            db.add(payment)

    # 7. Ground Truth Labels
    gt_labels = [
        GroundTruthLabel(
            id=str(uuid.uuid4()),
            merchant_id=merchant_id,
            anomaly_type="payment_failure_spike",
            description=spec["gt_payment_desc"],
            injected_dimensions={"method": spike["method"], "time_window": f"{spike['hours'][0]}:00-{spike['hours'][-1]+1}:00", "gateway_code": spike["gateway_code"]},
            expected_severity="high",
            is_detected=False
        ),
        GroundTruthLabel(
            id=str(uuid.uuid4()),
            merchant_id=merchant_id,
            anomaly_type="stock_depletion_risk",
            description=spec["gt_stock_desc"],
            injected_dimensions={"sku": spec["gt_stock_sku"], "days_stock_left": 3, "lead_time_days": 8},
            expected_severity="medium",
            is_detected=False
        ),
        GroundTruthLabel(
            id=str(uuid.uuid4()),
            merchant_id=merchant_id,
            anomaly_type="churn_risk",
            description=spec["gt_churn_desc"],
            injected_dimensions={"customer_count": 8, "inactivity_threshold_days": 45},
            expected_severity="low",
            is_detected=False
        )
    ]
    for gt in gt_labels:
        db.add(gt)

    # 8. Initial Audit Log
    db.add(AuditLog(
        id=str(uuid.uuid4()),
        merchant_id=merchant_id,
        entity_type="system",
        entity_id=merchant_id,
        event="created",
        actor="system_rule",
        payload={"message": f"Multi-tenant synthetic business '{spec['name']}' initialized with ground truth anomalies"},
        created_at=now
    ))

    db.commit()
    return merchant_id

def seed_synthetic_merchant_data(db: Session) -> str:
    """
    Seeds all 3 synthetic businesses and runs autonomous detection & action pipelines for each.
    Returns the ID of the first primary merchant.
    """
    now = datetime.now(timezone.utc)
    merchant_ids = []
    for spec in MERCHANTS_SPEC:
        m_id = seed_one_merchant(db, spec, now)
        merchant_ids.append(m_id)
        # Run detection pipeline if issues don't exist yet for this merchant
        from app.models.schema import Issue
        issues_exist = db.query(Issue).filter(Issue.merchant_id == m_id).first()
        if not issues_exist:
            signals = DetectionEngine.run_detection_pipeline(db, m_id)
            issues = ReasoningEngine.reason_over_signals(db, m_id, signals)
            ActionPlanner.plan_actions_for_issues(db, m_id, issues)

    return merchant_ids[0] if merchant_ids else ""

def seed_missing_merchants(db: Session) -> List[str]:
    """Ensures all 3 merchants from MERCHANTS_SPEC exist in DB."""
    return [seed_synthetic_merchant_data(db)]
