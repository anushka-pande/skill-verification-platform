from fastapi import APIRouter
from app.mongo import submissions_collection, tasks_collection
from datetime import datetime

router = APIRouter()

def get_skill_level(avg_score):
  if avg_score >= 80:
    return "Advanced"
  elif avg_score >= 50:
    return "Intermediate"
  return "Beginner"

@router.get("/profile/{user_id}")
def get_profile(user_id: int):
  submissions = list(
    submissions_collection.find({"user_id": user_id})
  )

  total = len(submissions)

  if total == 0:
    return {
      "total_submissions": 0,
      "average_score": 0,
      "best_score": 0,
      "success_rate": 0,
      "skill_level": "Beginner",
      "skill_breakdown": [],
      "recent_activity": [],
      "rank": "-",
      "streak_days": 0
    }

  # Scores
  scores = [
    s.get("final_score")
    for s in submissions
    if s.get("final_score") is not None
  ]

  passed = len([
    s for s in submissions
    if s.get("final_score") is not None
    and s.get("final_score") >= 50
  ])

  avg_score = round(sum(scores) / len(scores), 2) if scores else 0
  best_score = max(scores) if scores else 0
  success_rate = round((passed / len(scores)) * 100, 2) if scores else 0

  skill_level = get_skill_level(avg_score)

  # Skill Breakdown
  all_tasks = list(tasks_collection.find({}))
  task_map = {t["title"]: t for t in all_tasks}

  skill_data = {}

  for s in submissions:
    task_id = s.get("task_id")
    score = s.get("final_score", 0)

    task = task_map.get(task_id)
    skill = task.get("skill") if task else "General"

    if skill not in skill_data:
      skill_data[skill] = []

    skill_data[skill].append(score)

  skill_breakdown = []

  for skill, vals in skill_data.items():
    avg = round(sum(vals) / len(vals), 2)

    skill_breakdown.append({
      "skill": skill,
      "score": avg
    })

  skill_breakdown.sort(
    key=lambda x: x["score"],
    reverse=True
  )

  # Recent Activity
  recent_sorted = sorted(
    submissions,
    key=lambda x: x.get("created_at", datetime.min),
    reverse=True
  )[:3]

  recent_activity = []

  for s in recent_sorted:
    recent_activity.append({
      "task": s.get("task_id"),
      "score": s.get("final_score", 0),
      "date": str(s.get("created_at"))
    })

  # Rank
  all_submissions = list(
    submissions_collection.find({})
  )

  user_scores = {}

  for s in all_submissions:
    uid = s.get("user_id")
    sc = s.get("final_score", 0)

    if uid not in user_scores:
      user_scores[uid] = []

    user_scores[uid].append(sc)

  leaderboard = []

  for uid, vals in user_scores.items():
    leaderboard.append({
      "user_id": uid,
      "avg": sum(vals) / len(vals)
    })

  leaderboard.sort(
    key=lambda x: x["avg"],
    reverse=True
  )

  rank = "-"

  for i, item in enumerate(leaderboard, start=1):
    if item["user_id"] == user_id:
      rank = i
      break

  # Streak
  dates = set()

  for s in submissions:
    created = s.get("created_at")

    if created:
      dates.add(created.date())

  streak = 0

  today = datetime.now().date()

  while today in dates:
    streak += 1
    today = today.fromordinal(today.toordinal() - 1)

  return {
    "total_submissions": total,
    "average_score": avg_score,
    "best_score": best_score,
    "success_rate": success_rate,
    "skill_level": skill_level,
    "skill_breakdown": skill_breakdown,
    "recent_activity": recent_activity,
    "rank": rank,
    "streak_days": streak
  }