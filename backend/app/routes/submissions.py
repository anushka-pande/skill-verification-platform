from fastapi import APIRouter, HTTPException
from app.mongo import submissions_collection
from datetime import datetime

router = APIRouter()

@router.post("/submit-code")
def submit_code(submission: dict):
  user_id = submission.get("user_id")

  if user_id is None:
    raise HTTPException(status_code=400, detail="user_id is required")
  
  try:
    user_id = int(user_id)
  except:
    raise HTTPException(status_code=400, detail="Invalid user id")

  submission_data = {
    "user_id": user_id,
    "task_id": submission.get("task_id"),
    "code": submission.get("code"),
    "language": submission.get("language", "python"),
    "created_at": datetime.now(),

    # evalauation fields
    "final_score": None,
    "execution_score": None,
    "quality_score": None,
    "time_score": None,
    "status": "pending"
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

@router.get("/submissions/{user_id}")
def get_submissions(user_id: int):
  submissions = list(
    submissions_collection.find({"user_id": user_id}).sort("created_at", -1)
  )
  
  cleaned = []

  for s in submissions:
    score = s.get("final_score")

    if score is None:
      status = "Pending"
    elif score > 50:
      status = "Passed"
    else:
      status = "Failed"
        
    cleaned.append({
      "id": str(s["_id"]),   
      "task_id": s.get("task_id"),
      "score": s.get("final_score", 0),
      "date": str(s.get("created_at")),  
      "status": status
    })

  return cleaned