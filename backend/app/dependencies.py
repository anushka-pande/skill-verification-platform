from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from app.routes.auth import get_db
from app.models import User

def require_role(required_role: str):
    def role_checker(user_id: int, db: Session = Depends(get_db)):
        user = db.query(User).filter(User.id == user_id).first()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        if user.role != required_role:
            raise HTTPException(status_code=403, detail="Access denied")

        return user

    return role_checker