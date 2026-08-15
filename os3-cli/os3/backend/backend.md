# OS3 CLI Embedded Backend

This directory contains an embedded version of the FastAPI backend modules packaged inside
the CLI distribution to support standalone and offline vulnerability detection.

## Files

| File | Description |
|---|---|
| `main.py` | Embedded FastAPI app entry point inside the CLI distribution. |
| `requirements.txt` | Dependency declarations for embedded CLI backend components. |
| `attack_path_test.py` | Test script for attack path logic inside CLI package. |
| `test_attack_detector.py` | Test runner script for CLI attack path detector. |
| `test_dependencies.py` | Test script for dependency resolution in CLI package. |
| `test_osv.py` | Test script for OSV vulnerability queries in CLI package. |
| `test_recursive.py` | Test script for recursive resolution in CLI package. |

## Subdirectories

| Directory | Description | Wiki |
|---|---|---|
| `api/` | Embedded API scan endpoint route module. | [`api/wiki.md`](api/api.md) |
| `services/` | Embedded security analysis services for dependency tree and OSV lookups. | [`services/wiki.md`](services/services.md) |
