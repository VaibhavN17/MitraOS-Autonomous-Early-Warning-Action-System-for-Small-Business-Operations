# MitraOS — Autonomous Early-Warning & Action System for Small-Business Operations
**Track:** Razorpay Buildathon 2026 — Open Track  
**Positioning:** An AI agent that watches a small business's daily operations (Razorpay payments, orders, inventory runways, VIP customers) and proactively detects operational risks before the owner loses money — explaining the root cause in plain language and proposing bounded, pre-drafted actions for 1-tap approval.

---

## 🌟 Executive Summary & Vision

Small business owners run their businesses across scattered surfaces — payment gateway dashboards, ERPs, inventory sheets, and customer records. They rarely have time to check 10+ dashboards daily. Consequently, revenue-impacting issues (like evening UPI payment failure spikes, stockouts on fast-selling SKUs, or VIP customer churn) are often noticed only after money is already lost.

**MitraOS replaces 15 dashboards with 1 conversation.**

### The Bounded Autonomy Pipeline:
```
Raw Business Data (Razorpay Webhooks, ERP/Stock, Orders)
          ↓
Detection Layer (SQL Rolling Baselines, Statistical Z-scores & ML Risk Models)
          ↓
Structured Signals (Metric, Delta, Dimensions, Fingerprint)
          ↓
AI Reasoning Layer (LLM with Tool-Calling & Deterministic Fallback)
          ↓
Action Planner (Candidate Actions with Impact Estimation)
          ↓
Policy Engine (Bounded Autonomy: Approval Checks, Max Spend, Cooldowns)
          ↓
Human Approval Gate (1-Tap Approve / Reject / Conversational Adjustment)
          ↓
Execution Engine (Razorpay APIs, Mocked ERP/Communications, State Machine)
          ↓
Real-Time Feedback (WebSockets, Live Revenue Recovered Metrics, Audit Trail)
```

---

## 🚀 Key Features

### 1. Daily Morning Brief (Home Dashboard)
- Aggregated summary of yesterday's sales (`₹48,600`), 68 orders, and average order value.
- Severity-ranked Risk Cards:
  - 🔴 **High Severity:** UPI Payment Failure Spike (₹18,400 at risk, 24 failed attempts, NPCI bank gateway degradation) → 1-tap **Approve Payment Recovery**.
  - 🟠 **Medium Severity:** Monstera Deliciosa Stockout Risk (4 days stock remaining vs 7-day supplier lead time, ₹62,958 revenue at risk) → 1-tap **Review & Approve PO**.
  - 🟡 **Low Severity:** VIP Customer Churn Risk (8 high-LTV customers inactive for 45+ days, ₹46,900 re-engagement target) → 1-tap **Approve 15% VIP Incentive Campaign**.
- **Handled Today Section:** dynamically updates with live before/after numbers (e.g. *"✓ ₹12,800 recovered of ₹18,400 at risk"*).

### 2. Root-Cause Narrowing & Underlying Data
- Vertical diagnostic step chain explaining *why* the issue happened (e.g., Baseline 7.5% → Surged to 31.8% → UPI only → 19:00–21:00 IST → `GATEWAY_TIMEOUT_NPCI_DEGRADED`).
- Interactive telemetry charts:
  - Hourly payment success vs. failure rates
  - Inventory runway forecast curves
  - VIP customer cohort records

### 3. Conversational AI Agent with Embedded Action Plans
- Natural language interface (e.g., *"Handle the payment issue"*).
- Agent resolves the issue, calculates recoverable amounts (24 failed → 21 eligible → ₹12,800 recoverable), and returns a structured plan card with an **instant 1-tap Approve button** inside the chat!

### 4. Interactive Purchase Order Draft Editor
- Product details, supplier info, and wholesale costs.
- Editable order quantity input with real-time recalculation of total cost and revenue protected.

### 5. Live Metrics & Accuracy Benchmark
- **The "Before/After" Flip:** Live revenue at risk vs. revenue recovered dynamically flips as actions are approved!
- **Detection Accuracy (96.2%):** Live benchmark scored against synthetic ground truth labels.
- **False-Alert Rate (<3.8%):** Noise reduction via rolling statistical baselines.
- **Audit Trail Explorer:** Immutable timeline of every system, ML, LLM, and human decision.

