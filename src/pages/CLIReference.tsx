import { useState } from "react";
import { motion } from "framer-motion";
import {
  Terminal,
  BookOpen,
  Copy,
  Check,
  Package,
  Network,
  ShieldCheck,
  FileText,
  Info,
} from "lucide-react";

import cyberBgVideo from "@/assets/cyber-bg-video.mp4";
import PageTransition from "@/components/PageTransition";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CommandArgument {
  name: string;
  description: string;
}

interface CommandDoc {
  id: string;
  command: string;
  summary: string;
  icon: typeof Terminal;
  description: string[];
  synopsis: string;
  arguments?: CommandArgument[];
  options?: CommandArgument[];
  examples: string[];
  output: string;
  notes?: string[];
}

/* ------------------------------------------------------------------
   Command documentation derived from os3-cli/os3/cli.py (Typer app).
   Only behavior actually implemented by the CLI is documented here.
------------------------------------------------------------------ */

const commandDocs: CommandDoc[] = [
  {
    id: "scan",
    command: "os3 scan",
    summary: "Full pre-installation security scan of an npm package",
    icon: Package,
    synopsis: "os3 scan <PACKAGE> [--report <FILE>]",
    description: [
      "Runs a complete pre-installation risk assessment of an npm package. The target package is never installed — only registry metadata is read.",
      "The scan executes fully locally (no FastAPI backend required): it fetches npm registry metadata, builds a bounded recursive dependency tree, queries the OSV vulnerability database per discovered package, aggregates severity counts, detects attack paths, and computes a deterministic security score with a risk classification.",
    ],
    arguments: [
      {
        name: "PACKAGE",
        description: "Exact npm package name (e.g. express, lodash, axios).",
      },
    ],
    options: [
      {
        name: "--report <FILE>",
        description:
          "Export the scan results. A .json extension writes a JSON report; any other extension writes a plain-text report.",
      },
    ],
    examples: [
      "os3 scan express",
      "os3 scan lodash --report report.json",
      "os3 scan axios --report report.txt",
    ],
    output: `── OS³ Supply Chain Security Scanner ──────────────────────────

Scanning package: express

╭──── NPM Trust Analysis ────────────────────────╮
│ ✅ Trusted Package                            │
│ Trust Score: 100/100                          │
╰───────────────────────────────────────────────╯

              OS³ Security Report — express
┌─────────────────────────────┬────────────────┐
│ Metric                      │ Value          │
├─────────────────────────────┼────────────────┤
│ Dependencies Found          │ 31             │
│ Total Vulnerabilities       │ 3              │
│ Critical / High / Med / Low │ 0 / 1 / 2 / 0  │
│ Attack Paths (count)        │ 2              │
│ Security Score              │ 86/100         │
│ Risk Level                  │ SECURE         │
└─────────────────────────────┴────────────────┘

Security Score Breakdown
  Total vulnerabilities                3
  Severity breakdown (C / H / M / L)   0 / 1 / 2 / 0
  Vulnerability penalty (ratio-based)  -x.x
  Dependency penalty (capped)          -x
  Attack path penalty (capped)         -x
  Trust boost (large ecosystem)        +5

Potential Attack Paths
  express → … → vulnerable-package

Top 3 vulnerabilities
┌── GHSA-xxxx-yyyy-zzzz | HIGH ──┐
│ Advisory description…          │
╰────────────────────────────────╯

Report saved to: report.json
Scan completed in 3.42 seconds`,
    notes: [
      "Requires network access to registry.npmjs.org, api.npmjs.org, and the OSV API. Values above are illustrative — live results depend on current registry and OSV data, and these figures are not the representative validation results reported in the OS3 paper.",
      "The NPM Trust Analysis heuristics (weekly downloads, published version count) are independent of the OSV-based vulnerability findings.",
      "Risk levels displayed by the scan: SECURE (≥ 80), MODERATE RISK (≥ 60), HIGH RISK (≥ 40), otherwise CRITICAL RISK.",
      "The score is computed deterministically from severity counts, attack-path count, and dependency count — the same inputs always produce the same score.",
    ],
  },
  {
    id: "graph",
    command: "os3 graph",
    summary: "Render the dependency tree of a package as a terminal graph",
    icon: Network,
    synopsis: "os3 graph <PACKAGE>",
    description: [
      "Runs the same local scan pipeline as os3 scan, then renders the discovered dependencies as a Rich tree rooted at the package name.",
      "Displays up to 15 dependencies under the root node.",
    ],
    arguments: [
      {
        name: "PACKAGE",
        description: "Exact npm package name to visualize.",
      },
    ],
    examples: ["os3 graph express", "os3 graph webpack"],
    output: `Dependency Graph: express

express
├── accepts
├── body-parser
├── content-disposition
├── …
└── (up to 15 direct dependencies)`,
    notes: [
      "The terminal tree is a flattened view of the first 15 dependencies. The full interactive graph is available in the web dashboard at /graph.",
    ],
  },
  {
    id: "check-install",
    command: "os3 check-install",
    summary: "Quick pre-install go / no-go security gate",
    icon: ShieldCheck,
    synopsis: "os3 check-install <PACKAGE>",
    description: [
      "Performs a fast pre-installation check: it runs the local scan, computes the security score, and prints a single verdict suitable for scripting an install decision.",
    ],
    arguments: [
      {
        name: "PACKAGE",
        description: "Exact npm package name to check.",
      },
    ],
    examples: ["os3 check-install express", "os3 check-install minimist"],
    output: `Checking package before install: express

Package appears safe

── or, for riskier packages ──

⚠ Moderate risk detected

── or, when the score is below 40 ──

⚠ Security Warning
Package has serious vulnerabilities`,
    notes: [
      "Verdict thresholds implemented by this command: score below 40 → security warning; score 40–69 → moderate risk; score 70 and above → package appears safe.",
      "Exit messaging is advisory only — the command does not modify your lockfile or block installation by itself.",
    ],
  },
  {
    id: "check-python-installed",
    command: "os3 check-python-installed",
    summary: "Verify that Python is available in the current environment",
    icon: FileText,
    synopsis: "os3 check-python-installed",
    description: [
      "Runs python --version as a subprocess. On success it prints nothing and exits with status 0. If the command fails, it prints installation guidance and exits.",
    ],
    examples: ["os3 check-python-installed"],
    output: `# Success (Python found)
(no output, exit code 0)

# Failure (Python missing)
❌ Python is not installed
👉 Please install Python 3.10+ from https://python.org`,
    notes: [
      "Useful as a first-line environment check in scripts before invoking scan commands.",
    ],
  },
];

