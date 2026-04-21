from fastapi import APIRouter, Depends, HTTPException, Header
from jose import jwt
from sqlalchemy.orm import Session

from difflib import SequenceMatcher
from itertools import combinations

from app.mongo import (
  submissions_collection, 
  tasks_collection,
  recruiter_status_collection
)
from app.routes.auth import get_db
from app.models import User
from app.routes.auth import SECRET_KEY, ALGORITHM

router = APIRouter()

def normalize_code(code):
  if not code:
    return ""

  lines = code.splitlines()
  cleaned = []

  for line in lines:
    line = line.strip()

    if not line:
      continue

    # remove python comments
    if line.startswith("#"):
      continue

    # remove cpp/js/java comments
    if line.startswith("//"):
      continue

    cleaned.append(line.lower())

  return "".join(cleaned)

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

@router.get("/recruiter/plagiarism")
def plagiarism_report(user=Depends(verify_recruiter)):

  submissions = list(submissions_collection.find({}))

  suspicious = []

  grouped = {}

  # group by task + language
  for s in submissions:
    key = (s.get("task_id"), s.get("language"))

    if key not in grouped:
      grouped[key] = []

    grouped[key].append(s)

  for key, subs in grouped.items():
    task_id, language = key

    for a, b in combinations(subs, 2):

      if a["user_id"] == b["user_id"]:
        continue

      code1 = normalize_code(a.get("code", ""))
      code2 = normalize_code(b.get("code", ""))

      similarity = SequenceMatcher(None, code1, code2).ratio() * 100

      if similarity >= 80:
        suspicious.append({
          "task_id": task_id,
          "language": language,
          "user1": a["user_id"],
          "user2": b["user_id"],
          "similarity": round(similarity, 2)
        })

  suspicious.sort(key=lambda x: x["similarity"], reverse=True)

  return suspicious

@router.post("/recruiter/status")
def save_status(data: dict, user=Depends(verify_recruiter)):
  recruiter_id = user["user_id"]
  candidate_email = data.get("email")
  status = data.get("status")

  if status not in ["shortlisted", "rejected", "neutral"]:
    raise HTTPException(status_code=400, detail="Invalid status")

  recruiter_status_collection.update_one(
    {
      "recruiter_id": recruiter_id,
      "candidate_email": candidate_email
    },
    {
      "$set": {
          "recruiter_id": recruiter_id,
          "candidate_email": candidate_email,
          "status": status
      }
    },
    upsert=True
  )

  return {"message": "Status saved"}

@router.get("/recruiter/status")
def get_status(user=Depends(verify_recruiter)):
  recruiter_id = user["user_id"]

  docs = list(
    recruiter_status_collection.find(
      {"recruiter_id": recruiter_id},
      {"_id": 0}
    )
  )

  result = {}

  for d in docs:
    result[d["candidate_email"]] = d["status"]

  return result