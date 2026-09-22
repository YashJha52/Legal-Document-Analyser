import os
import sys
from pathlib import Path
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer

BASE_DIR = Path(__file__).resolve().parent.parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from backend.utils.config import DATA_DIR
from backend.nlp.chunker import chunk_by_words

CHROMA_DB_DIR = os.path.join(DATA_DIR, "chroma_db")
TRAINING_FILES_DIR = os.path.join(BASE_DIR, "training_files", "supreme_court_judgments_txt")

def build_index():
    print(f"Initializing ChromaDB at {CHROMA_DB_DIR}...")
    os.makedirs(CHROMA_DB_DIR, exist_ok=True)
    
    client = chromadb.PersistentClient(path=CHROMA_DB_DIR, settings=Settings(allow_reset=True))
    collection = client.get_or_create_collection(name="indian_case_law")
    
    print("Loading embedding model (all-MiniLM-L6-v2)...")
    model = SentenceTransformer("all-MiniLM-L6-v2")
    
    years = [str(y) for y in range(2015, 2026)]
    doc_count = 0
    chunk_count = 0
    
    print("Starting indexing process...")
    for year in years:
        year_dir = os.path.join(TRAINING_FILES_DIR, year)
        if not os.path.isdir(year_dir):
            continue
            
        print(f"Processing year: {year}")
        files = os.listdir(year_dir)
        
        for filename in files[:20]:
            if not filename.endswith(".txt"):
                continue
                
            filepath = os.path.join(year_dir, filename)
            try:
                with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                    text = f.read()
            except Exception as e:
                print(f"Error reading {filepath}: {e}")
                continue
                
            chunks = chunk_by_words(text, chunk_size=300, chunk_overlap=50)
            chunk_texts = []
            chunk_ids = []
            chunk_metadatas = []
            
            for i, chunk_dict in enumerate(chunks):
                chunk_text = str(chunk_dict.get("text", ""))
                if len(chunk_text.strip()) < 50:
                    continue
                    
                chunk_texts.append(chunk_text)
                chunk_ids.append(f"{filename}_chunk_{i}")
                chunk_metadatas.append({
                    "source": filename,
                    "year": year,
                    "type": "supreme_court_judgment"
                })
            
            if chunk_texts:
                embeddings = model.encode(chunk_texts, show_progress_bar=False).tolist()
                collection.add(
                    documents=chunk_texts,
                    embeddings=embeddings,
                    metadatas=chunk_metadatas,
                    ids=chunk_ids
                )
                chunk_count += len(chunk_texts)
            
            doc_count += 1
            if doc_count % 10 == 0:
                print(f"Indexed {doc_count} documents, {chunk_count} chunks so far...")
                
    print(f"Indexing complete! Total documents: {doc_count}, Total chunks: {chunk_count}")

def retrieve_context(query, n_results=2):
    if not os.path.exists(CHROMA_DB_DIR):
        return ""
        
    try:
        client = chromadb.PersistentClient(path=CHROMA_DB_DIR)
        collection = client.get_collection(name="indian_case_law")
        model = SentenceTransformer("all-MiniLM-L6-v2")
        
        query_embedding = model.encode([query]).tolist()
        
        results = collection.query(
            query_embeddings=query_embedding,
            n_results=n_results
        )
        
        documents = results.get("documents")
        if not documents or not documents[0]:
            return ""
            
        metadatas = results.get("metadatas")
        meta_list = metadatas[0] if metadatas else []
        
        contexts = []
        for i, doc in enumerate(documents[0]):
            meta = meta_list[i] if meta_list and i < len(meta_list) and meta_list[i] else {}
            source = meta.get("source", "Unknown Case")
            year = meta.get("year", "Unknown Year")
            contexts.append(f"Case Context ({year} - {source}):\n{doc}")
            
        return "\n\n".join(contexts)
    except Exception as e:
        print(f"RAG Retrieval error: {e}")
        return ""

if __name__ == "__main__":
    build_index()
