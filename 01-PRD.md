# Product Requirements Document (PRD)
## MitraOS — Autonomous Early-Warning & Action System for Small-Business Operations
**Track:** Razorpay Buildathon 2026 — Open Track

---

## 1. Problem Statement

Small business owners run their operations across scattered surfaces — payment gateway dashboards, order/ERP systems, inventory sheets, and customer records. They rarely have time to check 10+ dashboards a day, so revenue-impacting issues (payment failures, stockouts, customer churn) are often noticed only after money is already lost.

**Core problem:** Small businesses lack a system that proactively detects operational risk and translates it into a clear, actionable recommendation — before revenue is lost.

## 2. Vision

> An AI agent that watches a small business's daily operations and proactively finds problems before the owner loses money — then proposes (and, with approval, executes) the fix.

MitraOS is **not** a chatbot layered on dashboards. It is a **detect → understand → decide → act** agent with bounded autonomy: it can analyze, recommend, and prepare actions on its own, but spending money or contacting customers always requires owner approval unless explicitly authorized by policy.

## 3. Target User

- Small/medium business owners (D2C sellers, retailers, small e-commerce merchants) who:
  - Process payments through Razorpay
  - Manage limited inventory/SKUs
  - Don't have a dedicated data/ops analyst
  - Want plain-language answers, not raw dashboards

## 4. Goals / Non-Goals

**Goals**
- Detect revenue-risk situations automatically (payment failures, stock depletion, customer churn signals)
- Explain *why* a problem is happening in plain language
- Propose specific, bounded actions with an approval step
- Execute approved actions and report measurable outcomes (revenue recovered, issues detected, false-alert rate)
- Deliver a daily "Morning Brief" summarizing overnight/prior-day risk

**Non-Goals (for hackathon scope)**
- Not a full accounting/finance-controller product (avoid overlap with Razorpay's own Finance Controller track)
- Not a general-purpose BI/dashboarding tool
- Not fully autonomous spending — no unattended financial transactions
- Not building a full ERP/inventory system from scratch — integrate with mocked/synthetic data sources for the demo

## 5. Key Use Cases

1. **Payment degradation detection** — Owner is alerted when a product/route/time-window shows an abnormal payment failure rate, with root-cause narrowing (e.g., UPI, 7–9 PM, gateway pattern) and a recommended mitigation.
2. **Inventory + revenue risk** — Agent correlates sales velocity, stock level, and supplier lead time to flag potential stockouts and lost revenue, and drafts a purchase order for approval.
3. **Customer churn signal** — Agent flags high-value customers who haven't purchased in N days and prepares a re-engagement campaign draft.
4. **Morning Brief** — Daily digest of yesterday's revenue, top 3 risks (severity-tagged), and pre-drafted actions awaiting approval.
5. **Conversational action approval** — Owner can respond to a flagged issue in natural language ("Handle the payment issue") and the agent returns a concrete execution plan for approval.

## 6. Functional Requirements

| ID | Requirement |
|----|-------------|
| FR1 | System ingests payment data (Razorpay), order data, and inventory data on a scheduled basis |
| FR2 | System computes baseline behavior per metric (failure rate, sales velocity, purchase recency) and flags statistically significant deviations |
| FR3 | System uses an LLM reasoning layer to explain *why* a detected anomaly is occurring, using only the structured signals surfaced by the detection layer |
| FR4 | System proposes one or more bounded actions per issue, each mapped to an explicit policy (what it is/isn't allowed to do) |
| FR5 | No action that spends money or contacts a customer executes without explicit owner approval, unless a pre-approved automation rule exists |
| FR6 | System generates a daily Morning Brief (revenue summary + top risks + draft actions) |
| FR7 | System logs every detection, recommendation, approval, and executed action for auditability |
| FR8 | System reports measurable outcomes: revenue at risk, revenue recovered, detection accuracy, false-alert rate, actions executed vs. requiring approval |

## 7. Success Metrics (Demo)

- Revenue at risk identified vs. revenue recovered post-action
- Detection accuracy on injected synthetic anomalies
- False-alert rate
- Number of actions executed automatically vs. requiring approval
- End-to-end latency: raw event → flagged issue → recommendation

## 8. Judging Alignment

| Judge Criterion | How MitraOS Demonstrates It |
|---|---|
| Problem taste | Owners can't manually monitor 10+ dashboards daily |
| AI judgment | Layered ML (detection) + LLM (reasoning) + rules (policy), not "everything → LLM" |
| Build quality | Full-stack app + database + Razorpay API integration + agent architecture |
| Reliability | Policy engine, human approval gate, idempotent action execution |
| Failure recovery | API failure → retry → fallback → manual approval path |
| Measurable value | Revenue saved, issues detected, false-alert rate reported live in demo |

## 9. Positioning Note

Explicitly position MitraOS as an **"autonomous early-warning and action system for small-business operations"** — not an "AI CFO" or "AI Finance Controller," to avoid overlapping with Razorpay's own existing product direction and the Finance Controller track.

## 10. Demo Narrative (5-minute storyline)

1. Show synthetic merchant (₹4.8L monthly sales, 2,000 orders, 15 SKUs) with injected anomalies.
2. Morning Brief renders: revenue summary + 3 flagged issues (High/Medium/Low).
3. Drill into the payment-degradation issue → show root-cause narrowing → recommended action.
4. Owner approves → show execution + before/after revenue-at-risk numbers.
5. Close with a metrics screen: revenue recovered, detection accuracy, false-alert rate, actions executed vs. pending approval.
