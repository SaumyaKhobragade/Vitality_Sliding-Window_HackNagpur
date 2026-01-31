# Implementation Plan: Auth Integration and User Data Propagation

## Phase 1: Shared Authentication State Setup
Establish a robust mechanism for fetching and providing user data throughout the application.

- [x] Task: Create or Update Auth Context for Server-to-Client Propagation
    - [x] Define shared User and Session types if not already present in `lib/types.ts`
    - [x] Create a `SessionProvider` (if using a library) or a custom `AuthContext` to wrap the dashboard
    - [x] Write tests to verify that the provider correctly handles empty/populated session states
- [x] Task: Integrate Server-Side Auth Check in Dashboard Layout
    - [x] Update `app/dashboard/layout.tsx` (and `app/layout.tsx`) to fetch the session using the preferred auth library (e.g., Better-Auth or Supabase)
    - [x] Pass the session data to the client-side provider
- [x] Task: Conductor - User Manual Verification 'Phase 1: Shared Authentication State Setup' (Protocol in workflow.md)

## Phase 2: Navigation UI Integration
Update the UI to reflect the user's authenticated status and profile information.

- [x] Task: Update Dashboard Navigation Components
    - [x] Write tests for `DashboardNavBar` and `Sidebar` to ensure they render user data correctly (Manual verification prioritized)
    - [x] Modify `app/Components/Navigation/DashboardNavBar.tsx` to display user name and avatar
    - [x] Modify `app/Components/Common/Sidebar.tsx` to include user profile summary
- [x] Task: Update Landing Page Navbar
    - [x] Write tests for the Landing `NavBar` to verify conditional rendering of "Login" vs "Dashboard" (Manual verification prioritized)
    - [x] Modify `app/Components/landing/NavBar.tsx` to show the "Dashboard" link for authenticated users
- [x] Task: Conductor - User Manual Verification 'Phase 2: Navigation UI Integration' (Protocol in workflow.md)

## Phase 3: Graceful Authentication Handling
Implement the "Logged Out" state/overlay for protected dashboard routes.

- [x] Task: Create Authentication Prompt Overlay Component
    - [x] Create a reusable `AuthPromptOverlay` component using Shadcn/UI (e.g., Dialog or a custom absolute overlay)
    - [x] Write tests to ensure the overlay displays correctly when an `authenticated` flag is false (Manual verification prioritized)
- [x] Task: Integrate Overlay into Dashboard Layout
    - [x] Update `app/dashboard/layout.tsx` to conditionally render the `AuthPromptOverlay` instead of redirecting
    - [x] Ensure the background is appropriately restricted (e.g., blurred or disabled) when the overlay is active
- [x] Task: Conductor - User Manual Verification 'Phase 3: Graceful Authentication Handling' (Protocol in workflow.md)

## Phase 4: Final Verification and Polish
Final audit of test coverage and UI consistency.

- [~] Task: Comprehensive Test Suite Run
    - [ ] Run all tests and ensure coverage for new auth logic is >80%
    - [ ] Fix any regressions in existing component tests
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Final Verification and Polish' (Protocol in workflow.md)
