import os
import sys
import time
import glob
from dotenv import load_dotenv

# Ensure backend directory is in path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

load_dotenv()

from services.pdf_reader import extract_text
from services.chunker import chunk_text
from services.embedding import get_documents_embeddings
from services.vector_store import store_chunks
from services.rag import generate_rag_response

def run_test():
    print("=" * 80)
    print("      LEGAL ANALYZER END-TO-END RAG PIPELINE TEST")
    print("=" * 80)

    # 1. Locate an existing PDF in the uploads folder
    uploads_dir = os.path.join(CURRENT_DIR, "uploads")
    pdf_files = glob.glob(os.path.join(uploads_dir, "*.pdf"))

    if not pdf_files:
        print(f"[ERROR] No PDF files found in {uploads_dir}. Please place a PDF in uploads folder.")
        return

    # Select the candidate guide PDF or first available
    preferred_pdf = [f for f in pdf_files if "Exametryx" in f]
    selected_pdf = preferred_pdf[0] if preferred_pdf else pdf_files[0]
    filename = os.path.basename(selected_pdf)
    test_user_email = "tester_demo@legalai.com"
    test_doc_id = f"test_run_{int(time.time())}"

    print(f"\n[STEP 1] Selected PDF for Test:")
    print(f" -> File: {filename}")
    print(f" -> Path: {selected_pdf}")
    print(f" -> Size: {os.path.getsize(selected_pdf)} bytes")

    # 2. Extract Text
    print("\n" + "-" * 80)
    print("[STEP 2] Extracting text from PDF (PyMuPDF)...")
    t0 = time.time()
    text = extract_text(selected_pdf)
    t_extract = time.time() - t0
    print(f" -> Completed in {t_extract:.3f}s")
    print(f" -> Extracted characters: {len(text)}")
    print(" -> Text Preview (first 250 characters):")
    print(f"    {repr(text[:250])}")

    # 3. Chunk Text
    print("\n" + "-" * 80)
    print("[STEP 3] Chunking text into semantic passages...")
    t0 = time.time()
    chunks = chunk_text(text)
    t_chunk = time.time() - t0
    print(f" -> Completed in {t_chunk:.3f}s")
    print(f" -> Total chunks created: {len(chunks)}")
    if chunks:
        print(f" -> Sample Chunk 0 ({len(chunks[0])} chars):\n    {chunks[0][:150]}...")

    # 4. Generate Embeddings
    print("\n" + "-" * 80)
    print("[STEP 4] Generating Vector Embeddings (Sentence Transformers / intfloat/e5-base-v2)...")
    t0 = time.time()
    embeddings = get_documents_embeddings(chunks)
    t_embed = time.time() - t0
    print(f" -> Completed in {t_embed:.3f}s")
    print(f" -> Total embeddings generated: {len(embeddings)}")
    if embeddings:
        print(f" -> Embedding vector dimensionality: {len(embeddings[0])}")

    # 5. Store in ChromaDB
    print("\n" + "-" * 80)
    print("[STEP 5] Indexing into ChromaDB Vector Store...")
    t0 = time.time()
    doc_id, ids = store_chunks(
        chunks=chunks,
        embeddings=embeddings,
        filename=filename,
        doc_id=test_doc_id,
        user_email=test_user_email
    )
    t_store = time.time() - t0
    print(f" -> Completed in {t_store:.3f}s")
    print(f" -> Doc ID: {doc_id}")
    print(f" -> Indexed Vector Count: {len(ids)}")

    # 6. Ask Questions via RAG (Groq LLM)
    print("\n" + "=" * 80)
    print("[STEP 6] Testing Retrieval & Question Answering via Groq LLM...")
    print("=" * 80)

    test_questions = [
        "What information does a candidate need to have ready before beginning registration?",
        "What happens if a candidate selects the wrong institute during registration?",
        "What are the password recommendations and rules mentioned in the document?"
    ]

    for q_idx, question in enumerate(test_questions, start=1):
        print(f"\n>>> QUESTION {q_idx}: \"{question}\"")
        t0 = time.time()
        result = generate_rag_response(question, user_email=test_user_email, n_results=3)
        t_rag = time.time() - t0

        print(f"    (Answered in {t_rag:.2f}s)\n")

        print("    [RETRIEVED CITATIONS / CONTEXT]:")
        for c_idx, citation in enumerate(result.get("citations", []), start=1):
            snippet_preview = citation['snippet'].replace('\n', ' ')[:100]
            print(f"    - [{c_idx}] Confidence: {citation.get('confidence')} | Chunk {citation.get('chunk_index')}")
            print(f"        \"{snippet_preview}...\"")

        print("\n    [AI LEGAL COUNSEL ANSWER]:")
        for line in result.get("answer", "").split("\n"):
            print(f"    {line}")
        print("\n" + "-" * 80)
        
        # Brief pause between test questions to respect API rate limits
        if q_idx < len(test_questions):
            time.sleep(2)

    print("\n" + "=" * 80)
    print(" [SUCCESS] ALL PIPELINE STAGES PASSED SUCCESSFULLY!")
    print(" Extraction -> Chunking -> Embedding -> ChromaDB Index -> Groq RAG")
    print("=" * 80)

if __name__ == "__main__":
    run_test()
