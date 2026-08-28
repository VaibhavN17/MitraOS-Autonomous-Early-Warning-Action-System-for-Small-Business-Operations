from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.models.schema import AuditLog, Merchant

router = APIRouter(prefix="/audit", tags=["audit"])

@router.get("")
def get_audit_logs(
    limit: int = Query(50, le=200),
    entity_type: Optional[str] = None,
    actor: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(AuditLog)
    if entity_type:
        query = query.filter(AuditLog.entity_type == entity_type)
    if actor:
        query = query.filter(AuditLog.actor.like(f"%{actor}%"))

    logs = query.order_by(AuditLog.created_at.desc()).limit(limit).all()

    return [
        {
            "id": l.id,
            "entity_type": l.entity_type,
            "entity_id": l.entity_id,
            "event": l.event,
            "actor": l.actor,
            "payload": l.payload,
            "created_at": l.created_at.isoformat()
        } for l in logs
    ]
