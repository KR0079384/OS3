dependency_tree = {
    "express": {
        "body-parser": {
            "qs": {}
        },
        "cookie": {},
        "debug": {}
    }
}

vulnerable_packages = ["qs"]


def find_attack_paths(tree, vulnerable_packages, path=None, results=None):
    if path is None:
        path = []

    if results is None:
        results = []

    for package, dependencies in tree.items():
        new_path = path + [package]

        if package in vulnerable_packages:
            results.append(new_path)

        if isinstance(dependencies, dict):
            find_attack_paths(dependencies, vulnerable_packages, new_path, results)

    return results


attack_paths = find_attack_paths(dependency_tree, vulnerable_packages)

print("\nAttack Paths Detected:")
for p in attack_paths:
    print(" → ".join(p))