# Vitality Backend Integration Guide

This document outlines the API endpoints, data models, and integration strategies for connecting the Next.js frontend with the Vitality Java Spring Boot backend.

## Server Configuration

*   **Base URL:** `http://localhost:9090/api/simulation`
*   **Communication Protocol:** HTTP REST (No WebSockets currently implemented; use polling for live updates).

---

## API Endpoints

### 1. Initialize City
Resets or initializes the simulation with a specific number of hospitals.

*   **Endpoint:** `POST /init`
*   **Description:** Creates `N` hospitals (H1, H2, ... HN) with random capacities and default department configurations.
*   **Request Body:**
    ```json
    {
      "count": "5" 
    }
    ```
    *Note: The value for count must be a string.*
*   **Response:** `String` (e.g., "City Initialized with 5 hospitals.")

### 2. Inject Patient (Single)
Simulates a single patient arriving at a specific hospital.

*   **Endpoint:** `POST /patient`
*   **Request Body:**
    ```json
    {
      "hospitalId": "H1",
      "severity": 7
    }
    ```
    *   `hospitalId`: Target hospital ID (e.g., "H1", "H2").
    *   `severity`: Integer between 1 (low) and 10 (critical).
*   **Response:** `String` (Confirmation message).

### 3. Trigger Surge (Batch Injection)
Simulates a mass casualty or high-load event by injecting multiple patients randomly across the city.

*   **Endpoint:** `POST /surge`
*   **Request Body:**
    ```json
    {
      "count": "20"
    }
    ```
    *Note: The value for count must be a string.*
*   **Response:** `String` (e.g., "Injected 20 patients in the queue.")

### 4. Trigger Distress Event
Simulates a patient's condition worsening while waiting (e.g., collapse, heart attack). This increases their dynamic priority.

*   **Endpoint:** `POST /distress`
*   **Request Body:**
    ```json
    {
      "hospitalId": "H1", 
      "patientId": "uuid-string-here",
      "distressLevel": 5
    }
    ```
    *   `distressLevel`: Amount to increase the priority score by.
*   **Response:** `String` (Status update with new priority).

### 5. Evaluate Redirection
Checks if a patient should be moved to a different hospital based on current wait times and travel cost.

*   **Endpoint:** `POST /redirect/evaluate`
*   **Request Body:**
    ```json
    {
      "currentHospitalId": "H1",
      "patientId": "uuid-string-here"
    }
    ```
*   **Response:** `String` (The ID of the recommended hospital, e.g., "H2". If no better option exists, returns the current hospital ID "H1").

### 6. Get City Stats (Global Dashboard)
Retrieves aggregated metrics for the entire city. Ideal for the main dashboard header.

*   **Endpoint:** `GET /stats`
*   **Response:**
    ```json
    {
      "totalHospitals": 3,
      "totalPatientsWaiting": 45,
      "totalDoctorsActive": 12,
      "surgeActive": false
    }
    ```
    *   `surgeActive`: Boolean indicating if the "Survival Mode" logic (aggressive triage) is active.

### 7. Get Hospital Details
Retrieves detailed state of a specific hospital, including queues for every department.

*   **Endpoint:** `GET /hospital/{id}`
*   **Example:** `GET /hospital/H1`
*   **Response Structure:**
    ```json
    {
      "id": "H1",
      "name": "Hospital #1",
      "maxCapacity": 85,
      "waitingRooms": {
        "NURSE": [ ...Array of Patients... ],
        "GENERAL": [ ...Array of Patients... ],
        "ICU": [ ...Array of Patients... ]
      },
      "activeTreatments": 5,
      "totalQueueSize": 12,
      "activeDoctorCount": 5
    }
    ```

---

## TypeScript Interfaces

Copy these definitions into your Next.js project (e.g., `lib/types.ts`) to ensure type safety.

```typescript
// Enums
export type Department = 'NURSE' | 'GENERAL' | 'ICU';

// Patient Model
export interface Patient {
  id: string;
  baseSeverity: number; // 1-10
  arrivalTime: number; // Timestamp (ms)
  targetHospitalId: string;
  distressScore: number; // AtomicInteger serializes to number
  treating: boolean; // Mapped from isTreating
  dynamicPriority: number; // Calculated field
}

// Hospital Model
export interface Hospital {
  id: string;
  name: string;
  maxCapacity: number;
  // waitingRooms keys map to the Department enum
  waitingRooms: Record<Department, Patient[]>;
  // Note: departmentalStaff (ThreadPoolExecutor) is excluded as it doesn't serialize cleanly to useful JSON
  activeTreatments: number; // AtomicInteger serializes to number
  
  // Computed getters included in serialization
  totalQueueSize: number;
  activeDoctorCount: number;
}

// City Stats Model
export interface CityStats {
  totalHospitals: number;
  totalPatientsWaiting: number;
  totalDoctorsActive: number;
  surgeActive: boolean;
}
```

## Integration Strategy

### Polling Implementation
Since the backend uses standard REST without WebSockets, the frontend must poll for updates to show "live" data.

**Recommendation:**
*   **Global Stats:** Poll `GET /stats` every **1-2 seconds**.
*   **Hospital View:** Poll `GET /hospital/{id}` every **1-2 seconds** only when the specific hospital modal or page is open.

### Visualizing Queues
The `waitingRooms` object in the Hospital response contains sorted arrays of patients.
1.  **Ordering:** The backend `PriorityBlockingQueue` ensures the array is already sorted by `dynamicPriority`. The first element `[0]` is the next to be treated.
2.  **Departments:**
    *   Severity 1-3 -> `NURSE`
    *   Severity 4-7 -> `GENERAL`
    *   Severity 8-10 -> `ICU`

### Handling Surge Mode
When `surgeActive` in `/stats` is `true`:
1.  Display a prominent warning (Red Banner/Overlay).
2.  The backend changes the priority formula (Time Weight doubles). Visual indicators of "Time Waited" should perhaps be highlighted to reflect this urgency.
