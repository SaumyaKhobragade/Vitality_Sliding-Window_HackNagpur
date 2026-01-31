# Implementation Plan: Implement Mock Data Integration for Patient Flow Chart

## Phase 1: Data Architecture
- [~] Task: Define Patient Flow Schema and Mock Data
    - [ ] Define PatientFlowRecord interface in lib/types.ts.
    - [ ] Populate db/mockdata.ts with structured patient flow data.
- [ ] Task: Create Data Fetching Utility
    - [ ] Write unit tests for data fetching logic.
    - [ ] Implement getPatientFlowData utility with simulated delay.
- [ ] Task: Conductor - User Manual Verification 'Data Architecture' (Protocol in workflow.md)

## Phase 2: Component Integration
- [ ] Task: Refactor PatientFlowChart Component
    - [ ] Write unit tests for PatientFlowChart rendering with mock data.
    - [ ] Update component to fetch data on mount.
    - [ ] Replace hardcoded chart data with state-driven dynamic data.
- [ ] Task: Implement Data Refresh Logic (Optional/Bonus)
    - [ ] Add a simple "Refresh" button or polling mechanism for simulation feel.
- [ ] Task: Conductor - User Manual Verification 'Component Integration' (Protocol in workflow.md)

## Phase 3: Final Verification
- [ ] Task: End-to-End Visual Check
    - [ ] Verify chart responsiveness on mobile and desktop.
- [ ] Task: Conductor - User Manual Verification 'Implement Mock Data Integration' (Protocol in workflow.md)
