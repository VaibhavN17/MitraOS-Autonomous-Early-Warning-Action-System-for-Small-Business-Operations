import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Integer, BigInteger, Numeric, Boolean, DateTime,
    ForeignKey, Text, JSON, Index, func
)
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

def utc_now():
    return datetime.now(timezone.utc)

class Merchant(Base):
    __tablename__ = "merchants"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    razorpay_account_id = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    products = relationship("Product", back_populates="merchant", cascade="all, delete-orphan")
    customers = relationship("Customer", back_populates="merchant", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="merchant", cascade="all, delete-orphan")
    signals = relationship("Signal", back_populates="merchant", cascade="all, delete-orphan")
    issues = relationship("Issue", back_populates="merchant", cascade="all, delete-orphan")
    policies = relationship("Policy", back_populates="merchant", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="merchant", cascade="all, delete-orphan")
    webhook_events = relationship("WebhookEvent", back_populates="merchant", cascade="all, delete-orphan")
    users = relationship("User", back_populates="merchant", cascade="all, delete-orphan")

class Product(Base):
    __tablename__ = "products"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    merchant_id = Column(String(36), ForeignKey("merchants.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    sku = Column(String(100), nullable=False, index=True)
    current_stock = Column(Integer, nullable=False, default=0)
    supplier_lead_time_days = Column(Integer, nullable=False, default=7)
    unit_cost_paise = Column(BigInteger, nullable=False, default=0)
    unit_price_paise = Column(BigInteger, nullable=False, default=0)
    category = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    merchant = relationship("Merchant", back_populates="products")
    orders = relationship("Order", back_populates="product")

class Customer(Base):
    __tablename__ = "customers"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    merchant_id = Column(String(36), ForeignKey("merchants.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    total_lifetime_value_paise = Column(BigInteger, nullable=False, default=0)
    last_purchase_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    merchant = relationship("Merchant", back_populates="customers")
    orders = relationship("Order", back_populates="customer")

class Order(Base):
    __tablename__ = "orders"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    merchant_id = Column(String(36), ForeignKey("merchants.id"), nullable=False, index=True)
    customer_id = Column(String(36), ForeignKey("customers.id"), nullable=False, index=True)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False, index=True)
    quantity = Column(Integer, nullable=False, default=1)
    amount_paise = Column(BigInteger, nullable=False)
    status = Column(String(50), nullable=False, default="created", index=True)  # created, paid, failed, refunded
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False, index=True)

    merchant = relationship("Merchant", back_populates="orders")
    customer = relationship("Customer", back_populates="orders")
    product = relationship("Product", back_populates="orders")
    payment = relationship("Payment", back_populates="order", uselist=False, cascade="all, delete-orphan")

class Payment(Base):
    __tablename__ = "payments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    order_id = Column(String(36), ForeignKey("orders.id"), nullable=False, unique=True, index=True)
    razorpay_payment_id = Column(String(100), nullable=True, index=True)
    method = Column(String(50), nullable=False, index=True)  # UPI, card, netbanking, wallet
    status = Column(String(50), nullable=False, index=True)  # success, failed, pending
    failure_reason = Column(Text, nullable=True)
    gateway_response_code = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False, index=True)

    order = relationship("Order", back_populates="payment")

    __table_args__ = (
        Index("ix_payments_method_status_created", "method", "status", "created_at"),
    )

class Signal(Base):
    __tablename__ = "signals"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    merchant_id = Column(String(36), ForeignKey("merchants.id"), nullable=False, index=True)
    signal_type = Column(String(100), nullable=False, index=True)  # payment_failure_spike, stock_depletion_risk, churn_risk
    dimensions = Column(JSON, nullable=False, default={})
    baseline_value = Column(Numeric(12, 4), nullable=False)
    observed_value = Column(Numeric(12, 4), nullable=False)
    confidence = Column(Numeric(5, 4), nullable=False)
    fingerprint = Column(String(255), nullable=False, unique=True, index=True)
    detected_at = Column(DateTime(timezone=True), default=utc_now, nullable=False, index=True)

    merchant = relationship("Merchant", back_populates="signals")
    issues = relationship("Issue", back_populates="signal")

class Issue(Base):
    __tablename__ = "issues"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    merchant_id = Column(String(36), ForeignKey("merchants.id"), nullable=False, index=True)
    signal_id = Column(String(36), ForeignKey("signals.id"), nullable=True, index=True)
    severity = Column(String(20), nullable=False, index=True)  # high, medium, low
    explanation = Column(Text, nullable=False)
    root_cause_chain = Column(JSON, nullable=False, default=[])
    estimated_impact_paise = Column(BigInteger, nullable=False, default=0)
    status = Column(String(50), nullable=False, default="recommendation_ready", index=True)
    # detected, explained, recommendation_ready, approved, rejected, executing, completed, failed
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False, index=True)

    merchant = relationship("Merchant", back_populates="issues")
    signal = relationship("Signal", back_populates="issues")
    actions = relationship("Action", back_populates="issue", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_issues_merchant_status_sev", "merchant_id", "status", "severity"),
    )

