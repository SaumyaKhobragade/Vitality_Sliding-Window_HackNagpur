import { render, screen, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import PatientFlowChart from './PatientFlowChart'
import * as DataModule from '@/lib/data'

// Mock chart.js to avoid canvas issues
vi.mock('react-chartjs-2', () => ({
  Chart: ({ data }: any) => <div data-testid="mock-chart">{JSON.stringify(data)}</div>
}))

// Mock Chart.js register
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

describe('PatientFlowChart', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches data on mount and updates chart', async () => {
    const mockData = [
      { timestamp: '10:00', activePatients: 10, waiting: 5, discharged: 2, newArrivals: 3 },
      { timestamp: '10:10', activePatients: 15, waiting: 8, discharged: 4, newArrivals: 6 }
    ]

    const spy = vi.spyOn(DataModule, 'getPatientFlowData').mockResolvedValue(mockData)

    render(<PatientFlowChart />)

    expect(spy).toHaveBeenCalled()

    await waitFor(() => {
      const chart = screen.getByTestId('mock-chart')
      const chartData = JSON.parse(chart.textContent!)
      
      // Check labels
      expect(chartData.labels).toEqual(['10:00', '10:10'])
      
      // Check datasets
      const incomingDS = chartData.datasets.find((d: any) => d.label === 'Incoming')
      expect(incomingDS).toBeDefined()
      expect(incomingDS.data).toEqual([3, 6])
      
      const treatmentDS = chartData.datasets.find((d: any) => d.label === 'Treatment')
      expect(treatmentDS).toBeDefined()
      expect(treatmentDS.data).toEqual([2, 4])
    })
  })
})
