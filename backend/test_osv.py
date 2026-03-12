from services.osv_service import get_vulnerabilities

result = get_vulnerabilities("express", "npm")

print(result)