
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.chatbot import generate_response

app = FastAPI(title="StudyBot API")

# Enable frontend-backend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store conversation history
conversations = {}


class ChatRequest(BaseModel):
    conversation_id: str
    message: str


@app.get("/")
def home():
    return {"message": "StudyBot API is running"}


@app.post("/chat")
def chat(request: ChatRequest):

    try:
        if request.conversation_id not in conversations:
            conversations[request.conversation_id] = []

        history = conversations[request.conversation_id]

        answer = generate_response(
            history,
            request.message
        )

        # Save messages only after a successful response
        history.append({
            "role": "user",
            "content": request.message
        })

        history.append({
            "role": "assistant",
            "content": answer
        })

        return {
            "conversation_id": request.conversation_id,
            "response": answer
        }

    except RuntimeError as e:
        print("API ERROR:", e)

        raise HTTPException(
            status_code=503,
            detail=str(e)
        )

    except Exception as e:
        print("ERROR:", e)

        raise HTTPException(
            status_code=500,
            detail="Something went wrong. Please try again."
        )
