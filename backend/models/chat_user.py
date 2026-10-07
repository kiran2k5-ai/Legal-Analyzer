from pydantic import BaseModel
from typing import Optional

class user_chat(BaseModel):
    prompt: str
    session_id: Optional[str] = None