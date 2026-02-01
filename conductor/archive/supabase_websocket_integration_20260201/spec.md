# Specification: Supabase Integration & WebSocket Optimization

## Overview
This track focuses on transitioning the Vitality dashboard from hardcoded mock data to a dynamic, Supabase-backed architecture. It also involves optimizing the existing WebSocket infrastructure to ensure real-time updates are only active on relevant pages, improving performance and resource management.

## Functional Requirements
### 1. Supabase Data Migration
- **Entity Migration:** Replace hardcoded data in `lib/data.ts` and components with queries to Supabase for:
    - **Hospitals:** Capacity, status, and location data.
    - **Patients:** Queue status, severity scores, and flow history.
    - **Events:** Operational alerts (Distress Events) and Redirection Decisions.
- **API Layer:** Implement Next.js API Route Handlers (e.g., `/api/hospitals`, `/api/patients/queue`) to serve as an abstraction layer between the frontend and Supabase.

### 2. WebSocket Refactoring
- **Scoped Connectivity:** Move the `SocketService` initialization and connection logic from the global `layout.tsx` or root context to a more granular implementation (e.g., a `RealtimeContext` or similar).
- **Conditional Activation:** Ensure WebSocket connections are only established and maintained on dashboard-related pages. The connection should be terminated or not initiated when the user is on the Auth page.
- **Protocol:** Maintain the current STOMP/SockJS protocol for communication with the Java backend (Vitality-Core), but ensure the data received via sockets is integrated with the new Supabase-backed state.

## Non-Functional Requirements
- **Efficiency:** Minimize unnecessary database queries by implementing efficient data fetching patterns in API routes.
- **Performance:** Reduce client-side overhead by preventing idle WebSocket connections on static/non-operational pages.

## Acceptance Criteria
- [ ] All dashboard charts and tables reflect data fetched from Supabase tables instead of mock objects.
- [ ] Navigating to the Auth page results in no active WebSocket connection.
- [ ] Navigating to any Dashboard page initiates a WebSocket connection and receives real-time updates.
- [ ] API routes correctly handle data retrieval and error states from Supabase.

## Out of Scope
- Migrating the simulation engine logic to the frontend (remains in the Java backend).
- Implementing Supabase Realtime (sticking with STOMP for now).
