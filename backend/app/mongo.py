from pymongo import MongoClient

MONGO_URL = "mongodb://localhost:27017"

client = MongoClient(MONGO_URL)

db = client["skill_verification"]

tasks_collection = db["tasks"]
submissions_collection = db["submissions"]
recruiter_status_collection = db["recruiter_status"]
recruiter_notes_collection = db["recruiter_notes"]