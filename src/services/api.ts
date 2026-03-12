export async function scanPackage(packageName: string) {

    try {
  
      const response = await fetch("http://127.0.0.1:8000/api/scan-package", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          package_name: packageName
        })
      });
  
      if (!response.ok) {
        throw new Error("API request failed");
      }
  
      const data = await response.json();
  
      return data;
  
    } catch (error) {
  
      console.error("API Error:", error);
  
      return {
        package: packageName,
        security_score: 0,
        status: "Error",
        dependencies_found: 0,
        vulnerabilities: 0,
        graph: null
      };
  
    }
  
  }