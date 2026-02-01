import { render, screen, cleanup } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import PatientFlowChart from './PatientFlowChart'

// Mock chart.js to avoid canvas issues
vi.mock('react-chartjs-2', () => ({
  Chart: ({ data }: any) => <div data-testid="mock-chart" data-props={JSON.stringify(data)}>Mock Chart</div>
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
}))

const mockStats = {
  totalHospitals: 5,
  totalPatientsWaiting: 50,
  totalDoctorsActive: 20,
  surgeActive: false
}

// Mock ApiClient
vi.mock('@/lib/api-client', () => ({
  getAnalytics: vi.fn().mockResolvedValue([
    { timestamp: "10:00", waiting: 50, activePatients: 20 }
  ])
}))

// Mock context with stable stats reference
vi.mock('@/app/Components/Context/SimulationContext', () => ({
  useSimulation: () => ({
    stats: mockStats,
    isConnected: true,
    refreshStats: vi.fn()
  })
}))

describe('PatientFlowChart', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders chart with data from context', async () => {
    render(<PatientFlowChart />)
    
    // It should render immediately
    const chart = await screen.findByTestId('mock-chart')
    expect(chart).toBeDefined()
  })
})