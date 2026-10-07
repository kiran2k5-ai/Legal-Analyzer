from services.retriever import retrieve_chunks
from services.llm import generate_text

def generate_rag_response(query: str, user_email: str, n_results: int = 4) -> dict:
    # 1. Retrieve relevant chunks
    try:
        retrieval_results = retrieve_chunks(query, user_email=user_email, n_results=n_results)
    except Exception as e:
        print(f"Error during retrieval: {e}")
        return {
            "answer": "Error: Failed to retrieve document context from the vector database.",
            "citations": []
        }
    
    # 2. Extract texts and metadata
    documents = retrieval_results.get("documents", [[]])[0] if retrieval_results.get("documents") else []
    metadatas = retrieval_results.get("metadatas", [[]])[0] if retrieval_results.get("metadatas") else []
    distances = retrieval_results.get("distances", [[]])[0] if retrieval_results.get("distances") else []
    
    if not documents:
        return {
            "answer": "I have no reference documents in my knowledge base. Please upload a PDF legal document first to ask questions.",
            "citations": []
        }
    
    # 3. Construct Context and Citations list
    context_parts = []
    citations = []
    
    for doc_text, meta, distance in zip(documents, metadatas, distances):
        # Cosine distance = 1 - similarity
        similarity = round(1.0 - distance, 4)
        
        doc_name = meta.get("document", "Unknown Document")
        chunk_idx = meta.get("chunk_index", 0)
        
        context_parts.append(f"Source: {doc_name} (Chunk {chunk_idx})\nContent:\n{doc_text}\n---")
        
        citations.append({
            "document": doc_name,
            "chunk_index": chunk_idx,
            "snippet": doc_text,
            "confidence": similarity
        })
        
    context_str = "\n".join(context_parts)
    
    # 4. Construct LLM prompt
    system_instruction = (
        "You are an expert AI Legal Counsel. Your task is to answer the user's question by combining "
        "the specific details fetched from their uploaded document with your general legal knowledge, analysis, and reasoning.\n\n"
        "Guidelines:\n"
        "1. Prioritize and focus on details found in the provided snippets. Refer to specific clauses, numbers, or rules from the text.\n"
        "2. Supplement and enrich the response by adding general legal definitions, context, and standard legal practices related to the topic.\n"
        "3. Keep the tone highly professional, precise, and advisory.\n"
        "4. Clearly specify what details are extracted from the document versus what is standard legal context or general knowledge added by you."
    )

    
    prompt = f"User Question: {query}\n\nHere are the relevant excerpts from the legal documents:\n\n{context_str}\n\nAnswer the question based only on these excerpts:"
    
    # 5. Generate RAG answer
    answer = generate_text(prompt, system_instruction=system_instruction)
    
    return {
        "answer": answer,
        "citations": citations
    }
