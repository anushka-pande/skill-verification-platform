from fastapi import APIRouter, Depends, HTTPException, Header
from jose import jwt
from sqlalchemy.orm import Session

from difflib import SequenceMatcher
from itertools import combinations

import smtplib
from email.mime.text import MIMEText
from bson import ObjectId

from app.mongo import (
  submissions_collection, 
  tasks_collection,
  recruiter_status_collection,
  recruiter_notes_collection
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

  for uid, data in user_stats.items():
    scores = data["scores"]

    avg = sum(scores) / len(scores) if scores else 0

    # level
    if avg >= 80:
      level = "Advanced"
    elif avg >= 50:
      level = "Intermediate"
    else:
      level = "Beginner"

    skill_summary = {
      k: round(sum(v) / len(v), 2)
      for k, v in data["skills"].items()
    }

    # RANKING METRICS

    skill_diversity = len(skill_summary) * 10
    if skill_diversity > 100:
      skill_diversity = 100

    submission_score = len(scores) * 10
    if submission_score > 100:
      submission_score = 100

    consistency = 100 - (max(scores) - min(scores)) if scores else 0
    if consistency < 0:
      consistency = 0

    rank_score = round(
      avg * 0.60 +
      skill_diversity * 0.20 +
      submission_score * 0.10 +
      consistency * 0.10,
      2
    )

    result.append({
      "user_id": uid,
      "name": data["name"],
      "email": data["email"],
      "average_score": round(avg, 2),
      "skill_level": level,
      "total_submissions": len(scores),
      "skills": skill_summary,
      "rank_score": rank_score
    })

  result.sort(
    key=lambda x: x["rank_score"],
    reverse=True
  )

  for i, item in enumerate(result):
    item["rank"] = i + 1

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

@router.post("/recruiter/note")
def save_note(data: dict, user=Depends(verify_recruiter)):
  recruiter_notes_collection.update_one(
    {"email": data["email"]},
    {"$set": {"note": data["note"]}},
    upsert=True
  )

  return {"message": "Note saved"}

@router.get("/recruiter/note/{email}")
def get_note(email: str, user=Depends(verify_recruiter)):
  note = recruiter_notes_collection.find_one({"email": email})

  return {
    "note": note["note"] if note else ""
  }


@router.post("/recruiter/email-shortlisted")
def email_shortlisted(user=Depends(verify_recruiter)):
  try:
    shortlisted = list(
      recruiter_status_collection.find(
        {"status": "shortlisted"}
      )
    )

    for c in shortlisted:
      email = c["candidate_email"]

      msg = MIMEText(
          "Congratulations! You have been shortlisted."
      )

      msg["Subject"] = "Shortlisted"
      msg["From"] = "anushkapande04@gmail.com"
      msg["To"] = email

      server = smtplib.SMTP("smtp.gmail.com", 587)
      server.starttls()
      server.login(
        "anushkapande04@gmail.com",
        "dtbk plyn zzua gjqp"
      )

      server.sendmail(
        msg["From"],
        email,
        msg.as_string()
      )

      server.quit()

    return {"message": "Emails sent successfully"}

  except Exception as e:
    print("EMAIL ERROR:", str(e))
    raise HTTPException(
      status_code=500,
      detail=str(e)
    )
  
@router.get("/recruiter/submission/{submission_id}")
def submission_detail(
  submission_id: str,
  user=Depends(verify_recruiter)
):
  sub = submissions_collection.find_one(
    {"_id": ObjectId(submission_id)}
  )

  if not sub:
    raise HTTPException(
      status_code=404,
      detail="Submission not found"
    )

  return {
    "id": str(sub["_id"]),
    "task_id": sub.get("task_id"),
    "language": sub.get("language"),
    "code": sub.get("code"),
    "score": sub.get("final_score", 0),
    "execution_score": sub.get("execution_score", 0),
    "quality_score": sub.get("quality_score", 0),
    "time_score": sub.get("time_score", 0),
    "date": str(sub.get("created_at")),
    "details": sub.get("evaluation_details", []),
    "passed": sub.get("test_cases_passed", 0),
    "failed": sub.get("test_cases_failed", 0),
    "total": sub.get("test_cases_total", 0)
  }