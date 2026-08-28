# UI/UX Design Brief
## MitraOS

---

## 1. Design Principle

**"15 dashboards → 1 conversation."** Every screen should reduce, not add, cognitive load. The owner should never have to interpret a raw chart to know what to do next — the interface leads with the decision, not the data.

## 2. Tone & Voice

- Plain language, no jargon ("₹18,400 potentially lost due to failed payments," not "payment failure anomaly detected, z-score 3.2").
- Confident but non-alarmist — severity tags (🔴 High / 🟠 Medium / 🟡 Low) instead of red-alert styling everywhere.
- Always transparent about autonomy boundaries: "Nothing has been sent or purchased without your approval" should be a persistent, visible pattern, not a one-time disclaimer.

## 3. Core Screens

### 3.1 Morning Brief (home screen)
- Header: yesterday's revenue total, date.
- Issue list: cards sorted by severity, each with a one-line summary and ₹ impact estimate.
- Each card has a clear primary action (Review / Approve) and a secondary action (Ask why / Dismiss).
- A subtle "already prepared" indicator (✓ Payment recovery campaign, ✓ Purchase order draft) shows the agent has done the prep work.

### 3.2 Issue Detail
- Top: plain-language explanation.
- Middle: root-cause narrowing shown as a simple vertical step chain (not a dense chart) — e.g., Normal 8% → Today 31% → Concentrated in UPI → 7–9 PM window.
- Bottom: recommended action card with estimated impact and an Approve/Reject control.
- Optional expandable "Show underlying data" for owners who want the numbers.

### 3.3 Chat / Conversational Panel
- Persistent, lightweight chat entry point ("Ask Mitra anything" / "Handle the payment issue").
- Agent responses render as structured plan cards (counts, sub-actions, rationale), not walls of text.
- Approve control embedded directly in the chat response.

### 3.4 Execution Status
- Simple state indicator: Approved → Executing → Completed/Failed.
- On completion: before/after numbers (e.g., "₹12,800 recovered of ₹18,400 at risk").

### 3.5 Purchase Order Draft
- Editable quantity field, supplier, estimated cost, lead time context ("4 days stock left, 7-day lead time").
- Clear Approve / Edit / Reject actions.

### 3.6 Metrics Dashboard
- A small number of high-signal KPIs, not a BI tool: revenue at risk, revenue recovered, detection accuracy, false-alert rate, actions auto-executed vs. pending.
- Time-range selector (Today / 7 days / 30 days).

## 4. Visual System

- Severity color coding: red/orange/yellow reserved strictly for issue severity — not used decoratively elsewhere, so it retains meaning.
- Use a calm, neutral base palette (the dashboard is a "second brain," not a warning siren) so severity colors stand out when they matter.
- Typography: one clear display weight for ₹ figures and headline numbers (these are the things owners scan for first).
- Root-cause chains and flow diagrams use simple vertical/step layouts rather than dense charts — legibility over density.

## 5. Interaction Principles

- **Approval is always one tap away** from any recommendation — never buried in a menu.
- **Autonomy boundary is always visible** — every action screen states whether it required approval or was pre-approved by policy.
- **No screen should require the owner to interpret raw data to act** — data is available on demand (drill-down) but never required upfront.

## 6. Accessibility & Responsiveness

- Mobile-first (owners are likely to check this on a phone between tasks).
- High-contrast severity indicators for quick scanning.
- Numbers (₹ amounts, percentages) sized and weighted to be scannable at a glance.

## 7. Demo-Specific UI Notes

- Build the Morning Brief and Issue Detail screens first — these carry the most narrative weight in the 5-minute demo.
- Metrics Dashboard should be designed to visually "flip" from a before/after state during the live demo (at-risk → recovered) for maximum judge impact.
