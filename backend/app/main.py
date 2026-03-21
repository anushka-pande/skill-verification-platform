from fastapi import FastAPI
from app.routes import auth

app = FastAPI()

app.include_router(auth.router)

@app.get("/")
def home():
    return {"message": "Skill Verification Platform Backend Running"}

@app.get("/health")
def health():
    return {"status": "OK"}