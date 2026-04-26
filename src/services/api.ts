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

export interface Severity {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface ScanResponse {
  package: string;
  security_score: number;
  status: string;
  dependencies_found: number;
  dependencies: string[];
  vulnerabilities: number;

  /* FIX */
  severity: Severity;

  vulnerability_details: Vulnerability[];
  graph: DependencyGraph;

  attack_paths?: string[][];
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

    return {
      package: packageName,
      security_score: 0,
      status: "Error",
      dependencies_found: 0,
      dependencies: [],
      vulnerabilities: 0,

      severity: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
      },

      vulnerability_details: [],
      attack_paths: [],
      graph: {
        nodes: [],
        edges: []
      }
    };

  }

}