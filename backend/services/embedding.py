import os
from sentence_transformers import SentenceTransformer

EMBEDDING_MODEL_NAME = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
_model = None

def get_model():
    global _model
    if _model is None:
        try:
            _model = SentenceTransformer(EMBEDDING_MODEL_NAME, local_files_only=True)
        except Exception:
            _model = SentenceTransformer(EMBEDDING_MODEL_NAME)
    return _model

def get_query_embedding(query):
    m = get_model()
    prefix = "query: " if "e5" in EMBEDDING_MODEL_NAME.lower() else ""
    return m.encode(
        prefix + query,
        normalize_embeddings=True
    ).tolist()

def get_document_embedding(text):
    m = get_model()
    prefix = "passage: " if "e5" in EMBEDDING_MODEL_NAME.lower() else ""
    return m.encode(
        prefix + text,
        normalize_embeddings=True
    ).tolist()

def get_documents_embeddings(texts):
    m = get_model()
    prefix = "passage: " if "e5" in EMBEDDING_MODEL_NAME.lower() else ""
    passages = [prefix + text for text in texts]
    return m.encode(
        passages,
        normalize_embeddings=True
    ).tolist()