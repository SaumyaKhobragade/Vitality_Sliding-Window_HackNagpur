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

  it('should fetch analytics', async () => {
    const mockAnalytics = [{ timestamp: "10:00", activePatients: 10, waiting: 5, discharged: 1, newArrivals: 2 }];
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockAnalytics)
    })

    const data = await ApiClient.getAnalytics()
    expect(data).toEqual(mockAnalytics)
    expect(global.fetch).toHaveBeenCalledWith("/api/analytics", undefined)
  })

  it('should fetch redirection decisions', async () => {
    const mockDecisions = [{ id: "1", type: "safe" }];
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockDecisions)
    })

    const data = await ApiClient.getRedirectionDecisions()
    expect(data).toEqual(mockDecisions)
    expect(global.fetch).toHaveBeenCalledWith("/api/alerts", undefined)
  })

  it('should fetch patient queue', async () => {
    const mockQueue = [{ id: "p1", status: "Waiting" }];
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockQueue)
    })

    const data = await ApiClient.getPatientQueue("h1")
    expect(data).toEqual(mockQueue)
    expect(global.fetch).toHaveBeenCalledWith("/api/patients/queue?hospitalId=h1", undefined)
  })

  it('should fetch policies', async () => {
    const mockPolicies = [{ id: "pol1", name: "Policy A" }];
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockPolicies)
    })

    const data = await ApiClient.getPolicies()
    expect(data).toEqual(mockPolicies)
    expect(global.fetch).toHaveBeenCalledWith("/api/policies", undefined)
  })

  it('should update policy', async () => {
    const mockPolicy = { id: "pol1", isActive: true };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockPolicy)
    })

    const data = await ApiClient.updatePolicy({ id: "pol1", isActive: true })
    expect(data).toEqual(mockPolicy)
    expect(global.fetch).toHaveBeenCalledWith("/api/policies", expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ id: "pol1", isActive: true })
    }))
  })

  it('should fetch simulation history', async () => {
    const mockHistory = [{ id: "log1", message: "Test" }];
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockHistory)
    })

    const data = await ApiClient.getSimulationHistory()
    expect(data).toEqual(mockHistory)
    expect(global.fetch).toHaveBeenCalledWith("/api/simulation/history", undefined)
  })
})
