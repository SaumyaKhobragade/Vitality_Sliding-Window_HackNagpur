import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import { SimulationProvider, useSimulation } from './SimulationContext'
import React from 'react'

// Mock SocketService
vi.mock('@/lib/socket-service', () => {
  class MockSocketService {
    connect = vi.fn();
    disconnect = vi.fn();
    subscribe = vi.fn();
    isConnected = vi.fn().mockReturnValue(true);
  }
  return { SocketService: MockSocketService };
})

// Mock ApiClient
vi.mock('@/lib/api-client', () => ({
  getCityStats: vi.fn().mockResolvedValue({
    totalHospitals: 3,
    totalPatientsWaiting: 45,
    totalDoctorsActive: 12,
    surgeActive: false,
  }),
  getHospital: vi.fn(),
}))

// Helper component to test context
const TestComponent = () => {
  const { stats, isConnected } = useSimulation()
  return (
    <div>
      <div data-testid="status">{isConnected ? 'connected' : 'disconnected'}</div>
      <div data-testid="hospitals">{stats?.totalHospitals ?? 0}</div>
    </div>
  )
}

describe('SimulationProvider', () => {
  it('should provide initial simulation state', async () => {
    render(
      <SimulationProvider>
        <TestComponent />
      </SimulationProvider>
    )
    
    expect(screen.getByTestId('status').textContent).toBe('connected')
    
    // Wait for the async stats to be loaded
    const hospitalsValue = await screen.findByTestId('hospitals')
    expect(hospitalsValue.textContent).toBe('3')
  })
})
