import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import HospitalStatusList from './HospitalStatusList'

vi.mock('@/app/Components/Context/SimulationContext', () => ({
  useSimulation: () => ({
    hospitals: {
      "H1": {
        id: "H1",
        name: "General Hospital",
        maxCapacity: 100,
        waitingRooms: { "NURSE": [], "GENERAL": [], "ICU": [] },
        activeTreatments: 10,
        totalQueueSize: 20,
        activeDoctorCount: 5
      }
    },
    isConnected: true
  })
}))

describe('HospitalStatusList', () => {
  it('renders hospital data from context', () => {
    render(<HospitalStatusList />)
    
    // Check for hospital name
    expect(screen.getByText('General Hospital')).toBeDefined()
    
    // Check for queue size
    expect(screen.getByText('20')).toBeDefined()
    
    // Check for active doctors
    expect(screen.getByText('5')).toBeDefined()
  })
})
