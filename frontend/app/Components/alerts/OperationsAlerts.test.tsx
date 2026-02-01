import { render, screen, waitFor } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import OperationsAlerts from './OperationsAlerts'

vi.mock('@/lib/api-client', () => ({
  getDistressEvents: vi.fn().mockResolvedValue([
    {
      id: "d1",
      type: "COLLAPSE",
      locationDetail: "Waiting Room A",
      severityScore: 8,
      detectedAt: new Date().toISOString()
    }
  ]),
  getRedirectionDecisions: vi.fn().mockResolvedValue([
    {
      id: "r1",
      patientId: "p12345",
      reason: "Overcrowding",
      decisionType: "safe",
      time: new Date().toISOString()
    }
  ])
}))

describe('OperationsAlerts', () => {
  it('renders alerts from API', async () => {
    render(<OperationsAlerts />)
    
    expect(screen.getByText(/Loading alerts/i)).toBeDefined()
    
    await waitFor(() => {
        expect(screen.getByText(/COLLAPSE: Waiting Room A/i)).toBeDefined()
        expect(screen.getByText(/Redirection: Patient p12345/i)).toBeDefined()
    })
  })
})
