# Vitality System: Gap Analysis & Roadmap

**Date:** Sunday, 1 February 2026
**Reference Documents:**
*   `prd.md` (v2.0)
*   `BACKEND_IMPLEMENTATION_STATUS.md` (v1.0)
*   `FRONTEND_IMPLEMENTATION_STATUS.md` (v1.0)

## 1. Executive Summary

The Vitality system has achieved a **High Degree of Completion** regarding its core architectural goals: Multi-hospital coordination, real-time distributed triage, and simulation capabilities are functional. The system operates effectively as a decentralized execution model with centralized intelligence.

**Critical Gaps** lie primarily in the "Policy-as-Code" flexibility (currently hardcoded on backend) and the strict "Human-in-the-Loop" (HITL) workflows required for ethical compliance. The frontend is slightly ahead of the backend in terms of Policy UI, creating an integration gap.

---

## 2. Feature Comparison Matrix

| Feature Category | PRD Requirement | Backend Status | Frontend Status | Gap / Discrepancy |
| :--- | :--- | :--- | :--- | :--- |
| **Core Triage** | Priority Formula (Severity + Wait + Distress) | ✅ **Implemented** (`Patient.java`) | ✅ **Implemented** (Dashboard/Queue view) | None. |
| **Orchestration** | Multi-hospital coordination & Redirection | ✅ **Implemented** (`OrchestratorService`) | ✅ **Implemented** (Redirection Monitor) | **Explainability:** Backend uses simple scores; PRD requires structured reasons (Safe/Conditional). |
| **Surge Control** | Detection & "Survival Mode" | ✅ **Implemented** (Sliding Window) | ✅ **Implemented** (Live Charts) | None. |
| **Policy Engine** | YAML Config & Dynamic Updates | ❌ **Missing** (Hardcoded constants) | ⚠️ **Partial** (UI exists, but backend lacks dynamic loader) | **MAJOR GAP:** Frontend allows config, but backend cannot persist/apply it dynamically. |
| **Distress (BDSE)** | Signal Ingestion & Prioritization | ✅ **Implemented** (Events ingested) | ✅ **Implemented** (Alerts UI) | None. |
| **Human-in-Loop** | Explicit "Nurse Confirmation" workflow | ⚠️ **Partial** (Direct API update only) | ⚠️ **Unverified** (Dialogs exist, flow needs testing) | **Process Gap:** Backend treats "confirm" as just another update; needs specific state validation. |
| **Doctor Model** | Fatigue, Shift limits, Efficiency loss | ❌ **Missing** (Infinite efficiency) | ⚪ **N/A** (Not visualized) | **Simulation Gap:** System is too "perfect" without fatigue constraints. |
| **Real-time Comms** | SSE / WebSockets | ✅ **Implemented** | ✅ **Implemented** | None. |

---

## 3. Detailed Gap Analysis

### 3.1 Policy-as-Code (High Priority)
*   **Requirement:** The PRD specifies a YAML-based configuration (`triagePolicy`) that can be updated live via API to adjust `severityWeight`, `agingRate`, etc.
*   **Current State:**
    *   **Backend:** Logic is hardcoded (e.g., `AGING_FACTOR` is a constant).
    *   **Frontend:** Has a Policy Config page (`app/dashboard/policy-config/page.tsx`) capable of sending updates.
*   **Action:** Refactor backend constants into a singleton `TriagePolicyService` that can be updated via the existing Admin APIs.

### 3.2 Human-in-the-Loop (HITL) Verification (High Priority)
*   **Requirement:** High-impact decisions (major priority jumps from distress signals) must require explicit human confirmation.
*   **Current State:**
    *   **Backend:** Has `/distress` endpoint which boosts priority immediately.
    *   **Frontend:** Has alerts, but the specific "Review -> Confirm -> Apply" loop is not strictly enforced by the backend state machine.
*   **Action:** Add a `CONFIRMED` state to Distress Events. Updates should be provisional until the `POST /patients/{id}/update` with `source: NURSE_CONFIRMATION` is received.

### 3.3 Doctor Fatigue Modeling (Medium Priority)
*   **Requirement:** Doctors should have fatigue cooldowns and efficiency drops.
*   **Current State:** Doctors are modeled as threads that sleep for a fixed `TREATMENT_TIME_MS`.
*   **Action:** Introduce `DoctorState` with stamina metrics. Increase `TREATMENT_TIME_MS` as stamina decreases.

### 3.4 Decision Explainability (Medium Priority)
*   **Requirement:** Redirection decisions should explicitly state stability constraints and benefit reasoning.
*   **Current State:** Backend returns a target ID based on a numeric score.
*   **Action:** Update `OrchestratorService` to return a `RedirectionResult` object containing the decision logic (e.g., "Redirecting because wait time reduction > 15 mins").

## 4. Implementation Roadmap

### Phase 1: Bridge the Gaps (Immediate)
1.  **Backend:** Create `PolicyConfig` class and expose `GET/POST /admin/policy`. Connect this to the Triage logic to replace static constants.
2.  **Frontend:** Verify the Policy Config page reads/writes to this new endpoint.
3.  **Backend:** Modify `DistressEvent` to include a `status` (PENDING, CONFIRMED, DISMISSED).

### Phase 2: Refine Simulation (Post-Hackathon/Next Sprint)
1.  **Backend:** Implement `DoctorFatigueService`.
2.  **Frontend:** Visualizing Doctor Fatigue in the Hospital Status cards.
3.  **Backend:** Enhance Redirection logic to provide string-based "Reasoning" for the frontend to display.

## 5. Conclusion
The system is demo-ready for the core "Happy Path" of managing surges and redirections. To fully align with the "Ethical AI" and "Policy-Driven" goals of the PRD, the **Policy Engine** and **HITL Workflows** must be formalized in the backend code.
