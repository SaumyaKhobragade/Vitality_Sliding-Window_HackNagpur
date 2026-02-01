# Implementation Plan: Human-in-the-Loop (HITL) Distress Workflow & Policy Integration

This plan implements a supervised state machine for distress signals and a database-backed policy engine to replace hardcoded constants, as defined in [spec.md](./spec.md).

## Phase 1: Database Schema & Policy Foundation
**Goal:** Establish the persistence layer for policies and updated distress event states.

- [ ] Task: Create migration script for `triage_policies` table (Supabase/Postgres)
    - [ ] Define columns: `id`, `key`, `value`, `description`, `updated_at`
    - [ ] Seed initial data: `distress_provisional_boost`, `distress_provisional_timeout`, `distress_confirmed_boost`
- [ ] Task: Update `distress_events` table schema
    - [ ] Add `status` enum: `PENDING`, `CONFIRMED`, `DISMISSED`, `EXPIRED`
    - [ ] Add `nurse_id`, `justification_note`, `priority_delta`, `expires_at`
- [ ] Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2: Backend Policy Engine & Triage Refactor
**Goal:** Replace hardcoded constants in the Java backend with dynamic policies and implement the provisional boost logic.

- [ ] Task: Implement `TriagePolicyService` in Java
    - [ ] Create `PolicyConfig` model and repository
    - [ ] Implement caching mechanism with periodic refresh or webhook listener
- [ ] Task: Refactor `Patient` and `HospitalService` triage logic
    - [ ] Update `FinalPriority` calculation to use dynamic weights from `TriagePolicyService`
    - [ ] Implement `applyProvisionalBoost` and `rollbackProvisionalBoost` methods
- [ ] Task: Implement Distress State Machine in `DistressService`
    - [ ] Add logic to set `expires_at` based on `distress_provisional_timeout`
    - [ ] Implement a background task (Scheduled) to auto-expire stale `PENDING` events
- [ ] Task: Implement Audit Logging
    - [ ] Ensure all state transitions log the `priority_delta` and `nurse_id`
- [ ] Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3: Frontend HITL Workflows
**Goal:** Build the UI components for nurses to review and action distress signals.

- [ ] Task: Update `ApiClient` and Types
    - [ ] Sync TypeScript interfaces with new `DistressStatus` and policy endpoints
- [ ] Task: Enhance Patient Queue UI
    - [ ] Add visual flags for `PENDING` (flashing/amber) and `CONFIRMED` (solid red) distress
- [ ] Task: Create `DistressVerificationDialog` Component
    - [ ] Display signal metadata and CCTV reference
    - [ ] Add "Confirm" and "Dismiss" (with note field) buttons
- [ ] Task: Implement Policy Admin UI
    - [ ] Allow authorized users to update `triage_policies` values
- [ ] Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)

## Phase 4: Integration & Stress Testing
**Goal:** Verify the end-to-end flow and automatic timeout behavior.

- [ ] Task: Write Integration Test: "Provisional Boost to Permanent via Confirmation"
- [ ] Task: Write Integration Test: "Provisional Boost to Rollback via Timeout"
- [ ] Task: Write Integration Test: "Dynamic Policy Update Impact"
- [ ] Task: Conductor - User Manual Verification 'Phase 4' (Protocol in workflow.md)
