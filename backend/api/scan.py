from fastapi import APIRouter
from pydantic import BaseModel

from services.osv_service import get_vulnerabilities
from services.dependency_analyzer import (
    scan_dependency_tree,
    collect_all_packages
)
from services.attack_path_detector import find_attack_paths
from services.npm_service import get_dependencies

router = APIRouter()


class PackageRequest(BaseModel):
    package_name: str


def calculate_security_score(vulnerability_count: int):

    score = 100 - (vulnerability_count * 10)

    if score < 0:
        score = 0

    return score


@router.post("/scan-package")
def scan_package(request: PackageRequest):

    package_name = request.package_name

    print("\n==============================")
    print("Scanning package:", package_name)
    print("==============================\n")

    # Build dependency tree for analysis only
    tree = scan_dependency_tree(package_name)

    all_packages = collect_all_packages(tree)

    vulnerable_packages = []
    vulnerability_details = []

    severity_total = {
        "critical": 0,
        "high": 0,
        "medium": 0,
        "low": 0
    }

    for pkg in all_packages:

        result = get_vulnerabilities(pkg)

        if not result["success"]:
            continue

        vulnerability_details.extend(result.get("vulnerabilities", []))

        if result["vulnerability_count"] > 0:
            vulnerable_packages.append(pkg)

        sev = result.get("severity", {})

        severity_total["critical"] += sev.get("critical", 0)
        severity_total["high"] += sev.get("high", 0)
        severity_total["medium"] += sev.get("medium", 0)
        severity_total["low"] += sev.get("low", 0)

    vulnerability_count = len(vulnerability_details)

    attack_paths = find_attack_paths(tree, vulnerable_packages)

    score = calculate_security_score(vulnerability_count)

    status = "Safe"

    if vulnerability_count >= 5:
        status = "High Risk"
    elif vulnerability_count >= 2:
        status = "Moderate Risk"

    # IMPORTANT CHANGE
    # Graph initially contains ONLY root node
    graph = {
        "nodes": [
            {
                "id": package_name,
                "type": "root"
            }
        ],
        "edges": []
    }

    return {
        "package": package_name,
        "security_score": score,
        "status": status,
        "dependencies_found": len(all_packages) - 1,
        "dependencies": all_packages,
        "vulnerabilities": vulnerability_count,
        "severity": severity_total,
        "vulnerability_details": vulnerability_details,
        "attack_paths": attack_paths,
        "graph": graph
    }


@router.get("/expand-node")
def expand_node(package: str):

    print("\nExpanding node:", package)

    deps = get_dependencies(package)

    nodes = []
    edges = []

    for dep in deps:

        nodes.append({
            "id": dep,
            "type": "dependency"
        })

        edges.append({
            "source": package,
            "target": dep
        })

    return {
        "nodes": nodes,
        "edges": edges
    }