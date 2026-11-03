from pydantic import BaseModel, Field
from typing import Optional, List

class ChatRequest(BaseModel):
    message: str = Field(..., description="User question or prompt")
    lang: str = Field(default="en", description="Language code: en or hi")
    context: Optional[dict] = None

class ChatResponse(BaseModel):
    reply: str
    grounded_sources: List[str]
    lang: str
    retrieved_context: Optional[str] = None
