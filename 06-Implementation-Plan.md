# Implementation Plan
## MitraOS — Razorpay Buildathon 2026 (Open Track)

---

## 1. Guiding Principle

Build the narrow vertical slice that proves the **detect → understand → decide → act** loop end-to-end with real numbers, rather than spreading effort across many shallow features. The judges reward demonstrated agent judgment and reliability, not feature count.

## 2. Phased Plan

### Phase 0 — Setup (Day 0–1)
- Repo scaffolding (single monorepo on GitHub): FastAPI backend (API + agent orchestrator in one service), React + Vite + Tailwind frontend.
- Provision Neon (PostgreSQL), set up SQLAlchemy models + Alembic migrations.
- Set up Razorpay test/sandbox account, API keys, and a webhook endpoint (ngrok or Render preview URL for local testing).
- Set up deployment pipelines early so every later phase ships continuously: frontend → Vercel, backend → Render, DB → Neon. All chosen specifically to stay on free/low-cost tiers.
- Define the core schema (see Backend Schema doc) and run the first migration.

### Phase 1 — Synthetic Data Generator (Day 1–2)
- Build a script generating a synthetic merchant: ~50k–100k transactions, 15 products, realistic customer base.
- Inject deliberate anomalies: a payment-failure spike (concentrated in one method/time window), a stock-depletion scenario, a churn pattern.
- Store ground-truth labels for injected anomalies separately, for later accuracy scoring.

### Phase 2 — Detection Layer (Day 2–3)
- Implement rolling-baseline computation per metric (payment failure rate, sales velocity, purchase recency).
- Start with threshold/z-score based anomaly flagging for a fast working baseline; layer in an **XGBoost (via scikit-learn)** risk-scoring model trained on the synthetic dataset's engineered features (failure-rate deltas, velocity/stock ratio, recency gaps) once the baseline pipeline is stable.
- Both approaches write to the same `signals` table shape, so the ML model is a drop-in upgrade, not a rework.
- Unit test against the synthetic dataset's known injected anomalies; tune thresholds/model for reasonable precision/recall.

### Phase 3 — Reasoning Layer + Agent Orchestrator (Day 3–4)
- Build the custom agent orchestrator inside the FastAPI service: exposes detection queries, policy checks, and action handlers as callable tools for the LLM (tool-calling pattern), rather than a single free-form prompt.
- Orchestrator takes a `signal`, invokes Claude in a tool-calling loop, returns structured JSON (explanation, root-cause chain, recommended action, confidence).
- Enforce output schema validation; fall back to a rules-only explanation if the LLM call fails or returns malformed output.
- Write `issues` rows from validated LLM output.
- Stand up the Razorpay webhook endpoint (payment/order/refund/settlement events → `webhook_events` → normalized into `payments`/`orders`) so the detection layer runs on real-time data rather than polled snapshots.

### Phase 4 — Action Planner + Policy Engine (Day 4–5)
- Implement action types: `retry_payment`, `send_payment_reminder`, `create_purchase_order`, `send_reengagement_campaign`.
- Implement policy rules table + engine: determines `requires_approval`, spend limits, cooldowns.
- Wire issue → candidate action(s) → policy evaluation → `actions` table.

### Phase 5 — Approval + Execution + Realtime (Day 5–6)
- Build approval endpoints (approve/reject an action).
- Implement execution handlers per action type (Razorpay retry/refund API calls for payment actions; mocked handlers for PO/campaign actions if external integrations are out of scope).
- Implement idempotency via action status state machine.
- Implement audit logging for every state transition.
- Add a **WebSocket** channel from FastAPI to the frontend so issue/action status changes (`proposed → approved → executing → completed/failed`) push live instead of requiring polling.

### Phase 6 — Morning Brief + Chat Interface (Day 6–7)
- Scheduled FastAPI background job to aggregate the prior day's issues into a ranked digest.
- Build the conversational endpoint: owner message → agent orchestrator resolves referenced issue(s) via tool-calling → returns structured plan for approval.

### Phase 7 — Frontend (Day 5–8, parallel with backend from Phase 4 onward)
- Build screens per App Flow doc: Morning Brief, Issue Detail, Chat Panel, Execution Status, PO Draft, Metrics Dashboard.
- Apply UI/UX Design Brief visual system.

### Phase 8 — Metrics & Evaluation (Day 8)
- Build the metrics queries (revenue at risk/recovered, detection accuracy, false-alert rate, actions executed vs. pending).
- Validate accuracy numbers against the synthetic dataset's ground-truth anomaly labels.

### Phase 9 — Demo Rehearsal (Day 8–9)
- Script the 5-minute demo narrative (per PRD Section 10).
- Rehearse the before/after reveal on the Metrics Dashboard.
- Prepare fallback screenshots/recorded segments in case of live API flakiness during judging.

## 3. Team Role Split (suggested)

| Area | Owner focus |
|---|---|
| Backend (FastAPI) + DB + Razorpay webhooks | Core API, SQLAlchemy models/Alembic migrations, webhook handling |
| Agent orchestrator + detection (XGBoost) + LLM reasoning | Tool-calling orchestrator, detection model, prompt design, structured output validation |
| Frontend (React + Vite + Tailwind) | Morning Brief, Issue Detail, Chat, Metrics screens, WebSocket integration |
| Data + Evaluation | Synthetic dataset generator, ground-truth labeling, accuracy scoring |
| Deployment/DevOps (can be shared) | Vercel/Render/Neon pipelines, environment config, keeping everything on free/low-cost tiers |

*(Adjust based on actual team size/composition.)*

## 4. Risk Register

| Risk | Mitigation |
|---|---|
| LLM output inconsistency breaks downstream parsing | Strict JSON schema validation + rules-only fallback |
| Razorpay sandbox API limits/instability during demo | Cache last-known-good data; have a recorded fallback clip |
| Detection thresholds produce too many false alerts on synthetic data | Tune against ground-truth labels before demo day; report false-alert rate transparently as a metric, not hide it |
| Scope creep (trying to build too many action types) | Lock to 3–4 action types (payment retry/reminder, PO draft, re-engagement draft) for the hackathon |
| Razorpay webhook delivery missed/delayed (esp. on Render free tier cold starts) | Store raw payload in `webhook_events`, log signature verification, and add a periodic reconciliation job that reconciles against the Razorpay API for anything not received within a window |
| Time lost on non-differentiating UI polish | Prioritize Morning Brief + Issue Detail + Metrics screens first — these carry the demo |

## 5. Definition of Done (Hackathon Scope)

- End-to-end flow works live: synthetic data → detected signal → LLM explanation → recommended action → approval → execution → updated metrics.
- At least one payment-related and one inventory-related scenario fully demoable.
- Metrics dashboard shows real numbers computed from the synthetic dataset, not hardcoded values.
- Audit log is queryable and can be shown to judges if asked "how do you know the AI didn't just do something random?"
