# Implementation Plan: Java Backend Integration with WebSocket Updates

## Phase 1: API and Types Foundation [checkpoint: ec59198]
- [x] Task: Update Type Definitions and API Client 0943f4c
    - [ ] Verify and update \lib/types.ts\ with all interfaces defined in \API_INTEGRATION.md\.
    - [ ] Create \lib/api-client.ts\ implementing REST calls for \init\, \patient\, \surge\, \distress\, \edirect\, \stats\, and \hospital\.
    - [ ] Write unit tests for \pi-client.ts\ to ensure correct request formatting and error handling.
- [x] Task: Conductor - User Manual Verification 'API and Types Foundation' (Protocol in workflow.md)

## Phase 2: WebSocket Infrastructure [checkpoint: f723b46]
- [x] Task: Implement WebSocket Service cc03b10
    - [ ] Install \stompjs\ and \sockjs-client\ dependencies.
    - [ ] Create \lib/socket-service.ts\ to encapsulate STOMP connection, subscription, and reconnection logic.
    - [ ] Write unit tests for \socket-service.ts\ mocking the underlying WebSocket connection.
- [x] Task: Create Simulation Context Provider c5aee46
    - [ ] Implement \SimulationProvider\ in \pp/Components/Context/SimulationContext.tsx\ to manage global simulation state.
    - [ ] Integrate \SocketService\ within the provider to update state on incoming messages.
    - [ ] Write unit tests for \SimulationProvider\ verifying state updates from socket events.
- [x] Task: Conductor - User Manual Verification 'WebSocket Infrastructure' (Protocol in workflow.md)

## Phase 3: UI Integration and Component Refactoring [checkpoint: 01e655e]
- [x] Task: Integrate Real Data into Dashboard Components 4d6985c
- [x] Task: Conductor - User Manual Verification 'UI Integration and Component Refactoring' (Protocol in workflow.md)

## Phase 4: Final Verification and Polishing [checkpoint: fbe9faf]
- [x] Task: End-to-End Simulation Testing 540ab8e
- [x] Task: Conductor - User Manual Verification 'Java Backend Integration' (Protocol in workflow.md)