### 6. Live Anomaly Simulator (Judge Demo Engine)
- Dedicated interactive trigger panel for hackathon judges to inject live Card failure waves or stockout scenarios and watch the autonomous agent detect, reason, and broadcast updates over WebSockets in real time!

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology | Role |
|---|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Recharts | Morning Brief, Root-Cause chain, Metrics, Chat panel |
| **Backend** | FastAPI (Python 3.13), Pydantic, SQLAlchemy | REST APIs, Tool-calling agent orchestrator, WebSockets |
| **Database** | PostgreSQL / SQLite (via SQLAlchemy) | 12 core tables, audit logs, ground truth evaluation labels |
| **Detection** | Statistical Z-scores & Scikit-learn / XGBoost heuristics | Rolling baselines, anomaly detection, deduplicated signals |
| **Reasoning** | LLM (Claude / OpenAI / Gemini / Rule-Backed Fallback) | Root-cause narrowing, plain language explanations |
| **Payments** | Razorpay APIs & Webhook Signature Verification | HMAC-SHA256 signature checks, batch payment retry API |
| **Realtime** | WebSockets | Live push updates for status transitions and metrics |

---

## ⚡ Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Run Backend:
```bash
# From repository root
pip install -r backend/requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload --app-dir backend
```
- API Server: `http://localhost:8000`
- Interactive Swagger Docs: `http://localhost:8000/docs`
- *Note:* The backend automatically creates the database and seeds the synthetic merchant dataset (2,000+ orders across 15 SKUs with ground truth anomalies) on initial startup!

### 2. Run Frontend:
```bash
# In a second terminal
cd frontend
npm install
npm run dev
```
- Open `http://localhost:5173` in your browser.

### 3. Run Automated Tests:
```bash
# From repository root
python -m pytest
```
- Runs 10 backend integration, detection, policy, and reasoning test cases.

---

## 🐳 Docker Deployment

Run the complete multi-container stack with one command:
```bash
docker-compose up --build
```
- Web Application: `http://localhost:3000`
- Backend API: `http://localhost:8000`

---

## 🔑 Demo Credentials & Test Accounts

| Field | Demo Value |
|---|---|
| **Demo Merchant** | GreenLeaf Botanics & Nursery |
| **Razorpay Account ID** | `acc_GLN_rzp_2026` |
| **Owner Email** | `owner@greenleafnursery.in` |
| **Owner Password** | `MitraOS@2026` |

---

## 🎬 5-Minute Demo Walkthrough Narrative

1. **Morning Brief:** Open `http://localhost:5173`. Show yesterday's revenue (`₹48,600`) and the 3 active severity-ranked risk cards.
2. **Payment Failure Investigation:** Click *"Why is this happening?"* on the High Severity UPI card. Walk through the vertical 5-step root-cause chain narrowing the issue to NPCI gateway timeouts during 19:00–21:00. Expand the underlying telemetry chart.
3. **Conversational Action Approval:** Open the AI Assistant (Ask Mitra) or click *"Approve Payment Recovery"*. Watch the state transition live over WebSockets (`proposed` → `approved` → `executing` → `completed`).
4. **The Live Metric Flip:** Switch to the **Metrics & Evaluation** tab. Show how Revenue at Risk flipped into Revenue Recovered (`₹12,800` recovered), with **96.2% Detection Accuracy** and **<3.8% False-Alert Rate**.
5. **Live Anomaly Simulator:** Switch to the **Demo Simulator** tab. Click *"Inject Live Card Failure Wave"*. Watch the live alert toast appear, the WebSocket broadcast, and the new issue card drafted autonomously!
6. **Audit Trail:** Inspect the **Audit Trail** tab to show the immutable trace of system, ML, LLM, and human actions.

---

## 📄 License & Attribution
Developed for the **Razorpay Buildathon 2026 (Open Track)**.
All rights reserved.
