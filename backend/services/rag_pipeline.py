from sentence_transformers import SentenceTransformer
import faiss
import json
import numpy as np
import os

# ── Load model ───────────────────────────────────────────────────────────────
model = SentenceTransformer('all-MiniLM-L6-v2')

# ── Paths ────────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.dirname(__file__))  # goes up to /backend
DATA_DIR = os.path.join(BASE_DIR, 'data')

# ── Load knowledge base ──────────────────────────────────────────────────────
with open(os.path.join(DATA_DIR, 'os3_context.json')) as f:
    os3 = json.load(f)

with open(os.path.join(DATA_DIR, 'vulnerabilities.json')) as f:
    vulns = json.load(f)

# ── Build document chunks ────────────────────────────────────────────────────
documents = [
    f"Project: {os3['project']}",
    f"Problem OS3 solves: {os3['problem']}",
    f"Solution: {os3['solution']}",
    f"OS3 Features: {', '.join(os3['features'])}",
    f"How to use OS3: {os3['how_to_use']}",
]

for v in vulns:
    documents.append(
        f"Package '{v['package']}' (version {v['version']}) has risk: {v['risk']}. "
        f"Severity: {v['severity']}. CVE: {v['cve']}. Fix: {v['fix']}"
    )

# ── Build FAISS index ────────────────────────────────────────────────────────
embeddings = model.encode(documents, convert_to_numpy=True)
dimension = embeddings.shape[1]

index = faiss.IndexFlatL2(dimension)
index.add(embeddings)

print(f"✅ RAG pipeline ready — {len(documents)} documents indexed.")

def retrieve(query: str, top_k: int = 4) -> list:
    q_emb = model.encode([query], convert_to_numpy=True)
    distances, indices = index.search(q_emb, k=top_k)
    return [documents[i] for i in indices[0] if i < len(documents)]