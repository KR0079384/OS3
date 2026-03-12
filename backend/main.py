from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.scan import router as scan_router


# -----------------------------
# FastAPI Application
# -----------------------------
app = FastAPI(
    title="OS³ Security Scanner",
    description="Supply Chain Security Intelligence Platform for Developers",
    version="1.0.0"
)


# -----------------------------
# CORS Configuration
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all origins during development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------
# Root Endpoint (Health Check)
# -----------------------------
@app.get("/")
def root():
    return {
        "message": "OS³ Security Scanner API is running"
    }


# -----------------------------
# Register API Routes
# -----------------------------
app.include_router(scan_router, prefix="/api", tags=["Security Scanner"])