from typing import List, Dict, Any, TypedDict
from pydantic import BaseModel, Field
from langgraph.graph import StateGraph, END
from langchain_core.prompts import ChatPromptTemplate
import config
from langchain_ollama import ChatOllama
from langchain_groq import ChatGroq

# Pydantic schemas for structured output
class ClinicalFacts(BaseModel):
    chronic_conditions: List[str] = Field(default=[], description="List of chronic medical conditions (e.g. Hypertension, Diabetes, Asthma).")
    allergies: List[str] = Field(default=[], description="List of known allergies (e.g. Penicillin, Peanuts).")
    current_medications: List[str] = Field(default=[], description="List of current medications (e.g. Lisinopril 10mg daily).")
    past_surgeries: List[str] = Field(default=[], description="List of past surgeries or major medical procedures (e.g. Appendectomy, CABG).")

class PatientSummary(BaseModel):
    chronic_conditions: List[str]
    allergies: List[str]
    current_medications: List[str]
    past_surgeries: List[str]
    clinical_summary: str

# Define state structure for LangGraph
class AgentState(TypedDict):
    patient_id: str
    documents: List[Dict[str, Any]]
    extracted_facts: Dict[str, Any]
    clinical_summary: str
    final_output: PatientSummary

class SummaryAgent:
    def __init__(self):
        # Initialize Google Gemini model if API key is set

        if config.LLM_PROVIDER == "ollama":
            self.llm = ChatOllama(
                model=config.OLLAMA_LLM_MODEL,
                base_url=config.OLLAMA_BASE_URL,
                temperature=0.2
            )
            print(f"[OK] SummaryAgent: Initialized ChatOllama with {config.OLLAMA_LLM_MODEL}")
        else:
            self.llm = ChatGroq(
                model=config.LLM_MODEL_NAME,
                groq_api_key=config.GROQ_API_KEY,
                temperature=0.2
            )
            print(f"[OK] SummaryAgent: Initialized ChatGroq with {config.LLM_MODEL_NAME}")

        self._build_graph()

    def _extract_facts_node(self, state: AgentState) -> Dict[str, Any]:
        """Node 1: Extract structured clinical facts from documents."""
        docs = state["documents"]
        context = "\n\n".join([doc["page_content"] for doc in docs])
        
        if not context.strip():
            return {
                "extracted_facts": {
                    "chronic_conditions": ["None documented"],
                    "allergies": ["None documented"],
                    "current_medications": ["None documented"],
                    "past_surgeries": ["None documented"]
                }
            }

        if not self.llm:
            # Fallback mock extraction
            return {
                "extracted_facts": {
                    "chronic_conditions": ["Hypertension (Mock)"],
                    "allergies": ["Penicillin (Mock)"],
                    "current_medications": ["Lisinopril 10mg (Mock)"],
                    "past_surgeries": ["Appendectomy (Mock)"]
                }
            }

        # Prompt for fact extraction
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are an expert clinical AI assistant. Extract structured patient clinical facts from the provided medical records. Keep list items short and concise. Do not guess; only extract facts mentioned in the text. If nothing is found, return an empty list for that category."),
            ("user", "Medical Records:\n{context}\n\nExtract the clinical facts:")
        ])
        
        # Use structured LLM binding
        structured_llm = self.llm.with_structured_output(ClinicalFacts)
        chain = prompt | structured_llm
        
        try:
            facts = chain.invoke({"context": context})
            return {"extracted_facts": facts.model_dump()}
        except Exception as e:
            print(f"Error in facts extraction: {e}")
            return {
                "extracted_facts": {
                    "chronic_conditions": ["Error in parsing"],
                    "allergies": ["Error in parsing"],
                    "current_medications": ["Error in parsing"],
                    "past_surgeries": ["Error in parsing"]
                }
            }

    def _summarize_node(self, state: AgentState) -> Dict[str, Any]:
        """Node 2: Generate clinical-grade triage summary based on documents and extracted facts."""
        docs = state["documents"]
        context = "\n\n".join([doc["page_content"] for doc in docs])
        facts = state["extracted_facts"]

        if not context.strip():
            return {
                "clinical_summary": "No medical history documents or notes have been uploaded for this patient. Please register their history or upload records."
            }

        if not self.llm:
            return {
                "clinical_summary": "Patient has a history of hypertension, managed with Lisinopril. Allergic to penicillin. Previous appendectomy. (Demo Summary Mode - Configure Gemini API key for live generation)"
            }

        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are a senior triage doctor. Write a concise, clinical-grade medical summary of the patient's records for use in an emergency department triage queue. Focus on critical warning signs, recent symptoms, active complaints, and relevant past medical history. Format the response cleanly in markdown. Avoid fluff, be direct, and use bullet points for readability. Limit to 3 paragraphs max."),
            ("user", "Medical Records:\n{context}\n\nStructured Facts Extracted:\n{facts}\n\nGenerate the summary:")
        ])

        chain = prompt | self.llm
        try:
            result = chain.invoke({
                "context": context,
                "facts": str(facts)
            })
            return {"clinical_summary": result.content}
        except Exception as e:
            print(f"Error generating summary: {e}")
            return {"clinical_summary": f"Failed to generate summary: {str(e)}"}

    def _compile_node(self, state: AgentState) -> Dict[str, Any]:
        """Node 3: Compile extracted facts and clinical summary into final payload."""
        facts = state["extracted_facts"]
        summary = state["clinical_summary"]
        
        final_output = PatientSummary(
            chronic_conditions=facts.get("chronic_conditions") or ["None documented"],
            allergies=facts.get("allergies") or ["None documented"],
            current_medications=facts.get("current_medications") or ["None documented"],
            past_surgeries=facts.get("past_surgeries") or ["None documented"],
            clinical_summary=summary
        )
        return {"final_output": final_output}

    def _build_graph(self):
        """Construct the LangGraph workflow graph."""
        builder = StateGraph(AgentState)
        
        # Add nodes
        builder.add_node("extract_facts", self._extract_facts_node)
        builder.add_node("generate_summary", self._summarize_node)
        builder.add_node("compile_output", self._compile_node)
        
        # Add transitions
        builder.set_entry_point("extract_facts")
        builder.add_edge("extract_facts", "generate_summary")
        builder.add_edge("generate_summary", "compile_output")
        builder.add_edge("compile_output", END)
        
        # Compile graph
        self.graph = builder.compile()
        print("[OK] LangGraph Summary Agent compiled successfully")

    def run_agent(self, patient_id: str, retrieved_docs: List[Dict[str, Any]]) -> PatientSummary:
        """Run the compiled LangGraph workflow."""
        inputs = {
            "patient_id": patient_id,
            "documents": retrieved_docs,
            "extracted_facts": {},
            "clinical_summary": ""
        }
        
        result = self.graph.invoke(inputs)
        return result["final_output"]
