from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from app.core.database import get_db
from app.core.security import verify_password, create_access_token
from app.models.schema import User, Merchant

router = APIRouter(prefix="/auth", tags=["auth"])

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    merchant_id: str
    email: str
    role: str
    merchant_name: str

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    merchant = db.query(Merchant).filter(Merchant.id == user.merchant_id).first()
    merchant_name = merchant.name if merchant else "GreenLeaf Botanics"

    token = create_access_token(subject=user.id)
    return TokenResponse(
        access_token=token,
        user_id=user.id,
        merchant_id=user.merchant_id,
        email=user.email,
        role=user.role,
        merchant_name=merchant_name
    )

@router.get("/me")
def get_current_user_profile(db: Session = Depends(get_db)):
    # Demo default user
    user = db.query(User).first()
    if not user:
        raise HTTPException(status_code=404, detail="No user found")
    merchant = db.query(Merchant).filter(Merchant.id == user.merchant_id).first()
    return {
        "user_id": user.id,
        "merchant_id": user.merchant_id,
        "email": user.email,
        "role": user.role,
        "merchant_name": merchant.name if merchant else "GreenLeaf Botanics & Nursery"
    }