class Action(Base):
    __tablename__ = "actions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    issue_id = Column(String(36), ForeignKey("issues.id"), nullable=False, index=True)
    action_type = Column(String(100), nullable=False, index=True)
    # retry_payment, send_payment_reminder, create_purchase_order, send_reengagement_campaign
    parameters = Column(JSON, nullable=False, default={})
    requires_approval = Column(Boolean, nullable=False, default=True)
    approved_by = Column(String(36), ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(50), nullable=False, default="proposed", index=True)
    # proposed, approved, rejected, executing, completed, failed
    result = Column(JSON, nullable=True)  # { amount_recovered_paise: ..., details: ... }
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False, index=True)

    issue = relationship("Issue", back_populates="actions")
    approver = relationship("User")

class Policy(Base):
    __tablename__ = "policies"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    merchant_id = Column(String(36), ForeignKey("merchants.id"), nullable=False, index=True)
    action_type = Column(String(100), nullable=False, index=True)
    max_auto_spend_paise = Column(BigInteger, nullable=True)
    requires_approval = Column(Boolean, nullable=False, default=True)
    cooldown_hours = Column(Integer, nullable=False, default=24)

    merchant = relationship("Merchant", back_populates="policies")

class AuditLog(Base):
    __tablename__ = "audit_log"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    merchant_id = Column(String(36), ForeignKey("merchants.id"), nullable=False, index=True)
    entity_type = Column(String(50), nullable=False, index=True)  # signal, issue, action, webhook
    entity_id = Column(String(36), nullable=False, index=True)
    event = Column(String(50), nullable=False, index=True)  # created, updated, approved, rejected, executed, failed
    actor = Column(String(100), nullable=False)  # system_rule, ml_model, llm, human:{user_id}
    payload = Column(JSON, nullable=False, default={})
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False, index=True)

    merchant = relationship("Merchant", back_populates="audit_logs")

class WebhookEvent(Base):
    __tablename__ = "webhook_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    merchant_id = Column(String(36), ForeignKey("merchants.id"), nullable=False, index=True)
    provider = Column(String(50), nullable=False, default="razorpay")
    event_type = Column(String(100), nullable=False, index=True)
    signature_verified = Column(Boolean, nullable=False, default=False)
    payload = Column(JSON, nullable=False)
    processed = Column(Boolean, nullable=False, default=False)
    received_at = Column(DateTime(timezone=True), default=utc_now, nullable=False, index=True)

    merchant = relationship("Merchant", back_populates="webhook_events")

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    merchant_id = Column(String(36), ForeignKey("merchants.id"), nullable=False, index=True)
    email = Column(String(255), nullable=False, unique=True, index=True)
    role = Column(String(50), nullable=False, default="owner")  # owner, staff, admin
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    merchant = relationship("Merchant", back_populates="users")

class GroundTruthLabel(Base):
    __tablename__ = "ground_truth_labels"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    merchant_id = Column(String(36), ForeignKey("merchants.id"), nullable=False, index=True)
    anomaly_type = Column(String(100), nullable=False)  # payment_failure_spike, stockout, churn
    description = Column(Text, nullable=False)
    injected_dimensions = Column(JSON, nullable=False)
    expected_severity = Column(String(20), nullable=False)
    is_detected = Column(Boolean, default=False)
    detected_signal_id = Column(String(36), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
