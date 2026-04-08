from fastapi import APIRouter, HTTPException, Depends
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import User, UserCreate, UserLogin

import random

import smtplib
from email.mime.text import MIMEText

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def hash_password(password: str):
    return pwd_context.hash(password.strip())

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def generate_otp():
    return str(random.randint(100000, 999999))

@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):

    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    hashed = hash_password(user.password)

    otp = generate_otp()

    new_user = User(
        name=user.name,
        email=user.email,
        password=hashed,
        role=None,
        otp=otp,
        is_verified=False
    )

    send_otp_email(user.email, otp)

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User registered successfully"}


@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):

    db_user = db.query(User).filter(User.email == user.email).first()

    if not db_user:
        raise HTTPException(status_code=400, detail="User not found")

    if not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=400, detail="Invalid password")

    if not db_user.is_verified:
        raise HTTPException(status_code=403, detail="Email not verified")

    return {
        "message": "Login successful",
        "user_id": db_user.id,
        "role": db_user.role
    }

@router.post("/verify-otp")
def verify_otp(data: dict, db: Session = Depends(get_db)):

    email = data.get("email")
    otp = data.get("otp")

    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.otp != otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    user.is_verified = True
    user.otp = None

    db.commit()

    return {"message": "Email verified successfully"}

def send_otp_email(to_email, otp):
    sender_email = "anushkapande04@gmail.com"
    app_password = "dtbk plyn zzua gjqp"

    subject = "Your OTP Verification Code"
    body = f"Your OTP is: {otp}"

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = sender_email
    msg["To"] = to_email

    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(sender_email, app_password)
        server.sendmail(sender_email, to_email, msg.as_string())
        server.quit()
    except Exception as e:
        print("Email sending failed:", e)

@router.post("/set-role")
def set_role(data: dict, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == data["user_id"]).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if data["role"] not in ["candidate", "recruiter"]:
        raise HTTPException(status_code=400, detail="Invalid role")

    user.role = data["role"]
    db.commit()

    return {"message": "Role updated"}

