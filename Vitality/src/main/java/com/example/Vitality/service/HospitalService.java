package com.example.Vitality.service;

import com.example.Vitality.model.Department;
import com.example.Vitality.model.Hospital;
import com.example.Vitality.model.Patient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Map;
import java.util.Random;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;
import java.util.concurrent.PriorityBlockingQueue;
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.atomic.AtomicBoolean;

@Service
public class HospitalService {

    // Global Patient Registry (simulating a central database)
    private final Map<String, Patient> masterPatientIndex = new ConcurrentHashMap<>();
    private final Map<String, Hospital> cityHospitals = new ConcurrentHashMap<>();
    private final Random random = new Random();

    private final SurgeDetectorService surgeDetectorService;
    private final WebSocketService webSocketService;
    private final TriagePolicyService triagePolicyService;

    @Autowired
    public HospitalService(SurgeDetectorService surgeDetectorService, WebSocketService webSocketService, TriagePolicyService triagePolicyService) {
        this.surgeDetectorService = surgeDetectorService;
        this.webSocketService = webSocketService;
        this.triagePolicyService = triagePolicyService;
        
        // Inject global policy into Patient model
        Patient.policyService = triagePolicyService;
        
        webSocketService.broadcastEvent(Map.of("type", "SYSTEM_INIT", "message", "HospitalService Online"));
    }

    // Simulation Constants
    private static final int TREATMENT_TIME_MS = 10000; // Simulated 60 seconds treatment

    /**
     * initializes a hospital node with multiple departmental thread pools.
     */
    public Hospital createHospital(String id, String name, int maxCapacity) {
        Hospital hospital = Hospital.builder()
                .id(id)
                .name(name)
                .maxCapacity(maxCapacity)
                .x(random.nextInt(100))
                .y(random.nextInt(100))
                .build();

        // Initialize Departments
        initDepartment(hospital, Department.NURSE, 10); // 10 Nurses
        initDepartment(hospital, Department.GENERAL, 5); // 5 General Doctors
        initDepartment(hospital, Department.ICU, 2); // 2 ICU Specialists

        cityHospitals.put(id, hospital);
        return hospital;
    }

    private void initDepartment(Hospital h, Department dept, int staffCount) {
        PriorityBlockingQueue<Patient> queue = new PriorityBlockingQueue<>();
        h.getWaitingRooms().put(dept, queue);
        h.getStaffControl().put(dept, new ConcurrentLinkedDeque<>());

        // Store baseline count for surge scaling
        h.getBaselineStaffCount().put(dept, staffCount);

        ThreadFactory factory = r -> new Thread(r, h.getId() + "-" + dept + "-" + System.nanoTime());
        // Core and Max must be adjustable.
        ThreadPoolExecutor executor = new ThreadPoolExecutor(
                staffCount, staffCount, 0L, TimeUnit.MILLISECONDS,
                new LinkedBlockingQueue<>(), factory);

        h.getDepartmentalStaff().put(dept, executor);

        // Start consumers for this department
        for (int i = 0; i < staffCount; i++) {
            startNewDoctor(h, dept, executor, queue);
        }
    }

