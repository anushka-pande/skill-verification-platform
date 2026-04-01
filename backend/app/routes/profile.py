from fastapi import APIRouter
from app.mongo import submissions_collection

router = APIRouter()

@router.get("/profile/{user_id}")
def get_profile(user_id: int):
    submissions = list(submissions_collection.find({"user_id": user_id}))

    total = len(submissions)

    if total == 0:
        return {
            "total_submissions": 0,
            "average_score": 0,
            "best_score": 0,
            "success_rate": 0
        }

    scores = [s.get("final_score", 0) for s in submissions]

    passed = len([s for s in submissions if s.get("final_score", 0) >= 50])

    return {
        "total_submissions": total,
        "average_score": round(sum(scores) / total, 2),
        "best_score": max(scores),
        "success_rate": round((passed / total) * 100, 2)
    }