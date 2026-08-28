# App Flow Document
## MitraOS

---

## 1. Primary User Journeys

### Journey A — Daily Morning Brief
1. Owner opens the app (or receives a notification) in the morning.
2. **Morning Brief screen** loads: yesterday's revenue total + count of flagged issues, ranked High/Medium/Low.
3. Owner taps an issue card to expand it.
4. Expanded view shows: plain-language explanation, root-cause narrowing, recommended action(s), estimated impact (₹).
5. Owner taps **Approve**, **Reject**, or **Ask a question** (opens chat with the agent about this issue).
6. On approval → **Execution confirmation screen** → action status updates live (`approved → executing → completed`).
7. Owner returns to Morning Brief; resolved issue moves to a "Handled today" section.

### Journey B — Conversational Handling
1. Owner types/says: "Handle the payment issue."
2. Agent responds with an execution plan: counts (e.g., 80 failed payments → 46 retryable → 21 eligible customers → ₹12,800 recoverable), the specific sub-actions (retry X, remind Y, skip Z with reason), and an **Approve** button.
3. On approval, plan executes; owner gets a completion summary with outcome numbers.

### Journey C — Drill-down / Investigation
1. From any flagged issue, owner can tap **"Why is this happening?"**
2. Agent shows the root-cause narrowing chain (e.g., normal 8% → today 31% → concentrated in UPI → 7–9 PM → gateway pattern).
3. Owner can tap **"Show underlying data"** to see the raw metrics/chart behind the explanation.

### Journey D — Inventory Risk → Purchase Order
1. Agent flags: Product A has 4 days of stock left, 7-day supplier lead time, ≈₹62,000 potential lost revenue.
2. Agent shows a **draft purchase order** (quantity, supplier, estimated cost).
3. Owner reviews, edits quantity if needed, taps **Approve** → PO status becomes "sent" (or "ready to send" if supplier integration is out of scope for demo).

### Journey E — Metrics / Outcomes Review
1. Owner navigates to **Metrics tab**.
2. Sees: revenue at risk (detected) vs. revenue recovered (post-action), detection accuracy, false-alert rate, count of actions auto-executed vs. pending approval, over a selectable time range.

## 2. Screen-Level Flow Diagram

```
[Login] 
   ↓
[Morning Brief] ──tap issue──▶ [Issue Detail] ──"Why?"──▶ [Root Cause View] ──▶ [Underlying Data]
   │                                 │
   │                          [Recommended Action]
   │                                 │
   │                          Approve / Reject
   │                                 ↓
   │                         [Execution Status] ──▶ [Completion Summary]
   │
   ├──▶ [Chat with Agent] ──▶ [Proposed Plan] ──Approve──▶ [Execution Status]
   │
   ├──▶ [Inventory Risks] ──▶ [Draft Purchase Order] ──Approve──▶ [PO Confirmation]
   │
   └──▶ [Metrics Dashboard]
```

## 3. Notification / Re-engagement Flow

1. Agent detects high-value customers inactive 45+ days.
2. Drafts a re-engagement campaign (message copy + target list) — held in "Draft" state.
3. Surfaced in Morning Brief as a Low-severity item with a **Review Draft** action.
4. Owner reviews copy, edits if needed, approves → campaign sends (mocked/simulated for demo).

## 4. State Model for an Issue

```
detected → explained → recommendation_ready → (approved | rejected) → executing → (completed | failed)
```

Every transition is logged for the audit trail and feeds the Metrics dashboard.

## 5. Edge Cases in Flow

- **Owner ignores a flagged issue:** carries forward into the next day's Morning Brief with an "still pending" indicator; does not silently expire for financial-impact items.
- **Multiple issues affect the same product:** issues are grouped under one card to avoid duplicate alerts.
- **Approval given but execution fails:** owner is shown a failure state with a retry option, not a silent failure.
