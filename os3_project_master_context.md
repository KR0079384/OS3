# 🔐 OS3 - Open Source Supply Chain Security Scanner: Master Context Document

> **Usage Note**: Copy this document and feed it directly into any LLM (e.g., Gemini, GPT-4, Claude) as system/prompt context to brainstorm, design, or write code for next-level features of OS3.

---

## 🚀 1. System Overview & Problem Statement

**OS3 (Open Source Supply Chain Security Scanner)** is a developer-first security intelligence platform and CLI tool designed to inspect open-source software dependencies **before installation**.

### Core Problem Solved:
- Modern developers install `npm` / `PyPI` packages without knowing their transitive vulnerabilities or security posture.
- Traditional SCA (Software Composition Analysis) tools run post-installation (e.g., inside CI/CD or `npm audit`), when code is already executed on dev machines or build runners.
- Typosquatting, fake/malicious packages, and complex transitive dependency attack paths go unnoticed until exploitation.

### Solution:
- **Pre-Installation Inspection**: Scans package registries in real-time before `npm install` / `pip install`.
- **Dynamic Security Scoring**: Evaluates trust, vulnerabilities, dependency bloat, and attack paths into a 0–100 Security Score.
- **Attack Path Tracing**: Visualizes and highlights vulnerable dependency chains leading from top-level imports down to compromised transitive sub-dependencies.
- **AI Copilot & RAG**: Provides instant mitigation advice, alternative package suggestions, and CVE breakdowns using vector search and LLMs.
- **Dual Interface**: Full-featured Web Dashboard + PyPI CLI Tool (`os3-security`).

---

## 🏗️ 2. Architecture & Tech Stack

```
                     ┌──────────────────────────────────────────┐
                     │          OS3 System Architecture         │
                     └──────────────────────────────────────────┘
                                          │
       ┌──────────────────────────────────┼──────────────────────────────────┐
       ▼                                  ▼                                  ▼
┌───────────────┐                  ┌───────────────┐                  ┌───────────────┐
│ Web Dashboard │                  │ Python CLI    │                  │ FastAPI       │
│ (React + Vite)│                  │ (os3-security)│                  │ Backend API   │
└───────┬───────┘                  └───────┬───────┘                  └───────┬───────┘
        │                                  │                                  │
        │ HTTP API                         │ OSV / npm API                    │ RAG / FAISS / OSV
        ▼                                  ▼                                  ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                             External Security Data & AI                             │
│       • OSV Database API (api.osv.dev)   • npm Registry API (registry.npmjs.org)     │
│       • Ollama / Llama3 LLM Engine       • FAISS + SentenceTransformers             │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### Component Breakdown:
1. **Frontend**:
   - **Framework**: React 18 + TypeScript + Vite
   - **Styling**: Tailwind CSS + Shadcn UI (Radix primitives) + Framer Motion animations
   - **Visualizations**: ReactFlow (interactive node graph), Recharts (metrics charts)
   - **State/Data Fetching**: TanStack React Query + React Router DOM
   - **Hosting**: Firebase Hosting (`https://os3org.web.app`)

2. **Backend**:
   - **Framework**: FastAPI + Python 3.10+ (Uvicorn / Starlette)
   - **Security Data Engine**: Integration with OSV API (`api.osv.dev`) & `registry.npmjs.org`
   - **AI RAG Pipeline**: `sentence-transformers` (`all-MiniLM-L6-v2`) + FAISS index + `Ollama` (Llama3 model)
   - **CORS & Middleware**: Configured for local dev & production hosting

3. **CLI Tool (`os3-cli`)**:
   - **Distribution**: Published on PyPI as `os3-security` (`pip install os3-security`)
   - **Framework**: Typer + Rich (formatted tables, ASCII trees, panels)
   - **Commands**: `os3 scan <pkg>`, `os3 graph <pkg>`, `os3 check-install <pkg>`, `--report json|txt`
   - **Local Logic**: Independently queries npm registry & OSV API for zero-latency CLI use without backend dependency.

---

## 🧮 3. Core Algorithms & Logic

### A. Dynamic Security Scoring Engine
Calculates a 0–100 Security Score using weighted risk factors:
$$\text{Score} = 100 - (\text{Vuln Penalty} + \text{Attack Path Penalty} + \text{Dependency Penalty}) + \text{Trust Boost}$$

- **Vulnerability Penalty**:
  - `Critical`: -15 pts
  - `High`: -10 pts
  - `Medium`: -5 pts
  - `Low`: -2 pts
  *(CLI uses ratio-based severity weighting capped at 40 pts)*
- **Attack Path Penalty**: `-5 pts` per detected attack path (capped in CLI at 10 pts)
- **Dependency Bloat Penalty**: `-(total_dependencies / 5)`
- **Ecosystem Trust Boost**: `+5 pts` for established, high-download ecosystems

### B. NPM Package Trust & Fake Package Detection
- Analyzes npm package weekly download counts and version history counts.
- Flags packages with `<100` downloads or `<5` versions as high risk / potential typosquatting or fake packages.

### C. Attack Path Detection Algorithm
- Builds recursive dependency tree structure for top-level target package.
- Maps all nodes where `vulnerability_count > 0`.
- Executes graph traversal (DFS/BFS) to identify exact paths from root node down to infected transitive dependencies (e.g., `express → body-parser → qs [Vulnerable]`).

