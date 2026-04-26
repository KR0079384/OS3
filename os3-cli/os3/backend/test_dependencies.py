from services.npm_service import get_dependencies

deps = get_dependencies("express")

print("Dependencies:", deps)