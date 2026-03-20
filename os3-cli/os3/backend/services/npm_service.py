import requests

NPM_REGISTRY = "https://registry.npmjs.org"


def package_exists(package_name: str):
    """
    Check if a package exists in npm registry
    """

    try:
        url = f"{NPM_REGISTRY}/{package_name}"

        response = requests.get(url, timeout=10)

        return response.status_code == 200

    except Exception:
        return False


def get_dependencies(package_name: str):
    """
    Fetch direct dependencies of an npm package
    """

    try:

        url = f"{NPM_REGISTRY}/{package_name}"

        response = requests.get(url, timeout=10)

        # PACKAGE DOES NOT EXIST
        if response.status_code == 404:
            return None

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