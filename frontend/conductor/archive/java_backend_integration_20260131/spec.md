# Specification: Java Backend Integration with WebSocket Updates

## Overview
This track involves integrating the Next.js frontend with the Java Spring Boot backend to enable real-time hospital simulation monitoring and control. While commands will be sent via REST API calls, the system will be updated to receive live data streams via WebSockets using the STOMP protocol.

## Functional Requirements
- **WebSocket Integration:**
    - Implement a \SocketService\ using \stompjs\ and \sockjs-client\.
    - Establish a connection to the backend WebSocket endpoint (assumed at \/ws\).
    - Subscribe to topics for global stats (\/topic/stats\) and hospital updates (\/topic/hospital/{id}\).
- **REST API Client:**
    - Implement a service to handle all documented REST endpoints:
        - \POST /init\: Initialize city.
        - \POST /patient\: Inject single patient.
        - \POST /surge\: Trigger mass casualty event.
        - \POST /distress\: Trigger patient distress.
        - \POST /redirect/evaluate\: Evaluate patient redirection.
        - \GET /stats\: Initial fetch for global metrics.
        - \GET /hospital/{id}\: Initial fetch for detailed hospital state.
- **State Management:**
    - Create a \SimulationProvider\ (React Context) to store and distribute live simulation data.
    - Ensure incoming WebSocket messages update the global state and trigger re-renders.
- **UI Updates:**
    - Replace all mock data usage in \PatientFlowChart\, \DashboardStats\, \HospitalStatusList\, and \LiveImpactAnalysis\ with real data from the \SimulationProvider\.
    - Add a **WebSocket Connection Status Badge** in the \DashboardNavBar\ (e.g., Connected/Connecting/Disconnected).
- **Type Safety:**
    - Utilize the interfaces defined in \lib/types.ts\ for all API responses and state objects.

## Non-Functional Requirements
- **Reliability:** Implement automatic reconnection logic with exponential backoff for the WebSocket connection.
- **Performance:** Ensure state updates from the WebSocket do not cause excessive re-renders of unrelated components.
- **Error Handling:** Provide user-friendly toast notifications (using \sonner\) for failed REST actions or persistent connection issues.

## Acceptance Criteria
- Dashboard successfully connects to the backend WebSocket on load.
- Global stats (Total Patients, Active Doctors, etc.) update automatically when data is pushed from the server.
- Triggering a \"Surge\" or \"Inject Patient\" action results in visible updates to the charts and lists without refreshing.
- The \DashboardNavBar\ correctly displays the current connection status.
- All TypeScript types are correctly mapped and enforced.

## Out of Scope
- Backend implementation of the WebSocket server (assumed to be handled by the backend team).
- Authentication/Authorization for this phase.
