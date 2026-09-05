import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine, SessionLocal
from app.core.websockets import manager
from app.services.synthetic_data import seed_synthetic_merchant_data, MERCHANTS_SPEC
from app.services.detection import DetectionEngine
from app.services.reasoning import ReasoningEngine
from app.services.action_planner import ActionPlanner

# Routers
from app.api.auth import router as auth_router
from app.api.morning_brief import router as brief_router
from app.api.issues import router as issues_router
from app.api.actions import router as actions_router
from app.api.chat import router as chat_router
from app.api.metrics import router as metrics_router
from app.api.webhooks import router as webhooks_router
from app.api.simulator import router as simulator_router
from app.api.audit import router as audit_router
from app.api.data import router as data_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("mitraos")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables and auto-seed if needed
    logger.info("Initializing MitraOS Database and Models...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        from app.models.schema import Merchant
        merchants = db.query(Merchant).all()
        if len(merchants) < len(MERCHANTS_SPEC):
            logger.info("Seeding multi-tenant synthetic merchant datasets with ground truth anomalies...")
            seed_synthetic_merchant_data(db)
            logger.info("Multi-tenant businesses initialized successfully.")
        else:
            logger.info(f"Existing {len(merchants)} merchants found in database.")
    finally:
        db.close()
    
    yield
    logger.info("MitraOS shutting down...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="MitraOS — Autonomous Early-Warning & Action System for Small-Business Operations",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers under /api/v1
api_v1_prefix = settings.API_V1_STR
app.include_router(auth_router, prefix=api_v1_prefix)
app.include_router(brief_router, prefix=api_v1_prefix)
app.include_router(issues_router, prefix=api_v1_prefix)
app.include_router(actions_router, prefix=api_v1_prefix)
app.include_router(chat_router, prefix=api_v1_prefix)
app.include_router(metrics_router, prefix=api_v1_prefix)
app.include_router(webhooks_router, prefix=api_v1_prefix)
app.include_router(simulator_router, prefix=api_v1_prefix)
app.include_router(audit_router, prefix=api_v1_prefix)
app.include_router(data_router, prefix=api_v1_prefix)

# Real-time WebSocket Endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keepalive listener
            data = await websocket.receive_text()
            # Echo heartbeat or client triggers
            await websocket.send_text(f'{{"type":"PONG","received":"{data}"}}')
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)

@app.get("/")
def root():
    return {
        "system": "MitraOS",
        "tagline": "Autonomous Early-Warning & Action System for Small-Business Operations",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "operational"
    }

@app.get("/healthz")
@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "MitraOS Backend", "healthy": True}

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
