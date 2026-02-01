import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import SimulationPage from './page'
import * as ApiClient from '@/lib/api-client'

// Mock ApiClient
vi.mock("@/lib/api-client", () => ({
  initCity: vi.fn().mockResolvedValue("City Initialized"),
  triggerSurge: vi.fn().mockResolvedValue("Surge Triggered"),
  getSimulationHistory: vi.fn().mockResolvedValue([])
}));


// Mock SimulationContext
vi.mock('@/app/Components/Context/SimulationContext', () => ({
  useSimulation: () => ({ 
    stats: { totalHospitals: 5, totalPatientsWaiting: 0, totalDoctorsActive: 10, surgeActive: false }, 
    isConnected: true,
    refreshStats: vi.fn()
  }),
  SimulationProvider: ({ children }: any) => <div>{children}</div>
}))

// Mock Sidebar
vi.mock('@/components/ui/sidebar', () => ({
  useSidebar: () => ({ toggleSidebar: vi.fn() })
}))

// Mock components that use Chart.js or scrollIntoView
vi.mock('../../Components/Simulation/LiveImpactAnalysis', () => ({
  LiveImpactAnalysis: () => <div data-testid="live-impact">Live Impact Mock</div>
}))

vi.mock('../../Components/Simulation/EventStream', () => ({
  EventStream: ({ logs }: any) => (
    <div data-testid="event-stream">
      {logs.map((l: any) => <div key={l.id}>{l.message}</div>)}
    </div>
  )
}))

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn()

describe('SimulationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('calls initCity when Run Simulation is clicked', async () => {
    render(<SimulationPage />)
    
    const runBtn = screen.getByRole('button', { name: /Run Simulation/i })
    fireEvent.click(runBtn)
    
    await waitFor(() => {
      expect(ApiClient.initCity).toHaveBeenCalledWith(5)
    })
  })

  it('calls triggerSurge when Trigger Surge is clicked', async () => {
    render(<SimulationPage />)
    
    const surgeBtn = screen.getByRole('button', { name: /Trigger Surge/i })
    fireEvent.click(surgeBtn)
    
    await waitFor(() => {
      expect(ApiClient.triggerSurge).toHaveBeenCalled()
    })
  })
})