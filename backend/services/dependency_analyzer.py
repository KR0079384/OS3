from services.npm_service import get_dependencies


# -----------------------------
# Recursive Dependency Scanner
# -----------------------------
def scan_dependency_tree(package_name, depth=0, max_depth=2, visited=None):

    if visited is None:
        visited = set()

    if package_name in visited:
        return {
            "name": package_name,
            "dependencies": []
        }

    visited.add(package_name)

    if depth >= max_depth:
        return {
            "name": package_name,
            "dependencies": []
        }

    dependencies = get_dependencies(package_name)

    tree = {
        "name": package_name,
        "dependencies": []
    }

    for dep in dependencies:

        child = scan_dependency_tree(
            dep,
            depth + 1,
            max_depth,
            visited
        )

        tree["dependencies"].append(child)

    return tree


# -----------------------------
# Collect all packages in tree
# -----------------------------
def collect_all_packages(tree):

    packages = set()

    def dfs(node):

        packages.add(node["name"])

        for child in node.get("dependencies", []):
            dfs(child)

    dfs(tree)

    return list(packages)


# -----------------------------
# Convert Tree → Graph
# -----------------------------
def tree_to_graph(tree):

    nodes = []
    edges = []

    visited = set()

    def traverse(node, parent=None):

        name = node["name"]

        if name not in visited:

            nodes.append({
                "id": name,
                "type": "root" if parent is None else "dependency"
            })

            visited.add(name)

        if parent:

            edges.append({
                "source": parent,
                "target": name
            })

        for child in node["dependencies"]:
            traverse(child, name)

    traverse(tree)

    return {
        "nodes": nodes,
        "edges": edges
    }