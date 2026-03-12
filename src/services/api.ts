// --------------------------------------
// Types for API response
// --------------------------------------

export interface Vulnerability {
  id: string;
  summary?: string;
  details?: string;
  aliases?: string[];
}

export interface GraphNode {
  id: string;
  type: string;
}

export interface GraphEdge {
  source: string;
  target: string;
}

export interface DependencyGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface ScanResponse {
  package: string;
  security_score: number;
  status: string;
  dependencies_found: number;
  dependencies: string[];
  vulnerabilities: number;
  vulnerability_details: Vulnerability[];
  graph: DependencyGraph;
}


// --------------------------------------
// Scan Package API
// --------------------------------------

export async function scanPackage(packageName: string): Promise<ScanResponse> {

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
      throw new Error(`API request failed: ${response.status}`);
    }

    const data: ScanResponse = await response.json();

    return data;

  } catch (error) {

    console.error("API Error:", error);

    // Fallback safe response
    return {
      package: packageName,
      security_score: 0,
      status: "Error",
      dependencies_found: 0,
      dependencies: [],
      vulnerabilities: 0,
      vulnerability_details: [],
      graph: {
        nodes: [],
        edges: []
      }
    };

  }

}