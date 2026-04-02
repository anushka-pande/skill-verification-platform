from fastapi import APIRouter
from app.mongo import submissions_collection

router = APIRouter()

def get_skill_level(avg_score):
    if avg_score >= 80:
        return "Advanced"
    elif avg_score >= 50:
        return "Intermediate"
    else:
        return "Beginner"

@router.get("/profile/{user_id}")
def get_profile(user_id: int):
    submissions = list(submissions_collection.find({"user_id": user_id}))

    total = len(submissions)

    if total == 0:
        return {
            "total_submissions": 0,
            "average_score": 0,
            "best_score": 0,
            "success_rate": 0,
            "skill_level": "Beginner"
        }

    scores = [s.get("final_score") for s in submissions if s.get("final_score") is not None]
    
    passed = len([
        s for s in submissions 
        if s.get("final_score") is not None and s.get("final_score") >= 50
    ])

    if len(scores) == 0:
        avg_score = 0
        best_score = 0
        success_rate = 0
    else:
        avg_score = round(sum(scores) / len(scores), 2)
        best_score = max(scores)
        success_rate = round((passed / len(scores)) * 100, 2)

    skill_level = get_skill_level(avg_score)

    return {
        "total_submissions": total,
        "average_score": avg_score,
        "best_score": best_score,
        "success_rate": success_rate,
        "skill_level": skill_level  
    }