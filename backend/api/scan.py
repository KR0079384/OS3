from fastapi import APIRouter
from pydantic import BaseModel

from services.osv_service import get_vulnerabilities
from services.dependency_analyzer import scan_dependency_tree, tree_to_graph

router = APIRouter()


# -----------------------------
# Request Model
# -----------------------------
class PackageRequest(BaseModel):
    package_name: str


# -----------------------------
# Security Score Calculation
# -----------------------------
def calculate_security_score(vulnerability_count: int):

    score = 100 - (vulnerability_count * 10)

    if score < 0:
        score = 0

    return score


# -----------------------------
# Scan Endpoint
# -----------------------------
@router.post("/scan-package")
def scan_package(request: PackageRequest):

    package_name = request.package_name

    print("Scanning package:", package_name)

    # -----------------------------
    # Vulnerability Scan
    # -----------------------------
    result = get_vulnerabilities(package_name)

    if not result["success"]:
        return {
            "status": "Error",
            "package": package_name,
            "security_score": 0,
            "dependencies_found": 0,
            "dependencies": [],
            "vulnerabilities": 0,
            "vulnerability_details": [],
            "graph": {
                "nodes": [],
                "edges": []
            }
        }

    vulnerability_count = result["vulnerability_count"]
    vulnerabilities = result["vulnerabilities"]

    # -----------------------------
    # Recursive Dependency Scan
    # -----------------------------
    tree = scan_dependency_tree(package_name)

    graph = tree_to_graph(tree)

    nodes = graph["nodes"]

    # Remove root from dependency count
    dependencies = [n["id"] for n in nodes if n["id"] != package_name]

    # -----------------------------
    # Security Score
    # -----------------------------
    score = calculate_security_score(vulnerability_count)

    status = "Safe"

    if vulnerability_count >= 5:
        status = "High Risk"
    elif vulnerability_count >= 2:
        status = "Moderate Risk"

    # -----------------------------
    # Final Response
    # -----------------------------
    return {
        "package": package_name,
        "security_score": score,
        "status": status,
        "dependencies_found": len(dependencies),
        "dependencies": dependencies,
        "vulnerabilities": vulnerability_count,
        "vulnerability_details": vulnerabilities,
        "graph": graph
    }