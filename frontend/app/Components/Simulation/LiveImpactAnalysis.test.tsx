import { render, screen, cleanup } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { LiveImpactAnalysis } from './LiveImpactAnalysis'

// Mock chart.js
vi.mock('react-chartjs-2', () => ({
  Line: ({ data }: any) => <div data-testid="mock-chart" data-props={JSON.stringify(data)}>Mock Chart</div>
}))

vi.mock('chart.js', () => ({
  Chart: { register: vi.fn() },
  register: vi.fn(),
  CategoryScale: {},
  LinearScale: {},
  PointElement: {},
  LineElement: {},
  Title: {},
  Tooltip: {},
  Legend: {},
  Filler: {},
}))

const mockStats = {
  totalHospitals: 5,
  totalPatientsWaiting: 100,
  totalDoctorsActive: 20,
  surgeActive: false
}

// Mock context
vi.mock('@/app/Components/Context/SimulationContext', () => ({
  useSimulation: () => ({
    stats: mockStats,
    isConnected: true
  })
}))

describe('LiveImpactAnalysis', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders chart with data from context', async () => {
    render(<LiveImpactAnalysis />) 
    
    // Check for Queue Total (100)
    expect(screen.getByText('100')).toBeDefined() 
    
    const chart = await screen.findByTestId('mock-chart')
    expect(chart).toBeDefined()
  })
})