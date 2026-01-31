import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as ApiClient from './api-client'
import { CityStats } from './types'

// Mock fetch
global.fetch = vi.fn()

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize city', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      headers: {
        get: () => 'text/plain'
      },
      text: () => Promise.resolve("City Initialized")
    })

    const response = await ApiClient.initCity(5)
    
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/init'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ count: "5" })
      })
    )
    expect(response).toBe("City Initialized")
  })

  it('should fetch city stats', async () => {
    const mockStats: CityStats = {
      totalHospitals: 3,
      totalPatientsWaiting: 45,
      totalDoctorsActive: 12,
      surgeActive: false
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      headers: {
        get: () => 'application/json'
      },
      json: () => Promise.resolve(mockStats)
    })

    const stats = await ApiClient.getCityStats()
    expect(stats).toEqual(mockStats)
  })
})
