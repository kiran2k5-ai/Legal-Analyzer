import chromadb

client = chromadb.PersistentClient(path="chroma_db")

collection = client.get_or_create_collection(
    name="legal_documents",
    metadata={"hnsw:space": "cosine"}
)

import uuid

def store_chunks(chunks, embeddings, filename="", doc_id="", user_email=""):
    # If doc_id is not provided, generate one
    if not doc_id:
        doc_id = str(uuid.uuid4())
    ids = [f"{doc_id}_chunk_{i}" for i in range(len(chunks))]

    collection.add(
        ids=ids,
        documents=chunks,
        embeddings=embeddings,
        metadatas=[
            {"document": filename, "chunk_index": i, "doc_id": doc_id, "user_email": user_email}
            for i in range(len(chunks))
        ]
    )

    print("Chunks stored successfully!")
    return doc_id, ids


def clear_collection():
    global collection

    try:
        client.delete_collection("legal_documents")
    except:
        pass

    collection = client.get_or_create_collection(
        name="legal_documents",
        metadata={"hnsw:space": "cosine"}
    )

def delete_document_vectors(doc_id):
    try:
        collection.delete(where={"doc_id": doc_id})
        return True
    except Exception as e:
        print(f"Error deleting vectors: {e}")
        return False