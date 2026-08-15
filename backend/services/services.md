# Backend Services

This directory contains core security analysis services, dependency tree builders,
external OSV/npm API integration clients, and the RAG vector search pipeline.

## Files

| File | Description |
|---|---|
| `attack_path_detector.py` | Detects vulnerable paths from root package down to infected transitive dependencies. |
| `dependency_analyzer.py` | Recursively resolves npm package dependencies into a structured dependency tree. |
| `dependency_graph.py` | Helper functions for constructing graph representation of package dependencies. |
| `dependency_service.py` | Service wrapper interface for fetching package dependencies. |
| `npm_service.py` | Fetches package manifest JSON and direct dependencies from `registry.npmjs.org`. |
| `ollama_client.py` | Client interface for sending prompts and receiving streaming tokens from local Ollama LLM. |
| `osv_service.py` | Queries Google's OSV database (`api.osv.dev`) for package vulnerability records and severity metrics. |
| `rag_pipeline.py` | Embeds security documents with `SentenceTransformer` and retrieves top-$k$ context matches via FAISS index. |
