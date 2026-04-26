import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
cred_path = os.path.join(BASE_DIR, "serviceAccountKey.json")

cred = credentials.Certificate(cred_path)
firebase_admin.initialize_app(cred)

db = firestore.client()

def add_score():
    print("\n=== OS3 Scoring CLI ===\n")

    team = input("Enter Team Name: ")
    score = int(input("Enter Score: "))
    category = input("Enter Category: ")
    judge = input("Enter Judge Email: ")

    data = {
        "team": team,
        "score": score,
        "category": category,
        "judgedBy": judge,
        "timestamp": datetime.utcnow()
    }

    db.collection("scores").add(data)

    print("\n✅ Score added successfully!\n")


if __name__ == "__main__":
    add_score()