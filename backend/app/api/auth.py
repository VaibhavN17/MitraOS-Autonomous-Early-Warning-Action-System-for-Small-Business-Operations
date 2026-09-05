import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.schema import User, Merchant, Policy

router = APIRouter(prefix="/auth", tags=["auth"])

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    business_name: Optional[str] = None
    category: Optional[str] = None

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
    
    # Allow demo master password for testing convenience
    is_valid = False
    if user:
        if req.password in ["MitraOS@2026", "demo123", "password"] or verify_password(req.password, user.password_hash):
            is_valid = True

    if not user or not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. You may use demo accounts or password 'MitraOS@2026'."
        )

    merchant = db.query(Merchant).filter(Merchant.id == user.merchant_id).first()
    merchant_name = merchant.name if merchant else "GreenLeaf Botanics & Nursery"
    merchant_id = merchant.id if merchant else user.merchant_id

    token = create_access_token(subject=user.id)
    return TokenResponse(
        access_token=token,
        user_id=user.id,
        merchant_id=merchant_id,
        email=user.email,
        role=user.role,
        merchant_name=merchant_name
    )

@router.post("/register", response_model=TokenResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists. Please sign in."
        )

    now = datetime.now(timezone.utc)
    
    # Determine or create merchant
    merchant = None
    if req.business_name:
        m_id = str(uuid.uuid4())
        abbr = "".join([w[0].upper() for w in req.business_name.split()[:3]]) or "NEW"
        merchant = Merchant(
            id=m_id,
            name=req.business_name,
            razorpay_account_id=f"acc_{abbr}_rzp_2026",
            created_at=now
        )
        db.add(merchant)

        # Create policies
        policies = [
            Policy(id=str(uuid.uuid4()), merchant_id=m_id, action_type="retry_payment", max_auto_spend_paise=0, requires_approval=True, cooldown_hours=12),
            Policy(id=str(uuid.uuid4()), merchant_id=m_id, action_type="send_payment_reminder", max_auto_spend_paise=0, requires_approval=True, cooldown_hours=24),
            Policy(id=str(uuid.uuid4()), merchant_id=m_id, action_type="create_purchase_order", max_auto_spend_paise=1000000, requires_approval=True, cooldown_hours=48),
            Policy(id=str(uuid.uuid4()), merchant_id=m_id, action_type="send_reengagement_campaign", max_auto_spend_paise=500000, requires_approval=True, cooldown_hours=72)
        ]
        for p in policies:
            db.add(p)
    else:
        merchant = db.query(Merchant).first()

    merchant_id = merchant.id if merchant else str(uuid.uuid4())
    merchant_name = merchant.name if merchant else "My New Enterprise"

    # Create user
    user = User(
        id=str(uuid.uuid4()),
        merchant_id=merchant_id,
        email=req.email,
        role="owner",
        password_hash=get_password_hash(req.password),
        created_at=now
    )
    db.add(user)
    db.commit()

    token = create_access_token(subject=user.id)
    return TokenResponse(
        access_token=token,
        user_id=user.id,
        merchant_id=merchant_id,
        email=user.email,
        role=user.role,
        merchant_name=merchant_name
    )

@router.get("/me")
def get_current_user_profile(db: Session = Depends(get_db)):
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
