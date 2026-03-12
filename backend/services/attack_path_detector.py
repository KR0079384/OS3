def find_attack_paths(tree, vulnerable_packages):

    attack_paths = []

    def dfs(node, path):

        name = node["name"]

        new_path = path + [name]

        # If this node is vulnerable, record path
        if name in vulnerable_packages:
            attack_paths.append(new_path)

        for child in node.get("dependencies", []):
            dfs(child, new_path)

    dfs(tree, [])

    return attack_paths