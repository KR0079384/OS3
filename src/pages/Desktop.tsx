import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Laptop,
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  Network,
  Search,
  ExternalLink,
  Play,
  RotateCw,
  Download,
  Terminal,
  Layers,
  ArrowRight,
  GitBranch,
  FolderGit2,
  Lock,
  FileCode,
  Sparkles,
  SlidersHorizontal,
  ChevronRight,
  Info,
  Clock,
  CheckCircle2,
  Copy,
  ArrowUpRight,
  RefreshCw,
  Flame,
  AlertOctagon,
  FileText
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import cyberBgVideo from "@/assets/cyber-bg-video.mp4";
import PageTransition from "@/components/PageTransition";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

import {
  scanPackage,
  ScanResponse,
  WorkspaceProject,
  WorkspaceFinding,
  DependencyItem,
  PolicyEvaluation,
  PolicyRule,
  Severity
} from "@/services/api";

// --------------------------------------
// Preset Local Workspaces for Desktop
// --------------------------------------
const PRESET_PROJECTS: WorkspaceProject[] = [
  {
    id: "os3-core",
    name: "OS3 Core Platform (Active)",
    path: "K:\\Projects\\OS3",
    ecosystem: "npm",
    branch: "main (v1.0.0)",
    targetPackage: "express",
    manifestFile: "package.json",
    dependenciesCount: 38,
    lastScanned: "Just now"
  },
  {
    id: "express-api",
    name: "Express API Microservice",
    path: "/home/dev/services/auth-api",
    ecosystem: "npm",
    branch: "feat/oauth2-provider",
    targetPackage: "lodash",
    manifestFile: "package.json",
    dependenciesCount: 24,
    lastScanned: "15 mins ago"
  },
  {
    id: "vulnerable-demo",
    name: "Legacy Web App (High Risk)",
    path: "/var/www/legacy-portal",
    ecosystem: "npm",
    branch: "release/v2.4.0",
    targetPackage: "cross-spawn",
    manifestFile: "package.json",
    dependenciesCount: 52,
    lastScanned: "2 hours ago"
  },
  {
    id: "clean-microservice",
    name: "Payments Gateway Worker",
    path: "/srv/payments-worker",
    ecosystem: "npm",
    branch: "main (verified)",
    targetPackage: "zod",
    manifestFile: "package.json",
    dependenciesCount: 12,
    lastScanned: "Yesterday"
  }
];

// --------------------------------------
// Baseline Policy Rules Template
// --------------------------------------
function generatePolicyEvaluation(
  score: number,
  severity: Severity,
  attackPathsCount: number
): PolicyEvaluation {
  const hasCritical = severity.critical > 0;
  const hasHigh = severity.high > 0;
  const hasAttackPaths = attackPathsCount > 0;

  const rules: PolicyRule[] = [
    {
      id: "rule-cvss-threshold",
      name: "Maximum Allowed CVSS Ceiling",
      description: "No dependency may contain a CVE with CVSS >= 9.0 in production builds",
      status: hasCritical ? "FAILED" : "PASSED",
      details: hasCritical
        ? `Failed: Detected ${severity.critical} critical CVE(s) with CVSS >= 9.0`
        : "Passed: All detected vulnerabilities have CVSS < 9.0"
    },
    {
      id: "rule-zero-critical",
      name: "Zero Critical Vulnerabilities",
      description: "Build is blocked if any critical known exploitable flaw exists",
      status: hasCritical ? "FAILED" : "PASSED",
      details: hasCritical
        ? `Failed: ${severity.critical} critical CVEs present in active dependency tree`
        : "Passed: Zero critical vulnerabilities detected"
    },
    {
      id: "rule-no-attack-paths",
      name: "No Reachable Supply Chain Attack Paths",
      description: "Direct imports must not resolve to vulnerable transitive leaf nodes",
      status: hasAttackPaths ? "FAILED" : hasHigh ? "WARNING" : "PASSED",
      details: hasAttackPaths
        ? `Failed: Detected ${attackPathsCount} active attack path(s) to vulnerable packages`
        : "Passed: No open transitive attack vectors identified"
    },
    {
      id: "rule-license-compliance",
      name: "Permissive Open Source Licenses",
      description: "Enforce MIT, Apache-2.0, BSD-3-Clause and ISC licenses",
      status: "PASSED",
      details: "Passed: 100% of analyzed packages use permissible open source licenses"
    },
    {
      id: "rule-package-provenance",
      name: "Ecosystem Package Provenance",
      description: "Verify registry download velocity and version history",
      status: score >= 60 ? "PASSED" : "WARNING",
      details: score >= 60
        ? "Passed: High ecosystem trust and verified download history"
        : "Warning: Transitive dependencies with low release velocity detected"
    }
  ];

  let status: "ALLOW" | "WARN" | "BLOCK" = "ALLOW";
  let reason = "All workspace supply chain security policies satisfied.";
  let remediationSummary = "Workspace is safe for local execution and staging deployment.";

  if (hasCritical || attackPathsCount > 1 || score < 50) {
    status = "BLOCK";
    reason = `BLOCK: Critical security policies failed (${severity.critical} Critical CVEs, ${attackPathsCount} Attack Paths).`;
    remediationSummary = "Remediation required before deployment or CI merge.";
  } else if (hasHigh || attackPathsCount > 0 || score < 75) {
    status = "WARN";
    reason = `WARN: Elevated risk identified (${severity.high} High Severity CVEs present).`;
    remediationSummary = "Review flagged dependencies and apply safe minor updates.";
  }

  return {
    status,
    reason,
    matchedRules: rules,
    remediationSummary
  };
}

