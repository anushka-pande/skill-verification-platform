from fastapi import APIRouter, HTTPException 
from app.mongo import submissions_collection, tasks_collection 
from app.executor import execute_code 
from app.analyzer import analyze_code 
from bson import ObjectId 

router = APIRouter() 

def normalize_output(text):
  if text is None:
    return ""

  text = str(text).strip().lower()

  # collapse multiple spaces/newlines/tabs
  text = " ".join(text.split())

  return text

@router.post("/run-code")
def run_code(data: dict):

  code = data.get("code", "")
  language = data.get("language", "python")
  test_input = data.get("input", "")

  result = execute_code(code, test_input, language)

  return {
    "output": result.get("output", ""),
    "error": result.get("error", ""),
    "execution_time": round(result.get("execution_time", 0), 4)
  }

@router.post("/execute/{submission_id}") 
def execute_submission(submission_id: str): 
    
  # Get submission 
  submission = submissions_collection.find_one( 
    {"_id": ObjectId(submission_id)} 
  )
  
  if not submission: 
    raise HTTPException(status_code=404, detail="Submission not found.") 
  
  code = submission["code"] 
  task_title = submission["task_id"] 
  
  # Get task 
  task = tasks_collection.find_one( 
    {"title": task_title}
  ) 
  
  if not task: 
    raise HTTPException(status_code=404, detail="Task now found.") 
  
  public_cases = task.get("public_test_cases", task.get("test_cases", []))
  hidden_cases = task.get("hidden_test_cases", [])

  test_cases = []

  for tc in public_cases:
    tc["hidden"] = False
    test_cases.append({
      "input": tc["input"],
      "output": tc["output"],
      "hidden": False
    })
  
  for tc in hidden_cases:
    tc["hidden"] = True
    test_cases.append({
      "input": tc["input"],
      "output": tc["output"],
      "hidden": True
    })
  
  total = len(test_cases) 
  passed = 0 
  results = []
  has_error = False
  
  # loop through test cases 
  for test in test_cases:
    is_hidden = test.get("hidden", False)
    test_input = test["input"]
    expected_output = test["output"]

    language = submission.get("language", "python")
    execution_result = execute_code(code, test_input, language)
    
    execution_time = execution_result.get("execution_time", 0)
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

    actual_output = execution_result["output"].strip()

    if normalize_output(actual_output) == normalize_output(expected_output):
      passed += 1
      status = "passed"
    else:
      status = "failed"

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
        "hidden": False
      })
      
  execution_score = (passed / total) * 100 if total > 0 else 0 
  
  language = submission.get("language", "python")
  try:
    if language == "python":
      analysis = analyze_code(code) 
    else:
      analysis = {"line_count": len(code.splitlines()), "loop_count": 0}
  except:
    analysis = {"line_count": len(code.splitlines()), "loop_count": 0}
  quality_score = 100 
  
  # Penalize long code 
  if analysis["line_count"] > 50: 
    quality_score -= 10 
      
  # Penlaize too many loops 
  if analysis["loop_count"] > 3: 
    quality_score -= 10 
  
  quality_score = max(0, quality_score) 
  
  average_time = (
    sum(r.get("execution_time", 0) for r in results) / total
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
    {"$set": { 
      "execution_score": execution_score, 
      "quality_score": quality_score, 
      "time_score": time_score, 
      "final_score": final_score, 
      "evaluation_details": results,
      "test_cases_total": total,
      "test_cases_passed": passed,
      "test_cases_failed": failed
    }} 
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