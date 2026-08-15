# OS3 CLI Package

This directory contains the standalone Python CLI package for OS3, published on PyPI
as `os3-security`. It enables pre-installation package scanning directly in developer terminals.

## Files

| File | Description |
|---|---|
| `setup.py` | Setuptools installation configuration for PyPI package distribution (`os3-security`). |
| `pyproject.toml` | Build system specification and metadata for packaging `os3-security`. |
| `requirements.txt` | Runtime Python dependencies for the CLI (`typer`, `rich`, `requests`). |
| `MANIFEST.in` | Packaging manifest specifying extra non-code files included in the PyPI distribution. |
| `.gitignore` | Git ignore rules specific to CLI build artifacts and distributions. |

## Subdirectories

| Directory | Description | Wiki |
|---|---|---|
| `os3/` | Source code package containing CLI command handlers, engines, and embedded scanner logic. | [`os3/wiki.md`](os3/os3.md) |
