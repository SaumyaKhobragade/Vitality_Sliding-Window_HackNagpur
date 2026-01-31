# Adaptive City-Scale Hospital Triage System (ACHTS)

## Product Requirements Document (PRD)

**Version:** 2.0 (Hackathon + City-Scale Extension)  
**Status:** Expanded & Proposed Final Draft  
**Audience:** Engineers, Hackathon Judges, Product Reviewers, System Designers

---

## 1. Executive Summary

The **Adaptive City-Scale Hospital Triage System (ACHTS)** is a real-time, distributed decision-support platform designed to manage **patient prioritization, hospital load balancing, and emergency surge handling across multiple hospitals within a city**.

**Scope Note:** This implementation focuses strictly on the **Backend Logic and Simulation Engine**. Frontend integration is deferred.

The system extends traditional single-hospital triage by using a **Logical Single Control Plane** to simulate:

- **Multi-hospital coordination**
- **Intelligent patient redirection**
- **Behavioral distress detection (Simulated Inputs)**
- **Explainable, policy-driven scheduling**

---

## 2. Problem Statement

Modern urban healthcare systems face systemic challenges that cannot be solved at a single-hospital level:

1. **Localized Patient Surges**
   Accidents, outbreaks, or public events overload specific hospitals while others remain underutilized.

2. **Uneven Resource Distribution**
   Doctors, ICU beds, and equipment availability vary significantly across hospitals.

3. **Static Triage Models**
   FIFO or static-priority queues fail during overload, causing excessive waits for critical patients.

4. **Lack of System-Wide Visibility**
   Hospitals operate in silos with no real-time view of city-wide stress.

**ACHTS addresses these issues by treating the city as a coordinated healthcare system.**

---

## 3. Goals & Success Criteria

### 3.1 Primary Goals

- **Backend Core:** Implement a robust concurrency model for patient queuing and doctor thread pools.
- **Triage Logic:** Always prioritize critical patients ethically using dynamic scoring.
- **Coordination:** Simulate 3+ hospitals exchanging load data and accepting redirections.
- **Simulation:** Create a "God-Mode" simulation that injects patient surges and distress events to test stability.

### 3.2 Success Criteria

- **Stability:** System handles 1000+ concurrent simulated patients without crashing (Single JVM).
- **Correctness:** High-severity patients are served first; redirection occurs only when beneficial.
- **Explainability:** Every decision (Wait vs. Redirect) produces a readable log/reason.

---

## 4. Scope Definition

### 4.1 In Scope (Backend & Simulation)

- **City Triage Orchestrator (Logic):** Aggregates state and suggests redirects.
- **Hospital Nodes (Simulated):** Independent objects with local queues and thread pools.
- **Triage Algorithm:** Dynamic priority calculation (Severity + Wait Time + Distress).
- **Simulation Engine:** Scriptable injector for patient arrivals and distress updates.
- **API Layer:** REST endpoints to inspect state, trigger events, and fetch metrics.

### 4.2 Deferred / Out of Scope

- **Frontend UI:** Web dashboards (React/Next.js) are deferred.
- **Real Video Processing:** CCTV analysis is simulated via JSON event injection.
- **Physical Distributed Deployment:** System runs in a single JVM (Logical Microservices).
- **Permanent Persistence:** In-memory storage is sufficient for the simulation.

---

## 5. High-Level Architecture (Logical Simulation)

**Pattern:** Monolithic Spring Boot App simulating a Distributed System.

```
+-------------------------------------------------------------+
|  JVM (Spring Boot Context)                                  |
|                                                             |
|  [Simulation Controller] ---> [Event Injector]              |
|           |                                                 |
|           v                                                 |
|  [City Orchestrator Service] <---- Global State Map         |
|           |                                                 |
|           +---> [Hospital A Service] (Queue + ThreadPool)   |
|           |                                                 |
|           +---> [Hospital B Service] (Queue + ThreadPool)   |
|           |                                                 |
|           +---> [Hospital C Service] (Queue + ThreadPool)   |
|                                                             |
+-------------------------------------------------------------+
```

### Key Architectural Decisions

- **Communication:** Method calls mimic network requests (e.g., `orchestrator.requestRedirect(patient)`).
- **Concurrency:** Each "Hospital" has its own `ThreadPoolExecutor` representing doctors.
- **Isolation:** Hospitals do not share queues; they only communicate via the Orchestrator.

---

## 6. Core Components

### 6.1 Hospital Service (The Node)

- **Waiting Room:** `PriorityBlockingQueue<Patient>`
  - Ordered by `FinalPriority`.
- **Medical Staff:** `ThreadPoolExecutor`
  - Core Pool Size = Number of Doctors.
  - Task = `treatPatient(Patient p)`.
  - Thread sleep simulates treatment duration.

### 6.2 Triage & Priority Engine

**Formula:**
`Priority = BaseSeverity + (WaitTime * AgingFactor) + DistressBonus`

- **Severity:** 1 (Low) to 10 (Critical).
- **DistressBonus:** Dynamic boost from simulated CCTV events.

### 6.3 Orchestrator Service