### D. RAG Copilot Knowledge Search
- Embeds project facts & vulnerability data into FAISS index using `all-MiniLM-L6-v2`.
- Matches developer prompts to top-$k$ context chunks and streams LLM answers via Ollama / Llama3.

---

## 📂 4. Repository Directory Structure

```
OS3/
├── backend/                        # FastAPI Backend & RAG Pipeline
│   ├── api/
│   │   ├── scan.py                 # Package scanning, scoring, & graph node expansion endpoints
│   │   └── copilot.py              # AI RAG QA & streaming response endpoints
│   ├── services/
│   │   ├── dependency_analyzer.py  # Recursive npm dependency resolution tree builder
│   │   ├── attack_path_detector.py # Traces vulnerability attack paths through graph
│   │   ├── osv_service.py          # Queries OSV.dev for CVE/GHSA vulnerabilities
│   │   ├── npm_service.py          # Fetches package metadata from registry.npmjs.org
│   │   ├── rag_pipeline.py         # FAISS vector database & SentenceTransformers
│   │   └── ollama_client.py        # Ollama LLM integration
│   ├── data/
│   │   ├── os3_context.json        # Base security knowledge & product info
│   │   └── vulnerabilities.json    # Sample vulnerability dataset
│   └── main.py                     # FastAPI entry point
│
├── os3-cli/                        # Standalone Python CLI Tool (PyPI)
│   ├── os3/
│   │   ├── cli.py                  # Typer commands (scan, graph, check-install, report)
│   │   ├── scan.py                 # Core scanner engine
│   │   └── engine/                 # OSV API wrapper & parser
│   └── pyproject.toml / setup.py   # PyPI packaging config
│
├── src/                            # React Web Application
│   ├── pages/
│   │   ├── Landing.tsx             # Marketing homepage & CTA
│   │   ├── Scan.tsx                # Real-time package scan page
│   │   ├── Dashboard.tsx           # Security metrics, charts, & risk overview
│   │   ├── DependencyGraph.tsx     # ReactFlow interactive dependency graph & attack paths
│   │   ├── Vulnerabilities.tsx     # Filterable CVE list & details
│   │   ├── AICopilot.tsx           # Interactive AI Security Assistant
│   │   ├── Recommendations.tsx     # Safe package alternatives & upgrades
│   │   ├── Explore.tsx             # Package registry explorer
│   │   ├── Compare.tsx             # Side-by-side package security comparison
│   │   └── Intelligence.tsx        # Ecosystem threat intelligence feed
│   ├── components/                 # Navigation, Layout, UI primitives (Shadcn)
│   └── App.tsx                     # React Router 6 setup & layout wrapper
│
└── package.json / vite.config.ts   # Frontend build config
```

---

## ⚡ 5. Current Capabilities vs. Planned Next-Level Roadmap

| Capability | Current State in OS3 | Next-Level Objective |
| :--- | :--- | :--- |
| **Package Support** | npm JS packages | Multi-Ecosystem (PyPI, Cargo/Rust, Go Modules, Maven) |
| **Integrations** | Web App + CLI | GitHub Action, VS Code Extension, Pre-commit hooks |
| **Fix Generation** | Text suggestions in AI Copilot | One-click Automated PR Fixes / Auto-patching `package.json` |
| **RAG Knowledge Base** | In-memory FAISS + static JSON | Live Qdrant/Pinecone Vector DB synced with NVD / OSV real-time stream |
| **Sandbox Execution** | API metadata analysis | Dynamic behavior analysis / eBPF runtime sandbox for malicious install scripts |
| **Export Formats** | Custom JSON / Text | Industry standards: CycloneDX & SPDX SBOM generation |

---

## 🎯 6. Prompt Templates for Feeding to LLMs

Below are pre-structured prompts you can use with this context document to take OS3 to the next level:

### 💡 Prompt 1: Feature Expansion & Architecture Design
```text
[Paste this Master Context Document]

Based on the OS3 architecture above, design a production-grade GitHub Action integration (.github/workflows/os3-scan.yml) and custom CLI sub-command (`os3 ci`) that blocks Pull Requests if a new package drops the repository security score below 70 or introduces Critical CVEs. Provide full code and step-by-step implementation plan.
```

### 💡 Prompt 2: AI Automated Remediation Engine
```text
[Paste this Master Context Document]

I want to extend OS3's AI Copilot into an "Automated Remediation Engine". Draft the Python backend code and React UI component for a feature that generates an automatic dependency upgrade patch (or replacement package recommendation matrix) when a vulnerable transitive dependency is found, ensuring zero breaking changes.
```

### 💡 Prompt 3: Multi-Ecosystem (PyPI / Cargo) Support
```text
[Paste this Master Context Document]

Currently OS3 analyzes npm dependencies recursively using `registry.npmjs.org`. Architect a modular Python service `pypi_service.py` and `cargo_service.py` that conforms to the existing `dependency_analyzer.py` interface so OS3 can seamlessly scan Python (`requirements.txt` / PyPI) and Rust (`Cargo.toml`) packages.
```
