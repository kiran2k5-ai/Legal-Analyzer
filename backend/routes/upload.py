from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from services.pdf_reader import extract_text
from services.chunker import chunk_text
from services.embedding import get_documents_embeddings
from services.vector_store import store_chunks, delete_document_vectors
from database.mongodb import documents_collection
from routes.auth import get_current_user
from datetime import datetime
import uuid
import shutil
import os

router = APIRouter()

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    try:
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are supported.")

        # Generate a unique doc_id to avoid filename collisions on disk
        doc_id = str(uuid.uuid4())
        # Store file on disk with clean names or subfolders, but since the database binds them, let's keep it safe:
        # We can prefix the filename with doc_id to ensure no collision on disk!
        safe_filename = f"{doc_id}_{file.filename}"
        file_path = os.path.join(UPLOAD_FOLDER, safe_filename)

        # Save file to disk
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 1. Extract Text
        text = extract_text(file_path)
        if not text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from PDF or PDF is empty.")

        # 2. Chunk Text
        chunks = chunk_text(text)

        # 3. Get Embeddings
        embeddings = get_documents_embeddings(chunks)

        # 4. Store in ChromaDB
        _, chunk_ids = store_chunks(chunks, embeddings, file.filename, doc_id=doc_id, user_email=current_user["email"])

        # 5. Store Metadata in MongoDB
        doc_metadata = {
            "doc_id": doc_id,
            "filename": file.filename,
            "stored_filename": safe_filename,
            "user_email": current_user["email"],
            "total_chunks": len(chunks),
            "uploaded_at": datetime.utcnow().isoformat(),
            "file_size": os.path.getsize(file_path)
        }
        await documents_collection.insert_one(doc_metadata)

        return {
            "message": "File uploaded and processed successfully",
            "doc_id": doc_id,
            "filename": file.filename,
            "total_chunks": len(chunks)
        }

    except HTTPException:
        raise
    except Exception as e:
        # Clean up file on error if it exists
        if 'file_path' in locals() and os.path.exists(file_path):
            try:
                os.remove(file_path)
            except:
                pass
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/documents")
async def list_documents(current_user: dict = Depends(get_current_user)):
    try:
        docs = []
        async for doc in documents_collection.find({"user_email": current_user["email"]}, {"_id": 0}):
            docs.append(doc)
        return docs
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/documents/{doc_id}")
async def delete_document(doc_id: str, current_user: dict = Depends(get_current_user)):
    try:
        # Find document in MongoDB (ensuring it belongs to this user)
        doc = await documents_collection.find_one({"doc_id": doc_id, "user_email": current_user["email"]})
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")

        # Delete vectors from ChromaDB
        delete_document_vectors(doc_id)

        # Delete local file
        stored_name = doc.get("stored_filename", doc["filename"])
        file_path = os.path.join(UPLOAD_FOLDER, stored_name)
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception as e:
                print(f"Error removing file {file_path}: {e}")

        # Delete metadata from MongoDB
        await documents_collection.delete_one({"doc_id": doc_id, "user_email": current_user["email"]})

        return {"message": f"Document '{doc['filename']}' deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))