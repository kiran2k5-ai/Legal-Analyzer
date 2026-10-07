from fastapi import APIRouter, HTTPException, Depends
from models.chat_user import user_chat
from services.rag import generate_rag_response
from routes.auth import get_current_user
from database.mongodb import chat_collection, chat_sessions_collection
from datetime import datetime
import uuid

router = APIRouter(prefix="/chat")

@router.get("/sessions")
async def get_chat_sessions(current_user: dict = Depends(get_current_user)):
    try:
        cursor = chat_sessions_collection.find(
            {"user_email": current_user["email"]},
            {"session_id": 1, "title": 1, "updated_at": 1, "messages": 1}
        ).sort("updated_at", -1)
        
        sessions = []
        async for s in cursor:
            sessions.append({
                "session_id": s["session_id"],
                "title": s.get("title", "Consultation"),
                "updated_at": s.get("updated_at", ""),
                "message_count": len(s.get("messages", []))
            })
        return {"sessions": sessions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions/{session_id}")
async def get_session_detail(session_id: str, current_user: dict = Depends(get_current_user)):
    try:
        session = await chat_sessions_collection.find_one({
            "session_id": session_id,
            "user_email": current_user["email"]
        })
        if not session:
            raise HTTPException(status_code=404, detail="Consultation session not found")
        return {
            "session_id": session["session_id"],
            "title": session.get("title", "Consultation"),
            "messages": session.get("messages", [])
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/sessions/{session_id}")
async def delete_chat_session(session_id: str, current_user: dict = Depends(get_current_user)):
    try:
        result = await chat_sessions_collection.delete_one({
            "session_id": session_id,
            "user_email": current_user["email"]
        })
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Session not found")
        return {"message": "Session deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history")
async def get_chat_history(current_user: dict = Depends(get_current_user)):
    try:
        # Fetch the most recent session or fallback to legacy chat_collection
        latest_session = await chat_sessions_collection.find_one(
            {"user_email": current_user["email"]},
            sort=[("updated_at", -1)]
        )
        if latest_session:
            return {
                "session_id": latest_session["session_id"],
                "messages": latest_session.get("messages", [])
            }
            
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
        
        session_id = data.session_id
        is_new_session = False
        if not session_id:
            session_id = str(uuid.uuid4())
            is_new_session = True

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
        
        # Save to chat_sessions_collection
        title = data.prompt.strip()
        if len(title) > 40:
            title = title[:37] + "..."

        update_fields = {
            "updated_at": datetime.utcnow().isoformat(),
        }
        if is_new_session:
            update_fields["title"] = title
            update_fields["created_at"] = datetime.utcnow().isoformat()

        await chat_sessions_collection.update_one(
            {"session_id": session_id, "user_email": current_user["email"]},
            {
                "$push": {"messages": {"$each": [user_msg, ai_msg]}},
                "$set": update_fields
            },
            upsert=True
        )

        response["session_id"] = session_id
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/history")
async def clear_chat_history(current_user: dict = Depends(get_current_user)):
    try:
        await chat_sessions_collection.delete_many({"user_email": current_user["email"]})
        await chat_collection.delete_many({"user_email": current_user["email"]})
        return {"message": "All consultation history cleared successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))