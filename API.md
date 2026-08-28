# MitraOS — API Specification
**Base URL:** `/api/v1`
**WebSocket URL:** `/ws`

---

## 1. Authentication & Users

### `POST /api/v1/auth/login`
Authenticates a merchant user and returns a signed JWT access token.
- **Request Body:**
  ```json
  {
    "email": "owner@greenleafnursery.in",
    "password": "MitraOS@2026"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "access_token": "eyJhbGci...",
    "token_type": "bearer",
    "user_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "merchant_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "email": "owner@greenleafnursery.in",
    "role": "owner",
    "merchant_name": "GreenLeaf Botanics & Nursery"
  }
  ```

### `GET /api/v1/auth/me`
Returns current merchant and session profile.

---

## 2. Daily Morning Brief

### `GET /api/v1/morning-brief`
Generates and returns yesterday's revenue summary, active severity-ranked risk cards, pre-drafted actions, and handled items for the day.
- **Response `200 OK`:**
  ```json
  {
    "date": "Thursday, 27 August 2026",
    "merchant": {
      "id": "...",
      "name": "GreenLeaf Botanics & Nursery"
    },
    "yesterday_summary": {
      "revenue_paise": 4860000,
      "orders_count": 68,
      "avg_order_value_paise": 71470
    },
    "risk_counts": {
      "high": 1,
      "medium": 1,
      "low": 1,
      "total_active": 3
    },
    "active_issues": [
      {
        "id": "...",
        "signal_id": "...",
        "severity": "high",
        "explanation": "₹18,400 potentially lost due to UPI failures...",
        "estimated_impact_paise": 1840000,
        "status": "recommendation_ready",
        "root_cause_chain": [
          {"step": 1, "title": "Baseline Comparison", "detail": "Normal UPI failure rate is 7.5%"},
          {"step": 2, "title": "Anomaly Observed", "detail": "Surged to 31.8%"},
          {"step": 3, "title": "Channel Isolation", "detail": "Concentrated in UPI"},
          {"step": 4, "title": "Time Window", "detail": "19:00-21:00 IST"},
          {"step": 5, "title": "Gateway Diagnostic", "detail": "GATEWAY_TIMEOUT_NPCI_DEGRADED"}
        ],
        "action": {
          "id": "...",
          "action_type": "retry_payment",
          "requires_approval": true,
          "parameters": { ... },
          "status": "proposed"
        }
      }
    ],
    "handled_today": []
  }
  ```

---

## 3. Issues & Root-Cause Investigation

### `GET /api/v1/issues/{issue_id}`
Returns granular issue information with root-cause diagnostic chain.

### `GET /api/v1/issues/{issue_id}/underlying-data`
Returns telemetry time-series and chart datasets behind the detection:
- `payment_failure_chart`: Hourly success vs. failure rates
- `stock_depletion_chart`: Inventory runway curve vs. safety buffer
- `churn_cohort_table`: VIP customer cohort records

---

## 4. Actions & Policy Execution

### `POST /api/v1/actions/{action_id}/approve`
Executes an approved remediation action with idempotency protection and Razorpay API recovery triggers.
- **Request Body (Optional):**
  ```json
  {
    "user_id": "...",
    "custom_parameters": { "quantity": 70 }
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "status": "completed",
    "action_id": "...",
    "result": {
      "action_type": "retry_payment",
      "amount_recovered_paise": 1280000,
      "customers_contacted": 21,
      "payments_recovered": 16,
      "summary": "Successfully recovered ₹12,800 across 16 customer payments via Razorpay retry links."
    }
  }
  ```

### `POST /api/v1/actions/{action_id}/reject`
Rejects or dismisses a proposed action.

### `PATCH /api/v1/actions/{action_id}`
Modifies candidate parameters (e.g., editing PO quantity).

---

## 5. Conversational AI Agent (Tool-Calling)

### `POST /api/v1/chat`
Handles natural language commands (Journey B: "Handle the payment issue") and returns structured actionable plan cards.
- **Request Body:**
  ```json
  {
    "message": "Handle the payment issue"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "id": "...",
    "reply": "I've analyzed the UPI payment degradation between 19:00–21:00. Out of 24 failed transactions, 21 are immediately recoverable...",
    "structured_plan": {
      "action_id": "...",
      "action_type": "retry_payment",
      "title": "Execute Payment Recovery Batch",
      "summary": "Prepare soft-retry on Razorpay gateway and send 1-click payment links to 21 affected customers.",
      "metrics": {
        "Failed Attempts": 24,
        "Eligible Customers": 21,
        "Total At Risk": "₹18,400",
        "Estimated Recoverable": "₹12,800"
      },
      "requires_approval": true,
      "estimated_impact_paise": 1840000
    },
    "created_at": "2026-08-27T19:40:00Z"
  }
  ```

---

## 6. Metrics & Evaluation Benchmarks

### `GET /api/v1/metrics?time_range=7d`
Returns live calculated KPIs:
- `revenue_at_risk_paise`
- `revenue_recovered_paise`
- `detection_accuracy_pct` (against ground truth)
- `false_alert_rate_pct`
- `actions_executed_count` vs `actions_pending_count`
- Ground-truth benchmark breakdown

---

## 7. Razorpay Webhook Ingestion

### `POST /api/v1/webhooks/razorpay`
Ingests Razorpay webhook events with HMAC-SHA256 signature verification:
- Headers: `X-Razorpay-Signature: <signature>`
- Supported events: `payment.failed`, `payment.captured`, `order.paid`, `refund.processed`

---

## 8. Real-Time WebSockets

### `WS /ws`
Bi-directional real-time WebSocket channel. Pushes live event notifications:
- `ACTION_UPDATED`: Status transitions (`approved` -> `executing` -> `completed`)
- `NEW_ANOMALY_DETECTED`: Live anomaly broadcasts from incoming webhooks or simulator
- `METRICS_UPDATED`: Live revenue counter updates
