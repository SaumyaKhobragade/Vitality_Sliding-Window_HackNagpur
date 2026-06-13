import os
from pathlib import Path
from dotenv import load_dotenv

# Load env variables from .env file
load_dotenv()

# Base directories
BASE_DIR = Path(__file__).resolve().parent
CHROMA_DB_DIR = str(BASE_DIR / "chroma_db")

# API Keys
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

# RAG Configuration
# Use Gemini's embedding model if API key is set, otherwise fall back to local sentence-transformers
USE_GEMINI_EMBEDDINGS = bool(GEMINI_API_KEY)
EMBEDDING_MODEL_NAME = "models/gemini-embedding-001" if USE_GEMINI_EMBEDDINGS else "all-MiniLM-L6-v2"

# LLM Configuration
LLM_MODEL_NAME = "llama-3.3-70b-versatile"  # Groq model

# Document Processing
CHUNK_SIZE = 800
CHUNK_OVERLAP = 150

# Server Settings
HOST = "0.0.0.0"
PORT = 8002
