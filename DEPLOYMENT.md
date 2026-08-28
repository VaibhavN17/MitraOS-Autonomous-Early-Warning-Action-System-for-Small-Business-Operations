# MitraOS — Deployment Guide
**Target Environments:** Vercel (Frontend), Render (FastAPI Backend), Neon (Serverless PostgreSQL), Local Docker Compose

---

## 1. Quick Local Execution (Zero-Setup)

### Backend:
```bash
# From workspace root
pip install -r backend/requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload --app-dir backend
```
- Backend starts at `http://localhost:8000`
- Auto-seeds synthetic merchant dataset with 2,000+ orders and ground truth anomalies.
- OpenAPI Interactive Documentation: `http://localhost:8000/docs`

### Frontend:
```bash
# In another terminal
cd frontend
npm install
npm run dev
```
- Frontend starts at `http://localhost:5173`

---

## 2. Docker Compose Setup

Run the full stack with PostgreSQL and backend/frontend containers:
```bash
docker-compose up --build
```
- Frontend UI: `http://localhost:3000` or `http://localhost:5173`
- Backend API: `http://localhost:8000`
- PostgreSQL: `localhost:5432`

---

## 3. Production Cloud Deployment (Free Tier Rationale)

Per `02-TRD.md` Section 4:

### 3.1 Database (Neon PostgreSQL)
1. Create a free PostgreSQL project on [Neon.tech](https://neon.tech).
2. Copy the connection string:
   ```env
   DATABASE_URL=postgresql://user:password@ep-cool-project.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```

### 3.2 Backend (Render / Railway / Koyeb)
1. Connect GitHub repository to Render.
2. Select **Web Service** with Python environment.
3. Build Command: `pip install -r backend/requirements.txt`
4. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT --app-dir backend`
5. Configure Environment Variables:
   - `DATABASE_URL` = Neon connection string
   - `SECRET_KEY` = Secure production key
   - `RAZORPAY_KEY_ID` = Razorpay Sandbox / Production Key ID
   - `RAZORPAY_KEY_SECRET` = Razorpay Key Secret
   - `RAZORPAY_WEBHOOK_SECRET` = Razorpay Webhook Secret
   - `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` (Optional; built-in reasoning fallback works out of the box)

### 3.3 Frontend (Vercel / Netlify / Cloudflare Pages)
1. Import repository on [Vercel](https://vercel.com).
2. Set Root Directory: `frontend`
3. Framework Preset: `Vite`
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Set Environment Variables:
   - `VITE_API_URL` = `https://your-backend-render-app.onrender.com`

---

## 4. Razorpay Webhook Setup

1. In Razorpay Dashboard → **Settings** → **Webhooks** → **Add New Webhook**.
2. Webhook URL: `https://your-backend-render-app.onrender.com/api/v1/webhooks/razorpay`
3. Secret: Enter value matching `RAZORPAY_WEBHOOK_SECRET`.
4. Active Events:
   - `payment.failed`
   - `payment.captured`
   - `order.paid`
   - `refund.processed`
