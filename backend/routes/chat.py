from fastapi import APIRouter, HTTPException, Depends
from models.chat_user import user_chat
from services.rag import generate_rag_response
from routes.auth import get_current_user
from database.mongodb import chat_collection
from datetime import datetime

router = APIRouter(prefix="/chat")

@router.get("/history")
async def get_chat_history(current_user: dict = Depends(get_current_user)):
    try:
        chat = await chat_collection.find_one({"user_email": current_user["email"]})
        if not chat:
            return {"messages": []}
        return {"messages": chat.get("messages", [])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/")
async def get_user_prompt(data: user_chat, current_user: dict = Depends(get_current_user)):
    try:
        response = generate_rag_response(data.prompt, user_email=current_user["email"])
        
        # Save user message and AI response to MongoDB chat history
        user_msg = {
            "sender": "user",
            "text": data.prompt,
            "timestamp": datetime.utcnow().isoformat()
        }
        ai_msg = {
            "sender": "ai",
            "text": response.get("answer", ""),
            "citations": response.get("citations", []),
            "timestamp": datetime.utcnow().isoformat()
        }
        
        await chat_collection.update_one(
            {"user_email": current_user["email"]},
            {
                "$push": {"messages": {"$each": [user_msg, ai_msg]}},
                "$set": {"updated_at": datetime.utcnow().isoformat()}
            },
            upsert=True
        )
        
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/history")
async def clear_chat_history(current_user: dict = Depends(get_current_user)):
    try:
        await chat_collection.update_one(
            {"user_email": current_user["email"]},
            {
                "$set": {
                    "messages": [],
                    "updated_at": datetime.utcnow().isoformat()
                }
            },
            upsert=True
        )
        return {"message": "Chat history cleared successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    