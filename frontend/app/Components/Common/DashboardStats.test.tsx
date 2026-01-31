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
      surgeActive: true
    },
    isConnected: true
  })
}))

describe('DashboardStats', () => {
  it('displays stats from simulation context', () => {
    render(<DashboardStats />)
    
    // Check for "Patients Waiting" value from mock context (123)
    // The current hardcoded value is 234
    expect(screen.getByText('123')).toBeDefined()
    
    // Check for "Active Treatments" value (mapped to doctors for now) (45)
    // The current hardcoded value is 89
    expect(screen.getByText('45')).toBeDefined()
  })
})