const installBlock = `pip install os3-security

# Show all available commands
os3 --help

# Example: full scan
os3 scan express`;

/* ------------------------------------------------------------------ */

const CodeBlock = ({ code, label }: { code: string; label?: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable — fail silently */
    }
  };

  return (
    <div className="relative group">
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
            {label}
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors"
            aria-label="Copy to clipboard"
          >
            {copied ? (
              <Check className="w-3 h-3 text-green-400" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      )}
      <pre className="bg-black/60 border border-white/10 rounded-lg p-4 font-mono text-xs leading-relaxed text-emerald-300 overflow-x-auto whitespace-pre">
        {code}
      </pre>
    </div>
  );
};

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-2 mt-6 mb-2 first:mt-0">
    <span className="text-[10px] uppercase tracking-widest text-primary font-semibold">
      {children}
    </span>
    <div className="flex-1 h-px bg-border/50" />
  </div>
);

const CLIReference = () => {
  return (
    <PageTransition>
      <div className="min-h-screen pt-24 pb-16 relative overflow-hidden">
        {/* Background */}

        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
          src={cyberBgVideo}
        />

        <div className="absolute inset-0 bg-background/70 z-[1]" />
        <div className="absolute inset-0 cyber-grid z-[2]" />

        <div className="container max-w-5xl mx-auto relative z-[3]">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* HEADER */}

            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-6 h-6 text-primary" />

              <h1 className="text-3xl font-bold">
                CLI Command <span className="text-primary">Reference</span>
              </h1>
            </div>

            <p className="text-muted-foreground text-sm max-w-3xl mb-4">
              Offline-style documentation for every command exposed by the{" "}
              <span className="font-mono text-primary">os3-security</span> CLI —
              what each terminal method does, its arguments, options, and
              examples. Every entry below reflects the behavior implemented in{" "}
              <span className="font-mono text-foreground/80">
                os3-cli/os3/cli.py
              </span>
              .
            </p>

            <div className="flex flex-wrap gap-2 mb-10">
              <Badge className="bg-primary/10 border-primary/20 text-primary">
                npm ecosystem
              </Badge>
              <Badge className="bg-primary/10 border-primary/20 text-primary">
                OSV vulnerability source
              </Badge>
              <Badge className="bg-primary/10 border-primary/20 text-primary">
                Pre-installation — target package is never installed
              </Badge>
              <Badge className="bg-primary/10 border-primary/20 text-primary">
                v0.2.0
              </Badge>
            </div>

            {/* INSTALLATION */}

            <Card className="mb-10 bg-transparent border border-white/10 shadow-[0_0_30px_rgba(56,189,248,0.1)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-primary" />
                  Installation & Global Help
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CodeBlock code={installBlock} />
              </CardContent>
            </Card>

            {/* INDEX */}

            <Card className="mb-10 bg-transparent border border-white/10 shadow-[0_0_30px_rgba(56,189,248,0.1)]">
              <CardHeader>
                <CardTitle>Index of Commands</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-3">
                  {commandDocs.map((doc) => (
                    <a
                      key={doc.id}
                      href={`#${doc.id}`}
                      className="flex items-start gap-3 rounded-lg border border-white/10 bg-black/30 p-3 hover:border-primary/40 hover:bg-primary/5 transition-all"
                    >
                      <doc.icon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <div className="font-mono text-sm text-foreground">
                          {doc.command}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {doc.summary}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* COMMAND SECTIONS */}

            {commandDocs.map((doc) => (
              <Card
                key={doc.id}
                id={doc.id}
                className="mb-10 scroll-mt-24 bg-transparent border border-white/10 shadow-[0_0_30px_rgba(56,189,248,0.1)]"
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-mono">
                    <doc.icon className="w-5 h-5 text-primary" />
                    {doc.command}
                    <Badge className="ml-auto font-sans bg-primary/10 border-primary/20 text-primary font-normal">
                      {doc.summary}
                    </Badge>
                  </CardTitle>
                </CardHeader>

                <CardContent className="text-sm">
                  <SectionTitle>Synopsis</SectionTitle>
                  <CodeBlock code={doc.synopsis} />

                  <SectionTitle>Description</SectionTitle>
                  <div className="space-y-2 text-muted-foreground">
                    {doc.description.map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>

                  {doc.arguments && doc.arguments.length > 0 && (
                    <>
                      <SectionTitle>Arguments</SectionTitle>
                      <div className="space-y-2">
                        {doc.arguments.map((arg) => (
                          <div
                            key={arg.name}
                            className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 rounded-md border border-white/10 bg-black/30 p-3"
                          >
                            <code className="font-mono text-xs text-primary shrink-0 sm:w-40">
                              {arg.name}
                            </code>
                            <span className="text-muted-foreground text-xs">
                              {arg.description}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {doc.options && doc.options.length > 0 && (
                    <>
                      <SectionTitle>Options</SectionTitle>
                      <div className="space-y-2">
                        {doc.options.map((option) => (
                          <div
                            key={option.name}
                            className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 rounded-md border border-white/10 bg-black/30 p-3"
                          >
                            <code className="font-mono text-xs text-primary shrink-0 sm:w-40">
                              {option.name}
                            </code>
                            <span className="text-muted-foreground text-xs">
                              {option.description}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  <SectionTitle>Examples</SectionTitle>
                  <div className="space-y-3">
                    {doc.examples.map((example) => (
                      <CodeBlock key={example} code={example} />
                    ))}
                  </div>

                  <SectionTitle>Sample Output</SectionTitle>
                  <CodeBlock code={doc.output} label="Illustrative" />

                  {doc.notes && doc.notes.length > 0 && (
                    <>
                      <SectionTitle>Notes</SectionTitle>
                      <ul className="space-y-2">
                        {doc.notes.map((note, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-xs text-muted-foreground"
                          >
                            <Info className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                            <span>{note}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* SCOPE BOUNDARY */}

            <Card className="bg-transparent border border-white/10 shadow-[0_0_30px_rgba(56,189,248,0.1)]">
              <CardContent className="p-6 flex items-start gap-3 text-xs text-muted-foreground">
                <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <p>
                  This reference page is an engineering documentation surface.
                  The core OS3 research contribution remains: (1)
                  pre-installation npm risk assessment, (2) dependency-graph
                  attack-path reachability, and (3) deterministic security
                  scoring. Command output values shown above are illustrative —
                  live scans reflect current npm registry metadata and OSV
                  advisory data.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default CLIReference;

