from fastapi import APIRouter, HTTPException
from app.mongo import tasks_collection, submissions_collection

router = APIRouter()

@router.post("/tasks")
def create_task(task: dict):

    # task structure
    new_task = {
        "title": task.get("title"),
        "difficulty": task.get("difficulty"),
        "skill": task.get("skill"),

        "public_test_cases": task.get("public_test_cases", []),
        "hidden_test_cases": task.get("hidden_test_cases", []),

        "execution_time_limit": task.get("execution_time_limit", 1),  # execution time limit (in seconds)
        "solve_time_limit": task.get("solve_time_limit", 20)
    }

    # required field check
    if not new_task["title"] or not new_task["difficulty"]:
        raise HTTPException(status_code=400, detail="Title and difficulty are required")

    # difficulty validation
    if new_task["difficulty"] not in ["Easy", "Medium", "Hard"]:
        raise HTTPException(status_code=400, detail="Invalid difficulty (must be Easy, Medium, Hard)")

    # test case validation
    for tc in new_task["public_test_cases"] + new_task["hidden_test_cases"]:
        if "input" not in tc or "output" not in tc:
            raise HTTPException(status_code=400, detail="Each test case must have input and output")

    # Insert into tasks
    result = tasks_collection.insert_one(new_task)

    return {
        "message": "Task created successfully",
        "id": str(result.inserted_id)
    }

@router.get("/tasks")
def get_tasks(difficulty: str = None):
    
    query = {}

    if difficulty and difficulty != "All":
        query["difficulty"] = {"$regex": f"^{difficulty}$", "$options": "i"}

    tasks = list(tasks_collection.find(query))

    for t in tasks:
        t["id"] = str(t["_id"])
        del t["_id"]

    return tasks

@router.get("/task-analytics/{task_title}")
def task_analytics(task_title: str):
  # FETCH TASK
  task = tasks_collection.find_one({"title": task_title})

  if not task:
    return {
      "attempts": 0,
      "avg_score": 0,
      "pass_rate": 0,
      "failed_hidden": 0,
      "common_mistakes": ["Task not found"]
    }

  # FETCH SUBMISSIONS
  submissions = list(
    submissions_collection.find(
      {"task_id": task_title}
    )
  )

  total = len(submissions)

  if total == 0:
    return {
      "attempts": 0,
      "avg_score": 0,
      "pass_rate": 0,
      "failed_hidden": 0,
      "common_mistakes": [
        "No candidate attempts yet",
        "No performance data available"
      ]
    }

  # BASIC STATS
  scores = []
  passed = 0
  hidden_fail = 0

  for s in submissions:
    score = s.get("final_score", 0)
    scores.append(score)

    if score >= 50:
      passed += 1

    for case in s.get("evaluation_details", []):
      if case.get("hidden") is True:
        if case.get("status") != "passed":
          hidden_fail += 1

  avg_score = round(sum(scores) / total, 2)
  pass_rate = round((passed / total) * 100, 2)

  # COMMON MISTAKES
  mistakes = []

  skill = task.get("skill", "General")
  difficulty = task.get("difficulty", "Easy")

  # SKILL BASED 

  if skill == "String Manipulation":
    mistakes.append(
      "Edge cases like empty strings, spaces, or case sensitivity are often missed."
    )
    mistakes.append(
      "Incorrect index handling appears in reverse/palindrome logic."
    )

  elif skill == "Array":
    mistakes.append(
      "Loop boundary and indexing mistakes are common."
    )
    mistakes.append(
      "Duplicate values or negative numbers are often mishandled."
    )

  elif skill == "Basic Maths":
    mistakes.append(
      "Incorrect formula usage or arithmetic mistakes appear frequently."
    )
    mistakes.append(
      "Large number handling / overflow can cause wrong answers."
    )

  elif skill == "Recursion":
    mistakes.append(
      "Missing base case causes infinite recursion."
    )
    mistakes.append(
      "Return values are not propagated correctly."
    )

  elif skill == "Hashing":
    mistakes.append(
      "Frequency map updates and missing keys are common issues."
    )

  elif skill == "Linked List":
    mistakes.append(
      "Null pointer and broken link handling errors occur often."
    )

  else:
    mistakes.append(
      "Logic implementation mistakes are common on this task."
    )

  # DIFFICULTY BASED 

  if difficulty == "Medium":
    mistakes.append(
      "Multiple edge-case conditions are frequently missed."
    )

  elif difficulty == "Hard":
    mistakes.append(
      "Time complexity optimization is a major challenge."
    )
    mistakes.append(
      "Advanced logic handling causes frequent failures."
    )

  # ---- PERFORMANCE BASED ----

  if hidden_fail >= 3:
    mistakes.append(
      "Hidden edge test cases are failing frequently."
    )

  if pass_rate < 50:
    mistakes.append(
      "Many candidates struggle to complete the core logic."
    )

  if avg_score >= 85:
    mistakes.append(
      "Most candidates solve the main logic, but code quality varies."
    )

  # remove duplicates + keep top 3
  final_mistakes = []
  seen = set()

  for m in mistakes:
    if m not in seen:
      final_mistakes.append(m)
      seen.add(m)

  final_mistakes = final_mistakes[:3]

  # RESPONSE
  return {
    "attempts": total,
    "avg_score": avg_score,
    "pass_rate": pass_rate,
    "failed_hidden": hidden_fail,
    "common_mistakes": final_mistakes
  }