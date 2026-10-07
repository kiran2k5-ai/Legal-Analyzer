from sentence_transformers import SentenceTransformer

try:
    model = SentenceTransformer("intfloat/e5-base-v2", local_files_only=True)
except Exception:
    model = SentenceTransformer("intfloat/e5-base-v2")


def get_query_embedding(query):
    return model.encode(
        "query: " + query,
        normalize_embeddings=True
    ).tolist()


def get_document_embedding(text):
    return model.encode(
        "passage: " + text,
        normalize_embeddings=True
    ).tolist()


def get_documents_embeddings(texts):
    passages = ["passage: " + text for text in texts]
    return model.encode(
        passages,
        normalize_embeddings=True
    ).tolist()