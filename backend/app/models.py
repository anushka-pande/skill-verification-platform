# Pydantic models (for request validation)
from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str


# SQLAlchemy model (for database table)
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True)
    password = Column(String, nullable=False)
    role = Column(String, nullable=True)

    is_verified = Column(Boolean, default=False)
    otp = Column(String, nullable=True)
    otp_expiry = Column(DateTime, nullable=True)

    # Candidate
    skills = Column(String, nullable=True)

    # Recruiter
    company_name = Column(String, nullable=True)
    company_domain = Column(String, nullable=True)
    company_location = Column(String, nullable=True)
    recruiter_role = Column(String, nullable=True)