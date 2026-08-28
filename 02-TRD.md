# Technical Requirements Document (TRD)
## MitraOS — Autonomous Early-Warning & Action System

---

## 1. System Overview

MitraOS is a layered agent system, not a single LLM call. The pipeline is strictly:

```
Raw business data
      ↓
Rules / SQL / ML  (Detect)
      ↓
Anomaly detection
      ↓
LLM reasoning      (Understand)
      ↓
Action planner     (Decide)
      ↓
Policy engine       (Control)
      ↓
Human approval
      ↓
Razorpay / business APIs  (Act)
```

This separation is a core technical differentiator and must be visibly demonstrable in the demo (i.e., logs/traces should show which layer produced which output).

## 2. High-Level Architecture

```
┌─────────────────────┐
│      MitraOS         │
│  AI Business Agent   │
└──────────┬───────────┘
           │
 ┌─────────┼──────────┐
 ↓         ↓          ↓
Payments  Orders   Inventory
 ↓         ↓          ↓
Razorpay  Store/ERP  Stock
 API        data       data
 └─────────┼──────────┘
           ↓
   AI Reasoning Layer
           ↓
Detect → Understand → Decide → Act
```

## 3. Component Breakdown

### 3.1 Data Ingestion Layer
- **Razorpay data** arrives via **webhooks** (payments, orders, refunds, settlements, payment status) — a FastAPI webhook endpoint validates the signature and writes normalized events directly to the database, avoiding polling latency/cost.
- **Store/ERP and inventory data** (order/product data, stock levels, supplier lead times) is loaded via a scheduled FastAPI background task (mocked/synthetic for the demo, since no live ERP is in scope).
- All sources normalize into a common event schema before being written to the transactional database.

### 3.2 Detection Layer (ML / Rules / SQL)
- Deterministic and statistical checks — no LLM involved here.
- Responsibilities:
  - Rolling-baseline computation per metric (e.g., 7/30-day rolling failure rate per product/route/hour)
  - Anomaly detection (z-score / threshold-based for hackathon scope; can mention extensibility to ML models)
  - Candidate detections: payment failure spikes, sales velocity vs. stock depletion, customer purchase-recency gaps
- Output: structured "signal" objects (metric, magnitude, dimensions, confidence) — never free text.

### 3.3 AI Reasoning Layer (LLM)
- Input: structured signal objects only (not raw data) — keeps prompts small and grounded.
- Responsibilities:
  - Root-cause narrowing (e.g., correlate failure spike with payment method + time window + gateway response pattern)
  - Plain-language explanation of the issue
  - Draft of recommended action(s) with rationale
- Output: structured JSON (issue summary, root cause hypothesis, recommended action, confidence, severity) — parsed by the Action Planner, not shown raw to the user.

### 3.4 Action Planner
- Converts LLM recommendation into one or more candidate Action objects (type, target, parameters, estimated impact).
- Examples: `retry_payment`, `send_payment_reminder`, `create_purchase_order`, `send_reengagement_campaign`.

