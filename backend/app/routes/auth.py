from fastapi import APIRouter, HTTPException
from app.models import UserCreate, UserLogin
from passlib.context import CryptContext

router = APIRouter()

# Temporary in-memory storage
fake_users_db = {}

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password.strip())

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


@router.post("/register")
def register(user: UserCreate):
    if user.email in fake_users_db:
        raise HTTPException(status_code=400, detail="User already exists")

    hashed = hash_password(user.password)

    fake_users_db[user.email] = {
        "name": user.name,
        "email": user.email,
        "password": hashed
    }

    return {"message": "User registered successfully"}


@router.post("/login")
def login(user: UserLogin):
    db_user = fake_users_db.get(user.email)

    if not db_user:
        raise HTTPException(status_code=400, detail="User not found")

    if not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=400, detail="Invalid password")

    return {"message": "Login successful"}