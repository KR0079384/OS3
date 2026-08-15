# Backend API

This directory contains the FastAPI route definitions and HTTP request handlers
for package scanning, security scoring, dependency node expansion, and AI Copilot queries.

## Files

| File | Description |
|---|---|
| `scan.py` | Package scan endpoint (`/api/scan-package`), security scoring logic, and node expansion endpoint (`/api/expand-node`). |
| `copilot.py` | AI Copilot QA endpoint (`/copilot/ask`), streaming AI response endpoint (`/copilot/ask-stream`), and service health check. |
