import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach, beforeAll } from "vitest";
import { DashboardNavBar } from "./DashboardNavBar";
import { SimulationProvider } from "../Context/SimulationContext";
import { AuthProvider } from "../../Context/AuthContext";
import { SidebarProvider } from "@/components/ui/sidebar";

// Mock matchMedia
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

// Mock child components to isolate tests
vi.mock("@/app/Components/Common/SearchBar", () => ({
  SearchBar: () => <div data-testid="search-bar">SearchBar</div>,
}));

vi.mock("@/app/Components/dashboard/NotificationPopover", () => ({
  NotificationPopover: () => <div data-testid="notification-popover">Notifications</div>,
}));

vi.mock("@/app/Components/dashboard/HospitalSelector", () => ({
  HospitalSelector: () => <div data-testid="hospital-selector">HospitalSelector</div>,
}));

// Mock Supabase client
vi.mock("@/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
  }),
}));

describe("DashboardNavBar", () => {
  afterEach(() => {
    cleanup();
  });

  it("displays connection status", () => {
    render(
      <AuthProvider>
        <SimulationProvider>
          <SidebarProvider>
            <DashboardNavBar />
          </SidebarProvider>
        </SimulationProvider>
      </AuthProvider>
    );

    // Initial state is disconnected
    expect(screen.getByText("Disconnected")).toBeDefined();
  });

  it("renders user information when authenticated", () => {
    const mockUser = {
      id: "123",
      name: "Test User",
      email: "test@example.com",
      avatarUrl: "https://example.com/avatar.jpg",
    };

    render(
      <AuthProvider initialUser={mockUser}>
        <SimulationProvider>
          <SidebarProvider>
            <DashboardNavBar />
          </SidebarProvider>
        </SimulationProvider>
      </AuthProvider>
    );

    expect(screen.getByText("Test User")).toBeDefined();
    expect(screen.getByText("Authenticated")).toBeDefined();
  });
});
