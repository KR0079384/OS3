"""
Local dependency scan: npm tree + OSV aggregation (no FastAPI backend).
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional, Set

import requests

from os3.engine.osv import (
    count_severity,
    deduplicate_vulnerabilities,
    get_vulnerabilities,
    parse_vulnerabilities,
)

NPM_REGISTRY = "https://registry.npmjs.org"


def _get_dependencies(package_name: str) -> Optional[List[str]]:
    try:
        response = requests.get(f"{NPM_REGISTRY}/{package_name}", timeout=10)
        if response.status_code == 404:
            return None
        if response.status_code != 200:
            return []
        data = response.json()
        latest = data.get("dist-tags", {}).get("latest")
        if not latest:
            return []
        version_data = data.get("versions", {}).get(latest, {})
        deps = version_data.get("dependencies", {})
        return list(deps.keys())
    except requests.RequestException:
        return []


def _scan_dependency_tree(
    package_name: str,
    depth: int = 0,
    max_depth: int = 2,
    visited: Optional[Set[str]] = None,
) -> Optional[Dict[str, Any]]:
    if visited is None:
        visited = set()

    if package_name in visited:
        return {"name": package_name, "dependencies": []}
    visited.add(package_name)

    if depth >= max_depth:
        return {"name": package_name, "dependencies": []}

    dependencies = _get_dependencies(package_name)
    if dependencies is None:
        return None

    tree: Dict[str, Any] = {"name": package_name, "dependencies": []}
    for dep in dependencies:
        child = _scan_dependency_tree(dep, depth + 1, max_depth, visited)
        if child is not None:
            tree["dependencies"].append(child)
    return tree


def _collect_all_packages(tree: Dict[str, Any]) -> List[str]:
    packages: Set[str] = set()

    def dfs(node: Dict[str, Any]) -> None:
        packages.add(node["name"])
        for child in node.get("dependencies", []):
            dfs(child)

    dfs(tree)
    return list(packages)


def _find_attack_paths(
    tree: Dict[str, Any], vulnerable_packages: List[str]
) -> List[List[str]]:
    vuln_set = set(vulnerable_packages)
    attack_paths: List[List[str]] = []

    def dfs(node: Dict[str, Any], path: List[str]) -> None:
        name = node["name"]
        new_path = path + [name]
        vuln_count = sum(1 for p in new_path if p in vuln_set)
        if name in vuln_set and vuln_count >= 2 and len(new_path) >= 3:
            attack_paths.append(new_path)
        for child in node.get("dependencies", []):
            dfs(child, new_path)

    dfs(tree, [])
    return attack_paths


def run_package_scan(package_name: str, ecosystem: str = "npm") -> Dict[str, Any]:
    """
    Build npm dependency tree, query OSV per package, dedupe vulns, compute severity counts.

    Returns a dict shaped for CLI consumption. On missing package:
    {"error": "package_not_found", "message": "..."}
    """
    tree = _scan_dependency_tree(package_name)
    if tree is None:
        return {
            "error": "package_not_found",
            "message": f"Package '{package_name}' not found in npm registry",
        }

    all_packages = _collect_all_packages(tree)
    aggregated: List[Dict[str, Any]] = []
    vulnerable_packages: List[str] = []

    for pkg in all_packages:
        raw = get_vulnerabilities(pkg, ecosystem)
        parsed = parse_vulnerabilities(raw)
        if parsed:
            vulnerable_packages.append(pkg)
        aggregated.extend(parsed)

    vulnerability_details = deduplicate_vulnerabilities(aggregated)
    sev = count_severity(vulnerability_details)

    attack_paths = _find_attack_paths(tree, vulnerable_packages)

    return {
        "package": package_name,
        "dependencies": all_packages,
        "vulnerability_details": vulnerability_details,
        "attack_paths": attack_paths,
        "severity": {
            "critical": sev["CRITICAL"],
            "high": sev["HIGH"],
            "medium": sev["MEDIUM"],
            "low": sev["LOW"],
        },
        "vulnerabilities": len(vulnerability_details),
    }
