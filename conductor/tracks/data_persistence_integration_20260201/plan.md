# Implementation Plan: Data Persistence Integration

This plan outlines the migration from hardcoded mock data to database-backed API integration across the Vitality dashboard modules.

## Phase 1: Preparation & Schema Alignment
Focus on ensuring the frontend types match the API responses and centralizing the data fetching logic.

- [x] Task: Audit and synchronize shared types
    - [x] Update `lib/types.ts` to match Supabase schema outputs and API responses.
    - [x] Identify discrepancies between current mock data shapes and DB schema.
- [x] Task: Enhance `api-client.ts` for unified fetching
    - [x] Ensure generic fetchers handle error states and loading consistently.
- [x] Task: Conductor - User Manual Verification 'Preparation' (Protocol in workflow.md)

## Phase 2: Dashboard & Stats Integration
Integrate the main dashboard and analytics which have existing API endpoints.

- [x] Task: Migrate Dashboard Overview (`dashboard/page.tsx`)
    - [x] Write tests for `Stats` component with mocked API responses.
    - [x] Implement `useEffect` or React Query to fetch data from `/api/stats`.
    - [x] Replace hardcoded stats with dynamic data.
- [x] Task: Integrate Analytics Charts
    - [x] Write tests for chart data mapping.
    - [x] Implement fetching from `/api/analytics`.
    - [x] Update chart components to handle empty or loading states.
- [x] Task: Conductor - User Manual Verification 'Dashboard Integration' (Protocol in workflow.md)

## Phase 3: Alerts & Queue Management
Connect the live operational modules to the backend.

- [x] Task: Integrate Alerts & Decision Monitor
    - [x] Write tests for Alert list and Decision Monitor using `/api/alerts` mock.
    - [x] Update components to consume live redirection decisions.
- [x] Task: Integrate Patient Queue Details
    - [x] Write tests for hospital-specific queue fetching.
    - [x] Implement hospital selection filter linked to `?hospitalId`.
    - [x] Replace `mockPatients` in `dashboard/queue-details` with API data.
- [x] Task: Conductor - User Manual Verification 'Operations Integration' (Protocol in workflow.md)

## Phase 4: Simulation & Policy Configuration (New APIs)
Implement the missing backend logic and connect the frontend.

- [x] Task: Implement Simulation Persistence
    - [x] Create `api/simulation` routes for fetching and storing simulation runs.
    - [x] Write tests for Simulation controls with API interaction.
    - [x] Implement simulation history view.
- [x] Task: Implement Policy Configuration API
    - [x] Create `api/policies` GET and POST routes.
    - [x] Update `policy-config` page to load and save settings to Supabase.
- [x] Task: Conductor - User Manual Verification 'Simulation & Policies' (Protocol in workflow.md)

## Phase 5: Final Cleanup & Optimization
Remove all traces of mock data and perform final quality checks.

- [ ] Task: Comprehensive Mock Data Removal
    - [ ] Search for and delete unused `mockdata.ts` or hardcoded constants.
- [ ] Task: Final Coverage & Performance Audit
    - [ ] Run `vitest` with coverage report to ensure >80%.
    - [ ] Verify no "FOUC" (Flash of Unstyled Content) during data loading.
- [ ] Task: Conductor - User Manual Verification 'Final Release' (Protocol in workflow.md)