### 3.5 Policy Engine
- Deterministic rule layer answering: "What is this agent allowed to do?"
- Policies define:
  - Which action types require approval vs. can auto-execute
  - Spend limits / customer-contact limits
  - Cooldowns (e.g., don't retry a payment twice in the same failure category)
- Every action passes through the policy engine before execution or before being surfaced for approval.

### 3.6 Approval & Execution Layer
- Presents proposed action(s) to the owner (UI card / chat reply) with an Approve/Reject control.
- On approval: executes via the relevant integration (Razorpay API, notification service, mock ERP).
- Execution is idempotent — re-approving or retrying an already-executed action is a no-op, tracked via an `action_status` state machine (`proposed → approved → executing → completed/failed`).

### 3.7 Morning Brief Generator
- Scheduled job (e.g., daily 6 AM) that aggregates the previous day's detections into a ranked digest (High/Medium/Low severity), pre-drafts actions, and delivers via UI/notification.

### 3.8 Audit & Metrics Layer
- Every detection, LLM output, proposed action, approval decision, and execution result is logged.
- Powers the demo metrics screen: revenue at risk, revenue recovered, detection accuracy, false-alert rate, actions executed vs. pending.

## 4. Final Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend | React + TypeScript + Vite + Tailwind CSS | Dashboard, Morning Brief UI, approval cards |
| Backend | FastAPI (Python) | Single backend service — REST API + agent orchestration live together, no separate Node service |
| Database | PostgreSQL + SQLAlchemy + Alembic | SQLAlchemy as ORM, Alembic for versioned schema migrations |
| AI/ML (Detection layer) | XGBoost + scikit-learn | Anomaly/risk scoring on structured signals (failure-rate spikes, stockout risk, churn risk) |
| AI (Reasoning layer) | LLM API (Claude) | Root-cause narrowing, plain-language explanation, action recommendation |
| Agent | Tool-calling + custom agent orchestrator | Python-native orchestrator wraps detection → LLM → action-planner → policy-engine steps as callable tools; no heavyweight agent framework needed |
| Payments | Razorpay APIs + Webhooks | Webhooks replace polling for payment status changes → lower latency, lower cost than scheduled polling |
| Realtime | WebSockets | Push Morning Brief updates, issue status, and execution progress to the frontend live |
| Auth | JWT | Single merchant/owner login for demo |
| Deployment — Frontend | Vercel | React/Vite build, free tier |
| Deployment — Backend | Render | FastAPI service, free/low-cost tier |
| Deployment — Database | Neon | Serverless Postgres, free tier |
| Source control | GitHub | |

**Stack rationale:** Everything runs on free/low-cost tiers (Vercel + Render + Neon) so implementation time goes into the AI agent and the business logic, not infrastructure setup. Consolidating backend + agent orchestration into one FastAPI service (instead of a separate Node API + Python agent service) removes an inter-service hop and keeps the detect→understand→decide→act pipeline in one codebase, which also makes the audit trail easier to reason about end-to-end.

### 4.1 Where each stack choice plugs into the pipeline

- **XGBoost/scikit-learn** sit in the **Detection Layer** (§3.2) — replacing/augmenting the z-score baseline with a trained risk-scoring model over the structured signal features (failure rate deltas, sales-velocity vs. stock ratio, purchase-recency gaps). Output is still a structured "signal" object, never free text.
- **The custom agent orchestrator** sits between the Detection Layer and the LLM Reasoning Layer (§3.3–3.4): it exposes detection results, policy checks, and action-execution handlers as callable **tools**, and the LLM is invoked in a tool-calling loop rather than a single free-form prompt — keeping the model's role strictly to reasoning/explanation/recommendation, not arbitrary action.
- **Webhooks** replace the scheduled-polling description in §3.1 for payment status — Razorpay pushes payment/order/refund/settlement events directly, which lowers both latency and API-call cost versus polling.
- **WebSockets** power live updates in the Approval & Execution Layer (§3.6) and Morning Brief (§3.7) — the frontend reflects `proposed → approved → executing → completed/failed` transitions in real time instead of polling the API.

## 5. Non-Functional Requirements

- **Latency:** Detection-to-recommendation pipeline should complete within a few seconds for demo-scale synthetic data (50k–100k transactions).
- **Idempotency:** All action executions must be safe to retry.
- **Auditability:** Every automated decision must be traceable to the signals that produced it.
- **Bounded autonomy:** No financial or customer-facing action executes without either explicit approval or a pre-approved policy rule.
- **Explainability:** Every flagged issue must carry a plain-language explanation, not just a raw metric.

## 6. Failure Handling

| Failure | Handling |
|---|---|
| Razorpay API timeout/error | Retry with backoff → fallback to cached/last-known data → flag as degraded in UI |
| LLM call failure/malformed output | Retry once → fall back to rules-only recommendation (no root-cause narrative) |
| Action execution failure | Mark action `failed`, surface to owner, do not silently retry financial actions |
| Duplicate detection (same anomaly re-flagged) | Deduplicate via signal fingerprint + cooldown window |

## 7. Synthetic Data & Evaluation

- Generate a synthetic merchant dataset (50k–100k transactions) with injected anomalies (payment failure spikes, stockout scenarios, churn patterns).
- Evaluate detection layer against known injected anomalies to report detection accuracy and false-alert rate live in the demo.
