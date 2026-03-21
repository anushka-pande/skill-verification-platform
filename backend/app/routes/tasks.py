from fastapi import APIRouter
from app.mongo import tasks_collection

router = APIRouter()

@router.post("/tasks")
def create_task(task: dict):
    result = tasks_collection.insert_one(task)
    return {"message": "Task created", "id": str(result.inserted_id)}

@router.get("/tasks")
def get_tasks():
    tasks = list(tasks_collection.find({}, {"_id": 0}))
    return tasks