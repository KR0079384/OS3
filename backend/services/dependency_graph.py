def build_dependency_graph(package_name, dependencies):
    """
    Builds graph structure for dependency visualization
    """

    nodes = []
    edges = []

    # root package node
    nodes.append({
        "id": package_name,
        "type": "root"
    })

    # dependency nodes
    for dep in dependencies:
        nodes.append({
            "id": dep,
            "type": "dependency"
        })

        edges.append({
            "source": package_name,
            "target": dep
        })

    return {
        "nodes": nodes,
        "edges": edges
    }