# Implementation Plan: Java Backend Integration with WebSocket Updates

## Phase 1: API and Types Foundation
- [ ] Task: Update Type Definitions and API Client
    - [ ] Verify and update \lib/types.ts\ with all interfaces defined in \API_INTEGRATION.md\.
    - [ ] Create \lib/api-client.ts\ implementing REST calls for \init\, \patient\, \surge\, \distress\, \edirect\, \stats\, and \hospital\.
    - [ ] Write unit tests for \pi-client.ts\ to ensure correct request formatting and error handling.
- [ ] Task: Conductor - User Manual Verification 'API and Types Foundation' (Protocol in workflow.md)

## Phase 2: WebSocket Infrastructure
- [ ] Task: Implement WebSocket Service
    - [ ] Install \stompjs\ and \sockjs-client\ dependencies.
    - [ ] Create \lib/socket-service.ts\ to encapsulate STOMP connection, subscription, and reconnection logic.
    - [ ] Write unit tests for \socket-service.ts\ mocking the underlying WebSocket connection.
- [ ] Task: Create Simulation Context Provider
    - [ ] Implement \SimulationProvider\ in \pp/Components/Context/SimulationContext.tsx\ to manage global simulation state.
    - [ ] Integrate \SocketService\ within the provider to update state on incoming messages.
    - [ ] Write unit tests for \SimulationProvider\ verifying state updates from socket events.
- [ ] Task: Conductor - User Manual Verification 'WebSocket Infrastructure' (Protocol in workflow.md)

## Phase 3: UI Integration and Component Refactoring
- [ ] Task: Integrate Real Data into Dashboard Components
    - [ ] Refactor \DashboardStats\ to consume live data from \SimulationProvider\.
    - [ ] Refactor \PatientFlowChart\ to visualize real-time patient flow from the backend.
    - [ ] Update \HospitalStatusList\ and \LiveImpactAnalysis\ to reflect the active backend simulation state.
    - [ ] Implement the connection status badge in \DashboardNavBar\.
    - [ ] Write integration tests for these components to ensure they render correctly with data from the context.
- [ ] Task: Conductor - User Manual Verification 'UI Integration and Component Refactoring' (Protocol in workflow.md)

## Phase 4: Final Verification and Polishing
- [ ] Task: End-to-End Simulation Testing
    - [ ] Verify that triggering actions (like injecting a patient) via the UI correctly updates the WebSocket-driven components.
    - [ ] Test the reconnection logic by manually disconnecting the backend or simulating a network failure.
- [ ] Task: Conductor - User Manual Verification 'Java Backend Integration' (Protocol in workflow.md)
