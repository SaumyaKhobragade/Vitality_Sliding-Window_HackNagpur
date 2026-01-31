import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';

// Mock createClient
vi.mock('@/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
  }),
}));

// Mock component to consume context
const TestComponent = () => {
  const { user, session } = useAuth();
  return (
    <div>
      <div data-testid="user-name">{user?.name || 'Guest'}</div>
      <div data-testid="session-status">{session ? 'Active' : 'Inactive'}</div>
    </div>
  );
};

describe('AuthContext', () => {
  afterEach(() => {
    cleanup();
  });

  it('provides default unauthenticated state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('user-name').textContent).toBe('Guest');
    expect(screen.getByTestId('session-status').textContent).toBe('Inactive');
  });

  it('provides authenticated state when initial session is provided', () => {
    const mockUser = {
      id: '123',
      name: 'John Doe',
      email: 'john@example.com',
      avatarUrl: 'https://example.com/avatar.jpg',
    };

    const mockSession = {
      accessToken: 'token', // Updated to match lib/types definition
      user: mockUser,
    };

    render(
      // @ts-ignore - Props match implementation
      <AuthProvider initialSession={mockSession} initialUser={mockUser}>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('user-name').textContent).toBe('John Doe');
    expect(screen.getByTestId('session-status').textContent).toBe('Active');
  });
});