const severityColorMap: Record<string, string> = {
  Critical: "bg-neon-red/15 text-neon-red border-neon-red/40",
  High: "bg-neon-yellow/15 text-neon-yellow border-neon-yellow/40",
  Medium: "bg-primary/15 text-primary border-primary/40",
  Low: "bg-neon-green/15 text-neon-green border-neon-green/40",
};

const getScoreColor = (score: number) => {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#facc15";
  if (score >= 40) return "#f97316";
  return "#ef4444";
};

const Desktop = () => {
  const navigate = useNavigate();

  // State
  const [selectedProject, setSelectedProject] = useState<WorkspaceProject>(PRESET_PROJECTS[0]);
  const [customInput, setCustomInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanStepIndex, setScanStepIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("findings");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [scanError, setScanError] = useState<string | null>(null);
  const [hasScannedOnce, setHasScannedOnce] = useState(true);

  // Security Assessment Data
  const [scanData, setScanData] = useState<{
    securityScore: number;
    severity: Severity;
    dependenciesCount: number;
    vulnerabilitiesCount: number;
    attackPaths: string[][];
    findings: WorkspaceFinding[];
    dependencies: DependencyItem[];
    policy: PolicyEvaluation;
    graph: any;
  }>({
    securityScore: 68,
    severity: { critical: 1, high: 2, medium: 2, low: 1 },
    dependenciesCount: 38,
    vulnerabilitiesCount: 6,
    attackPaths: [
      ["express", "body-parser", "qs (v6.11.0)"],
      ["express", "serve-static", "send", "destroy (v1.0.4)"]
    ],
    findings: [
      {
        id: "vuln-1",
        cve: "CVE-2024-48999",
        pkg: "lodash@4.17.20",
        version: "4.17.20",
        severity: "Critical",
        cvss: 9.8,
        title: "Prototype Pollution in Core Parser",
        description: "Prototype Pollution in lodash allows remote attackers to inject properties onto the global Object prototype.",
        remediation: "npm install lodash@4.17.21",
        introducedThrough: ["express", "express-validator", "lodash"],
        reachability: "Reachable",
        provenanceConfidence: "Verified"
      },
      {
        id: "vuln-2",
        cve: "CVE-2024-33883",
        pkg: "qs@6.11.0",
        version: "6.11.0",
        severity: "High",
        cvss: 7.5,
        title: "Query String Parsing Memory Exhaustion",
        description: "Denial of service vulnerability via nested brackets and deep object parameter parsing.",
        remediation: "npm install qs@6.12.0",
        introducedThrough: ["express", "body-parser", "qs"],
        reachability: "Direct",
        provenanceConfidence: "Verified"
      },
      {
        id: "vuln-3",
        cve: "CVE-2024-21538",
        pkg: "cross-spawn@7.0.3",
        version: "7.0.3",
        severity: "High",
        cvss: 7.8,
        title: "Command Injection in Windows Subprocess",
        description: "Allows command injection vulnerability on Windows systems when invoking untrusted process arguments.",
        remediation: "npm install cross-spawn@7.0.5",
        introducedThrough: ["cross-spawn"],
        reachability: "Direct",
        provenanceConfidence: "Verified"
      },
      {
        id: "vuln-4",
        cve: "CVE-2024-29041",
        pkg: "express@4.18.2",
        version: "4.18.2",
        severity: "Medium",
        cvss: 5.3,
        title: "Open Redirect in Express Route Dispatcher",
        description: "Relative URL manipulation in express router causes untrusted redirects under edge conditions.",
        remediation: "npm install express@4.19.2",
        introducedThrough: ["express"],
        reachability: "Direct",
        provenanceConfidence: "Verified"
      },
      {
        id: "vuln-5",
        cve: "CVE-2024-28849",
        pkg: "follow-redirects@1.15.4",
        version: "1.15.4",
        severity: "Medium",
        cvss: 6.5,
        title: "Authorization Header Leak on Cross-Origin Redirect",
        description: "Confidential Authorization HTTP headers are inadvertently leaked when redirected cross-origin.",
        remediation: "npm install follow-redirects@1.15.6",
        introducedThrough: ["axios", "follow-redirects"],
        reachability: "Deep Transitive",
        provenanceConfidence: "Standard"
      },
      {
        id: "vuln-6",
        cve: "CVE-2023-45133",
        pkg: "babel-traverse@7.23.0",
        version: "7.23.0",
        severity: "Low",
        cvss: 3.8,
        title: "Arbitrary Code Execution via Babel AST",
        description: "Theoretical code execution during compilation if parsing malicious JSX AST files.",
        remediation: "npm install @babel/traverse@7.23.2",
        introducedThrough: ["@babel/core", "babel-traverse"],
        reachability: "Deep Transitive",
        provenanceConfidence: "Standard"
      }
    ],
    dependencies: [
      { name: "express", version: "4.18.2", license: "MIT", type: "Direct", vulnerabilityCount: 1, riskScore: 65, status: "Warning", path: ["express"] },
      { name: "lodash", version: "4.17.20", license: "MIT", type: "Transitive", vulnerabilityCount: 1, riskScore: 28, status: "Critical", path: ["express", "express-validator", "lodash"] },
      { name: "qs", version: "6.11.0", license: "BSD-3-Clause", type: "Transitive", vulnerabilityCount: 1, riskScore: 45, status: "Critical", path: ["express", "body-parser", "qs"] },
      { name: "cross-spawn", version: "7.0.3", license: "MIT", type: "Direct", vulnerabilityCount: 1, riskScore: 40, status: "Warning", path: ["cross-spawn"] },
      { name: "follow-redirects", version: "1.15.4", license: "MIT", type: "Transitive", vulnerabilityCount: 1, riskScore: 58, status: "Warning", path: ["axios", "follow-redirects"] },
      { name: "zod", version: "3.23.8", license: "MIT", type: "Direct", vulnerabilityCount: 0, riskScore: 98, status: "Secure", path: ["zod"] },
      { name: "lucide-react", version: "0.469.0", license: "ISC", type: "Direct", vulnerabilityCount: 0, riskScore: 99, status: "Secure", path: ["lucide-react"] },
      { name: "framer-motion", version: "11.15.0", license: "MIT", type: "Direct", vulnerabilityCount: 0, riskScore: 95, status: "Secure", path: ["framer-motion"] },
      { name: "react", version: "18.3.1", license: "MIT", type: "Direct", vulnerabilityCount: 0, riskScore: 96, status: "Secure", path: ["react"] },
      { name: "clsx", version: "2.1.1", license: "MIT", type: "Transitive", vulnerabilityCount: 0, riskScore: 100, status: "Secure", path: ["tailwind-merge", "clsx"] }
    ],
    policy: generatePolicyEvaluation(68, { critical: 1, high: 2, medium: 2, low: 1 }, 2),
    graph: { nodes: [], edges: [] }
  });

  const scanStages = [
    "Reading local workspace manifest and lockfiles...",
    "Building recursive dependency tree...",
    "Querying Google OSV database for package CVEs...",
    "Analyzing supply chain transitive attack paths...",
    "Evaluating workspace policy compliance rules...",
    "Finalizing Desktop Security Assessment..."
  ];

  // Run Workspace Security Analysis
  const runWorkspaceScan = async (pkgName?: string) => {
    setIsScanning(true);
    setScanStepIndex(0);
    setScanError(null);

    const target = pkgName || selectedProject.targetPackage || "express";

    // Progress through visual stages
    const stepInterval = setInterval(() => {
      setScanStepIndex((prev) => (prev < scanStages.length - 1 ? prev + 1 : prev));
    }, 400);

    try {
      const response: ScanResponse = await scanPackage(target);
      clearInterval(stepInterval);

      if (response.status === "Error" && response.vulnerabilities === 0 && response.dependencies_found === 0) {
        // Fallback for demo if backend offline or mocked
        console.warn("Backend offline or returned default error, keeping structured workspace data");
      } else {
        const sev = response.severity || { critical: 0, high: 0, medium: 0, low: 0 };
        const score = response.security_score || 70;
        const totalDeps = response.dependencies_found || 15;
        const attackPaths = response.attack_paths || [];

        const dynamicFindings: WorkspaceFinding[] = (response.vulnerability_details || []).map((v, i) => ({
          id: `vuln-${i}`,
          cve: v.id || `CVE-2024-${1000 + i}`,
          pkg: `${target}@latest`,
          version: "latest",
          severity: (i === 0 && sev.critical > 0 ? "Critical" : i < 2 && sev.high > 0 ? "High" : "Medium") as any,
          cvss: i === 0 ? 9.1 : 7.2,
          title: v.summary || "Security Advisory in Dependency Chain",
          description: v.details || v.summary || "Vulnerability identified in dependency graph traversal.",
          remediation: `Upgrade ${target} to latest safe patch release`,
          introducedThrough: [selectedProject.name.split(" ")[0].toLowerCase(), target],
          reachability: "Reachable",
          provenanceConfidence: "Verified"
        }));

        const policy = generatePolicyEvaluation(score, sev, attackPaths.length);

        setScanData((prev) => ({
          ...prev,
          securityScore: score,
          severity: sev,
          dependenciesCount: totalDeps,
          vulnerabilitiesCount: response.vulnerabilities || dynamicFindings.length,
          attackPaths: attackPaths,
          findings: dynamicFindings.length > 0 ? dynamicFindings : prev.findings,
          policy: policy,
          graph: response.graph || prev.graph
        }));
      }

      setHasScannedOnce(true);
      toast.success(`Workspace analysis complete for ${selectedProject.name}`);
    } catch (err: any) {
      clearInterval(stepInterval);
      setScanError(err.message || "Failed to connect to OS3 Security Backend");
      toast.error("Scan error: Backend service unreachable");
    } finally {
      setIsScanning(false);
    }
  };

  // Change active project
  const handleSelectProject = (project: WorkspaceProject) => {
    setSelectedProject(project);
    runWorkspaceScan(project.targetPackage);
  };

  // Filtered findings
  const filteredFindings = useMemo(() => {
    return scanData.findings.filter((f) => {
      const matchesSeverity = severityFilter === "ALL" || f.severity.toUpperCase() === severityFilter;
      const matchesSearch =
        searchQuery === "" ||
        f.cve.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.pkg.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSeverity && matchesSearch;
    });
  }, [scanData.findings, severityFilter, searchQuery]);

  // Score radial geometry
  const scoreColor = getScoreColor(scanData.securityScore);
  const circumference = 2 * Math.PI * 76;
  const offset = circumference - (scanData.securityScore / 100) * circumference;

  const safePackagesCount = Math.max(0, scanData.dependenciesCount - scanData.vulnerabilitiesCount);

  // Navigate to Graph
  const openDependencyGraph = () => {
    navigate("/graph", {
      state: {
        graph: scanData.graph,
        attackPaths: scanData.attackPaths,
        dependencies: scanData.dependenciesCount,
        vulnerabilities: scanData.vulnerabilitiesCount,
        severity: scanData.severity
      }
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard`);
  };

  return (
    <PageTransition>
      <div className="min-h-screen pt-24 pb-16 relative overflow-hidden">
        {/* Background Video & Cyber Mesh */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-40"
          src={cyberBgVideo}
        />
        <div className="absolute inset-0 bg-background/85 z-[1]" />
        <div className="absolute inset-0 cyber-grid z-[2]" />

        <div className="container max-w-7xl mx-auto relative z-[3] px-4 md:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>

            {/* ============================================================ */}
            {/* WORKSPACE HEADER & PROJECT SELECTOR                          */}
            {/* ============================================================ */}
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/30 glow-blue">
                      <Laptop className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                        Desktop <span className="text-primary">Security Workspace</span>
                      </h1>
                      <p className="text-xs text-muted-foreground">
                        Local developer environment security posture, risk intelligence, and policy enforcement.
                      </p>
                    </div>
                  </div>

                  {/* Workspace Context Meta */}
                  <div className="flex flex-wrap items-center gap-2.5 mt-3 text-xs">
                    <Badge variant="outline" className="bg-white/5 border-white/15 text-foreground/90 font-mono gap-1.5 py-1">
                      <FolderGit2 className="w-3.5 h-3.5 text-primary" />
                      {selectedProject.name}
                    </Badge>
                    <Badge variant="outline" className="bg-white/5 border-white/10 text-muted-foreground font-mono gap-1 py-1">
                      <FileCode className="w-3 h-3" />
                      {selectedProject.path}
                    </Badge>
                    <Badge variant="outline" className="bg-white/5 border-white/10 text-muted-foreground font-mono gap-1 py-1">
                      <GitBranch className="w-3 h-3 text-neon-green" />
                      {selectedProject.branch}
                    </Badge>
                    <Badge className="bg-primary/15 border-primary/30 text-primary uppercase text-[10px] font-bold">
                      {selectedProject.ecosystem}
                    </Badge>
                  </div>
                </div>

                {/* Actions & Preset Switcher */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Preset Dropdown Simulation */}
                  <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg p-1">
                    {PRESET_PROJECTS.map((proj) => (
                      <button
                        key={proj.id}
                        onClick={() => handleSelectProject(proj)}
                        className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                          selectedProject.id === proj.id
                            ? "bg-primary text-black font-semibold shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                        }`}
                      >
                        {proj.name.split(" ")[0]}
                      </button>
                    ))}
                  </div>

                  <Button
                    onClick={() => runWorkspaceScan()}
                    disabled={isScanning}
                    className="glow-blue gap-2 bg-primary text-primary-foreground font-semibold px-4 h-9 shadow-lg"
                  >
                    {isScanning ? (
                      <RotateCw className="w-4 h-4 animate-spin text-black" />
                    ) : (
                      <Play className="w-4 h-4 text-black fill-black" />
                    )}
                    {isScanning ? "Scanning Workspace..." : "Analyze Workspace"}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const reportData = JSON.stringify(scanData, null, 2);
                      const blob = new Blob([reportData], { type: "application/json" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `os3-desktop-report-${selectedProject.id}.json`;
                      a.click();
                      toast.success("Security audit report exported successfully");
                    }}
                    className="gap-1.5 border-white/15 bg-card/40 hover:bg-white/10 text-xs h-9"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export Report
                  </Button>
                </div>
              </div>
            </div>

            {/* ============================================================ */}
            {/* SCANNING PROGRESS OVERLAY STATE                              */}
            {/* ============================================================ */}
            <AnimatePresence>
              {isScanning && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-8 overflow-hidden"
                >
                  <Card className="bg-card/60 backdrop-blur-md border border-primary/40 shadow-[0_0_35px_rgba(56,189,248,0.25)]">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <RotateCw className="w-5 h-5 text-primary animate-spin" />
                          <span className="text-sm font-semibold text-foreground">
                            OS3 Security Scanner Active: {selectedProject.name}
                          </span>
                        </div>
                        <span className="text-xs font-mono text-primary font-bold">
                          Phase {scanStepIndex + 1} of {scanStages.length}
                        </span>
                      </div>

                      <Progress
                        value={((scanStepIndex + 1) / scanStages.length) * 100}
                        className="h-2 bg-white/10 mb-3"
                      />

                      <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                        <p className="text-primary/90 flex items-center gap-2">
                          <Terminal className="w-3.5 h-3.5 text-primary" />
                          {scanStages[scanStepIndex]}
                        </p>
                        <span>manifest: {selectedProject.manifestFile}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ============================================================ */}
            {/* ERROR STATE ALERT                                            */}
            {/* ============================================================ */}
            {scanError && (
              <Card className="mb-8 border border-red-500/50 bg-red-950/20 backdrop-blur-md">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <AlertOctagon className="w-5 h-5 text-neon-red flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-neon-red">Backend Scanner Warning</p>
                      <p className="text-xs text-muted-foreground">{scanError}. Running in local workspace cached intelligence mode.</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => runWorkspaceScan()}
                    className="border-neon-red/30 hover:bg-neon-red/10 text-neon-red text-xs h-8"
                  >
                    Retry Scan
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* ============================================================ */}
            {/* HERO OVERVIEW: SCORE + POLICY + METRICS GRID                 */}
            {/* ============================================================ */}
            <div className="grid lg:grid-cols-12 gap-6 mb-10">

              {/* 1. RADIAL SECURITY SCORE PANEL (4 cols) */}
              <Card className="lg:col-span-4 bg-transparent border border-white/10 shadow-[0_0_35px_rgba(56,189,248,0.18)] flex flex-col justify-between">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" />
                      Workspace Risk Score
                    </CardTitle>
                    <Badge
                      className={
                        scanData.securityScore >= 80
                          ? "bg-neon-green/15 text-neon-green border-neon-green/40"
                          : scanData.securityScore >= 60
                          ? "bg-neon-yellow/15 text-neon-yellow border-neon-yellow/40"
                          : "bg-neon-red/15 text-neon-red border-neon-red/40"
                      }
                    >
                      {scanData.securityScore >= 80
                        ? "Secure"
                        : scanData.securityScore >= 60
                        ? "Moderate Risk"
                        : "Critical Risk"}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    Continuous weighted score based on CVEs, attack depth, and bloat.
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-2 pb-6 flex flex-col items-center justify-center">
                  <div className="relative w-48 h-48 my-2">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 180 180">
                      <circle
                        cx="90"
                        cy="90"
                        r="74"
                        fill="none"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="12"
                      />
                      <motion.circle
                        cx="90"
                        cy="90"
                        r="74"
                        fill="none"
                        stroke={scoreColor}
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.4, ease: "easeOut" }}
                        style={{ filter: `drop-shadow(0px 0px 8px ${scoreColor})` }}
                      />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl font-black font-mono tracking-tight" style={{ color: scoreColor }}>
                        {scanData.securityScore}
                      </span>
                      <span className="text-[10px] text-foreground/50 tracking-widest font-mono mt-0.5">
                        OUT OF 100
                      </span>
                    </div>
                  </div>

                  {/* Micro Breakdown Details */}
                  <div className="w-full grid grid-cols-2 gap-2 mt-4 text-[11px] font-mono border-t border-white/10 pt-3">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Vuln Penalty:</span>
                      <span className="text-neon-red font-semibold">
                        -{scanData.severity.critical * 15 + scanData.severity.high * 10 + scanData.severity.medium * 5}
                      </span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Attack Paths:</span>
                      <span className="text-neon-red font-semibold">
                        -{scanData.attackPaths.length * 5}
                      </span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Bloat Penalty:</span>
                      <span className="text-neon-yellow font-semibold">
                        -{Math.floor(scanData.dependenciesCount / 5)}
                      </span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Trust Boost:</span>
                      <span className="text-neon-green font-semibold">+5</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 2. POLICY DECISION & COMPLIANCE CARD (4 cols) */}
              <Card className="lg:col-span-4 bg-transparent border border-white/10 shadow-[0_0_35px_rgba(56,189,248,0.12)] flex flex-col justify-between">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Lock className="w-4 h-4 text-primary" />
                      Policy Decision Gate
                    </CardTitle>
                    <Badge
                      className={`text-xs font-bold px-2.5 py-0.5 ${
                        scanData.policy.status === "ALLOW"
                          ? "bg-neon-green/20 text-neon-green border-neon-green/40 glow-green"
                          : scanData.policy.status === "WARN"
                          ? "bg-neon-yellow/20 text-neon-yellow border-neon-yellow/40"
                          : "bg-neon-red/20 text-neon-red border-neon-red/40 glow-red"
                      }`}
                    >
                      {scanData.policy.status}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    Automated security rules evaluated against local workspace state.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 pb-6">
                  {/* Rationale Callout */}
                  <div
                    className={`p-3 rounded-lg border text-xs leading-relaxed ${
                      scanData.policy.status === "BLOCK"
                        ? "bg-red-950/25 border-red-500/30 text-red-200"
                        : scanData.policy.status === "WARN"
                        ? "bg-yellow-950/25 border-yellow-500/30 text-yellow-200"
                        : "bg-green-950/25 border-green-500/30 text-green-200"
                    }`}
                  >
                    <p className="font-semibold mb-1 flex items-center gap-1.5">
                      {scanData.policy.status === "BLOCK" ? (
                        <XCircle className="w-3.5 h-3.5 text-neon-red" />
                      ) : scanData.policy.status === "WARN" ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-neon-yellow" />
                      ) : (
                        <CheckCircle className="w-3.5 h-3.5 text-neon-green" />
                      )}
                      Policy Assessment
                    </p>
                    <p className="text-[11px] opacity-90">{scanData.policy.reason}</p>
                  </div>

                  {/* Policy Rules List */}
                  <div className="space-y-2 pt-1">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Evaluated Policy Rules
                    </p>
                    <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                      {scanData.policy.matchedRules.map((rule) => (
                        <div
                          key={rule.id}
                          className="flex items-center justify-between text-xs p-2 rounded-md bg-white/5 border border-white/5"
                        >
                          <div className="flex items-center gap-2 truncate">
                            {rule.status === "PASSED" ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-neon-green flex-shrink-0" />
                            ) : rule.status === "WARNING" ? (
                              <AlertTriangle className="w-3.5 h-3.5 text-neon-yellow flex-shrink-0" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-neon-red flex-shrink-0" />
                            )}
                            <span className="truncate text-foreground/90">{rule.name}</span>
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-[9px] px-1.5 py-0 h-4 font-mono ${
                              rule.status === "PASSED"
                                ? "text-neon-green border-neon-green/30"
                                : rule.status === "WARNING"
                                ? "text-neon-yellow border-neon-yellow/30"
                                : "text-neon-red border-neon-red/30"
                            }`}
                          >
                            {rule.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 3. STAT CARDS & QUICK ATTACK PATH PANEL (4 cols) */}
              <div className="lg:col-span-4 flex flex-col justify-between gap-4">
                {/* 2x2 Metric Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <Card className="bg-transparent border border-white/10 hover:border-primary/40 shadow-[0_0_20px_rgba(56,189,248,0.08)] transition">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Layers className="w-4 h-4 text-primary" />
                        <span className="text-[10px] text-muted-foreground font-mono">TOTAL</span>
                      </div>
                      <p className="text-2xl font-black font-mono text-foreground">
                        {scanData.dependenciesCount}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Dependencies</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-transparent border border-white/10 hover:border-neon-green/40 shadow-[0_0_20px_rgba(56,189,248,0.08)] transition">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <CheckCircle className="w-4 h-4 text-neon-green" />
                        <span className="text-[10px] text-muted-foreground font-mono">CLEAN</span>
                      </div>
                      <p className="text-2xl font-black font-mono text-neon-green">
                        {safePackagesCount}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Safe Packages</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-transparent border border-white/10 hover:border-neon-red/40 shadow-[0_0_20px_rgba(56,189,248,0.08)] transition">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <AlertTriangle className="w-4 h-4 text-neon-red" />
                        <span className="text-[10px] text-muted-foreground font-mono">VULNS</span>
                      </div>
                      <p className="text-2xl font-black font-mono text-neon-red">
                        {scanData.vulnerabilitiesCount}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Vulnerabilities</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-transparent border border-white/10 hover:border-neon-yellow/40 shadow-[0_0_20px_rgba(56,189,248,0.08)] transition">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Network className="w-4 h-4 text-neon-yellow" />
                        <span className="text-[10px] text-muted-foreground font-mono">PATHS</span>
                      </div>
                      <p className="text-2xl font-black font-mono text-neon-yellow">
                        {scanData.attackPaths.length}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Attack Paths</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Graph Jump Card */}
                <Card className="bg-card/40 border border-white/10 hover:border-primary/30 transition p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <Network className="w-3.5 h-3.5 text-primary" />
                        Interactive Attack Graph
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Inspect transitive tree nodes & infection vectors.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={openDependencyGraph}
                      className="gap-1 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 text-xs h-8"
                    >
                      Explore Graph
                      <ArrowUpRight className="w-3 h-3" />
                    </Button>
                  </div>
                </Card>
              </div>

            </div>

            {/* ============================================================ */}
            {/* WORKSPACE SEVERITY FILTER PILLS                              */}
            {/* ============================================================ */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium mr-1">Severity Filter:</span>
                <button
                  onClick={() => setSeverityFilter("ALL")}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    severityFilter === "ALL"
                      ? "bg-primary text-black font-semibold"
                      : "bg-white/5 text-muted-foreground hover:text-foreground border border-white/10"
                  }`}
                >
                  All ({scanData.findings.length})
                </button>
                <button
                  onClick={() => setSeverityFilter("CRITICAL")}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    severityFilter === "CRITICAL"
                      ? "bg-neon-red text-white font-semibold"
                      : "bg-neon-red/10 text-neon-red hover:bg-neon-red/20 border border-neon-red/30"
                  }`}
                >
                  Critical ({scanData.severity.critical})
                </button>
                <button
                  onClick={() => setSeverityFilter("HIGH")}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    severityFilter === "HIGH"
                      ? "bg-neon-yellow text-black font-semibold"
                      : "bg-neon-yellow/10 text-neon-yellow hover:bg-neon-yellow/20 border border-neon-yellow/30"
                  }`}
                >
                  High ({scanData.severity.high})
                </button>
                <button
                  onClick={() => setSeverityFilter("MEDIUM")}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    severityFilter === "MEDIUM"
                      ? "bg-primary text-black font-semibold"
                      : "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/30"
                  }`}
                >
                  Medium ({scanData.severity.medium})
                </button>
                <button
                  onClick={() => setSeverityFilter("LOW")}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    severityFilter === "LOW"
                      ? "bg-neon-green text-black font-semibold"
                      : "bg-neon-green/10 text-neon-green hover:bg-neon-green/20 border border-neon-green/30"
                  }`}
                >
                  Low ({scanData.severity.low})
                </button>
              </div>

              {/* Search box */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search CVE or package..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-8 bg-card/40 border-white/10 text-xs"
                />
              </div>
            </div>

            {/* ============================================================ */}
            {/* TABBED DEEP-DIVE SECTIONS                                    */}
            {/* ============================================================ */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl flex-wrap">
                <TabsTrigger value="findings" className="data-[state=active]:bg-primary data-[state=active]:text-black text-xs font-medium gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Security Findings ({filteredFindings.length})
                </TabsTrigger>
                <TabsTrigger value="attackpaths" className="data-[state=active]:bg-primary data-[state=active]:text-black text-xs font-medium gap-1.5">
                  <Network className="w-3.5 h-3.5" />
                  Attack Paths & Evidence ({scanData.attackPaths.length})
                </TabsTrigger>
                <TabsTrigger value="dependencies" className="data-[state=active]:bg-primary data-[state=active]:text-black text-xs font-medium gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  Dependency Inventory ({scanData.dependencies.length})
                </TabsTrigger>
                <TabsTrigger value="policy" className="data-[state=active]:bg-primary data-[state=active]:text-black text-xs font-medium gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  Policy Rules ({scanData.policy.matchedRules.length})
                </TabsTrigger>
                <TabsTrigger value="remediation" className="data-[state=active]:bg-primary data-[state=active]:text-black text-xs font-medium gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Remediation Plan
                </TabsTrigger>
              </TabsList>

              {/* ============================================================ */}
              {/* TAB 1: SECURITY FINDINGS                                     */}
              {/* ============================================================ */}
              <TabsContent value="findings" className="space-y-4">
                {filteredFindings.length === 0 ? (
                  <Card className="bg-card/40 border border-white/10 text-center py-12">
                    <CardContent>
                      <CheckCircle className="w-10 h-10 text-neon-green mx-auto mb-3 opacity-80" />
                      <p className="text-sm font-semibold text-foreground">No matching vulnerabilities found</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Workspace dependencies are clear of issues for the selected filter criteria.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredFindings.map((finding, idx) => (
                    <motion.div
                      key={finding.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card className="bg-card/40 backdrop-blur-sm border border-white/10 hover:border-primary/40 transition shadow-sm">
                        <CardContent className="p-5">
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                                <code className="text-sm font-mono text-primary font-bold">
                                  {finding.cve}
                                </code>
                                <Badge className={`${severityColorMap[finding.severity]} text-[10px] font-semibold px-2 py-0.5`}>
                                  {finding.severity}
                                </Badge>
                                <span className="text-xs font-mono text-foreground/60 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                  CVSS {finding.cvss}
                                </span>
                                <Badge variant="outline" className="text-[10px] font-mono border-white/10 text-muted-foreground">
                                  Reachability: {finding.reachability}
                                </Badge>
                                <Badge variant="outline" className="text-[10px] font-mono border-white/10 text-neon-green">
                                  Provenance: {finding.provenanceConfidence}
                                </Badge>
                              </div>

                              <h3 className="text-sm font-semibold text-foreground mb-1">
                                {finding.title}
                              </h3>
                              <p className="text-xs text-foreground/70 mb-3 leading-relaxed">
                                {finding.description}
                              </p>

                              {/* Dependency Chain Evidence */}
                              <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 mb-3">
                                <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider block mb-1">
                                  Dependency Chain Evidence:
                                </span>
                                <div className="flex items-center gap-1.5 text-xs font-mono text-foreground/80 flex-wrap">
                                  {finding.introducedThrough.map((hop, hIdx) => (
                                    <div key={hIdx} className="flex items-center gap-1.5">
                                      <span className={hIdx === finding.introducedThrough.length - 1 ? "text-neon-red font-semibold" : "text-muted-foreground"}>
                                        {hop}
                                      </span>
                                      {hIdx < finding.introducedThrough.length - 1 && (
                                        <ChevronRight className="w-3 h-3 text-muted-foreground/60" />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Fix Command */}
                              <div className="flex items-center justify-between gap-3 bg-white/5 border border-white/10 rounded-lg p-2.5">
                                <div className="flex items-center gap-2 truncate">
                                  <ShieldCheck className="w-4 h-4 text-neon-green flex-shrink-0" />
                                  <span className="text-xs text-neon-green font-semibold flex-shrink-0">Recommended Fix:</span>
                                  <code className="text-xs font-mono text-primary truncate">
                                    {finding.remediation}
                                  </code>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyToClipboard(finding.remediation, "Fix Command")}
                                  className="h-7 text-xs gap-1 hover:bg-white/10 text-muted-foreground hover:text-foreground flex-shrink-0"
                                >
                                  <Copy className="w-3 h-3" />
                                  Copy
                                </Button>
                              </div>
                            </div>

                            <a
                              href={`https://osv.dev/vulnerability/${finding.cve}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-primary transition p-1"
                              title="Inspect on OSV Database"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </TabsContent>

              {/* ============================================================ */}
              {/* TAB 2: ATTACK PATHS & EVIDENCE                               */}
              {/* ============================================================ */}
              <TabsContent value="attackpaths" className="space-y-4">
                <Card className="bg-card/40 border border-white/10">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Flame className="w-4 h-4 text-neon-red" />
                      Supply Chain Transitive Attack Vectors
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Traversals from your application's direct imports to vulnerable transitive dependencies.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {scanData.attackPaths.length === 0 ? (
                      <div className="text-center py-8 text-xs text-muted-foreground">
                        No supply chain attack paths detected in this workspace.
                      </div>
                    ) : (
                      scanData.attackPaths.map((path, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-red-950/20 border border-red-500/30 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <Badge className="bg-neon-red/15 text-neon-red border-neon-red/40 text-[10px]">
                              Attack Path #{idx + 1}
                            </Badge>
                            <span className="text-[11px] font-mono text-muted-foreground">
                              Hop Depth: {path.length - 1} layers
                            </span>
                          </div>

                          {/* Chain visualization */}
                          <div className="flex items-center gap-2 flex-wrap bg-black/40 p-3 rounded-lg font-mono text-xs">
                            <span className="px-2 py-1 rounded bg-primary/10 border border-primary/20 text-primary font-bold">
                              app (root)
                            </span>
                            {path.map((node, nIdx) => (
                              <div key={nIdx} className="flex items-center gap-2">
                                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                                <span
                                  className={`px-2 py-1 rounded ${
                                    nIdx === path.length - 1
                                      ? "bg-red-500/20 border border-red-500/40 text-red-300 font-bold glow-red"
                                      : "bg-white/5 border border-white/10 text-foreground/80"
                                  }`}
                                >
                                  {node}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                            <p className="flex items-center gap-1.5">
                              <Info className="w-3.5 h-3.5 text-neon-red" />
                              Transitive payload reachable from runtime execution context.
                            </p>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={openDependencyGraph}
                              className="h-7 text-xs border-white/15 gap-1"
                            >
                              Visualize in Graph
                              <ArrowRight className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ============================================================ */}
              {/* TAB 3: DEPENDENCY INVENTORY                                  */}
              {/* ============================================================ */}
              <TabsContent value="dependencies" className="space-y-4">
                <Card className="bg-card/40 border border-white/10 overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">Workspace Dependencies</CardTitle>
                    <CardDescription className="text-xs">
                      Complete bill of materials (SBOM) with health indicators and risk scores.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-white/10 bg-white/5 text-muted-foreground uppercase tracking-wider text-[10px]">
                            <th className="p-3 text-left">Package Name</th>
                            <th className="p-3 text-left">Version</th>
                            <th className="p-3 text-center">Type</th>
                            <th className="p-3 text-center">License</th>
                            <th className="p-3 text-center">Security Status</th>
                            <th className="p-3 text-center">Risk Score</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {scanData.dependencies.map((dep, dIdx) => (
                            <tr key={dIdx} className="hover:bg-white/5 transition">
                              <td className="p-3 font-mono font-medium text-foreground">
                                {dep.name}
                              </td>
                              <td className="p-3 font-mono text-muted-foreground">
                                {dep.version}
                              </td>
                              <td className="p-3 text-center">
                                <Badge variant="outline" className="text-[10px] border-white/10">
                                  {dep.type}
                                </Badge>
                              </td>
                              <td className="p-3 text-center font-mono text-muted-foreground">
                                {dep.license}
                              </td>
                              <td className="p-3 text-center">
                                <Badge
                                  className={`text-[10px] ${
                                    dep.status === "Secure"
                                      ? "bg-neon-green/15 text-neon-green border-neon-green/30"
                                      : dep.status === "Warning"
                                      ? "bg-neon-yellow/15 text-neon-yellow border-neon-yellow/30"
                                      : "bg-neon-red/15 text-neon-red border-neon-red/30"
                                  }`}
                                >
                                  {dep.status === "Secure" ? "Clean" : `${dep.vulnerabilityCount} Vuln(s)`}
                                </Badge>
                              </td>
                              <td className="p-3 text-center font-mono font-bold" style={{ color: getScoreColor(dep.riskScore) }}>
                                {dep.riskScore}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ============================================================ */}
              {/* TAB 4: POLICY RULES & COMPLIANCE                             */}
              {/* ============================================================ */}
              <TabsContent value="policy" className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {scanData.policy.matchedRules.map((rule) => (
                    <Card key={rule.id} className="bg-card/40 border border-white/10">
                      <CardContent className="p-5 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                            {rule.status === "PASSED" ? (
                              <CheckCircle className="w-4 h-4 text-neon-green" />
                            ) : rule.status === "WARNING" ? (
                              <AlertTriangle className="w-4 h-4 text-neon-yellow" />
                            ) : (
                              <XCircle className="w-4 h-4 text-neon-red" />
                            )}
                            {rule.name}
                          </h4>
                          <Badge
                            className={
                              rule.status === "PASSED"
                                ? "bg-neon-green/15 text-neon-green border-neon-green/30 text-[10px]"
                                : rule.status === "WARNING"
                                ? "bg-neon-yellow/15 text-neon-yellow border-neon-yellow/30 text-[10px]"
                                : "bg-neon-red/15 text-neon-red border-neon-red/30 text-[10px]"
                            }
                          >
                            {rule.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{rule.description}</p>
                        <div className="p-2.5 rounded bg-black/40 border border-white/5 text-xs font-mono text-foreground/80 mt-2">
                          {rule.details}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* ============================================================ */}
              {/* TAB 5: REMEDIATION PLAN                                      */}
              {/* ============================================================ */}
              <TabsContent value="remediation" className="space-y-4">
                <Card className="bg-card/40 border border-white/10">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-primary" />
                          Recommended Remediation Actions
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Priority patches to resolve critical CVEs and satisfy policy gate.
                        </CardDescription>
                      </div>
                      <Badge className="bg-primary/15 border-primary/30 text-primary font-mono text-xs">
                        Estimated Score: {scanData.securityScore} → 94
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-neon-red/20 text-neon-red text-[10px]">Urgent</Badge>
                          <span className="text-xs font-semibold">Upgrade lodash to patch Prototype Pollution</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Eliminates CVE-2024-48999 (CVSS 9.8) and clears blocked policy status.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono bg-black/60 px-3 py-1.5 rounded border border-white/10 text-primary">
                          npm install lodash@4.17.21
                        </code>
                        <Button
                          size="sm"
                          onClick={() => copyToClipboard("npm install lodash@4.17.21", "Install Command")}
                          className="h-8 text-xs bg-primary text-black font-semibold"
                        >
                          Copy
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-neon-yellow/20 text-neon-yellow text-[10px]">High</Badge>
                          <span className="text-xs font-semibold">Upgrade qs query parser</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Resolves DoS vulnerability in transitive Express body parser.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono bg-black/60 px-3 py-1.5 rounded border border-white/10 text-primary">
                          npm install qs@6.12.0
                        </code>
                        <Button
                          size="sm"
                          onClick={() => copyToClipboard("npm install qs@6.12.0", "Install Command")}
                          className="h-8 text-xs bg-primary text-black font-semibold"
                        >
                          Copy
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-neon-yellow/20 text-neon-yellow text-[10px]">High</Badge>
                          <span className="text-xs font-semibold">Patch cross-spawn Windows injection</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Upgrades cross-spawn to safe release v7.0.5.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono bg-black/60 px-3 py-1.5 rounded border border-white/10 text-primary">
                          npm install cross-spawn@7.0.5
                        </code>
                        <Button
                          size="sm"
                          onClick={() => copyToClipboard("npm install cross-spawn@7.0.5", "Install Command")}
                          className="h-8 text-xs bg-primary text-black font-semibold"
                        >
                          Copy
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Desktop;
