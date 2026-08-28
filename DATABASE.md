# MitraOS — Database Schema & Architecture

MitraOS uses PostgreSQL (hosted on Neon serverless or local Docker Postgres) with full SQLite local support via SQLAlchemy ORM.

---

## 1. Entity-Relationship Diagram

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│  merchants   │───1:N─│   products   │───1:N─│    orders    │
└──────┬───────┘       └──────────────┘       └──────┬───────┘
       │                                             │ 1:1
       │ 1:N                                  ┌──────▼───────┐
       ├───────▶ customers                    │   payments   │
       │                                      └──────────────┘
       ├───────▶ signals ───1:N─▶ issues ───1:N─▶ actions
       │
       ├───────▶ policies
       ├───────▶ audit_log
       ├───────▶ webhook_events
       └───────▶ users
```

---

## 2. Table Definitions

### 2.1 `merchants`
Primary multi-tenant table identifying the nursery business.
- `id` (UUID PK): Unique merchant identifier
- `name` (TEXT): Business name (`GreenLeaf Botanics & Nursery`)
- `razorpay_account_id` (TEXT): Linked Razorpay Merchant ID (`acc_GLN_rzp_2026`)
- `created_at` (TIMESTAMPTZ)

### 2.2 `products`
Inventory catalogue items.
- `id` (UUID PK)
- `merchant_id` (UUID FK → `merchants.id`)
- `name` (TEXT): E.g. `Monstera Deliciosa (Large)`
- `sku` (TEXT): E.g. `PLN-MON-01`
- `current_stock` (INT): Current inventory count
- `supplier_lead_time_days` (INT): Restocking lead time
- `unit_cost_paise` (BIGINT): Wholesale unit cost in paise
- `unit_price_paise` (BIGINT): Retail unit selling price in paise
- `category` (TEXT): Foliage, Trees, Care, etc.

### 2.3 `orders`
Customer transaction orders.
- `id` (UUID PK)
- `merchant_id` (UUID FK → `merchants.id`)
- `customer_id` (UUID FK → `customers.id`)
- `product_id` (UUID FK → `products.id`)
- `quantity` (INT)
- `amount_paise` (BIGINT)
- `status` (TEXT): `created`, `paid`, `failed`, `refunded`
- `created_at` (TIMESTAMPTZ)

### 2.4 `payments`
Payment gateway attempts and gateway error diagnostic codes.
- `id` (UUID PK)
- `order_id` (UUID FK → `orders.id` UNIQUE)
- `razorpay_payment_id` (TEXT): Gateway payment reference
- `method` (TEXT): `UPI`, `card`, `netbanking`, `wallet`
- `status` (TEXT): `success`, `failed`, `pending`
- `failure_reason` (TEXT NULLABLE): Bank/Network reason
- `gateway_response_code` (TEXT NULLABLE): E.g. `GATEWAY_TIMEOUT_NPCI_DEGRADED`
- `created_at` (TIMESTAMPTZ)

### 2.5 `customers`
Customer relationship records.
- `id` (UUID PK)
- `merchant_id` (UUID FK → `merchants.id`)
- `name` (TEXT)
- `email` (TEXT)
- `phone` (TEXT)
- `total_lifetime_value_paise` (BIGINT)
- `last_purchase_at` (TIMESTAMPTZ)

### 2.6 `signals` (Detection Layer Output)
Structured signals surfaced by rules, statistical z-scores, and ML risk scoring.
- `id` (UUID PK)
- `merchant_id` (UUID FK → `merchants.id`)
- `signal_type` (TEXT): `payment_failure_spike`, `stock_depletion_risk`, `churn_risk`
- `dimensions` (JSONB): Granular contextual parameters
- `baseline_value` (NUMERIC)
- `observed_value` (NUMERIC)
- `confidence` (NUMERIC): Probability score (e.g. `0.9620`)
- `fingerprint` (TEXT UNIQUE): Deduplication key per `(merchant, type, dimensions, day)`
- `detected_at` (TIMESTAMPTZ)

### 2.7 `issues` (Reasoning Layer Output)
Surfaced operational problems ready for owner review.
- `id` (UUID PK)
- `merchant_id` (UUID FK → `merchants.id`)
- `signal_id` (UUID FK → `signals.id`)
- `severity` (TEXT): `high`, `medium`, `low`
- `explanation` (TEXT): Plain-language narrative
- `root_cause_chain` (JSONB): Ordered step chain
- `estimated_impact_paise` (BIGINT): Potential lost revenue
- `status` (TEXT): `detected` → `explained` → `recommendation_ready` → `approved` / `rejected` → `executing` → `completed` / `failed`
- `created_at` (TIMESTAMPTZ)

### 2.8 `actions` (Action Planner Output)
Concrete executable remediation plans.
- `id` (UUID PK)
- `issue_id` (UUID FK → `issues.id`)
- `action_type` (TEXT): `retry_payment`, `create_purchase_order`, `send_reengagement_campaign`
- `parameters` (JSONB): Payload parameters
- `requires_approval` (BOOLEAN): Evaluated by Policy Engine
- `approved_by` (UUID FK → `users.id`)
- `approved_at` (TIMESTAMPTZ)
- `status` (TEXT): `proposed`, `approved`, `rejected`, `executing`, `completed`, `failed`
- `result` (JSONB): Outcome data including `amount_recovered_paise`
- `created_at` (TIMESTAMPTZ)

### 2.9 `policies`
Merchant-configured bounded autonomy limits.
- `id` (UUID PK)
- `merchant_id` (UUID FK → `merchants.id`)
- `action_type` (TEXT)
- `max_auto_spend_paise` (BIGINT)
- `requires_approval` (BOOLEAN DEFAULT TRUE)
- `cooldown_hours` (INT)

### 2.10 `audit_log`
Immutable audit log of all system decisions.
- `id` (UUID PK)
- `merchant_id` (UUID FK → `merchants.id`)
- `entity_type` (TEXT): `signal`, `issue`, `action`, `webhook`
- `entity_id` (UUID)
- `event` (TEXT): `created`, `approved`, `rejected`, `executed`, `failed`
- `actor` (TEXT): `system_rule`, `ml_model`, `llm`, `human:owner`
- `payload` (JSONB)
- `created_at` (TIMESTAMPTZ)

### 2.11 `webhook_events`
Raw incoming webhook payloads for idempotency, replay, and audit.
- `id` (UUID PK)
- `merchant_id` (UUID FK → `merchants.id`)
- `provider` (TEXT): `razorpay`
- `event_type` (TEXT)
- `signature_verified` (BOOLEAN)
- `payload` (JSONB)
- `processed` (BOOLEAN)
- `received_at` (TIMESTAMPTZ)

### 2.12 `users`
Merchant user profiles for authentication.
- `id` (UUID PK)
- `merchant_id` (UUID FK → `merchants.id`)
- `email` (TEXT UNIQUE)
- `role` (TEXT): `owner`, `staff`
- `password_hash` (TEXT)

---

## 3. Ground Truth Evaluation Schema

### `ground_truth_labels`
Used to evaluate Detection Layer precision and false-alert rates live against injected scenarios.
- `id` (UUID PK)
- `merchant_id` (UUID FK → `merchants.id`)
- `anomaly_type` (TEXT)
- `description` (TEXT)
- `injected_dimensions` (JSONB)
- `expected_severity` (TEXT)
- `is_detected` (BOOLEAN)
- `detected_signal_id` (TEXT)
