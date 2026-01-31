import { describe, it, expect, vi } from 'vitest'
import { getPatientFlowData } from './data'
import { PATIENT_FLOW_DATA } from '@/db/mockdata'

describe('Data Fetching', () => {
  it('getPatientFlowData should return mock data after delay', async () => {
    vi.useFakeTimers()
    
    const promise = getPatientFlowData()
    
    // Fast-forward time
    vi.advanceTimersByTime(1000)
    
    const data = await promise
    expect(data).toEqual(PATIENT_FLOW_DATA)
    expect(data.length).toBeGreaterThan(0)
    
    vi.useRealTimers()
  })
})
