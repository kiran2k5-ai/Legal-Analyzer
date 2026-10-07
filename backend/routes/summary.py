from fastapi import APIRouter, HTTPException, Depends
from database.mongodb import documents_collection
from services.vector_store import collection as chroma_collection
from services.llm import generate_text
from routes.auth import get_current_user

router = APIRouter(prefix="/summary")

@router.get("/{doc_id}")
async def get_document_summary(doc_id: str, current_user: dict = Depends(get_current_user)):
    try:
        # Check if we have the metadata in MongoDB (securing it for this user)
        doc = await documents_collection.find_one({"doc_id": doc_id, "user_email": current_user["email"]})
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")

        # If summary is already cached in MongoDB, return it
        if "summary" in doc and doc["summary"]:
            return {"summary": doc["summary"]}

        # Otherwise, query ChromaDB for the document chunks to generate a summary
        # Query ChromaDB by metadata matching the doc_id
        results = chroma_collection.get(
            where={"doc_id": doc_id}
        )
        
        chunks = results.get("documents", [])
        if not chunks:
            raise HTTPException(status_code=400, detail="No chunks found for this document to summarize.")

        # Sort chunks by index if possible, or just join them
        metadatas = results.get("metadatas", [])
        indexed_chunks = []
        for text, meta in zip(chunks, metadatas):
            idx = meta.get("chunk_index", 0)
            indexed_chunks.append((idx, text))
        
        indexed_chunks.sort(key=lambda x: x[0])
        sorted_texts = [item[1] for item in indexed_chunks]

        # Use up to 15 chunks (roughly 7500 words) to avoid blowing up the context window
        context_text = "\n\n".join(sorted_texts[:15])

        # Prompt for summarizing
        system_instruction = (
            "You are an expert AI Legal Counsel. Your goal is to write a highly professional, "
            "clear, structured, and comprehensive executive summary of the provided legal document. "
            "Focus on the primary parties, duration, critical obligations, liabilities, termination conditions, "
            "and any governing laws. Do not invent details; describe only what is stated in the text."
        )
        
        prompt = (
            f"Please generate a comprehensive executive summary of this legal document:\n\n"
            f"Document Title: {doc['filename']}\n\n"
            f"Content:\n{context_text}"
        )

        summary = generate_text(prompt, system_instruction=system_instruction)

        # Cache the summary in MongoDB (ensuring it's saved for this user's document)
        await documents_collection.update_one(
            {"doc_id": doc_id, "user_email": current_user["email"]},
            {"$set": {"summary": summary}}
        )

        return {"summary": summary}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
