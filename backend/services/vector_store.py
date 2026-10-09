import chromadb
import uuid
import os

client = chromadb.PersistentClient(path="chroma_db")

COLLECTION_NAME = "legal_documents_v2"

collection = client.get_or_create_collection(
    name=COLLECTION_NAME,
    metadata={"hnsw:space": "cosine"}
)

def clear_collection():
    global collection
    try:
        client.delete_collection(COLLECTION_NAME)
    except Exception:
        pass

    collection = client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"}
    )

def store_chunks(chunks, embeddings, filename="", doc_id="", user_email=""):
    global collection
    if not doc_id:
        doc_id = str(uuid.uuid4())
    ids = [f"{doc_id}_chunk_{i}" for i in range(len(chunks))]

    metadatas = [
        {"document": filename, "chunk_index": i, "doc_id": doc_id, "user_email": user_email}
        for i in range(len(chunks))
    ]

    try:
        collection.add(
            ids=ids,
            documents=chunks,
            embeddings=embeddings,
            metadatas=metadatas
        )
    except Exception as e:
        if "dimension" in str(e).lower():
            print("Dimension mismatch in ChromaDB. Resetting collection for new embedding model...")
            clear_collection()
            collection.add(
                ids=ids,
                documents=chunks,
                embeddings=embeddings,
                metadatas=metadatas
            )
        else:
            raise e

    print("Chunks stored successfully!")
    return doc_id, ids

def delete_document_vectors(doc_id):
    try:
        collection.delete(where={"doc_id": doc_id})
        return True
    except Exception as e:
        print(f"Error deleting vectors: {e}")
        return False