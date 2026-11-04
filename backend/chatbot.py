import time
import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY not found in .env file")

client = genai.Client(api_key=api_key)

MODEL_NAME = "gemini-3.5-flash-lite"

SYSTEM_PROMPT = """
You are StudyBot, a helpful and friendly AI study assistant.

Your purpose is to help engineering students understand technical
subjects clearly.

Rules:
- Explain difficult concepts in simple language.
- Give examples when useful.
- Be concise but informative.
- Remember the context of the current conversation.
- If the student asks a follow-up question, use previous messages
  to understand what they are referring to.
"""



def generate_response(history, user_message):

    recent_history = history[-6:]

    conversation = SYSTEM_PROMPT + "\n\n"

    for message in recent_history:
        role = message["role"]
        content = message["content"]

        if role == "user":
            conversation += f"Student: {content}\n"
        else:
            conversation += f"StudyBot: {content}\n"

    conversation += f"Student: {user_message}\n"
    conversation += "StudyBot:"

    for attempt in range(2):
        try:
            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=conversation
            )

            return response.text

        except Exception as e:
            error = str(e).lower()

            if (
                "503" in error
                or "unavailable" in error
                or "429" in error
                or "resource_exhausted" in error
            ):
                if attempt == 0:
                    print("Gemini busy. Retrying once...")
                    time.sleep(1)
                else:
                    raise RuntimeError(
                        "Gemini is busy. Please try again."
                    )
            else:
                raise
