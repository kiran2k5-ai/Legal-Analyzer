import requests
import os
import sys
import time
import random

API_BASE_URL = "http://127.0.0.1:8000"


def log_step(name):
    print("\n" + "=" * 60)
    print(f"STEP: {name}")
    print("=" * 60)

def main():
    print("Starting Integration Tests for Legal AI Document Analyzer...")
    print(f"Target API Base URL: {API_BASE_URL}")

    # Generate random email to avoid duplicate signup conflicts
    rand_id = random.randint(1000, 9999)
    test_email = f"user_{rand_id}@legalai-test.com"
    test_password = "SecurePassword123!"
    test_name = "Integration Test User"
    
    token = None
    doc_id = None
    filename = "SAMPLE-Lease-Agreement-Template.pdf"
    
    # Check if sample PDF file exists
    sample_pdf_path = os.path.join("backend", "uploads", filename)
    if not os.path.exists(sample_pdf_path):
        # Fallback to check parent uploads
        sample_pdf_path = os.path.join("uploads", filename)
        if not os.path.exists(sample_pdf_path):
            # Fallback to other file in uploads
            uploads_dir = os.path.join("backend", "uploads")
            if os.path.exists(uploads_dir):
                files = [f for f in os.listdir(uploads_dir) if f.lower().endswith(".pdf")]
                if files:
                    filename = files[0]
                    sample_pdf_path = os.path.join(uploads_dir, filename)

    print(f"Testing with PDF file: {sample_pdf_path}")
    if not os.path.exists(sample_pdf_path):
        print(f"Error: Could not locate a test PDF file. Please ensure e:/React/legaldocument/backend/uploads contains a PDF.")
        sys.exit(1)

    # ----------------------------------------------------
    # Step 1: User Signup
    # ----------------------------------------------------
    log_step("1. User Signup (/auth/signup)")
    signup_data = {
        "full_name": test_name,
        "email": test_email,
        "password": test_password
    }
    try:
        res = requests.post(f"{API_BASE_URL}/auth/signup", json=signup_data)
        print(f"Status Code: {res.status_code}")
        print(res.json())
        assert res.status_code == 200, "Signup failed"
        token = res.json().get("access_token")
        assert token is not None, "Token missing from signup response"
        print("Signup: SUCCESS")
    except Exception as e:
        print(f"Signup test failed: {e}")
        sys.exit(1)

    # ----------------------------------------------------
    # Step 2: User Login
    # ----------------------------------------------------
    log_step("2. User Login (/auth/login)")
    login_data = {
        "email": test_email,
        "password": test_password
    }
    try:
        res = requests.post(f"{API_BASE_URL}/auth/login", json=login_data)
        print(f"Status Code: {res.status_code}")
        print(res.json())
        assert res.status_code == 200, "Login failed"
        token = res.json().get("access_token")
        assert token is not None, "Token missing from login response"
        print("Login: SUCCESS")
    except Exception as e:
        print(f"Login test failed: {e}")
        sys.exit(1)

    # ----------------------------------------------------
    # Step 3: Document Upload & Indexing
    # ----------------------------------------------------
    log_step("3. Upload and Parse Document (/upload)")
    headers = {"Authorization": f"Bearer {token}"}
    try:
        with open(sample_pdf_path, "rb") as pdf_file:
            files = {"file": (filename, pdf_file, "application/pdf")}
            res = requests.post(f"{API_BASE_URL}/upload", files=files, headers=headers)
        
        print(f"Status Code: {res.status_code}")
        print(res.json())
        assert res.status_code == 200, "Upload failed"
        upload_res = res.json()
        doc_id = upload_res.get("doc_id")
        assert doc_id is not None, "doc_id missing from upload response"
        print("Upload & Parsing: SUCCESS")
    except Exception as e:
        print(f"Upload test failed: {e}")
        sys.exit(1)

    # ----------------------------------------------------
    # Step 4: List Documents
    # ----------------------------------------------------
    log_step("4. Fetch Document List (/documents)")
    try:
        res = requests.get(f"{API_BASE_URL}/documents", headers=headers)
        print(f"Status Code: {res.status_code}")
        print(res.json())
        assert res.status_code == 200, "Fetch document list failed"
        docs = res.json()
        assert any(d.get("doc_id") == doc_id for d in docs), "Uploaded document not in active library list"
        print("Fetch Document List: SUCCESS")
    except Exception as e:
        print(f"List documents test failed: {e}")
        sys.exit(1)

    # ----------------------------------------------------
    # Step 5: Document Summarization
    # ----------------------------------------------------
    log_step("5. Get Cached Executive Document Summary (/summary/{doc_id})")
    print("Warning: Running Ollama locally may take several seconds...")
    start_time = time.time()
    try:
        res = requests.get(f"{API_BASE_URL}/summary/{doc_id}", headers=headers)
        print(f"Status Code: {res.status_code}")
        summary_res = res.json()
        print(f"Summary: {summary_res.get('summary')[:300]}...")
        print(f"Duration: {time.time() - start_time:.2f} seconds")
        assert res.status_code == 200, "Summarize failed"
        assert "summary" in summary_res, "Summary text missing from response"
        print("Executive Summarize: SUCCESS")
    except Exception as e:
        print(f"Summarization test failed: {e}")
        sys.exit(1)

    # ----------------------------------------------------
    # Step 6: RAG Chat Verification
    # ----------------------------------------------------
    log_step("6. RAG Chat Query (/chat/)")
    chat_prompt = {
        "prompt": "What are the core obligations mentioned in the document?"
    }
    start_time = time.time()
    try:
        res = requests.post(f"{API_BASE_URL}/chat/", json=chat_prompt, headers=headers)
        print(f"Status Code: {res.status_code}")
        chat_res = res.json()
        print(f"Answer: {chat_res.get('answer')}")
        print("\nCitations returned:")
        for idx, cit in enumerate(chat_res.get("citations", [])):
            print(f"  [{idx+1}] File: {cit['document']} (Chunk {cit['chunk_index']}) - Confidence: {cit['confidence']}")
        print(f"Duration: {time.time() - start_time:.2f} seconds")
        assert res.status_code == 200, "Chat prompt failed"
        assert "answer" in chat_res, "Answer text missing from response"
        print("RAG Chat: SUCCESS")
    except Exception as e:
        print(f"RAG Chat test failed: {e}")
        sys.exit(1)

    # ----------------------------------------------------
    # Step 6.5: Chat History Verification
    # ----------------------------------------------------
    log_step("6.5. Verify Chat History (/chat/history)")
    try:
        res = requests.get(f"{API_BASE_URL}/chat/history", headers=headers)
        print(f"Fetch History Status Code: {res.status_code}")
        history = res.json()
        print(f"Fetched Messages: {len(history.get('messages', []))}")
        assert res.status_code == 200, "Get chat history failed"
        assert len(history.get("messages", [])) >= 2, "Chat history does not contain user and AI messages"
        
        res = requests.delete(f"{API_BASE_URL}/chat/history", headers=headers)
        print(f"Clear History Status Code: {res.status_code}")
        assert res.status_code == 200, "Delete chat history failed"
        
        res = requests.get(f"{API_BASE_URL}/chat/history", headers=headers)
        history_cleared = res.json()
        assert len(history_cleared.get("messages", [])) == 0, "Chat history not cleared successfully"
        print("Chat History Verification: SUCCESS")
    except Exception as e:
        print(f"Chat History test failed: {e}")
        sys.exit(1)


    # ----------------------------------------------------
    # Step 7: Delete Document
    # ----------------------------------------------------
    log_step("7. Delete Document and Clean Embeddings (/documents/{doc_id})")
    try:
        res = requests.delete(f"{API_BASE_URL}/documents/{doc_id}", headers=headers)
        print(f"Status Code: {res.status_code}")
        print(res.json())
        assert res.status_code == 200, "Delete document failed"
        
        # Verify it was removed from list
        res_list = requests.get(f"{API_BASE_URL}/documents", headers=headers)
        docs_list = res_list.json()
        assert not any(d.get("doc_id") == doc_id for d in docs_list), "Document still in library list after delete request"
        print("Delete Document: SUCCESS")
    except Exception as e:
        print(f"Delete document test failed: {e}")
        sys.exit(1)

    print("\n" + "=" * 60)
    print("ALL API INTEGRATION TESTS PASSED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    main()
