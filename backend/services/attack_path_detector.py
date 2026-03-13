def find_attack_paths(tree, vulnerable_packages):

    attack_paths = []

    def dfs(node, path):

        name = node["name"]
        new_path = path + [name]

        # Count vulnerable packages in the chain
        vuln_count = sum(1 for p in new_path if p in vulnerable_packages)

        # Record only if chain has multiple vulnerable nodes
        if name in vulnerable_packages and vuln_count >= 2 and len(new_path) >= 3:
            attack_paths.append(new_path)

        for child in node.get("dependencies", []):
            dfs(child, new_path)

    dfs(tree, [])

    return attack_paths