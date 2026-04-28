from fastapi import APIRouter, HTTPException
from app.mongo import submissions_collection, tasks_collection
from app.executor import execute_code
from app.analyzer import analyze_code
from bson import ObjectId
import re

router = APIRouter()

def normalize_output(text):
  if text is None:
    return ""

  text = str(text).strip().lower()

  # collapse spaces/newlines/tabs
  text = " ".join(text.split())

  return text

# SMART OUTPUT HINT ENGINE
def detect_output_hint(actual_output, expected_output):
  if actual_output is None:
    return None

  actual_raw = str(actual_output).strip()
  expected_raw = str(expected_output).strip()

  actual = actual_raw.lower()
  expected = expected_raw.lower()

  # if expected answer exists but extra output too
  if expected and expected in actual and actual.strip() != expected.strip():
    return "Extra text detected. Print only final required output."

  keywords = [
    "enter", "input", "provide", "type", "give",
    "number", "numbers", "value", "values",
    "string", "integer",
    "sum =", "result =", "answer =",
    "sum is", "result is", "answer is",
    "output:"
  ]

  for word in keywords:
    if word in actual:
      return "Prompt/debug text detected. Only print the final answer."

  if "\n" in actual_raw and "\n" not in expected_raw:
    return "Multiple output lines detected. Print only required final output."

  return None

# RUN CODE
@router.post("/run-code")
def run_code(data: dict):
  code = data.get("code", "")
  language = data.get("language", "python")
  test_input = data.get("input", "")
  expected_output = data.get("expected", "")

  result = execute_code(code, test_input, language)

  output = result.get("output", "")
  error = result.get("error", "")
  exec_time = round(result.get("execution_time", 0), 4)

  hint = None

  if not error and expected_output:
    hint = detect_output_hint(output, expected_output)

  return {
    "output": output,
    "error": error,
    "execution_time": exec_time,
    "hint": hint
  }


# SUBMIT / EVALUATE
@router.post("/execute/{submission_id}")
def execute_submission(submission_id: str):
  submission = submissions_collection.find_one(
    {"_id": ObjectId(submission_id)}
  )

  if not submission:
    raise HTTPException(
      status_code=404,
      detail="Submission not found."
    )

  code = submission["code"]
  task_title = submission["task_id"]

  task = tasks_collection.find_one(
    {"title": task_title}
  )

  if not task:
    raise HTTPException(
      status_code=404,
      detail="Task not found."
    )

  public_cases = task.get(
    "public_test_cases",
    task.get("test_cases", [])
  )

  hidden_cases = task.get(
    "hidden_test_cases",
    []
  )

  test_cases = []

  for tc in public_cases:
    test_cases.append({
      "input": tc["input"],
      "output": tc["output"],
      "hidden": False
    })

  for tc in hidden_cases:
    test_cases.append({
      "input": tc["input"],
      "output": tc["output"],
      "hidden": True
    })

  total = len(test_cases)
  passed = 0
  results = []
  has_error = False

  # ---------------------------------------------
  # Run all test cases
  # ---------------------------------------------
  for test in test_cases:
    is_hidden = test["hidden"]
    test_input = test["input"]
    expected_output = test["output"]

    language = submission.get(
      "language",
      "python"
    )

    execution_result = execute_code(
      code,
      test_input,
      language
    )

    execution_time = execution_result.get(
      "execution_time", 0
    )

    error = execution_result.get("error")

    if error:
      has_error = True

      if is_hidden:
        results.append({
            "hidden": True,
            "status": "error"
        })
      else:
        results.append({
            "input": test_input,
            "expected": expected_output,
            "error": error,
            "execution_time": execution_time,
            "status": "error",
            "hidden": False
        })
      continue

    actual_output = execution_result.get(
      "output", ""
    ).strip()

    hint = None

    if normalize_output(actual_output) == normalize_output(expected_output):
      passed += 1
      status = "passed"
    else:
      status = "failed"
      hint = detect_output_hint(
        actual_output,
        expected_output
      )

    if is_hidden:
      results.append({
        "hidden": True,
        "status": status
      })
    else:
      results.append({
        "input": test_input,
        "expected": expected_output,
        "actual": actual_output,
        "execution_time": execution_time,
        "status": status,
        "hidden": False,
        "hint": hint
      })

  # Scoring
  execution_score = (
    (passed / total) * 100 if total > 0 else 0
  )

  language = submission.get(
    "language",
    "python"
  )

  try:
    if language == "python":
      analysis = analyze_code(code)
    else:
      analysis = {
        "line_count": len(code.splitlines()),
        "loop_count": 0
      }
  except:
    analysis = {
      "line_count": len(code.splitlines()),
      "loop_count": 0
    }

  quality_score = 100

  if analysis["line_count"] > 50:
    quality_score -= 10

  if analysis["loop_count"] > 3:
    quality_score -= 10

  quality_score = max(0, quality_score)

  average_time = (
    sum(
      r.get("execution_time", 0)
      for r in results
    ) / total
    if total > 0 else 0
  )

  if average_time < 0.2:
    time_score = 100
  elif average_time < 1:
    time_score = 90
  elif average_time < 2:
    time_score = 75
  else:
    time_score = 50

  if has_error:
    execution_score = 0
    quality_score = 0
    time_score = 0
    final_score = 0
  else:
    final_score = (
      0.6 * execution_score +
      0.3 * quality_score +
      0.1 * time_score
    )

  failed = total - passed

  submissions_collection.update_one(
    {"_id": ObjectId(submission_id)},
    {
      "$set": {
        "execution_score": execution_score,
        "quality_score": quality_score,
        "time_score": time_score,
        "final_score": final_score,
        "evaluation_details": results,
        "test_cases_total": total,
        "test_cases_passed": passed,
        "test_cases_failed": failed
      }
    }
  )

  return {
    "score": round(final_score, 2),

    "test_cases": {
      "total": total,
      "passed": passed,
      "failed": failed
    },

    "breakdown": {
      "execution": round(execution_score, 2),
      "quality": round(quality_score, 2),
      "time": round(time_score, 2)
    },

    "details": results
  }