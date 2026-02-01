# Specification: Data Persistence Integration

## 1. Overview
This track aims to replace all hardcoded mock data in the Dashboard, Alerts, Decision Monitor, Queue Details, Simulation, and Policy Config modules with real data fetched from the Supabase database via Next.js API routes.

## 2. Functional Requirements

### 2.1 Dashboard Overview (`dashboard/page.tsx`)
- **Requirement:** Fetch and display real-time city stats and analytics snapshots.
- **Source:** Use existing `GET /api/stats` and `GET /api/analytics`.

### 2.2 Alerts & Decision Monitor (`dashboard/alerts`, `dashboard/decision-monitor`)
- **Requirement:** Display live redirection decisions and system alerts.
- **Source:** Use existing `GET /api/alerts`.
- **Note:** Ensure the data shape from `getRedirectionDecisions` matches both the Alerts list and Decision Monitor visualization needs.

### 2.3 Queue Details (`dashboard/queue-details`)
- **Requirement:** Show the current patient queue for a selected hospital.
- **Source:** Use existing `GET /api/patients/queue`. Supports `?hospitalId` query param.

### 2.4 Simulation (`dashboard/simulation`)
- **Requirement:** Remove hardcoded simulation results.
- **Implementation:**
    - Create new API endpoints (e.g., `GET /api/simulation/history`, `POST /api/simulation/run`) or Supabase functions to handle simulation data.
    - Integrate frontend to fetch/trigger simulations.

### 2.5 Policy Config (`dashboard/policy-config`)
- **Requirement:** Allow viewing and updating of hospital/system policies from the DB.
- **Implementation:**
    - Create new API endpoints (e.g., `GET /api/policies`, `POST /api/policies`).
    - Integrate frontend forms to load initial state and save changes.

## 3. Non-Functional Requirements
- **Performance:** Data fetching should not block the UI (use Loading states/Suspense).
- **Error Handling:** Gracefully handle API failures with toast notifications or error boundaries.
- **Type Safety:** Ensure shared types between API responses and Frontend components (update `types.ts` if needed).

## 4. Acceptance Criteria
- [ ] No hardcoded data objects remain in the specified page components.
- [ ] Dashboard charts reflect data from `api/stats`.
- [ ] Queue list updates based on DB data.
- [ ] Simulation can be run/viewed via API.
- [ ] Policies can be read/updated via API.
