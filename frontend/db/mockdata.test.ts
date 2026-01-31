import { describe, it, expect } from 'vitest'
import { PATIENT_FLOW_DATA } from './mockdata'
import { PatientFlowRecord } from '@/lib/types'

describe('Mock Data', () => {
  it('should export PATIENT_FLOW_DATA array', () => {
    expect(PATIENT_FLOW_DATA).toBeDefined()
    expect(Array.isArray(PATIENT_FLOW_DATA)).toBe(true)
    expect(PATIENT_FLOW_DATA.length).toBeGreaterThan(0)
  })

  it('should have correct structure for each record', () => {
    const record = PATIENT_FLOW_DATA[0]
    expect(record).toHaveProperty('timestamp')
    expect(record).toHaveProperty('activePatients')
    expect(record).toHaveProperty('waiting')
    expect(record).toHaveProperty('discharged')
    expect(record).toHaveProperty('newArrivals')
  })
})
