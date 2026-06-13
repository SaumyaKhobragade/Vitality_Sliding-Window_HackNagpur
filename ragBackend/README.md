# Vitality RAG Medical History Backend — Setup & API Reference

This document provides a comprehensive guide on setting up, configuring, and running the FastAPI-based RAG (Retrieval-Augmented Generation) medical history backend. It includes setup commands, configuration specs, file formats, and detailed schema specifications for all API endpoints.

---

## 1. Setup & Installation Commands

Follow these steps to set up the environment and run the backend server.

### Prerequisite Checklist
* **Python**: 3.10 to 3.12 (recommended)
* **API Keys**:
  * **Google Gemini API Key** (for generating query and chunk vector embeddings via `models/gemini-embedding-001`)
  * **Groq API Key** (for fast LangGraph-driven clinical facts extraction and summarization via `llama-3.3-70b-versatile`)

### Command Sequence

#### Step 1: Clone or Navigate to the Directory
```bash
cd d:\Vitality_Sliding-Window_HackNagpur\ragBackend
```

#### Step 2: Create a Virtual Environment
```bash
# Windows (PowerShell/CMD)
python -m venv venv

# macOS/Linux
python3 -m venv venv
```

#### Step 3: Activate the Virtual Environment
```bash
# Windows (PowerShell)
.\venv\Scripts\Activate.ps1

# Windows (Command Prompt)
.\venv\Scripts\activate.bat

# macOS/Linux
source venv/bin/activate
```

#### Step 4: Install Dependencies
Install the required base dependencies along with the integration packages for Groq and OpenAI compatibility:
```bash
pip install -r requirements.txt
pip install langchain-groq langchain-openai
```

#### Step 5: Start the Backend Server
Run the Uvicorn ASGI server to host the API locally:
```bash
# Using Python to trigger uvicorn
.\venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8002 --reload
```

---

## 2. Configuration Files Schema

The backend uses two main files for configuration: `.env` and `config.py`.

### `.env` File Schema
Create a `.env` file in the root of the `ragBackend` directory with the following variables:

```ini
# Google Gemini API key for embeddings
GEMINI_API_KEY="AIzaSy..."

# Groq API key for LLM summarization and structured clinical extraction
GROQ_API_KEY="gsk_..."

# Server configuration options
HOST=0.0.0.0
PORT=8002
```

### `config.py` Properties
Located at [config.py](file:///d:/Vitality_Sliding-Window_HackNagpur/ragBackend/config.py), this file defines variables loaded by the system services:

| Config Variable | Default Value | Description |
|---|---|---|
| `CHROMA_DB_DIR` | `./chroma_db` | Persistent directory path for ChromaDB files |
| `USE_GEMINI_EMBEDDINGS` | `True` (if `GEMINI_API_KEY` present) | Falls back to local `all-MiniLM-L6-v2` if `False` |
| `EMBEDDING_MODEL_NAME` | `"models/gemini-embedding-001"` | The vector model used for index/query embedding |
| `LLM_MODEL_NAME` | `"llama-3.3-70b-versatile"` | The model ID used by Groq for LangGraph logic |
| `CHUNK_SIZE` | `800` | Segment character length for parsing text chunks |
| `CHUNK_OVERLAP` | `150` | Overlap character length between sequential chunks |

---

## 3. API Route Schemas

The application exposes 3 REST API endpoints.

### 1. `GET /health`
Verifies the status of the backend and lists the active models.

* **Response Payload (JSON)**:
```json
{
  "status": "healthy",
  "use_gemini_embeddings": true,
  "embedding_model": "models/gemini-embedding-001",
  "llm_model": "llama-3.3-70b-versatile"
}
```

---

### 2. `POST /api/patients/{patient_id}/history`
Ingests clinical text notes and/or uploaded medical files, splits them into semantic chunks, embeds them, and persists them to ChromaDB.

* **URL Parameters**:
  * `patient_id` (string, path parameter): Unique identifier for the patient.
* **Request Format**: `multipart/form-data`
  * `text` (string, form field, optional): Raw clinical notes.
  * `files` (file binary, form field, optional): Supports multiple uploaded files.

* **Supported File Types**:
  * `.pdf` (Portable Document Format)
  * `.docx` / `.doc` (Microsoft Word)
  * `.txt` (Plain Text)

* **Response Payload (JSON - Success)**:
```json
{
  "status": "success",
  "message": "Successfully ingested 3 chunks of medical history for patient pt-demo-42.",
  "chunks_count": 3
}
```

* **Response Payload (JSON - Error)**:
```json
{
  "detail": "No medical history notes or files were provided."
}
```

---

### 3. `GET /api/patients/{patient_id}/summary`
Retrieves relevant context chunks from the Chroma vector database, executes the LangGraph clinical facts agent, and returns a structured clinical summary.

* **URL Parameters**:
  * `patient_id` (string, path parameter): Patient ID to retrieve and summarize.

* **Response Payload (JSON - Success)**:
```json
{
  "patient_id": "pt-demo-42",
  "chronic_conditions": [
    "Type 2 Diabetes Mellitus",
    "Hypertension"
  ],
  "allergies": [
    "Penicillin",
    "Sulfa drugs"
  ],
  "current_medications": [
    "Metformin 1000mg twice daily",
    "Amlodipine 5mg once daily",
    "Atorvastatin 40mg at night"
  ],
  "past_surgeries": [
    "Cholecystectomy",
    "Left knee arthroscopy"
  ],
  "clinical_summary": "### Patient Summary\nPatient Jane Smith presents with a history of Type 2 Diabetes Mellitus and Hypertension...",
  "retrieved_snippets": [
    "Patient Jane Smith, 52 years old. Known chronic conditions: Type 2 Diabetes Mellitus (since 2015)..."
  ]
}
```

* **Response Payload (JSON - Graceful Empty State)**:
Returned if no documents or text notes exist for the requested `patient_id`:
```json
{
  "patient_id": "nonexistent-patient-123",
  "chronic_conditions": [
    "None documented"
  ],
  "allergies": [
    "None documented"
  ],
  "current_medications": [
    "None documented"
  ],
  "past_surgeries": [
    "None documented"
  ],
  "clinical_summary": "No medical records found for this patient. Please ensure history was submitted correctly.",
  "retrieved_snippets": []
}
```

---

## 4. Database Schema (ChromaDB Vector Store)

ChromaDB is a document-oriented database. Inside `chroma_db`, documents are stored as:
1. **`page_content`**: The raw text segment (max 800 characters, overlap 150 characters).
2. **`metadata`**: A structured JSON object mapped to each segment:
   ```json
   {
     "patient_id": "pt-demo-42",
     "source": "direct_input" | "file_upload",
     "filename": "medical_report.pdf",
     "chunk_index": 0
   }
   ```
This metadata allows the retrieval layer to filter queries scoped specifically to `{"patient_id": patient_id}` before finding the nearest vector neighbors.
