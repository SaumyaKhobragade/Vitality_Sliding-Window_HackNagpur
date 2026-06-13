from typing import List, Dict, Any, TypedDict, Optional
from pydantic import BaseModel, Field
from langgraph.graph import StateGraph, END
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
import config


# ── Pydantic output schema ────────────────────────────────────────────────────

class RiskFlag(BaseModel):
    risk_type: str = Field(description="Category: ALLERGY | INTERACTION | CONTRAINDICATION | DUPLICATE | OTHER")
    severity: str = Field(description="HIGH | MEDIUM | LOW")
    description: str = Field(description="One-line explanation of the risk.")
    implicated_items: List[str] = Field(description="Specific drugs, conditions, or allergens involved.")

class RiskAssessment(BaseModel):
    risk_flags: List[RiskFlag] = Field(default=[], description="Ordered list of identified risks (highest severity first).")
    safe_to_prescribe: bool = Field(description="True only if zero HIGH-severity flags exist.")
    summary_note: str = Field(description="1–2 sentence clinical note for the attending physician.")


# ── LangGraph state ───────────────────────────────────────────────────────────

class RiskAgentState(TypedDict):
    patient_id: str
    chronic_conditions: List[str]
    allergies: List[str]
    current_medications: List[str]
    past_surgeries: List[str]
    clinical_summary: str
    risk_assessment: Optional[RiskAssessment]


# ── Agent class ───────────────────────────────────────────────────────────────

class RiskAgent:
    """
    LangGraph agent that takes a PatientSummary and flags prescription risks:
    - Allergy conflicts with candidate / current medications
    - Drug–drug interactions among current medications
    - Medications contraindicated by the patient's chronic conditions
    - Duplicate / redundant prescriptions
    """

    SYSTEM_PROMPT = (
        "You are a clinical pharmacovigilance AI embedded in a hospital triage system. "
        "Your ONLY job is to identify prescription safety risks from a patient's medical summary. "
        "Rules:\n"
        "- Be concise. Each risk flag must fit in ONE line.\n"
        "- Classify severity strictly: HIGH = immediate danger / anaphylaxis / lethal interaction; "
        "MEDIUM = significant risk requiring physician attention; LOW = minor / monitor.\n"
        "- risk_type must be exactly one of: ALLERGY, INTERACTION, CONTRAINDICATION, DUPLICATE, OTHER.\n"
        "- implicated_items lists only the specific drugs/conditions involved (≤4 items).\n"
        "- summary_note is ≤2 sentences for the attending physician.\n"
        "- If no risks exist, return an empty risk_flags list and safe_to_prescribe=true.\n"
        "- Do NOT add explanatory prose outside the structured output."
    )

    def __init__(self):
        self.llm = ChatGroq(
            model=config.LLM_MODEL_NAME,
            groq_api_key=config.GROQ_API_KEY,
            temperature=0.0,   # deterministic for safety-critical output
            max_tokens=512,    # keep token usage low; output is structured and short
        )
        print(f"[OK] RiskAgent: Initialized ChatGroq with {config.LLM_MODEL_NAME}")
        self._build_graph()

    # ── Graph nodes ───────────────────────────────────────────────────────────

    def _assess_risks_node(self, state: RiskAgentState) -> Dict[str, Any]:
        """Single node: call LLM with structured output to produce RiskAssessment."""
        # Build a compact patient context string
        context_lines = [
            f"Chronic conditions: {', '.join(state['chronic_conditions']) or 'None'}",
            f"Known allergies:     {', '.join(state['allergies']) or 'None'}",
            f"Current medications: {', '.join(state['current_medications']) or 'None'}",
            f"Past surgeries:      {', '.join(state['past_surgeries']) or 'None'}",
            f"Clinical summary:\n{state['clinical_summary']}",
        ]
        patient_context = "\n".join(context_lines)

        prompt = ChatPromptTemplate.from_messages([
            ("system", self.SYSTEM_PROMPT),
            ("user",
             "Analyse the patient profile below and return a RiskAssessment.\n\n"
             "{patient_context}")
        ])

        structured_llm = self.llm.with_structured_output(RiskAssessment)
        chain = prompt | structured_llm

        try:
            result: RiskAssessment = chain.invoke({"patient_context": patient_context})
            return {"risk_assessment": result}
        except Exception as e:
            print(f"[RiskAgent] Error during risk assessment: {e}")
            # Safe fallback – flag that assessment failed so clinicians aren't misled
            fallback = RiskAssessment(
                risk_flags=[
                    RiskFlag(
                        risk_type="OTHER",
                        severity="HIGH",
                        description="Automated risk assessment failed; manual review required.",
                        implicated_items=[]
                    )
                ],
                safe_to_prescribe=False,
                summary_note=(
                    f"Risk analysis could not be completed automatically ({str(e)[:80]}). "
                    "A pharmacist or senior clinician must review before prescribing."
                )
            )
            return {"risk_assessment": fallback}

    # ── Graph construction ────────────────────────────────────────────────────

    def _build_graph(self):
        builder = StateGraph(RiskAgentState)
        builder.add_node("assess_risks", self._assess_risks_node)
        builder.set_entry_point("assess_risks")
        builder.add_edge("assess_risks", END)
        self.graph = builder.compile()
        print("[OK] LangGraph Risk Agent compiled successfully")

    # ── Public API ────────────────────────────────────────────────────────────

    def run_agent(
        self,
        patient_id: str,
        chronic_conditions: List[str],
        allergies: List[str],
        current_medications: List[str],
        past_surgeries: List[str],
        clinical_summary: str,
    ) -> RiskAssessment:
        """Run the risk agent and return a structured RiskAssessment."""
        inputs: RiskAgentState = {
            "patient_id": patient_id,
            "chronic_conditions": chronic_conditions,
            "allergies": allergies,
            "current_medications": current_medications,
            "past_surgeries": past_surgeries,
            "clinical_summary": clinical_summary,
            "risk_assessment": None,
        }
        result = self.graph.invoke(inputs)
        return result["risk_assessment"]
