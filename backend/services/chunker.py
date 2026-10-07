try:
    from langchain_text_splitters import RecursiveCharacterTextSplitter
    HAS_LANGCHAIN = True
except ImportError:
    HAS_LANGCHAIN = False

def chunk_text(text: str):
    if HAS_LANGCHAIN:
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=100,
            separators=[
                "\n\n",
                "\n",
                ". ",
                " ",
                ""
            ]
        )
        return splitter.split_text(text)
    
    # Pure Python fallback splitter if langchain is unavailable
    chunks = []
    chunk_size = 500
    overlap = 100
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        if chunk.strip():
            chunks.append(chunk)
        start += (chunk_size - overlap)
    return chunks