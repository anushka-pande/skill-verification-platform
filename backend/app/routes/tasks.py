from fastapi import APIRouter
from app.mongo import tasks_collection

router = APIRouter()

@router.post("/tasks")
def create_task(task: dict):
    result = tasks_collection.insert_one(task)
    return {"message": "Task created", "id": str(result.inserted_id)}

@router.get("/tasks")
def get_tasks(difficulty: str = None):
    
    query = {}

    if difficulty and difficulty != "All":
        query["difficulty"] = difficulty

    tasks = list(tasks_collection.find(query, {"_id": 0}))

    return tasks