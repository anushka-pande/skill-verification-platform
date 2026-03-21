from fastapi import APIRouter
from app.mongo import submissions_collection
from datetime import datetime

router = APIRouter()

@router.post("/submit-code")
def submit_code(submission: dict):

    submission_data = {
        "user_id": submission.get("user_id"),
        "task_id": submission.get("task_id"),
        "code": submission.get("code"),
        "timestamp": datetime.utcnow()
    }

    result = submissions_collection.insert_one(submission_data)

    return {
        "message": "Submission saved successfully",
        "submission_id": str(result.inserted_id)
    }

@router.get("/submissions")
def get_submissions():
    submissions = list(submissions_collection.find({}, {"_id": 0}))
    return submissions