import os
import time
import requests
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "qwen/qwen3.8-27b")

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3")

def generate_text(prompt: str, system_instruction: str = None) -> str:
    # 1. Use Groq if API Key is configured (Cloud / Render or Local)
    if GROQ_API_KEY:
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": GROQ_MODEL,
            "messages": messages,
            "temperature": 0.2
        }

        # Retry up to 4 times on rate limit (429)
        for attempt in range(4):
            try:
                response = requests.post(url, headers=headers, json=payload, timeout=60)
                if response.status_code == 429 and attempt < 3:
                    retry_after = response.headers.get("retry-after")
                    try:
                        wait_time = float(retry_after) if retry_after else (attempt + 1) * 3
                    except (ValueError, TypeError):
                        wait_time = (attempt + 1) * 3
                    print(f"Groq rate limit reached (429). Retrying in {wait_time}s...")
                    time.sleep(wait_time)
                    continue

                response.raise_for_status()
                data = response.json()
                return data["choices"][0]["message"]["content"]
            except Exception as e:
                if attempt == 3:
                    print(f"Error generating content via Groq: {e}. Falling back to Ollama if available...")
                    break
                time.sleep(2)

    # 2. Fallback to local Ollama if no Groq API Key is present
    try:
        url = f"{OLLAMA_HOST}/api/generate"
        payload = {
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False
        }
        if system_instruction:
            payload["system"] = system_instruction
            
        response = requests.post(url, json=payload, timeout=90)
        response.raise_for_status()
        return response.json().get("response", "")
    except Exception as e:
        print(f"Error generating content via Ollama: {e}")
        return f"Error: Ollama generation failed. Details: {str(e)}"
