import sqlite3
from fastapi import APIRouter, Depends
from app.db.database import get_db
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chatbot import generate_chat_response

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
def handle_chat(req: ChatRequest, conn: sqlite3.Connection = Depends(get_db)):
    res = generate_chat_response(conn, req.message, req.lang)
    return ChatResponse(**res)
