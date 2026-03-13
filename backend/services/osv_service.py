import requests

OSV_API_URL = "https://api.osv.dev/v1/query"


def classify_severity(cvss_vector: str):
    """
    Determine severity from CVSS vector string.
    """
    if not cvss_vector:
        return "low"

    vector = cvss_vector.upper()

    # crude but effective heuristic
    if "C:H" in vector and "I:H" in vector and "A:H" in vector:
        return "critical"

    if "C:H" in vector or "I:H" in vector or "A:H" in vector:
        return "high"

    if "C:L" in vector or "I:L" in vector:
        return "medium"

    return "low"


def get_vulnerabilities(package_name: str, ecosystem: str = "npm"):
    """
    Query OSV database and extract vulnerability severity.
    """

    payload = {
        "package": {
            "name": package_name,
            "ecosystem": ecosystem
        }
    }

    try:

        response = requests.post(OSV_API_URL, json=payload, timeout=10)

        if response.status_code != 200:
            return {
                "success": False,
                "error": "OSV API request failed"
            }

        data = response.json()

        vulnerabilities = data.get("vulns", [])

        severity_counts = {
            "critical": 0,
            "high": 0,
            "medium": 0,
            "low": 0
        }

        for vuln in vulnerabilities:

            severity_list = vuln.get("severity", [])

            if not severity_list:
                severity_counts["low"] += 1
                continue

            for sev in severity_list:

                vector = sev.get("score", "")

                level = classify_severity(vector)

                severity_counts[level] += 1

        return {
            "success": True,
            "vulnerability_count": len(vulnerabilities),
            "vulnerabilities": vulnerabilities,
            "severity": severity_counts
        }

    except Exception as e:

        return {
            "success": False,
            "error": str(e)
        }