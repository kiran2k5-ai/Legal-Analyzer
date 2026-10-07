from services.vector_store import collection
from services.embedding import get_query_embedding


def retrieve_chunks(query, user_email, n_results=3):
    query_embedding = get_query_embedding(query)

    results = collection.query(
        query_embeddings=[query_embedding],
        where={"user_email": user_email},
        n_results=n_results
    )

    return results