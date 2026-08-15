# Frontend Source (src)

The `src` directory contains the React 18 frontend source code for the OS3 web application.
It includes interactive pages, Shadcn UI components, dynamic graph visualizations, state management, and backend API clients.

## Files

| File | Description |
|---|---|
| `App.tsx` | Main React application component configuring TanStack Query client, route definitions, and navigation layout. |
| `App.css` | Global application styling rules and override declarations. |
| `index.css` | Main CSS file containing Tailwind directives, CSS design variables, and glassmorphism styling rules. |
| `main.tsx` | Entry point rendering the React application root into the DOM. |
| `vite-env.d.ts` | TypeScript declarations for Vite client environment modules. |

## Subdirectories

| Directory | Description | Wiki |
|---|---|---|
| `assets/` | Video and background image media assets. | [`assets/wiki.md`](assets/assets.md) |
| `components/` | Reusable UI components, header navigation, scoreboards, and UI primitives. | [`components/wiki.md`](components/components.md) |
| `data/` | Static demo datasets for UI component rendering. | [`data/wiki.md`](data/data.md) |
| `hooks/` | Custom React hooks for viewport detection and toast notifications. | [`hooks/wiki.md`](hooks/hooks.md) |
| `lib/` | Firebase SDK initialization and utility class merging helpers. | [`lib/wiki.md`](lib/lib.md) |
| `pages/` | Application page views (Scan, Graph, Copilot, Dashboard, Vulnerabilities, etc.). | [`pages/wiki.md`](pages/pages.md) |
| `services/` | HTTP API service client for communicating with FastAPI backend. | [`services/wiki.md`](services/services.md) |
