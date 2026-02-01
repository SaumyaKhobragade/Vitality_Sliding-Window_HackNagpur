# Specification: Human-in-the-Loop (HITL) Distress Workflow & Policy Integration

**Status:** Draft
**Type:** Feature
**Track ID:** hitl_distress_workflow_20260201

## 1. Overview
This track addresses two critical gaps identified in the `GAP_ANALYSIS.md`:
1. **Strict Human-in-the-Loop (HITL) Workflow:** Transitioning from automated priority boosts to a supervised model where nurses must confirm or dismiss behavioral distress signals.
2. **Policy-as-Code Integration:** Moving hardcoded triage constants (like the distress boost amount and provisional duration) into a database-backed configuration system.

## 2. Functional Requirements

### 2.1 Behavioral Distress State Machine
- **States:** Distress events must now progress through a state machine: `PENDING` -> `CONFIRMED` | `DISMISSED`.
- **Provisional Boost:** When a distress signal is first detected (`PENDING`), apply a temporary priority boost to move the patient up the queue immediately.
- **Expiration:** If no action is taken within a configurable `provisional_timeout`, the boost is automatically rolled back, and the event is marked as `EXPIRED` (treated as Dismissed).

### 2.2 Nurse Verification Interface
- **Alert Dialog:** Provide a UI component for reviewing `PENDING` signals, including the signal type, confidence, and timestamp.
- **Queue Flags:** Display a visual indicator/flag on the main patient queue for patients with active `PENDING` or `CONFIRMED` distress.
- **Actions:** 
    - **Confirm:** Finalizes the priority boost and logs the nurse's ID.
    - **Dismiss:** Removes the provisional boost immediately and requires an optional justification note.

### 2.3 Policy-as-Code (Backend)
- **Persistence:** Store triage and HITL configuration in a Supabase/Postgres `triage_policies` table.
- **Dynamic Reloading:** The backend must fetch these policies on startup and provide an endpoint for the frontend to update them.
- **Configurable Parameters:**
    - `distress_provisional_boost` (int)
    - `distress_provisional_timeout` (seconds)
    - `distress_confirmed_boost` (int)

### 2.4 Audit & Explainability
- **Audit Log:** Every confirmation or dismissal must record:
    - `nurse_id`
    - `timestamp`
    - `action_taken` (Confirm/Dismiss/Expire)
    - `justification_note` (if provided)
    - `priority_delta` (the exact change in `FinalPriority`)

## 3. Technical Requirements
- **Backend (Java):** Update `DistressEvent` model and `TriageService` to handle the provisional logic and policy fetching.
- **Frontend (Next.js):** Integrate with the new `DistressStatus` and implement the confirmation dialog flow.
- **Database:** Create `triage_policies` table and update `distress_events` table schema.

## 4. Acceptance Criteria
- [ ] A new patient with a distress signal receives a priority boost immediately (Provisional).
- [ ] After the timeout, the boost is removed automatically if not confirmed.
- [ ] Nurse confirmation converts the provisional boost to a permanent one.
- [ ] All actions (Confirm/Dismiss/Expire) are visible in the system audit logs.
- [ ] Triage constants can be updated via the database without restarting the Java backend.

## 5. Out of Scope
- Integration with actual live CCTV video streaming (staying with event-based simulation).
- Advanced ML re-training based on nurse dismissals.
