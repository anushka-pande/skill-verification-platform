from fastapi import APIRouter, Depends, HTTPException, Header
from jose import jwt
from sqlalchemy.orm import Session

from app.mongo import submissions_collection, tasks_collection
from app.routes.auth import get_db
from app.models import User
from app.routes.auth import SECRET_KEY, ALGORITHM

router = APIRouter()

def verify_recruiter(authorization: str = Header(...)):

  try:
    token = authorization.split(" ")[1]

    payload = jwt.decode(
      token,
      SECRET_KEY,
      algorithms=[ALGORITHM]
    )

    if payload["role"] != "recruiter":
      raise HTTPException(
        status_code=403,
        detail="Access denied"
      )

    return payload

  except Exception as e:
    print("TOKEN ERROR: ", str(e))
    raise HTTPException(
      status_code=401,
      detail=str(e)
    )

@router.get("/recruiter/overview")
def recruiter_overview(
  db: Session = Depends(get_db),
  user=Depends(verify_recruiter)
):
  # Fetch all submissions
  submissions = list(submissions_collection.find({}))

  # Preload users (avoid N+1 SQL queries)
  users = db.query(User).all()
  user_map = {u.id: u for u in users}

  # Preload tasks (avoid repeated Mongo queries)
  tasks = list(tasks_collection.find({}))
  task_map = {t["title"]: t for t in tasks}

  user_stats = {}

  for s in submissions:
    user_id = s.get("user_id")
    score = s.get("final_score") or 0

    # Get skill from task
    task_title = s.get("task_id")
    task = task_map.get(task_title)
    skill = task.get("skill") if task else "Unknown"

    # Initialize user entry
    if user_id not in user_stats:
      user_obj = user_map.get(user_id)

      user_stats[user_id] = {
        "name": user_obj.name if user_obj else "Unknown",
        "email": user_obj.email if user_obj else "Unknown",
        "scores": [],
        "skills": {}
      }

    # Add score
    user_stats[user_id]["scores"].append(score)

    # Skill tracking
    if skill not in user_stats[user_id]["skills"]:
      user_stats[user_id]["skills"][skill] = []

    user_stats[user_id]["skills"][skill].append(score)

  result = []

  for data in user_stats.values():
    scores = data["scores"]

    avg = sum(scores) / len(scores) if scores else 0

    # Skill level classification
    if avg >= 80:
      level = "Advanced"
    elif avg >= 50:
      level = "Intermediate"
    else:
      level = "Beginner"

    # Skill-wise averages
    skill_summary = {
      k: round(sum(v) / len(v), 2)
      for k, v in data["skills"].items()
    }

    result.append({
      "name": data["name"],
      "email": data["email"],
      "average_score": round(avg, 2),
      "skill_level": level,
      "total_submissions": len(scores),
      "skills": skill_summary
    })

  return result