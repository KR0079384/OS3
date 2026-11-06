# OS3 Desktop Security Workspace

The **Desktop Security Workspace** (`/desktop`) represents the developer's local and project-level supply-chain security command center inside [[OS3 Architecture]]. It integrates with the OS3 [[Risk Engine]], [[Policy Engine]], and graph traversal pipeline to provide continuous, explainable security visibility for local repositories and packages.

---

## 1. Purpose

The Desktop section bridges the gap between pre-install package inspection and active workspace governance:
- **Local Workspace Posture**: Monitor security scores, dependency counts, and risk distributions for local projects.
- **Continuous Policy Enforcement**: Evaluate whether active manifests satisfy organizational security gates (`ALLOW`, `WARN`, `BLOCK`).
- **Explainable Evidence**: Expose transitive infection paths and risk contributors via structured [[Evidence Model]] chains.
- **One-Click Remediation**: Deliver concrete, validated patch commands to resolve CVEs and restore passing policy status.

---

## 2. Desktop Architecture & Data Flow

```
 ┌────────────────────────────────────────────────────────┐
 │             OS3 Desktop Security Workspace              │
 └───────────────────────────┬────────────────────────────┘
                             │
            ┌────────────────┼────────────────┐
            ▼                                 ▼
 ┌─────────────────────┐           ┌──────────────────────┐
 │   [[Risk Engine]]   │           │  [[Policy Engine]]   │
 │   - Risk Score (0-100)│           │  - Gate Decision     │
 │   - Vulnerability Pen│           │  - Rule Evaluations  │
 │   - Path Penalties  │           │  - Explanations      │
 └──────────┬──────────┘           └──────────┬───────────┘
            │                                 │
            └────────────────┬────────────────┘
                             │
                             ▼
 ┌────────────────────────────────────────────────────────┐
 │               [[Evidence Model]] & Graph               │
 │    - App → Direct-Dep → Transitive-Dep → CVE Node      │
 │    - Provenance Confidence & Blast Radius              │
 └───────────────────────────┬────────────────────────────┘
                             │
                             ▼
 ┌────────────────────────────────────────────────────────┐
 │           Interactive Desktop UI Components            │
 │    - Radial Score Gauge & Metric Cards                 │
 │    - Policy Decision Gate & Matched Rule List          │
 │    - Severity Filterable Findings & One-Click Fixes    │
 │    - Dependency Inventory & Interactive Graph Link     │
 └────────────────────────────────────────────────────────┘
```

---

## 3. UI Component Hierarchy

The Desktop interface is composed of modular, native OS3 primitives:

```text
Desktop (Page)
├── PageTransition
│   ├── VideoBackground (cyber-bg-video.mp4)
│   ├── CyberGridOverlay (cyber-grid)
│   └── Container
│       ├── WorkspaceHeader
│       │   ├── ProjectTitle & Icon
│       │   ├── MetadataBadges (Path, Branch, Ecosystem, Manifest)
│       │   ├── WorkspacePresetSwitcher
│       │   ├── ActionButtons (Analyze Workspace, Export Report)
│       ├── ScanningProgressOverlay (Phased Stage Scanner)
│       ├── SecurityOverviewGrid
│       │   ├── RadialScoreCard ([[Risk Assessment]])
│       │   │   ├── SVGDonutMeter
│       │   │   └── PenaltyBreakdown
│       │   ├── PolicyDecisionCard ([[Policy Decision]])
│       │   │   ├── DecisionBadge (ALLOW / WARN / BLOCK)
│       │   │   ├── RationaleCallout
│       │   │   └── MatchedPolicyRulesList
│       │   └── MetricStatsCards (Total, Clean, Vulns, Attack Paths)
│       ├── SeverityFilterToolbar (All, Critical, High, Medium, Low + Search)
│       └── WorkspaceTabs
│           ├── FindingsTab (CVE Cards, CVSS, Evidence Chains, Copy Fix)
│           ├── AttackPathsTab (Transitive Supply Chain Vectors)
│           ├── DependenciesTab (SBOM Table with Risk Scores)
│           ├── PolicyRulesTab (Detailed Compliance Verification)
│           └── RemediationPlanTab (Prioritized Upgrade Schedule)
```

---

## 4. API & Service Dependencies

Desktop communicates with OS3 backend endpoints and services:
- **`POST /api/scan-package`**: Invokes dependency tree resolution, OSV database lookup, attack path detection, and scoring.
- **[[Dependency Graph]] Integration**: Passes graph nodes and edges to `/graph` via React Router state for interactive ReactFlow canvas inspection.
- **Local Fallback Engine**: Gracefully provides structured cached workspace data if backend services are offline.

---

## 5. [[Risk Engine]] Integration

The Desktop section consumes the standard OS3 dynamic scoring formula:

$$\text{Score} = \max\left(0, 100 - (\text{Vuln Penalty} + \text{Attack Penalty} + \text{Dependency Penalty}) + \text{Trust Boost}\right)$$

- **Vulnerability Penalty**: $-15$ (Critical), $-10$ (High), $-5$ (Medium), $-2$ (Low)
- **Attack Path Penalty**: $-5$ per detected transitive vector
- **Complexity Penalty**: $-\lfloor \text{Dependencies} / 5 \rfloor$
- **Trust Boost**: $+5$ for verified ecosystems

---

## 6. [[Policy Engine]] Integration

Evaluates local workspace artifacts against structured enterprise compliance rules:
1. **CVSS Ceiling Rule**: Blocks builds with vulnerabilities exceeding CVSS 9.0.
2. **Zero Criticals Rule**: Mandates 0 critical CVEs in production dependencies.
3. **Attack Path Gate**: Fails when reachable exploitation vectors exist from root imports.
4. **License Compliance**: Enforces permissive open-source licenses (MIT, Apache-2.0, BSD).
5. **Provenance Verification**: Checks package velocity and prevents typosquatting.

---

## 7. Operational States

| State | Visual Behavior |
|---|---|
| **Loading** | Phased progress bar with active terminal status messages and animated spinner. |
| **Empty** | Clean onboarding interface with quick-select presets for instant workspace load. |
| **Error** | Non-blocking alert banner with retry trigger and local cached analysis fallback. |
| **Success** | Full interactive security dashboard with filterable findings, graph links, and copyable fixes. |

---

## 8. Related Notes

- [[OS3 Architecture]]
- [[Risk Engine]]
- [[Policy Engine]]
- [[Risk Assessment]]
- [[Policy Decision]]
- [[Dependency Graph]]
- [[Evidence Model]]
