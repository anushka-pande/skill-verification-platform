from fastapi import APIRouter, HTTPException
from app.mongo import tasks_collection

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