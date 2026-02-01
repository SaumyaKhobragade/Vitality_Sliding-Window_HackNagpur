# Implementation Plan: Supabase Integration & WebSocket Optimization

This plan outlines the steps to migrate data fetching to Supabase via Next.js API routes and optimize the WebSocket connection lifecycle.

## Phase 1: API Layer & Supabase Data Fetching
- [x] Task: Create Supabase Data Access Layer
    - [x] Implement helper functions in `lib/supabase-api.ts` for common queries (hospitals, patients, alerts).
    - [x] Ensure proper TypeScript types mapping from `schema.sql` to `lib/types.ts`.
- [x] Task: Implement Next.js API Route Handlers
    - [x] Create `app/api/hospitals/route.ts` to fetch hospital data.
    - [x] Create `app/api/patients/queue/route.ts` to fetch patient and queue data.
    - [x] Create `app/api/alerts/route.ts` to fetch distress events and redirection decisions.
- [x] Task: Refactor Frontend Data Hooks
    - [x] Update `lib/data.ts` or create `hooks/use-dashboard-data.ts` to fetch from the new API routes instead of hardcoded mocks.
    - [x] Verify that `PatientFlowChart`, `HospitalStatusList`, and `DataTable` components render correctly with Supabase data.
- [x] Task: Conductor - User Manual Verification 'Phase 1: API Layer' (Protocol in workflow.md)

## Phase 2: WebSocket Scoping & Optimization
- [x] Task: Refactor WebSocket Service Lifecycle
    - [x] Modify `lib/socket-service.ts` to support explicit `connect()` and `disconnect()` calls.
    - [x] Remove automatic socket initialization from global layouts.
- [x] Task: Create `RealtimeProvider` Context
    - [x] Implement a `RealtimeContext` that manages the socket connection state.
    - [x] Use `useEffect` in the provider to connect on mount and disconnect on unmount.
- [x] Task: Apply Scoped Connectivity
    - [x] Wrap only the `dashboard` layout (`app/dashboard/layout.tsx`) with the `RealtimeProvider`.
    - [x] Ensure the `auth` page (`app/auth/page.tsx`) remains outside this provider scope.
- [x] Task: Verify Connection Logic
    - [x] Check browser network tab to ensure WebSocket only initiates on `/dashboard` routes.
    - [x] Verify that socket messages still correctly update the UI state.
- [x] Task: Conductor - User Manual Verification 'Phase 2: WebSocket Scoping' (Protocol in workflow.md)

## Phase 3: Final Integration & Cleanup
- [x] Task: Remove Legacy Mock Data
    - [x] Delete or archive hardcoded objects in `lib/data.ts`.
    - [x] Remove unused imports of mock data across the codebase.
- [x] Task: End-to-End Verification
    - [x] Test full flow: Login -> Dashboard (Socket connects, Supabase data loads) -> Logout/Auth (Socket disconnects).
- [x] Task: Conductor - User Manual Verification 'Phase 3: Final Integration' (Protocol in workflow.md)
