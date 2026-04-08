from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, tasks, submissions, execute, profile, recruiter
from app.database import engine
from app.models import User

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

User.metadata.create_all(bind=engine)

app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(submissions.router)
app.include_router(execute.router)
app.include_router(profile.router)
app.include_router(recruiter.router)

@app.get("/")
def home():
    return {"message": "Skill Verification Platform Backend Running"}

@app.get("/health")
def health():
    return {"status": "OK"}