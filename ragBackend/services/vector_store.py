from typing import List, Dict, Any
from langchain_community.vectorstores import Chroma
import config

class VectorStoreService:
    def __init__(self):
        # Initialize the embedding function
        if config.USE_GEMINI_EMBEDDINGS:
            try:
                from langchain_google_genai import GoogleGenerativeAIEmbeddings
                self.embeddings = GoogleGenerativeAIEmbeddings(
                    model=config.EMBEDDING_MODEL_NAME,
                    google_api_key=config.GEMINI_API_KEY
                )
                print(f"[OK] Initialized Google Generative AI Embeddings: {config.EMBEDDING_MODEL_NAME}")
            except Exception as e:
                print(f"[WARN] Failed to load Gemini Embeddings, falling back to local sentence-transformers: {e}")
                self._load_fallback_embeddings()
        else:
            self._load_fallback_embeddings()

        # Initialize ChromaDB client
        self.vector_store = Chroma(
            persist_directory=config.CHROMA_DB_DIR,
            embedding_function=self.embeddings
        )
        print(f"[OK] ChromaDB persistence initialized at: {config.CHROMA_DB_DIR}")

    def _load_fallback_embeddings(self):
        try:
            from langchain_community.embeddings import HuggingFaceEmbeddings
            self.embeddings = HuggingFaceEmbeddings(
                model_name="sentence-transformers/all-MiniLM-L6-v2"
            )
            print("[OK] Initialized local HuggingFace Embeddings: sentence-transformers/all-MiniLM-L6-v2")
        except Exception as e:
            print(f"[WARN] Failed to load HuggingFace Embeddings: {e}")
            print("[INFO] Falling back to lightweight MockEmbeddings class for test environment...")
            class MockEmbeddings:
                def embed_documents(self, texts: List[str]) -> List[List[float]]:
                    import random
                    random.seed(42)
                    return [[random.random() for _ in range(384)] for _ in texts]

                def embed_query(self, text: str) -> List[float]:
                    import random
                    random.seed(42)
                    return [random.random() for _ in range(384)]
            self.embeddings = MockEmbeddings()
            print("[OK] Initialized MockEmbeddings (384-dimensional random vectors)")

    def add_patient_documents(self, patient_id: str, documents: List[Dict[str, Any]]):
        """Add chunks to vector database with patient_id metadata filter."""
        if not documents:
            return
        
        texts = [doc["page_content"] for doc in documents]
        metadatas = [doc["metadata"] for doc in documents]
        
        # Ensure all metadatas have patient_id
        for meta in metadatas:
            meta["patient_id"] = patient_id

        self.vector_store.add_texts(texts=texts, metadatas=metadatas)
        print(f"Indexed {len(texts)} document chunks for patient {patient_id}")

    def retrieve_patient_documents(self, patient_id: str, query: str = "medical history symptoms allergies medications chronic conditions", k: int = 6) -> List[Dict[str, Any]]:
        """Retrieve most relevant chunks for a specific patient using metadata filtering."""
        # Query ChromaDB with patient_id filter
        results = self.vector_store.similarity_search(
            query,
            k=k,
            filter={"patient_id": patient_id}
        )
        
        retrieved_docs = []
        for doc in results:
            retrieved_docs.append({
                "page_content": doc.page_content,
                "metadata": doc.metadata
            })
        return retrieved_docs
