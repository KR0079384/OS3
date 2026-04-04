from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.scan import router as scan_router
from api.copilot import router as copilot_router

app = FastAPI(
    title="OS³ Security Scanner",
    description="Supply Chain Security Intelligence Platform for Developers",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080",
    "http://127.0.0.1:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "OS³ Security Scanner API is running"}

app.include_router(
    scan_router,
    prefix="/api",
    tags=["Security Scanner"]
)

# ✅ FIXED: prefix is just /api, copilot.py handles /copilot/ask internally
app.include_router(
    copilot_router,
    prefix="/api",
    tags=["AI Copilot"]
)