from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from services.rag_pipeline import retrieve
from services.ollama_client import ask_ollama, ask_ollama_stream
import logging
import traceback

router = APIRouter(prefix="/copilot", tags=["AI Copilot"])
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("copilot")

class QuestionRequest(BaseModel):
    question: str

class AnswerResponse(BaseModel):
    answer: str
    context_used: list


# ── Standard endpoint ────────────────────────────────────────────────────────
@router.post("/ask", response_model=AnswerResponse)
async def ask_copilot(req: QuestionRequest):
    try:
        if not req.question.strip():
            return AnswerResponse(answer="⚠️ Please enter a question.", context_used=[])

        logger.info(f"Received question: {req.question}")
        context_chunks = retrieve(req.question)
        if not context_chunks:
            context_chunks = ["No specific context found in OS3 knowledge base."]
        context = "\n".join(context_chunks)

        prompt = build_prompt(req.question, context)
        answer = ask_ollama(prompt)
        return AnswerResponse(answer=answer.strip(), context_used=context_chunks)

    except Exception as e:
        logger.error(traceback.format_exc())
        return AnswerResponse(answer=f"❌ Error: {str(e)}", context_used=[])


# ── Streaming endpoint ───────────────────────────────────────────────────────
@router.post("/ask-stream")
async def ask_copilot_stream(req: QuestionRequest):
    try:
        context_chunks = retrieve(req.question)
        if not context_chunks:
            context_chunks = ["No specific context found."]
        context = "\n".join(context_chunks)
        prompt = build_prompt(req.question, context)

        def generate():
            try:
                for token in ask_ollama_stream(prompt):
                    yield token
            except Exception as e:
                yield f"❌ Stream failed: {str(e)}"

        return StreamingResponse(
            generate(),
            media_type="text/plain",
            headers={
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no",  # prevents nginx from buffering stream
            }
        )

    except Exception as e:
        logger.error(traceback.format_exc())
        # Return error as a stream so frontend still reads it
        def error_stream():
            yield f"❌ Error: {str(e)}"
        return StreamingResponse(error_stream(), media_type="text/plain")


# ── Shared prompt builder ────────────────────────────────────────────────────
def build_prompt(question: str, context: str) -> str:
    return f"""You are OS3 AI Security Copilot — an expert in open-source software security.

Context from OS3 knowledge base:
{context}

User Question: {question}

Give a concise, structured answer. For vulnerabilities include: risk, CVE ID, and fix.
Answer:"""


# ── Health check ─────────────────────────────────────────────────────────────
@router.get("/health")
def copilot_health():
    from services.ollama_client import MODEL
    return {"status": "OS3 Copilot API is running ✅", "model": MODEL, "rag": "enabled"}