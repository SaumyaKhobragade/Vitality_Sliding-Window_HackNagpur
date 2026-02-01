import { describe, it, expect, vi } from 'vitest'
import { getPatientFlowData } from './data'

global.fetch = vi.fn()

describe('Data Fetching', () => {
  it('getPatientFlowData should return data from API', async () => {
    const mockData = [{ timestamp: "10:00", activePatients: 45 }];
    (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData)
    });
    
    const data = await getPatientFlowData()
    
    expect(global.fetch).toHaveBeenCalledWith("/api/analytics")
    expect(data).toEqual(mockData)
  })
})
