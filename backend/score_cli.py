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

        package_name = input("Enter Package Name: ")
        security_score = int(input("Enter Security Score: "))
        risk_level = input("Enter Risk Level: ")
        analysis_score = input("Enter Analysed By: ")

        data = {
            "package_name": package_name,
            "security_score": security_score,
            "risk_level": risk_level,
            "AnalysedBy": analysis_score,
            "timestamp": datetime.utcnow()
        }

        db.collection("scores").add(data)

        print("\n✅ Score added successfully!\n")


if __name__ == "__main__":
    add_score()