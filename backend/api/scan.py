from fastapi import APIRouter
from pydantic import BaseModel

from services.osv_service import get_vulnerabilities
from services.dependency_analyzer import (
    scan_dependency_tree,
    tree_to_graph,
    collect_all_packages
)
from services.attack_path_detector import find_attack_paths

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
    # Build Dependency Tree
    # -----------------------------
    tree = scan_dependency_tree(package_name)

    # -----------------------------
    # Collect all packages
    # -----------------------------
    all_packages = collect_all_packages(tree)

    print("All packages:", all_packages)

    vulnerable_packages = []
    vulnerability_details = []

    # -----------------------------
    # Check vulnerabilities for ALL packages
    # -----------------------------
    for pkg in all_packages:

        result = get_vulnerabilities(pkg)

        if not result["success"]:
            continue

        if result["vulnerability_count"] > 0:

            vulnerable_packages.append(pkg)
            vulnerability_details.extend(result["vulnerabilities"])

    vulnerability_count = len(vulnerability_details)

    print("Vulnerable packages:", vulnerable_packages)

    # -----------------------------
    # Build Graph
    # -----------------------------
    graph = tree_to_graph(tree)

    nodes = graph["nodes"]

    dependencies = [n["id"] for n in nodes if n["id"] != package_name]

    # -----------------------------
    # Detect Attack Paths
    # -----------------------------
    attack_paths = find_attack_paths(tree, vulnerable_packages)

    print("Attack paths:", attack_paths)

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
        "vulnerability_details": vulnerability_details,
        "attack_paths": attack_paths,
        "graph": graph
    }