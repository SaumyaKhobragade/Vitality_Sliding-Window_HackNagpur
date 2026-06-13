from groq.types import batch_retrieve_response
from IPython.testing import skipdoctest
from IPython.testing import skipdoctest
import os
import uvicorn
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import config
from services.document_processor import DocumentProcessor
from services.vector_store import VectorStoreService
from services.summary_agent import SummaryAgent, PatientSummary
from services.risk_agent import RiskAgent, RiskAssessment, RiskFlag

# Initialize FastAPI app
app = FastAPI(
    title="Vitality RAG Medical History Backend",
    description="RAG service to store and synthesize patient medical histories using LangChain, LangGraph, and ChromaDB.",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Services
doc_processor = DocumentProcessor()
vector_store_service = VectorStoreService()
summary_agent = SummaryAgent()
risk_agent = RiskAgent()

class SummaryResponse(BaseModel):
    patient_id: str
    chronic_conditions: List[str]
    allergies: List[str]
    current_medications: List[str]
    past_surgeries: List[str]
    clinical_summary: str
    retrieved_snippets: List[str]

class RiskFlagResponse(BaseModel):
    risk_type: str
    severity: str
    description: str
    implicated_items: List[str]

class RiskResponse(BaseModel):
    patient_id: str
    safe_to_prescribe: bool
    summary_note: str
    risk_flags: List[RiskFlagResponse]

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "use_gemini_embeddings": config.USE_GEMINI_EMBEDDINGS,
        "embedding_model": config.EMBEDDING_MODEL_NAME,
        "llm_model": config.LLM_MODEL_NAME
    }

@app.post("/api/patients/{patient_id}/history")
async def ingest_patient_history(
    patient_id: str,
    text: Optional[str] = Form(None),
    files: Optional[List[UploadFile]] = File(None)
):
    """
    Ingests plain text and uploaded files for a patient, chunking and storing them in ChromaDB.
    """
    all_chunks = []
    
    # 1. Process plain text notes if provided
    if text and text.strip():
        print(f"Processing text notes for patient: {patient_id}")
        text_metadata = {"source": "direct_input", "patient_id": patient_id}
        text_chunks = doc_processor.chunk_text(text, text_metadata)
        all_chunks.extend(text_chunks)

    # 2. Process uploaded files if provided
    if files:
        for file in files:
            if not file.filename:
                continue
            print(f"Processing file {file.filename} for patient: {patient_id}")
            try:
                file_bytes = await file.read()
                file_text = doc_processor.extract_text(file.filename, file_bytes)
                
                file_metadata = {
                    "source": "file_upload",
                    "filename": file.filename,
                    "patient_id": patient_id
                }
                file_chunks = doc_processor.chunk_text(file_text, file_metadata)
                all_chunks.extend(file_chunks)
            except Exception as e:
                print(f"Failed to process file {file.filename}: {e}")
                raise HTTPException(status_code=400, detail=f"Failed to process file {file.filename}: {str(e)}")

    if not all_chunks:
        raise HTTPException(
            status_code=400,
            detail="No medical history notes or files were provided."
        )

    # 3. Add to ChromaDB vector store
    try:
        vector_store_service.add_patient_documents(patient_id, all_chunks)
    except Exception as e:
        print(f"Failed to index documents: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to index medical records: {str(e)}")

    return {
        "status": "success",
        "message": f"Successfully ingested {len(all_chunks)} chunks of medical history for patient {patient_id}.",
        "chunks_count": len(all_chunks)
    }

@app.get("/api/patients/{patient_id}/retrieve")
def get_patient_details(patient_id: str):
    retrieved_docs = vector_store_service.retrieve_patient_documents(patient_id, k=8)
        
        # If no documents are found, return empty fields but don't error out
    if not retrieved_docs:
        return SummaryResponse(
            patient_id=patient_id,
            chronic_conditions=["None documented"],
            allergies=["None documented"],
            current_medications=["None documented"],
            past_surgeries=["None documented"],
            clinical_summary="No medical records found for this patient. Please ensure history was submitted correctly.",
            retrieved_snippets=[]
        )
    
    return retrieved_docs[0]
@app.get("/api/patients/{patient_id}/summary", response_model=SummaryResponse)
def get_patient_summary(patient_id: str):
    """
    Retrieves the patient's records, runs the LangGraph summary agent, and returns the structured summary.
    """
    try:
        # 1. Retrieve patient documents from ChromaDB
        retrieved_docs = vector_store_service.retrieve_patient_documents(patient_id, k=8)
        
        # If no documents are found, return empty fields but don't error out
        if not retrieved_docs:
            return SummaryResponse(
                patient_id=patient_id,
                chronic_conditions=["None documented"],
                allergies=["None documented"],
                current_medications=["None documented"],
                past_surgeries=["None documented"],
                clinical_summary="No medical records found for this patient. Please ensure history was submitted correctly.",
                retrieved_snippets=[]
            )
            
        # 2. Run the LangGraph summary agent
        agent_output = summary_agent.run_agent(patient_id, retrieved_docs)
        
        # 3. Extract source text snippets for doctor reference
        snippets = [doc["page_content"] for doc in retrieved_docs]

        return SummaryResponse(
            patient_id=patient_id,
            chronic_conditions=agent_output.chronic_conditions,
            allergies=agent_output.allergies,
            current_medications=agent_output.current_medications,
            past_surgeries=agent_output.past_surgeries,
            clinical_summary=agent_output.clinical_summary,
            retrieved_snippets=snippets
        )
    except Exception as e:
        print(f"Error compiling patient summary: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to compile medical summary: {str(e)}"
        )

@app.get("/api/patients/{patient_id}/risks", response_model=RiskResponse)
def get_patient_risks(patient_id: str):
    """
    Runs the summary agent first, then passes the result to the RiskAgent
    to identify dangerous medications, interactions, contraindications, and allergies.
    Returns a structured, token-efficient risk assessment.
    """
    try:
        # 1. Retrieve documents
        retrieved_docs = vector_store_service.retrieve_patient_documents(patient_id, k=8)

        if not retrieved_docs:
            return RiskResponse(
                patient_id=patient_id,
                safe_to_prescribe=True,
                summary_note="No medical records found. Risk assessment skipped.",
                risk_flags=[]
            )

        # 2. Run summary agent to get structured patient facts
        summary = summary_agent.run_agent(patient_id, retrieved_docs)

        # 3. Pass summary output into risk agent
        assessment: RiskAssessment = risk_agent.run_agent(
            patient_id=patient_id,
            chronic_conditions=summary.chronic_conditions,
            allergies=summary.allergies,
            current_medications=summary.current_medications,
            past_surgeries=summary.past_surgeries,
            clinical_summary=summary.clinical_summary,
        )

        return RiskResponse(
            patient_id=patient_id,
            safe_to_prescribe=assessment.safe_to_prescribe,
            summary_note=assessment.summary_note,
            risk_flags=[
                RiskFlagResponse(
                    risk_type=f.risk_type,
                    severity=f.severity,
                    description=f.description,
                    implicated_items=f.implicated_items,
                )
                for f in assessment.risk_flags
            ]
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Risk assessment failed: {str(e)}"
        )


if __name__ == "__main__":
    print("......")
    uvicorn.run("main:app", host=config.HOST, port=config.PORT, reload=True)
