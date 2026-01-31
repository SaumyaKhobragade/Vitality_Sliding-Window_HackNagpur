import { describe, it, expectTypeOf } from 'vitest'
import { PatientFlowRecord } from './types'

describe('Type Definitions', () => {
  it('should have a PatientFlowRecord interface', () => {
    // This test basically checks if the type exists and compiles
    // We can also check specific properties if we want to be strict
    const record: PatientFlowRecord = {
        timestamp: '10:00',
        activePatients: 50,
        waiting: 10,
        discharged: 5,
        newArrivals: 8
    }
    
    expectTypeOf(record).toBeObject()
    expectTypeOf(record.timestamp).toBeString()
    expectTypeOf(record.activePatients).toBeNumber()
  })
})
