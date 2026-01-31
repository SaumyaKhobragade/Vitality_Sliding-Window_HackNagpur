import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { DashboardNavBar } from './DashboardNavBar'

// Mock context
vi.mock('@/app/Components/Context/SimulationContext', () => ({
  useSimulation: () => ({
    stats: {},
    isConnected: false // Start disconnected
  })
}))

// Mock Sidebar context
vi.mock('@/components/ui/sidebar', () => ({
  useSidebar: () => ({ toggleSidebar: vi.fn() })
}))

describe('DashboardNavBar', () => {
  it('displays connection status', () => {
    render(<DashboardNavBar />)
    
    // Should show "Disconnected" or similar
    expect(screen.getByText(/Disconnected/i)).toBeDefined()
  })
})
