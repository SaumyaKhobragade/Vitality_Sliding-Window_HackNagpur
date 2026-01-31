# Adaptive City-Scale Hospital Triage System (Vitality)

## Product Requirements Document (PRD)

**Version:** 2.0 (Hackathon + City-Scale Extension)  
**Status:** Expanded & Proposed Final Draft  
**Audience:** Engineers, Hackathon Judges, Product Reviewers, System Designers

---

## 1. Executive Summary

The **Adaptive City-Scale Hospital Triage System (Vitality)** is a real-time, distributed, and ethically grounded decision-support platform designed to manage **patient prioritization, hospital load balancing, and emergency surge handling across multiple hospitals within a city**.

The system extends traditional single-hospital triage by introducing:
- **Multi-hospital coordination**
- **Intelligent patient redirection**
- **Behavioral distress detection using CCTV and human-in-the-loop confirmation**
- **Explainable, policy-driven scheduling**
- **Graceful degradation under extreme stress**

Vitality is **not a medical decision-maker**. It does **not diagnose, prescribe, or override clinical judgment**. Instead, it provides **operational intelligence** to assist hospital staff and administrators in making faster, fairer, and more transparent decisions.

---

## 2. Problem Statement

Modern urban healthcare systems face systemic challenges that cannot be solved at a single-hospital level:

1. **Localized Patient Surges**  
   Accidents, outbreaks, or public events overload specific hospitals while others remain underutilized.

2. **Uneven Resource Distribution**  
   Doctors, ICU beds, and equipment availability vary significantly across hospitals.

3. **Static Triage Models**  
   FIFO or static-priority queues fail during overload, causing:
   - Excessive waits for critical patients
   - Starvation of non-critical patients
   - Ethical ambiguity and lack of transparency

4. **Invisible Distress Signals**  
   Patients deteriorate while waiting, and staff may not immediately notice observable distress (collapse, vomiting, immobility).

5. **Lack of System-Wide Visibility**  
   Hospitals operate in silos with no real-time view of city-wide stress.

**Vitality addresses these issues by treating the city as a coordinated healthcare system rather than isolated facilities.**

---

## 3. Goals & Success Criteria

### 3.1 Primary Goals
- Always prioritize critical patients ethically and transparently
- Coordinate patient flow across multiple hospitals
- Detect and react to real-time distress signals
- Support continuous patient arrivals (streaming)
- Treat multiple patients in parallel across hospitals
- Handle doctor shortages and hospital overload gracefully

### 3.2 Secondary Goals
- Prevent starvation of lower-severity patients
- Provide explainable scheduling and redirection decisions
- Support human override and confirmation
- Enable live simulation and stress testing
- Expose rich real-time metrics for monitoring

### 3.3 Success Criteria
- No system crashes under extreme surge
- No interruption of active treatments
- Ethical and explainable redirection decisions
- Observable fairness across hospitals
- Clear operational insights for staff and admins

---

## 4. Scope Definition

### 4.1 In Scope
- Multi-hospital coordination within a city
- Priority-based triage and scheduling
- Intelligent patient redirection
- Behavioral distress signal ingestion (CCTV or simulated)
- Human-in-the-loop confirmation
- Dynamic doctor and capacity scaling
- Real-time metrics and dashboards
- Simulation engine

### 4.2 Out of Scope
- Medical diagnosis or treatment decisions
- Automated life-critical actions without human confirmation
- Inter-city or national coordination
- Long-term patient data storage
- Legal or billing workflows

---

## 5. Assumptions & Constraints

- Treatment is **non-preemptive**
- One doctor treats one patient at a time
- Severity is externally assigned (triage nurse / system input)
- CCTV analysis detects **behavioral distress**, not medical conditions
- System runs as a logical single control plane (can be simulated in one JVM)
- All queues are explicitly bounded

---

## 6. High-Level System Architecture

```
                City Triage Orchestrator
                         |
      -------------------------------------------------
      |                     |                        |
Hospital A            Hospital B                Hospital C
(Local Triage)        (Local Triage)            (Local Triage)
```

### Key Architectural Principle
- **Decentralized execution, centralized intelligence**

Hospitals operate independently but publish state to a city-level orchestrator that assists with redirection and policy decisions.

---

## 7. Core Components

### 7.1 City Triage Orchestrator

Responsibilities:
- Aggregate real-time hospital metrics
- Detect city-wide surges
- Compute redirection recommendations
- Enforce ethical and safety constraints

Maintains:
- Hospital registry
- Load & capacity snapshots
- Redirection policies

---

### 7.2 Hospital-Level Triage Engine

Each hospital runs its own triage system with:
- Local waiting queue
- Doctor thread pool
- Admission control

Hospitals never lose autonomy; they **accept or reject redirection suggestions**.

---

### 7.3 Triage & Scheduling Engine

#### Priority Calculation Model

```
FinalPriority =
  BaseSeverity
  + WaitingTimeBoost
  + DistressBoost
  - StabilityPenalty
```

Properties:
- Severity-dominant
- Time-aware
- Distress-aware
- Non-preemptive

Fairness aging ensures eventual service for long-waiting patients.

---

### 7.4 Policy-as-Code Engine