    private void startNewDoctor(Hospital h, Department dept, ThreadPoolExecutor executor,
            PriorityBlockingQueue<Patient> queue) {
        AtomicBoolean stopFlag = new AtomicBoolean(false);
        h.getStaffControl().get(dept).add(stopFlag);

        CompletableFuture.runAsync(() -> {
            while (!stopFlag.get()) { // Check flag before waiting
                try {
                    // 1. Primary Check (Blocking for a short time to prioritize own department)
                    Patient p = queue.poll(100, TimeUnit.MILLISECONDS);

                    // 2. Upward Referral Logic (If primary empty, check lower tiers)
                    if (p == null) {
                        if (dept == Department.ICU) {
                            // ICU Checks General, then Nurse
                            p = h.getWaitingRooms().get(Department.GENERAL).poll();
                            if (p == null) {
                                p = h.getWaitingRooms().get(Department.NURSE).poll();
                            }
                        } else if (dept == Department.GENERAL) {
                            // General Checks Nurse
                            p = h.getWaitingRooms().get(Department.NURSE).poll();
                        }
                    }

                    if (p != null) {
                        treatPatient(h, dept, p);
                        // User Requirement: Check stop flag AFTER treatment to ensure graceful exit
                        if (stopFlag.get()) {
                            break;
                        }
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }, executor);
    }

    private void treatPatient(Hospital h, Department dept, Patient p) {
        h.getActiveTreatments().incrementAndGet();
        p.setTreating(true);
        System.out.println("Hospital " + h.getId() + " [" + dept + "]: Treating patient " + p.getId() + " (Priority: "
                + p.getDynamicPriority() + ")");

        // Broadcast Start
        try {
            java.util.Map<String, Object> startEvent = new java.util.HashMap<>();
            startEvent.put("type", "TREATMENT_STARTED");
            startEvent.put("patientId", p.getId());
            startEvent.put("hospitalId", h.getId());
            startEvent.put("department", dept.name());
            startEvent.put("duration", p.getTreatmentTime());
            startEvent.put("timestamp", System.currentTimeMillis());
            webSocketService.broadcastEvent(startEvent);
        } catch (Exception e) {
            System.err.println("Failed to broadcast start event: " + e.getMessage());
        }

        try {
            Thread.sleep(p.getTreatmentTime());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } finally {
            h.getActiveTreatments().decrementAndGet();
            masterPatientIndex.remove(p.getId());

            // Broadcast Completion
            try {
                java.util.Map<String, Object> endEvent = new java.util.HashMap<>();
                endEvent.put("type", "TREATMENT_COMPLETED");
                endEvent.put("patientId", p.getId());
                endEvent.put("hospitalId", h.getId());
                endEvent.put("timestamp", System.currentTimeMillis());
                webSocketService.broadcastEvent(endEvent);
            } catch (Exception e) {
                System.err.println("Failed to broadcast end event: " + e.getMessage());
            }

            System.out.println("Hospital " + h.getId() + " [" + dept + "]: Finished treating patient " + p.getId());
        }
    }

    public void admitPatient(String hospitalId, Patient p) {
        Hospital h = cityHospitals.get(hospitalId);
        if (h != null) {
            masterPatientIndex.put(p.getId(), p); // Register globally

            // Notify Surge Detector
            surgeDetectorService.recordArrival();

            // Routing Logic (Vertical Scaling)
            Department targetDept;
            if (p.getBaseSeverity() <= 3) {
                targetDept = Department.NURSE;
            } else if (p.getBaseSeverity() <= 7) {
                targetDept = Department.GENERAL;
            } else {
                targetDept = Department.ICU;
            }

            h.getWaitingRooms().get(targetDept).offer(p);
            System.out.println("Admitted " + p.getId() + " to " + hospitalId + " -> " + targetDept + " Queue | "
                    + "Severity: " + p.getSeverity());
        }
    }

    public Hospital getHospital(String id) {
        return cityHospitals.get(id);
    }

    public synchronized void reset() {
        // Shutdown all threads
        for (Hospital h : cityHospitals.values()) {
            h.getDepartmentalStaff().forEach((dept, executor) -> executor.shutdownNow());
        }
        cityHospitals.clear();
        masterPatientIndex.clear();
        surgeDetectorService.reset();
        System.out.println("Hospital Simulation State Reset.");
    }

    public boolean transferPatient(String patientId, String sourceId, String targetId) {
        Hospital source = cityHospitals.get(sourceId);
        Hospital target = cityHospitals.get(targetId);
        Patient p = masterPatientIndex.get(patientId);

        if (source == null || target == null || p == null)
            return false;

        // Safety check: Don't move if treating
        if (p.isTreating())
            return false;

        Department dept = getDepartmentForSeverity(p.getBaseSeverity());

        // Remove from source (Costly O(n) scan, but necessary)
        boolean removed = source.getWaitingRooms().get(dept).remove(p);

        if (removed) {
            // Update patient record
            p.setTargetHospitalId(targetId);
            // Add to target
            target.getWaitingRooms().get(dept).offer(p);
            System.out.println(">>> 🚑 TRANSFER SUCCESS: " + p.getId() + " moved from " + sourceId + " to " + targetId);
            return true;
        }
        return false;
    }

    public Department getDepartmentForSeverity(int severity) {
        if (severity <= 3) {
            return Department.NURSE;
        } else if (severity <= 7) {
            return Department.GENERAL;
        } else {
            return Department.ICU;
        }
    }

    public Patient findPatient(String patientId) {
        return masterPatientIndex.get(patientId);
    }

    public java.util.Collection<Patient> getAllActivePatients() {
        return masterPatientIndex.values();
    }

    public java.util.Collection<Hospital> getAllHospitals() {
        return cityHospitals.values();
    }

    public synchronized void updateStaffCount(String hospitalId, Department dept, int targetCount) {
        Hospital h = cityHospitals.get(hospitalId);
        if (h != null) {
            ThreadPoolExecutor executor = h.getDepartmentalStaff().get(dept);
            java.util.Deque<AtomicBoolean> flags = h.getStaffControl().get(dept);

            if (executor != null && flags != null) {
                int currentCount = executor.getCorePoolSize();
                System.out.println(
                        "Updating " + hospitalId + " [" + dept + "] Staff: " + currentCount + " -> " + targetCount);

                if (targetCount > currentCount) {
                    // GROWING: Enhance capacity then add workers
                    executor.setMaximumPoolSize(Math.max(executor.getMaximumPoolSize(), targetCount));
                    executor.setCorePoolSize(targetCount);
                    executor.setMaximumPoolSize(targetCount); // Sync max to core

                    int diff = targetCount - currentCount;
                    for (int i = 0; i < diff; i++) {
                        startNewDoctor(h, dept, executor, h.getWaitingRooms().get(dept));
                    }

                } else if (targetCount < currentCount) {
                    // SHRINKING: Signal workers to stop, then reduce capacity
                    int diff = currentCount - targetCount;
                    for (int i = 0; i < diff; i++) {
                        AtomicBoolean flag = flags.pollLast(); // Remove from active list
                        if (flag != null) {
                            flag.set(true); // Signal thread to stop after current/next loop
                        }
                    }
                    // We don't shrink executor immediately to avoid interrupting active tasks.
                    // The threads will exit naturally. We can update core pool size to reflect
                    // "policy"
                    executor.setCorePoolSize(targetCount);
                    executor.setMaximumPoolSize(Math.max(targetCount, 1)); // Keep at least 1 slot or target
                }
            }
        }
    }

    /**
     * Scale staff for a specific hospital by a factor relative to baseline.
     * 
     * @param hospitalId The hospital to scale
     * @param factor     Scaling factor (1.0 = baseline, 1.4 = 40% increase)
     */
    public synchronized void scaleStaffByFactor(String hospitalId, double factor) {
        Hospital h = cityHospitals.get(hospitalId);
        if (h != null) {
            for (Department dept : Department.values()) {
                Integer baseline = h.getBaselineStaffCount().get(dept);
                if (baseline != null) {
                    int targetCount = Math.max(1, (int) (baseline * factor));
                    updateStaffCount(hospitalId, dept, targetCount);
                }
            }
        }
    }

    /**
     * Scale all hospitals in the city by a factor.
     * Used for surge response (1.4 = 40% increase) and recovery (1.0 = baseline).
     * 
     * @param factor Scaling factor
     */
    public void scaleAllHospitals(double factor) {
        System.out.println(">>> 🏥 SCALING ALL HOSPITALS by factor: " + factor + " <<<");
        for (Hospital h : cityHospitals.values()) {
            scaleStaffByFactor(h.getId(), factor);
        }
    }

    public void updatePatientDistress(String patientId, com.example.Vitality.model.DistressStatus status) {
        Patient p = masterPatientIndex.get(patientId);
        if (p != null) {
            System.out.println(">>> DISTRESS UPDATE: Patient " + patientId + " status " + status);
            p.updateDistress(status);
            // Note: Queue might not re-sort immediately until polling, but since PriorityBlockingQueue is used,
            // we rely on the next poll() or iteration to reflect changes. 
            // For strict re-ordering, we would need to remove and re-add, but that's expensive O(N).
            // Given the simulation loop, eventual consistency (milliseconds) is acceptable.
        }
    }
}