- Monitors `queueSize` and `estimatedWaitTime` of all hospitals.
- **Redirection Logic:**
  - IF `Hospital A` is overloaded AND `Hospital B` has capacity
  - AND `TransferTime + WaitTime_B < WaitTime_A`
  - THEN Suggest Redirect.

---

## 7. Data Models (Simplified)

### 7.1 Patient

```java
class Patient {
  String id;
  int severity; // 1-10
  long arrivalTime;
  Hospital currentHospital;
  boolean isTreating;
}
```

### 7.2 Distress Event (Simulated)

```java
class DistressEvent {
  String patientId;
  String type; // "COLLAPSE", "VOMITING"
  double confidence; // 0.0 - 1.0
}
```

---

## 8. API Design (Inspection & Control)

Since there is no frontend, we rely on these endpoints for control/debug:

### 8.1 Simulation Control

- `POST /api/simulation/start`: Reset state and start processing.
- `POST /api/simulation/inject`: Add a specific test patient.
- `POST /api/simulation/surge`: Trigger a random surge of N patients.

### 8.2 Inspection

- `GET /api/hospitals/{id}`: Get queue status and doctor usage.
- `GET /api/city/metrics`: System-wide health checks.

---

## 9. Technology Stack

- **Language:** Java 17
- **Framework:** Spring Boot 3.x / 4.x
- **Build:** Gradle
- **State:** In-Memory (`ConcurrentHashMap`, `AtomicInteger`) (No DB required)
- **Testing:** JUnit 5 (Unit tests), MockMvc (Integration)

---

## 18. API Design

### 18.1 Patient APIs

#### Register New Patient

```
POST /patients
```

```json
{
  "patientId": "P123",
  "severity": 7,
  "hospitalId": "HOSP_A",
  "arrivalTime": "2026-01-31T10:30:00Z"
}
```

#### Update Patient Condition

```
POST /patients/{id}/update
```

```json
{
  "severity": 8,
  "source": "NURSE_CONFIRMATION"
}
```

---

### 18.2 Hospital & Doctor APIs

#### Update Doctor Availability

```
POST /hospitals/{id}/doctors
```

```json
{
  "availableDoctors": 12
}
```

#### Hospital Metrics Snapshot

```
GET /hospitals/{id}/metrics
```

---

### 18.3 City-Level Orchestrator APIs

#### Register Hospital

```
POST /city/hospitals
```

```json
{
  "hospitalId": "HOSP_A",
  "specializations": ["TRAUMA", "ICU"],
  "maxCapacity": 200
}
```

#### Redirection Recommendation

```
POST /city/redirect/evaluate
```

```json
{
  "patientId": "P123",
  "currentHospital": "HOSP_A"
}
```

**Response**

```json
{
  "decision": "CONDITIONAL_REDIRECT",
  "targetHospital": "HOSP_B",
  "reason": "Lower wait time and available ICU"
}
```

---

### 18.4 Distress Signal APIs

#### Report Distress Event

```
POST /distress/event
```

```json
{
  "patientId": "P123",
  "signalType": "PROLONGED_IMMOBILITY",
  "confidence": 0.82,
  "zone": "WAITING_AREA"
}
```

---

### 18.5 Admin & Policy APIs

#### Update Triage Policy

```
POST /admin/policy/update
```

```json
{
  "severityWeight": 10,
  "agingEnabled": true,
  "distressDecayRate": 0.1
}
```

#### Manual Override

```
POST /admin/override
```

```json
{
  "patientId": "P123",
  "action": "PRIORITY_BOOST",
  "reason": "Doctor observation"
}
```

---

## 19. Data Models

### 19.1 Patient

```java
class Patient {
  String patientId;
  int baseSeverity;
  Instant arrivalTime;
  String hospitalId;
}
```

---

### 19.2 PatientState (Mutable, Thread-Safe)

```java
class PatientState {
  AtomicInteger currentSeverity;
  AtomicInteger distressScore;
  AtomicLong lastUpdated;
}
```

---

### 19.3 Hospital

```java
class Hospital {
  String hospitalId;
  Set<String> specializations;
  int maxCapacity;
  AtomicInteger activeDoctors;
}
```

---

### 19.4 DistressEvent

```java
class DistressEvent {
  String patientId;
  SignalType signal;
  double confidence;
  String zone;
  Instant timestamp;
}
```

---

### 19.5 SchedulingDecision (Explainability)

```java
class SchedulingDecision {
  String patientId;
  int finalPriority;
  List<String> reasons;
}
```

---

## 20. Future Enhancements

- Inter-city coordination
- Predictive ML-based surge modeling
- Wearable signal integration
- Ambulance routing optimization
- Digital twin of city healthcare

---

## 18. Summary

ACHTS transforms hospital triage from a **local, reactive process** into a **city-scale, adaptive, ethical, and explainable system**. By combining concurrency-safe scheduling, behavioral distress awareness, and multi-hospital coordination, the platform demonstrates how modern software systems can meaningfully support real-world healthcare operations without replacing human judgment.

---

**End of PRD**