All scheduling and redirection logic is configurable via policies:

```yaml
triagePolicy:
  severityWeight: 10
  agingEnabled: true
  distressDecayRate: 0.1
  overload:
    minSeverity: 6
```

Benefits:
- Hospital-specific customization
- Live policy switching during simulations
- Transparent decision logic

---

### 7.5 Concurrency Layer

#### Waiting Room Queue
- `PriorityBlockingQueue<Patient>`
- Thread-safe
- Lazy invalidation for updates
- Bounded capacity

#### Doctor Execution Pool
- `ThreadPoolExecutor`
- One thread = one doctor
- Dynamically resizable
- No treatment interruption

---

## 8. Behavioral Distress Signal Engine (BDSE)

### 8.1 Purpose

To detect **observable patient distress signals** using CCTV feeds or simulated events and assist staff in prioritization.

### 8.2 Detected Signals
- Sudden collapse or fall
- Prolonged immobility
- Repeated bending (possible nausea)
- Erratic or agitated movement
- Crowd gathering around a patient

### 8.3 Key Safeguards
- No medical inference
- Signals are temporary
- Human confirmation required for major priority jumps
- Full audit logging

---

## 9. Human-in-the-Loop Design

High-impact decisions require staff confirmation:

1. System raises alert
2. Nurse/admin reviews context
3. Decision confirmed or rejected
4. Action applied with audit trail

This ensures:
- Ethical compliance
- Trust
- Reduced false positives

---

## 10. Multi-Hospital Redirection Strategy

### 10.1 Redirection Eligibility
- Patient stability threshold
- Severity ceiling for transport
- Required specialization availability

### 10.2 Redirection Score

```
RedirectScore =
  (WaitTime_here - TravelTime - WaitTime_there)
  × SeverityWeight
```

### 10.3 Redirection States
- SAFE_REDIRECT
- CONDITIONAL_REDIRECT
- NO_REDIRECT

Each decision includes an explainable reason.

---

## 11. Doctor Shortage & Fatigue Modeling

Doctors are modeled as finite human resources:
- Max continuous treatments
- Fatigue cooldown periods
- Temporary efficiency reduction

This improves realism and system stability.

---

## 12. Surge Detection & Prediction

### 12.1 Detection Signals
- Queue growth rate
- Arrival vs treatment rate
- Distress signal density

### 12.2 Predictive Heuristics

If arrival rate exceeds rolling average by threshold:
- Pre-activate overload policy
- Prepare redirection

No ML required for hackathon scope.

---

## 13. Monitoring & Observability

### 13.1 Metrics Exposed
- Queue size (per hospital)
- Average & max wait time
- Active treatments
- Distress alerts
- Redirections performed
- Fairness index

### 13.2 Fairness Index

```
FairnessIndex =
(max_wait - min_wait) / avg_wait
```

---

## 14. Simulation Engine

Supports:
- Artificial patient surges
- Random doctor unavailability
- Random distress events
- Policy switching
- Multi-hospital stress testing

Used for:
- Live demos
- Validation
- What-if analysis

---

## 15. Ethical & Legal Considerations

- Advisory-only system
- No automated treatment decisions
- Human confirmation required
- Transparent scoring & logs
- Explicit overload signaling

---

## 16. Risks & Mitigations

| Risk | Mitigation |
|----|----|
| False distress detection | Human confirmation |
| Priority inflation | Decay & rollback |
| Hospital overload | Redirection + admission control |
| Staff mistrust | Explainable decisions |

---

## 17. Technology Stack

### 17.1 Backend & Core Systems

- **Language:** Java 17+
- **Framework:** Spring Boot (REST APIs, scheduling, dependency injection)
- **Concurrency:**
  - `PriorityBlockingQueue` for patient waiting rooms
  - `ThreadPoolExecutor` for doctor execution pools
  - `CompletableFuture` for async orchestration (city-level)

### 17.2 Data & State Management

- **In-Memory Stores (Hackathon Scope):**
  - `ConcurrentHashMap` for patient state, hospital registry
  - `AtomicInteger / AtomicLong` for metrics
- **Optional Persistence (Mock / Optional):**
  - H2 / SQLite (for audit logs, replay)

### 17.3 Video / Distress Signal Pipeline

- **Input:**
  - Simulated CCTV events (JSON)
  - Optional webcam / prerecorded video
- **Processing (Hackathon-Safe):**
  - OpenCV (motion, posture heuristics)
  - Event-based abstraction (no raw video storage)

### 17.4 Frontend / Visualization (Optional but High Impact)

- **Dashboard:** React / Next.js
- **Charts:** Chart.js / Recharts
- **Live Updates:** WebSockets / Server-Sent Events (SSE)

### 17.5 DevOps & Tooling

- Docker (single-node simulation)
- Maven / Gradle
- GitHub Actions (optional CI)

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

Vitality transforms hospital triage from a **local, reactive process** into a **city-scale, adaptive, ethical, and explainable system**. By combining concurrency-safe scheduling, behavioral distress awareness, and multi-hospital coordination, the platform demonstrates how modern software systems can meaningfully support real-world healthcare operations without replacing human judgment.

---

**End of PRD**

