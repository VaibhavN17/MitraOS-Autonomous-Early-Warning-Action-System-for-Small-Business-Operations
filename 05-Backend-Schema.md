# Backend Schema Design
## MitraOS

---

## 1. Design Notes

- PostgreSQL (hosted on Neon), modeled with **SQLAlchemy** ORM; schema changes managed as versioned **Alembic** migrations from day one so the schema can evolve safely during the hackathon build.
- All monetary values stored as integers in paise (avoid float rounding issues).
- Every table that represents an agent decision includes a `created_by` discriminator (`system_rule`, `ml_model`, `llm`, `human`) to keep the detect→decide→act separation auditable.
- `payments` rows are written by the Razorpay **webhook** handler (not a polling job) — see `webhook_events` below for the raw-event audit trail.

## 2. Core Tables

### 2.1 `merchants`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | text | |
| razorpay_account_id | text | |
| created_at | timestamptz | |

### 2.2 `products`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| merchant_id | uuid FK → merchants | |
| name | text | |
| sku | text | |
| current_stock | int | |
| supplier_lead_time_days | int | |
| unit_cost_paise | bigint | |

### 2.3 `orders`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| merchant_id | uuid FK | |
| customer_id | uuid FK → customers | |
| product_id | uuid FK | |
| quantity | int | |
| amount_paise | bigint | |
| status | text | `created`, `paid`, `failed`, `refunded` |
| created_at | timestamptz | |

### 2.4 `payments`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| order_id | uuid FK | |
| razorpay_payment_id | text | |
| method | text | UPI, card, netbanking, etc. |
| status | text | `success`, `failed`, `pending` |
| failure_reason | text nullable | |
| gateway_response_code | text nullable | |
| created_at | timestamptz | |

### 2.5 `customers`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| merchant_id | uuid FK | |
| name | text | |
| total_lifetime_value_paise | bigint | |
| last_purchase_at | timestamptz | |

### 2.6 `signals` (Detection layer output)
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| merchant_id | uuid FK | |
| signal_type | text | `payment_failure_spike`, `stock_depletion_risk`, `churn_risk` |
| dimensions | jsonb | e.g., `{product_id, payment_method, time_window}` |
| baseline_value | numeric | |
| observed_value | numeric | |
| confidence | numeric | |
| fingerprint | text | dedup key, unique per (merchant, type, dimensions, day) |
| detected_at | timestamptz | |

### 2.7 `issues` (Reasoning layer output, one per surfaced problem)
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| merchant_id | uuid FK | |
| signal_id | uuid FK → signals | |
| severity | text | `high`, `medium`, `low` |
| explanation | text | plain-language, LLM-generated |
| root_cause_chain | jsonb | ordered array of narrowing steps |
| estimated_impact_paise | bigint | |
| status | text | `detected`, `explained`, `recommendation_ready`, `approved`, `rejected`, `executing`, `completed`, `failed` |
| created_at | timestamptz | |

### 2.8 `actions` (Action planner output)
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| issue_id | uuid FK → issues | |
| action_type | text | `retry_payment`, `send_payment_reminder`, `create_purchase_order`, `send_reengagement_campaign` |
| parameters | jsonb | action-specific payload |
| requires_approval | boolean | set by policy engine |
| approved_by | uuid nullable FK → users | |
| approved_at | timestamptz nullable | |
| status | text | `proposed`, `approved`, `rejected`, `executing`, `completed`, `failed` |
| result | jsonb nullable | outcome data (e.g., amount recovered) |
| created_at | timestamptz | |

### 2.9 `policies`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| merchant_id | uuid FK | |
| action_type | text | |
| max_auto_spend_paise | bigint nullable | |
| requires_approval | boolean | default true |
| cooldown_hours | int | prevents duplicate actions |

### 2.10 `audit_log`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| merchant_id | uuid FK | |
| entity_type | text | `signal`, `issue`, `action` |
| entity_id | uuid | |
| event | text | `created`, `updated`, `approved`, `rejected`, `executed`, `failed` |
| actor | text | `system`, `llm`, `human:{user_id}` |
| payload | jsonb | |
| created_at | timestamptz | |

### 2.11 `webhook_events`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| merchant_id | uuid FK | |
| provider | text | `razorpay` |
| event_type | text | e.g., `payment.failed`, `order.paid`, `refund.processed` |
| signature_verified | boolean | |
| payload | jsonb | raw webhook body, kept for audit/replay |
| processed | boolean | whether it was successfully normalized into `payments`/`orders` |
| received_at | timestamptz | |

### 2.12 `users`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| merchant_id | uuid FK | |
| email | text | |
| role | text | `owner`, `staff` |
| password_hash | text | |

## 3. Relationships Overview

```
merchants 1─* products
merchants 1─* customers
merchants 1─* orders
orders    1─1 payments
merchants 1─* signals
signals   1─* issues
issues    1─* actions
merchants 1─* policies
merchants 1─* audit_log
merchants 1─* webhook_events
merchants 1─* users
```

## 4. Indexing Notes

- `signals(fingerprint)` — unique index for deduplication.
- `payments(method, status, created_at)` — supports rolling baseline queries for failure-rate detection.
- `issues(merchant_id, status, severity)` — powers the Morning Brief query.
- `actions(status)` — powers the Metrics dashboard (executed vs. pending).

## 5. Metrics Derivation (query-level, not stored)

- **Revenue at risk:** `SUM(issues.estimated_impact_paise WHERE status NOT IN (completed))`
- **Revenue recovered:** `SUM(actions.result->>'amount_recovered_paise' WHERE status = completed)`
- **Detection accuracy / false-alert rate:** computed against the synthetic dataset's known injected-anomaly labels (evaluation-only table, not part of production schema).
