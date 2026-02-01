import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import DashboardStats from './DashboardStats'

// Mock the context hook
vi.mock('@/app/Components/Context/SimulationContext', () => ({
  useSimulation: () => ({
    stats: {
      totalHospitals: 5,
      totalPatientsWaiting: 123,
      totalDoctorsActive: 45,
      surgeActive: true,
      recentRedirections: 7
    },
    hospitals: {
      "h1": { id: "h1", totalQueueSize: 80, maxCapacity: 100 }, // 80% (Overloaded)
      "h2": { id: "h2", totalQueueSize: 20, maxCapacity: 100 }, // 20%
      "h3": { id: "h3", totalQueueSize: 90, maxCapacity: 100 }, // 90% (Overloaded)
    },
    isConnected: true
  })
}))

describe('DashboardStats', () => {
  it('displays stats from simulation context', () => {
    render(<DashboardStats />)
    
    // Check for "Patients Waiting" value from mock context (123)
    expect(screen.getByText('123')).toBeDefined()
    
    // Check for "Active Doctors" value (45)
    expect(screen.getByText('45')).toBeDefined()

    // Check for "Overloaded" count (2 hospitals > 70%)
    expect(screen.getByText('2')).toBeDefined()

    // Check for "Redirections" (7)
    expect(screen.getByText('7')).toBeDefined()
  })
})
