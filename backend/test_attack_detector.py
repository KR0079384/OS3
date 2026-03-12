from services.attack_path_detector import find_attack_paths

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

paths = find_attack_paths(dependency_tree, vulnerable_packages)

print(paths)