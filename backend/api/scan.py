from fastapi import APIRouter
from pydantic import BaseModel
from services.osv_service import get_vulnerabilities
import requests

router = APIRouter()

# -----------------------------
# Request Body Model
# -----------------------------
class PackageRequest(BaseModel):
    package_name: str


# -----------------------------
# Dependency Extraction
# -----------------------------
def get_package_dependencies(package_name: str):

    url = f"https://registry.npmjs.org/{package_name}"

    try:

        response = requests.get(url)

        if response.status_code != 200:
            return []

        data = response.json()

        latest_version = data.get("dist-tags", {}).get("latest")

        if not latest_version:
            return []

        version_data = data.get("versions", {}).get(latest_version, {})

        dependencies = version_data.get("dependencies", {})

        return list(dependencies.keys())

    except Exception as e:
        print("Dependency fetch error:", e)
        return []


# -----------------------------
# Security Score Calculation
# -----------------------------
def calculate_security_score(vulnerability_count: int):

    score = 100 - (vulnerability_count * 10)

    if score < 0:
        score = 0

    return score


# -----------------------------
# Dependency Graph Builder
# -----------------------------
def build_dependency_graph(package_name: str, dependencies: list):

    nodes = []
    edges = []

    # Root node
    nodes.append({
        "id": package_name,
        "type": "root"
    })

    # Dependency nodes
    for dep in dependencies:

        nodes.append({
            "id": dep,
            "type": "dependency"
        })

        edges.append({
            "source": package_name,
            "target": dep
        })

    return {
        "nodes": nodes,
        "edges": edges
    }


# -----------------------------
# Scan Endpoint
# -----------------------------
@router.post("/scan-package")
def scan_package(request: PackageRequest):

    package_name = request.package_name

    print("Scanning package:", package_name)

    # Vulnerability Scan
    result = get_vulnerabilities(package_name)

    if not result["success"]:
        return {
            "status": "Error",
            "dependencies_found": 0,
            "vulnerabilities": 0,
            "security_score": 0,
            "graph": {
                "nodes": [],
                "edges": []
            }
        }

    vulnerability_count = result["vulnerability_count"]
    vulnerabilities = result["vulnerabilities"]

    # Extract Dependencies
    dependencies = get_package_dependencies(package_name)

    # Calculate Security Score
    score = calculate_security_score(vulnerability_count)

    status = "Safe"

    if vulnerability_count >= 5:
        status = "High Risk"
    elif vulnerability_count >= 2:
        status = "Moderate Risk"

    # Build Dependency Graph
    graph = build_dependency_graph(package_name, dependencies)

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