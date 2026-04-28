import os
from dotenv import load_dotenv
import google.generativeai as genai
from groq import Groq
from fastapi import APIRouter
from app.mongo import submissions_collection, tasks_collection

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

router = APIRouter()
load_dotenv()

@router.get("/ai-insights/{user_id}")
def ai_insights(user_id: int):
  submissions = list(
    submissions_collection.find({"user_id": user_id})
  )

  if not submissions:
    starter_tasks = list(
      tasks_collection.find({}, {"_id": 0})
    )[:3]

    suggested = []

    for t in starter_tasks:
      suggested.append({
        "title": t["title"],
        "skill": t["skill"],
        "difficulty": t["difficulty"],
        "reason": "Great beginner task"
      })

    return {
      "strengths": [
        "Ready to start problem solving",
        "Untapped learning potential"
      ],
      "weaknesses": [
        "No submissions yet"
      ],
      "trend": "No Data",
      "recommendations": [
        "Solve your first task",
        "Start with Easy problems",
        "Build consistency with daily practice"
      ],
      "readiness_score": 0,
      "suggested_tasks": suggested
    }

  tasks = list(tasks_collection.find({}))
  task_map = {t["title"]: t for t in tasks}

  solved_tasks = set(s["task_id"] for s in submissions)

  unsolved = [
    t for t in tasks
    if t["title"] not in solved_tasks
  ]

  scores = []
  skill_scores = {}
  hidden_pass = 0
  hidden_total = 0
  hard_attempted = 0

  for s in submissions:
    score = s.get("final_score", 0)
    scores.append(score)

    task = task_map.get(s.get("task_id"))
    skill = task.get("skill") if task else "General"

    if skill not in skill_scores:
      skill_scores[skill] = []

    skill_scores[skill].append(score)

    if task and task.get("difficulty") == "Hard":
      hard_attempted += 1

    for case in s.get("evaluation_details", []):
      if case.get("hidden") == True:
        hidden_total += 1
        if case.get("status") == "passed":
          hidden_pass += 1

  avg_score = sum(scores) / len(scores)

  # Recommended Tasks
  weak_skill = None

  if skill_scores:
    weak_skill = min(
      skill_scores.items(),
      key=lambda x: sum(x[1]) / len(x[1])
    )[0]

  recommended = []

  for t in unsolved:
    score = 0
    reason = ""

    if weak_skill and t["skill"] == weak_skill:
      score += 40
      reason = f"Improve {weak_skill}"

    if t["difficulty"] == "Medium":
      score += 20

    if t["difficulty"] == "Hard":
      score += 10

    if reason == "":
      reason = "Good next practice task"

    recommended.append({
      "title": t["title"],
      "skill": t["skill"],
      "difficulty": t["difficulty"],
      "score": score,
      "reason": reason
    })

  recommended = sorted(
    recommended,
    key=lambda x: x["score"],
    reverse=True
  )[:3]

  # Strengths
  strengths = []

  best_skill = max(
    skill_scores.items(),
    key=lambda x: sum(x[1]) / len(x[1])
  )[0]

  strengths.append(f"Strong in {best_skill}")

  if avg_score >= 80:
    strengths.append("High scoring performer")

  if len(submissions) >= 5:
    strengths.append("Consistent practice")

  # Weaknesses
  weaknesses = []

  if avg_score < 60:
    weaknesses.append("Needs stronger fundamentals")

  if hidden_total > 0:
    hidden_rate = (hidden_pass / hidden_total) * 100

    if hidden_rate < 70:
      weaknesses.append(
        "Weak in hidden testcase handling"
      )

  if hard_attempted == 0:
    weaknesses.append(
      "No Hard tasks attempted yet"
    )

  # Trend
  trend = "Stable"

  if len(scores) >= 4:
    old_avg = sum(scores[:len(scores)//2]) / max(1, len(scores)//2)
    new_avg = sum(scores[len(scores)//2:]) / max(1, len(scores)-len(scores)//2)

    if new_avg > old_avg + 5:
      trend = "Improving"
    elif new_avg < old_avg - 5:
      trend = "Declining"

  # Recommendations
  recommendations = []

  if hard_attempted == 0:
    recommendations.append(
      "Try one Hard problem this week"
    )

  if avg_score < 80:
    recommendations.append(
      "Improve code quality for higher scores"
    )

  recommendations.append(
    f"Practice more tasks in {best_skill}"
  )

  # Readiness score
  readiness = min(
    100,
    round(avg_score * 0.8 + len(submissions) * 2)
  )

  return {
    "strengths": strengths,
    "weaknesses": weaknesses,
    "trend": trend,
    "recommendations": recommendations,
    "readiness_score": readiness,
    "suggested_tasks": recommended
  }

@router.post("/ai-coach")
def ai_coach(data: dict):
  stats = data.get("stats")

  prompt = f"""
You are a coding career coach speaking directly to the user.

Candidate analytics:
{stats}

Write a clean coaching summary addressing the user as you in this EXACT format:

Strength Summary:
<2 short sentences using "you">

Weakness Summary:
<2 short sentences using "you">

Improvement Steps:
- step 1
- step 2

Motivation:
<1 encouraging sentence using "you">

Rules:
- Use second person ("you", "your")
- Never say "candidate", "they", or "this user" 
- No markdown
- No ** symbols
- No numbering
- Keep under 120 words
- Clean readable text
- Friendly and professional
"""

  # TRY GEMINI
  try:
    model = genai.GenerativeModel("gemini-2.0-flash")
    res = model.generate_content(prompt)

    print("AI Source: Gemini")

    return {
      "message": res.text,
    }

  except Exception as e:
    print("Gemini failed:", e)

  # TRY GROQ
  try:
    client = Groq(
      api_key=os.getenv("GROQ_API_KEY")
    )

    chat = client.chat.completions.create(
      model="llama-3.1-8b-instant",
      messages=[
        {
          "role": "user",
          "content": prompt
        }
      ]
    )

    print("AI Source: Groq")

    return {
      "message": chat.choices[0].message.content,
    }

  except Exception as e:
    print("Groq failed:", e)

  # LOCAL FALLBACK
  strengths = stats.get("strengths", [])
  weaknesses = stats.get("weaknesses", [])
  readiness = stats.get("readiness_score", 0)

  msg = f"""
{strengths[0] if strengths else 'Good learning potential.'}
Focus on: {weaknesses[0] if weaknesses else 'Consistent practice'}.
Readiness score is {readiness}%.
Solve more Medium tasks this week.
Keep progressing steadily.
"""

  print("AI Source: Local Fallback")

  return {
    "message": msg.strip(),
  }