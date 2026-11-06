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
// Types for Desktop Workspace & Policy Engine
// --------------------------------------

export type PolicyStatus = "ALLOW" | "WARN" | "BLOCK";

export interface PolicyRule {
  id: string;
  name: string;
  description: string;
  status: "PASSED" | "FAILED" | "WARNING";
  details: string;
}

export interface PolicyEvaluation {
  status: PolicyStatus;
  reason: string;
  matchedRules: PolicyRule[];
  remediationSummary: string;
}

export interface WorkspaceFinding {
  id: string;
  cve: string;
  pkg: string;
  version: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  cvss: number;
  title: string;
  description: string;
  remediation: string;
  introducedThrough: string[];
  reachability: "Direct" | "Reachable" | "Deep Transitive";
  provenanceConfidence: "Verified" | "Standard" | "Low";
}

export interface DependencyItem {
  name: string;
  version: string;
  license: string;
  type: "Direct" | "Transitive" | "Dev";
  vulnerabilityCount: number;
  riskScore: number;
  status: "Secure" | "Warning" | "Critical";
  path: string[];
}

export interface WorkspaceProject {
  id: string;
  name: string;
  path: string;
  ecosystem: "npm" | "pypi";
  branch: string;
  targetPackage?: string;
  manifestFile: string;
  dependenciesCount: number;
  lastScanned?: string;
}

export interface WorkspaceScanResult {
  project: WorkspaceProject;
  securityScore: number;
  riskLevel: "Secure" | "Moderate Risk" | "High Risk" | "Critical Risk";
  policy: PolicyEvaluation;
  totalDependencies: number;
  directDependencies: number;
  transitiveDependencies: number;
  vulnerabilitiesCount: number;
  safePackagesCount: number;
  severity: Severity;
  findings: WorkspaceFinding[];
  dependencies: DependencyItem[];
  attackPaths: string[][];
  graph: DependencyGraph;
  recentChanges: {
    timestamp: string;
    event: string;
    type: "upgrade" | "vuln_found" | "policy_change" | "scan";
    delta?: string;
  }[];
  recommendedActions: {
    id: string;
    priority: "Urgent" | "High" | "Medium" | "Low";
    title: string;
    description: string;
    command: string;
    scoreImprovement: number;
    affectedPackage: string;
  }[];
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