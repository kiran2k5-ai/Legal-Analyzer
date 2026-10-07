import asyncio
import os
import sys
from dotenv import load_dotenv

# Ensure backend folder is in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

load_dotenv()

from services.rag import generate_rag_response
from database.mongodb import documents_collection

async def main():
    print("Checking database status...")
    
    # 1. Check MongoDB docs
    doc_count = await documents_collection.count_documents({})
    print(f"MongoDB total documents: {doc_count}")
    
    if doc_count == 0:
        print("Warning: No documents uploaded. Please upload documents in the frontend first to test retrieval.")
        return
        
    print("\nListing documents in database:")
    async for doc in documents_collection.find():
        print(f"- Filename: {doc['filename']} (ID: {doc['doc_id']})")
    
    user_email = "test@example.com"
    first_doc = await documents_collection.find_one({})
    if first_doc and "user_email" in first_doc:
        user_email = first_doc["user_email"]
        
    query = "What is the lease duration and rent payment terms?"
    print(f"\nRunning RAG Query: '{query}' for user '{user_email}'")
    print("-" * 50)
    
    response = generate_rag_response(query, user_email=user_email)
    
    print("\n[AI RESPONSE]:")
    print(response["answer"])
    
    print("\n[CITATIONS]:")
    for cit in response["citations"]:
        print(f"- Document: {cit['document']} (Chunk {cit['chunk_index']})")
        print(f"  Confidence: {cit['confidence']}")
        print(f"  Excerpt: {cit['snippet'][:100]}...")

if __name__ == "__main__":
    asyncio.run(main())
