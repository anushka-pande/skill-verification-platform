from fastapi import APIRouter, HTTPException 
from app.mongo import submissions_collection, tasks_collection 
from app.executor import execute_code 
from app.analyzer import analyze_code 
from bson import ObjectId 

router = APIRouter() 

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
    
    test_cases = task.get("test_cases", []) 
    
    total = len(test_cases) 
    passed = 0 
    results = [] 
    
    # loop through test cases 
    for test in test_cases:
        test_input = test["input"]
        expected_output = test["output"]

        language = submission.get("language", "python")
        execution_result = execute_code(code, test_input, language)
        
        execution_time = execution_result.get("execution_time", 0)
        error = execution_result.get("error")

        if error:
            results.append({
                "input": test_input,
                "expected": expected_output,
                "error": error,
                "execution_time": execution_time,
                "status": "error"
            })
            continue

        actual_output = execution_result["output"].strip()

        if actual_output == expected_output:
            passed += 1
            status = "passed"
        else:
            status = "failed"

        results.append({
            "input": test_input,
            "expected": expected_output,
            "actual": actual_output,
            "execution_time": execution_time,
            "status": status
        })
        
    execution_score = (passed / total) * 100 if total > 0 else 0 
    
    language = submission.get("language", "python")
    if language == "python":
        analysis = analyze_code(code) 
    else:
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
    
    time_score = 100 if average_time < 1 else 80 
    
    final_score = ( 
        0.6 * execution_score + 
        0.3 * quality_score + 
        0.1 * time_score 
    ) 
    
    submissions_collection.update_one( 
        {"_id": ObjectId(submission_id)}, 
        {"$set": { 
            "execution_score": execution_score, 
            "quality_score": quality_score, 
            "time_score": time_score, 
            "final_score": final_score, 
            "evaluation_details": results 
        }} 
    ) 
    
    return { 
        "total_test_cases": total, 
        "passed": passed, 
        "execution_score": execution_score, 
        "quality_score": quality_score, 
        "time_score": time_score, 
        "final_score": final_score, 
        "analysis": analysis, 
        "details": results 
    }