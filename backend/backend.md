# Backend

The backend contains the FastAPI application responsible for package scanning,
dependency analysis, vulnerability intelligence, security scoring, and AI/RAG operations.

## Files

| File                      | Description                                                               |
| ------------------------- | ------------------------------------------------------------------------- |
| `main.py`                 | FastAPI application entry point, CORS middleware, and route registration. |
| `requirements.txt`        | Python dependency declarations for the FastAPI backend and RAG engine.    |
| `score_cli.py`            | CLI test script for executing security scoring logic on package names.    |
| `attack_path_test.py`     | Test script verifying attack path detection logic on dependency graphs.   |
| `test_attack_detector.py` | Test runner script for the attack path detection service.                 |
| `test_dependencies.py`    | Unit test verifying npm package dependency resolution.                    |
| `test_osv.py`             | Test script validating OSV vulnerability API integration.                 |
| `test_recursive.py`       | Test script validating recursive dependency tree building.                |

## Subdirectories

| Directory   | Description                                                              | Wiki                                       |
| ----------- | ------------------------------------------------------------------------ | ------------------------------------------ |
| `api/`      | FastAPI route modules and HTTP endpoint handlers.                        | [`api/wiki.md`](api/api.md)                |
| `data/`     | Static security context and vulnerability datasets for RAG.              | [`data/wiki.md`](data/data.md)             |
| `services/` | Security analysis engines, graph builders, OSV client, and RAG pipeline. | [`services/wiki.md`](services/services.md) |
