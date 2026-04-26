from services.dependency_analyzer import scan_dependency_tree

tree = scan_dependency_tree("express")

print(tree)