# 🚀 MitraOS — Run & Execution Guide

This guide details how to set up, start, and run **MitraOS** (Backend & Frontend) locally, using Docker, or for test and demo executions.

---

## ⚡ Quick Start (TL;DR)

Open **two separate terminal windows**:

### Terminal 1 — Backend (FastAPI)
```bash
# 1. (Optional but recommended) Create & activate a virtual environment:
python -m venv venv
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Windows (CMD):
.\venv\Scripts\activate.bat
# Linux / macOS:
source venv/bin/activate

# 2. Install dependencies:
pip install -r backend/requirements.txt

# 3. Start the FastAPI server (from the repository root):
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload --app-dir backend
```
- **Backend API:** [http://localhost:8000](http://localhost:8000)
- **Interactive Swagger Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
- *Note: On initial startup, SQLite database tables and 2,000+ synthetic merchant orders/anomalies are seeded automatically!*

---

### Terminal 2 — Frontend (React + Vite)
> ⚠️ **Important:** Ensure you change directory into `frontend/` before executing npm commands.
```bash
# 1. Navigate to the frontend directory:
cd frontend

# 2. Install packages:
npm install

# 3. Start the Vite development server:
npm run dev
```
- **Web App:** [http://localhost:5173](http://localhost:5173)

---

## 📋 Prerequisites

| Tool | Recommended Version | Verification Command |
|---|---|---|
| **Python** | 3.10+ (tested on 3.10, 3.11, 3.12, 3.13) | `python --version` |
| **Node.js** | 18.x or 20.x+ | `node -v` |
| **npm** | 9.x or 10.x+ | `npm -v` |
| **Docker & Docker Compose** *(optional)* | 24.x+ / Compose v2 | `docker compose version` |

---

## ⚙️ Step-by-Step Setup

### 1. Configure Environment Variables
Copy `.env.example` to `.env` in the project root:

```bash
# Windows PowerShell:
Copy-Item .env.example .env

# Linux / macOS / Git Bash:
cp .env.example .env
```

**Default configuration highlights:**
```ini
PROJECT_NAME="MitraOS"
SECRET_KEY="mitraos_super_secret_jwt_key_2026"
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# SQLite (default for zero-setup local dev)
DATABASE_URL="sqlite:///./mitraos.db"

# Razorpay Test Credentials (preconfigured mock values)
RAZORPAY_KEY_ID="rzp_test_mock_mitraos_key"
RAZORPAY_KEY_SECRET="rzp_secret_mock_mitraos_secret"
RAZORPAY_WEBHOOK_SECRET="rzp_webhook_secret_mock"

# Optional LLM Key (has rule-based fallback if empty)
LLM_PROVIDER="anthropic"
ANTHROPIC_API_KEY=""
```

---

### 2. Running the Backend

From the repository root `Razorpay/`:
```bash
pip install -r backend/requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload --app-dir backend
```

#### Available Backend Endpoints:
- **API Root / Health Check:** `http://localhost:8000/api/health`
- **Swagger Documentation:** `http://localhost:8000/docs`
- **ReDoc Documentation:** `http://localhost:8000/redoc`
- **WebSocket Endpoint:** `ws://localhost:8000/ws`

---

### 3. Running the Frontend

From the repository root `Razorpay/`:
```bash
cd frontend
npm install
npm run dev
```

The frontend will run at `http://localhost:5173` and automatically proxies requests to the backend at `http://localhost:8000`.

---

## 🐳 Running with Docker Compose

To start both PostgreSQL, FastAPI backend, and React frontend in containerized environments with a single command:

```bash
docker-compose up --build
```

#### Docker Service Map:
- **Frontend App:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:8000](http://localhost:8000)
- **PostgreSQL Database:** `localhost:5432` (`mitraos_db`)

To stop all services:
```bash
docker-compose down
```

---

## 🧪 Running Automated Tests

Run the full pytest suite from the root directory:

```bash
# Run all tests
python -m pytest

# Run with verbose output & print statements
python -m pytest -v -s

# Run specific test modules
python -m pytest backend/tests/test_detection.py
python -m pytest backend/tests/test_policy.py
```

---

## 🔑 Demo Credentials & Accounts

| Parameter | Value |
|---|---|
| **Merchant Name** | GreenLeaf Botanics & Nursery |
| **Razorpay Account ID** | `acc_GLN_rzp_2026` |
| **Merchant Email** | `owner@greenleafnursery.in` |
| **Password** | `MitraOS@2026` |

---

## 🛠️ Troubleshooting & FAQs

### Q1: `npm error enoent Could not read package.json`
- **Cause:** You ran `npm run dev` in the project root directory instead of the `frontend` folder.
- **Fix:** Run `cd frontend` first, then run `npm run dev`.

### Q2: Port 8000 or 5173 is already in use
- **Fix (Windows PowerShell):**
  ```powershell
  Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess | Stop-Process
  Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process
  ```
- **Fix (Linux/macOS):**
  ```bash
  kill -9 $(lsof -t -i:8000)
  kill -9 $(lsof -t -i:5173)
  ```

### Q3: How do I reset or reseed the database?
- Simply delete `mitraos.db` in the repository root and restart the backend. The startup event will recreate all tables and seed fresh demo data automatically.

### Q4: How do I test live anomaly injections?
1. Open the frontend at `http://localhost:5173`.
2. Go to the **Demo Simulator** tab.
3. Click on **"Inject Live Card Failure Wave"** or other scenario triggers to watch real-time detection and WebSocket broadcast.
