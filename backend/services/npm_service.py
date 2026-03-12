import requests

NPM_REGISTRY = "https://registry.npmjs.org"


def get_dependencies(package_name: str):
    """
    Fetch direct dependencies of an npm package
    """

    try:
        url = f"{NPM_REGISTRY}/{package_name}"

        response = requests.get(url, timeout=10)

        if response.status_code != 200:
            print(f"Failed to fetch package: {package_name}")
            return []

        data = response.json()

        # Get latest version
        latest_version = data.get("dist-tags", {}).get("latest")

        if not latest_version:
            return []

        version_data = data.get("versions", {}).get(latest_version, {})

        dependencies = version_data.get("dependencies", {})

        # Convert dependency dict → list
        dependency_list = list(dependencies.keys())

        return dependency_list

    except Exception as e:
        print("Dependency fetch error:", e)
        return []