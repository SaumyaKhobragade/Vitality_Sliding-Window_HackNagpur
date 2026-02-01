# Implementation Plan: Human-in-the-Loop (HITL) Distress Workflow & Policy Integration

This plan implements a supervised state machine for distress signals and a database-backed policy engine to replace hardcoded constants, as defined in [spec.md](./spec.md).

## Phase 1: Database Schema & Policy Foundation
**Goal:** Establish the persistence layer for policies and updated distress event states.

- [x] Task: Create migration script for `triage_policies` table (Supabase/Postgres)
    - [x] Define columns: `id`, `key`, `value`, `description`, `updated_at`
    - [x] Seed initial data: `distress_provisional_boost`, `distress_provisional_timeout`, `distress_confirmed_boost`
- [x] Task: Update `distress_events` table schema
    - [x] Add `status` enum: `PENDING`, `CONFIRMED`, `DISMISSED`, `EXPIRED`
    - [x] Add `nurse_id`, `justification_note`, `priority_delta`, `expires_at`
- [x] Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md) [checkpoint: manual]

## Phase 2: Backend Policy Engine & Triage Refactor
**Goal:** Replace hardcoded constants in the Java backend with dynamic policies and implement the provisional boost logic.

- [x] Task: Implement `TriagePolicyService` in Java [checkpoint: compiled]
    - [x] Create `PolicyConfig` model and repository
    - [x] Implement caching mechanism with periodic refresh or webhook listener
- [x] Task: Refactor `Patient` and `HospitalService` triage logic
    - [x] Update `FinalPriority` calculation to use dynamic weights from `TriagePolicyService`
    - [x] Implement `applyProvisionalBoost` and `rollbackProvisionalBoost` methods
- [x] Task: Implement Distress State Machine in `DistressService`
    - [x] Add logic to set `expires_at` based on `distress_provisional_timeout`
    - [x] Implement a background task (Scheduled) to auto-expire stale `PENDING` events
- [x] Task: Implement Audit Logging
    - [x] Ensure all state transitions log the `priority_delta` and `nurse_id`
- [x] Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3: Frontend HITL Workflows
**Goal:** Build the UI components for nurses to review and action distress signals.

- [x] Task: Update `ApiClient` and Types [checkpoint: updated]
    - [x] Sync TypeScript interfaces with new `DistressStatus` and policy endpoints
- [x] Task: Enhance Patient Queue UI
    - [x] Add visual flags for `PENDING` (flashing/amber) and `CONFIRMED` (solid red) distress
- [x] Task: Create `DistressVerificationDialog` Component
    - [x] Display signal metadata and CCTV reference
    - [x] Add "Confirm" and "Dismiss" (with note field) buttons
- [x] Task: Implement Policy Admin UI
    - [x] Allow authorized users to update `triage_policies` values
- [x] Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)

## Phase 4: Integration & Stress Testing
**Goal:** Verify the end-to-end flow and automatic timeout behavior.

- [x] Task: Write Integration Test: "Provisional Boost to Permanent via Confirmation"
- [x] Task: Write Integration Test: "Provisional Boost to Rollback via Timeout"
- [x] Task: Write Integration Test: "Dynamic Policy Update Impact"
- [x] Task: Conductor - User Manual Verification 'Phase 4' (Protocol in workflow.md) [checkpoint: tests passed]
