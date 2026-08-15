# OS3 CLI Source Module

This directory contains the primary Python source files for the OS3 command-line interface.
It defines Typer terminal commands (`scan`, `graph`, `check-install`), Rich formatting, and scan orchestrators.

## Files

| File | Description |
|---|---|
| `__init__.py` | Package initialization marker for `os3` module. |
| `cli.py` | Typer CLI entry point defining terminal commands, Rich table rendering, and report exporter logic. |
| `scan.py` | Standalone scan driver orchestrating npm metadata requests, vulnerability checks, and scoring. |

## Subdirectories

| Directory | Description | Wiki |
|---|---|---|
| `backend/` | Embedded copy of backend services and test runners for standalone CLI offline support. | [`backend/wiki.md`](backend/backend.md) |
| `engine/` | Vulnerability query engine and OSV severity aggregator. | [`engine/wiki.md`](engine/engine.md) |
