import requests

OSV_API_URL = "https://api.osv.dev/v1/query"


def get_vulnerabilities(package_name: str, ecosystem: str = "npm"):
    """
    Query the OSV database for vulnerabilities of a package.
    """

    payload = {
        "package": {
            "name": package_name,
            "ecosystem": ecosystem
        }
    }

    try:
        response = requests.post(OSV_API_URL, json=payload)

        if response.status_code != 200:
            return {
                "success": False,
                "error": "OSV API request failed"
            }

        data = response.json()

        vulnerabilities = data.get("vulns", [])

        return {
            "success": True,
            "vulnerability_count": len(vulnerabilities),
            "vulnerabilities": vulnerabilities
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }