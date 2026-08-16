# OS3 Repository Map

OS3 is a developer-first open-source supply-chain security platform.
It provides pre-installation package security analysis, dependency tree visualization,
attack path identification, risk scoring, a standalone CLI tool, and an AI Copilot.

## Repository Structure

```text
OS3/
├── backend/                        # FastAPI Backend & RAG Engine
│   ├── api/                        # HTTP API endpoint routes
│   ├── data/                       # Static knowledge base & vulnerability datasets
│   └── services/                   # Security scanner, graph, OSV, & RAG services
│
├── os3-cli/                        # Standalone PyPI CLI Tool (os3-security)
│   └── os3/                        # CLI source package
│       ├── backend/                # Embedded backend services for standalone CLI
│       │   ├── api/                # Embedded API routes
│       │   └── services/           # Embedded analysis services
│       └── engine/                 # OSV vulnerability query engine
│
├── public/                         # Static media assets & favicon
│
├── scripts/                        # Repository maintenance & validation scripts
│
└── src/                            # React Web Application Frontend
    ├── assets/                     # Media & video background assets
    ├── components/                 # Visual components & layout elements
    │   └── ui/                     # Shadcn / Radix UI primitive components
    ├── data/                       # Demo UI dataset declarations
    ├── hooks/                      # Custom React UI hooks
    ├── lib/                        # Firebase SDK configuration & utility functions
    ├── pages/                      # Web application page components
    └── services/                   # Frontend API client services
```

## Navigation

| Area | Purpose | Start Here |
|---|---|---|
| `.github/` | GitHub workflows and repository configuration | [`.github/wiki.md`](.github/.github.md) |
| `backend/` | FastAPI backend service, RAG engine, OSV integration, and security scoring | [`backend/wiki.md`](backend/backend.md) |
| `os3-cli/` | Standalone Python CLI package published on PyPI as `os3-security` | [`os3-cli/wiki.md`](os3-cli/os3-cli.md) |
| `public/` | Static branding assets, icons, and web server robots text | [`public/wiki.md`](public/public.md) |
| `scripts/` | Maintenance, wiki validation, and repository helper scripts | [`scripts/wiki.md`](scripts/scripts.md) |
| `src/` | React 18 frontend web application, interactive dashboards, and graph visualizations | [`src/wiki.md`](src/src.md) |

## Root Configuration & Root Files

| File | Description |
|---|---|
| `package.json` | Root npm package configuration and frontend dependencies. |
| `vite.config.ts` | Vite build tool and development server configuration. |
| `tailwind.config.ts` | Tailwind CSS theme colors, utilities, and plugin setup. |
| `postcss.config.js` | PostCSS plugin configuration for Tailwind CSS and Autoprefixer. |
| `tsconfig.json` | Master TypeScript compiler configuration. |
| `tsconfig.app.json` | Web app TypeScript compiler settings and path aliases (`@/*`). |
| `tsconfig.node.json` | Node.js build tooling TypeScript compiler configuration. |
| `eslint.config.js` | ESLint code quality and style rule configuration. |
| `firebase.json` | Firebase Hosting deployment routing configuration. |
| `.firebaserc` | Firebase project target identifier configuration. |
| `index.html` | Entry HTML document for the Vite React frontend. |
| `README.md` | General project overview, problem statement, and setup instructions. |
| `os3_project_master_context.md` | System context document for LLM prompting and roadmap design. |
| `report.json` | Sample CLI scan output report in JSON format. |
| `report.txt` | Sample CLI scan output report in text format. |

## Agent Navigation Rule

When working on this repository:

1. Read `primary.md` first.
2. Identify the relevant top-level directory.
3. Read that directory's `wiki.md`.
4. Follow the wiki recursively into relevant subdirectories.
5. Use the file descriptions to identify the source files relevant to the task.
6. Read the actual source files before making assumptions.
7. Do not scan unrelated directories unless the task requires them.
8. Treat source code as the implementation truth.
9. Treat these wiki files as navigation/context aids, not as substitutes for source code.
