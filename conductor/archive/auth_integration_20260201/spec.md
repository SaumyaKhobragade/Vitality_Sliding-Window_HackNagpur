# Specification: Auth Integration and User Data Propagation

## Overview
This track focuses on integrating user authentication data across the Vitality application, specifically within the `/dashboard` route group and the Landing page. The goal is to provide a personalized user experience by displaying user details (name, avatar) and handling unauthenticated states gracefully using a non-intrusive UI approach.

## Functional Requirements
1.  **Global Auth State (Server-Side):**
    -   Fetch user authentication data (session/user object) on the server in the root layout or dashboard layout using Server Components.
    -   Ensure the user data includes at least the `name` and `avatar` (or image URL).
2.  **Dashboard Integration:**
    -   Propagate user data to the `DashboardNavBar` and `Sidebar` components.
    -   Display the user's name and avatar in the profile dropdown/navigation area.
3.  **Landing Page Integration:**
    -   Update the Landing page `NavBar` to detect authentication status.
    -   Replace the "Login" button with a "Dashboard" link and/or user profile indicator when the user is logged in.
4.  **Graceful Authentication Handling:**
    -   Instead of strict redirects for unauthenticated users in `/dashboard`, implement a "Logged Out" state or a login prompt overlay.
    -   The dashboard layout should remain visible but restricted/blurred until the user authenticates.

## Non-Functional Requirements
1.  **Performance:** Use Server Components for initial auth checks to minimize Client-Side fetching and layout shifts.
2.  **Type Safety:** Utilize existing TypeScript interfaces (from `lib/types.ts` or auth library) for user and session objects.
3.  **UI Consistency:** Ensure the login prompt/overlay follows the project's Shadcn/UI and Tailwind CSS styling.

## Acceptance Criteria
- [ ] Users see their name and avatar in the dashboard sidebar/navbar when logged in.
- [ ] The Landing page Navbar shows a "Dashboard" link for authenticated users.
- [ ] Unauthenticated users accessing `/dashboard` see a clear login prompt/overlay instead of being immediately kicked to a separate login page.
- [ ] User data is fetched once at the layout level and passed down efficiently.

## Out of Scope
- Implementation of Role-Based Access Control (RBAC) or permission-based UI filtering.
- Filtering dashboard data based on Organization IDs or complex user relationships.
