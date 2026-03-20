import requests


def get_package_dependencies(package_name: str):
    """
    Fetch first-level dependencies of an npm package
    using the npm registry API.
    """

    url = f"https://registry.npmjs.org/{package_name}"

    try:
        response = requests.get(url)

        if response.status_code != 200:
            return []

        data = response.json()

        # Get latest version
        latest_version = data.get("dist-tags", {}).get("latest")

        if not latest_version:
            return []

        # Get dependencies of latest version
        version_data = data.get("versions", {}).get(latest_version, {})
        dependencies = version_data.get("dependencies", {})

        return list(dependencies.keys())

    except Exception as e:
        print("Error fetching dependencies:", e)
        return []