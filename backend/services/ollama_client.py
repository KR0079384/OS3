import requests
import json
from typing import Generator

OLLAMA_URL = "http://127.0.0.1:11434/api/generate"
MODEL = "llama3:8b"

def ask_ollama(prompt: str) -> str:
    """Standard blocking call."""
    try:
        response = requests.post(
            OLLAMA_URL,
            json={"model": MODEL, "prompt": prompt, "stream": False},
            timeout=60
        )
        if response.status_code != 200:
            return f"❌ Ollama error: {response.text}"
        return response.json().get("response", "No response from model.")

    except requests.exceptions.ConnectionError:
        return "❌ Ollama is not running. Run: ollama serve"
    except requests.exceptions.Timeout:
        return "⏱️ Timed out. Try a shorter question."
    except Exception as e:
        return f"❌ Failed: {str(e)}"


def ask_ollama_stream(prompt: str) -> Generator[str, None, None]:
    """Streaming call — yields tokens one by one."""
    try:
        with requests.post(
            OLLAMA_URL,
            json={"model": MODEL, "prompt": prompt, "stream": True},
            stream=True,
            timeout=120
        ) as response:
            if response.status_code != 200:
                yield f"❌ Ollama error: {response.text}"
                return

            for line in response.iter_lines():
                if not line:
                    continue
                try:
                    # Each line is a JSON object
                    chunk = json.loads(line.decode("utf-8") if isinstance(line, bytes) else line)
                    token = chunk.get("response", "")
                    if token:
                        yield token
                    if chunk.get("done", False):
                        break
                except json.JSONDecodeError:
                    # Skip malformed lines
                    continue

    except requests.exceptions.ConnectionError:
        yield "❌ Ollama is not running. Run: ollama serve"
    except requests.exceptions.Timeout:
        yield "⏱️ Timed out. Try a shorter question."
    except Exception as e:
        yield f"❌ Stream error: {str(e)}"