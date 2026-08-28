from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Dict, Any
from app.core.database import get_db
from app.models.schema import Action, User
from app.services.execution import ExecutionEngine

router = APIRouter(prefix="/actions", tags=["actions"])

class ApproveActionRequest(BaseModel):
    user_id: Optional[str] = None
    custom_parameters: Optional[Dict[str, Any]] = None

class RejectActionRequest(BaseModel):
    user_id: Optional[str] = None
    reason: Optional[str] = "Rejected by owner"

class UpdateActionParamsRequest(BaseModel):
    parameters: Dict[str, Any]

@router.post("/{action_id}/approve")
async def approve_action(
    action_id: str,
    req: ApproveActionRequest = Body(default=ApproveActionRequest()),
    db: Session = Depends(get_db)
):
    try:
        result = await ExecutionEngine.approve_and_execute_action(
            db=db,
            action_id=action_id,
            user_id=req.user_id,
            custom_params=req.custom_parameters
        )
        return result
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{action_id}/reject")
async def reject_action(
    action_id: str,
    req: RejectActionRequest = Body(default=RejectActionRequest()),
    db: Session = Depends(get_db)
):
    try:
        result = await ExecutionEngine.reject_action(
            db=db,
            action_id=action_id,
            user_id=req.user_id,
            reason=req.reason or "Rejected by owner"
        )
        return result
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{action_id}")
def update_action_parameters(
    action_id: str,
    req: UpdateActionParamsRequest,
    db: Session = Depends(get_db)
):
    action = db.query(Action).filter(Action.id == action_id).first()
    if not action:
        raise HTTPException(status_code=404, detail="Action not found")
    if action.status not in ["proposed"]:
        raise HTTPException(status_code=400, detail="Cannot edit parameters of an already processed action")

    action.parameters = {**action.parameters, **req.parameters}
    db.commit()
    db.refresh(action)
    return {
        "id": action.id,
        "action_type": action.action_type,
        "parameters": action.parameters,
        "status": action.status
    }
