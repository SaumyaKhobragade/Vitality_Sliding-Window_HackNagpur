package com.example.Vitality.service;

import com.example.Vitality.model.Hospital;
import com.example.Vitality.model.Patient;
import com.example.Vitality.model.Department;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

import org.springframework.scheduling.annotation.Scheduled;

@Service
public class OrchestratorService {

    // Auto-monitor every 5 seconds
    @Scheduled(fixedRate = 7000)
    public void monitorAndRedirect() {
        if (hospitalService.getAllHospitals().isEmpty()) {
            System.out.println(">>> [Auto-Monitor] No hospitals registered yet. Skipping cycle.");
            return;
        }

        System.out.println(">>> [Auto-Monitor] ===== Starting Redirection Cycle =====");
        StringBuilder queueStats = new StringBuilder(">> [Auto-Monitor] Queues: ");
        int totalScanned = 0;
        int totalMoved = 0;
        int totalPatientsInSystem = 0;

        // Iterate all hospitals
        for (Hospital h : hospitalService.getAllHospitals()) {
            // Append stats for debugging
            int nurseQ = h.getDepartmentQueueSize(Department.NURSE);
            int genQ = h.getDepartmentQueueSize(Department.GENERAL);
            int icuQ = h.getDepartmentQueueSize(Department.ICU);
            int hospitalTotal = nurseQ + genQ + icuQ;
            totalPatientsInSystem += hospitalTotal;

            queueStats.append(
                    String.format("[%s(%d,%d): N%d G%d I%d Total:%d] ",
                            h.getId(), h.getX(), h.getY(), nurseQ, genQ, icuQ, hospitalTotal));

            for (Department dept : Department.values()) {
                int[] stats = checkQueueForRedirects(h, dept);
                totalScanned += stats[0];
                totalMoved += stats[1];
            }
        }

        System.out.println(queueStats.toString());
        System.out.println(
                String.format(">>> [Auto-Monitor] Cycle Complete -> Total Patients: %d | Scanned: %d | Redirected: %d",
                        totalPatientsInSystem, totalScanned, totalMoved));

        if (totalMoved > 0) {
            System.out.println(">>> [Auto-Monitor] ✅ Successfully redirected " + totalMoved + " patients this cycle!");
        } else if (totalScanned > 0) {
            System.out.println(
                    ">>> [Auto-Monitor] ⚠️ Scanned " + totalScanned + " patients but found no beneficial redirections");
        }
        System.out.println(">>> [Auto-Monitor] ===== Cycle End =====\n");
    }

    private int[] checkQueueForRedirects(Hospital source, Department dept) {
        // Snapshot array to avoid CME
        // Use getOrDefault to prevent NullPointer
        java.util.Queue<Patient> q = source.getWaitingRooms().get(dept);
        if (q == null || q.isEmpty())
            return new int[] { 0, 0 };

        Object[] patients = q.toArray();
        int scanned = 0;
        int moved = 0;

        if (patients.length > 0) {
            System.out.println(String.format("  >> Checking %s [%s] queue: %d patients waiting",
                    source.getId(), dept, patients.length));
        }

        for (Object obj : patients) {
            if (scanned++ > 50) // Increased limit
                break;

            Patient p = (Patient) obj;
            String bestTarget = evaluateRedirection(p.getId(), source.getId());

            if (bestTarget != null && !bestTarget.equals(source.getId())) {
                System.out.println(String.format("  >> Attempting transfer: %s from %s to %s",
                        p.getId(), source.getId(), bestTarget));
                boolean success = hospitalService.transferPatient(p.getId(), source.getId(), bestTarget);
                if (success) {
                    moved++;
                    System.out.println(String.format("  >> ✅ Transfer SUCCESS: %s moved to %s",
                            p.getId(), bestTarget));

                    // Broadcast redirection event to frontend
                    Hospital targetHospital = hospitalService.getHospital(bestTarget);
                    Map<String, Object> event = new HashMap<>();
                    event.put("type", "PATIENT_REDIRECTED");
                    event.put("patientId", p.getId());
                    event.put("sourceHospitalId", source.getId());
                    event.put("sourceHospitalName", source.getName());
                    event.put("targetHospitalId", bestTarget);
                    event.put("targetHospitalName", targetHospital != null ? targetHospital.getName() : bestTarget);
                    event.put("severity", p.getSeverity());
                    event.put("timestamp", System.currentTimeMillis());
                    event.put("message", "🔄 Patient " + p.getId().substring(0, 8) + " redirected from "
                            + source.getName() + " to "
                            + (targetHospital != null ? targetHospital.getName() : bestTarget));
                    webSocketService.broadcastEvent(event);
                    sseService.broadcastEvent(event);
                } else {
                    System.out.println(
                            String.format("  >> ❌ Transfer FAILED: %s could not be moved (likely already treating)",
                                    p.getId()));
                }
            }
        }

        if (scanned > 0 && moved == 0) {
            System.out.println(String.format("  >> No beneficial redirections found for %s [%s] (scanned %d patients)",
                    source.getId(), dept, scanned));
        }

        return new int[] { scanned, moved };
    }

    private final HospitalService hospitalService;
    private final SurgeDetectorService surgeDetectorService;
    private final WebSocketService webSocketService;
    private final SseService sseService;

    // Redirection threshold: allow redirections even with small negative benefits
    private static final double MIN_REDIRECT_BENEFIT = -2.0;
    // Distance penalty: 20 units distance = 1 patient in queue (reduced from 10)
    private static final double DISTANCE_PENALTY_FACTOR = 0.05;

    @Autowired
    public OrchestratorService(HospitalService hospitalService, SurgeDetectorService surgeDetectorService,
            WebSocketService webSocketService, SseService sseService) {
        this.hospitalService = hospitalService;
        this.surgeDetectorService = surgeDetectorService;
        this.webSocketService = webSocketService;
        this.sseService = sseService;
    }

    /**
     * Retrieves all hospitals registered in the system.
     * In a real system, this would might call out to the services.
     * Here, it queries the HospitalService registry.
     */
    public Collection<Hospital> getAllHospitals() {
        // We need to expose the values from HospitalService.
        // Ideally HospitalService should have a getAll() method.
        // For now, let's assume we can get them by IDs if we knew them,
        // OR let's add a getAllHospitals to HospitalService.
        return hospitalService.getAllHospitals();
    }

    public Map<String, Object> getCityStats() {
        Map<String, Object> stats = new HashMap<>();
        Collection<Hospital> hospitals = getAllHospitals();

        int totalPatientsWaiting = 0;
        int totalDoctorsActive = 0;

        for (Hospital h : hospitals) {
            totalPatientsWaiting += h.getTotalQueueSize();
            totalDoctorsActive += h.getActiveDoctorCount();
        }

        stats.put("totalHospitals", hospitals.size());
        stats.put("totalPatientsWaiting", totalPatientsWaiting);
        stats.put("totalDoctorsActive", totalDoctorsActive);
        stats.put("surgeActive", surgeDetectorService.isSurgeActive()); // Expose Surge Status

        return stats;
    }

    /**
     * Evaluates if a patient should be redirected from sourceHospital to another
     * hospital.
     * Returns the target Hospital ID (could be the same as source if no redirect).
     */
    public String evaluateRedirection(String patientId, String sourceHospitalId) {
        Hospital source = hospitalService.getHospital(sourceHospitalId);
        Patient patient = hospitalService.findPatient(patientId);

        if (source == null || patient == null)
            return null;

        // Determine which queue matters
        Department requiredDept = hospitalService.getDepartmentForSeverity(patient.getBaseSeverity());

        double maxScore = MIN_REDIRECT_BENEFIT - 1; // Start below threshold
        String bestTargetId = sourceHospitalId;

        // Get queue size ONLY for the relevant department
        double waitSource = source.getDepartmentQueueSize(requiredDept);

        boolean foundCandidate = false;

        for (Hospital candidate : getAllHospitals()) {
            if (candidate.getId().equals(sourceHospitalId))
                continue;

            double waitCandidate = candidate.getDepartmentQueueSize(requiredDept);

            // Balanced Formula: Cost = Queue + (Distance * DISTANCE_PENALTY_FACTOR)
            // 20 units distance = 1 patient in queue (reduced penalty)
            double dist = Math.hypot(source.getX() - candidate.getX(), source.getY() - candidate.getY());
            double distancePenalty = dist * DISTANCE_PENALTY_FACTOR;

            double benefit = waitSource - (waitCandidate + distancePenalty);

            // Log evaluation for debugging (only for first few candidates)
            if (!foundCandidate) {
                System.out.println(
                        String.format("    [Eval] Patient %s: %s(Q:%d) vs %s(Q:%d, Dist:%.1f) -> Benefit: %.2f",
                                patientId.substring(0, Math.min(8, patientId.length())),
                                sourceHospitalId, (int) waitSource,
                                candidate.getId(), (int) waitCandidate, dist, benefit));
            }

            // Relaxed threshold: allow redirections with benefit > MIN_REDIRECT_BENEFIT
            if (benefit > MIN_REDIRECT_BENEFIT && benefit > maxScore) {
                maxScore = benefit;
                bestTargetId = candidate.getId();
                foundCandidate = true;
            }
        }

        if (!bestTargetId.equals(sourceHospitalId)) {
            // Get the target hospital for its name
            Hospital targetHospital = hospitalService.getHospital(bestTargetId);

            System.out.println(String.format("    ✅ REDIRECT DECISION: %s from %s to %s (Benefit: %.2f)",
                    patientId.substring(0, Math.min(8, patientId.length())),
                    sourceHospitalId, bestTargetId, maxScore));

            // Broadcast suggestion/event via both WebSocket and SSE
            Map<String, Object> event = new java.util.HashMap<>();
            event.put("type", "PATIENT_REDIRECTED");
            event.put("patientId", patientId);
            event.put("sourceHospitalId", sourceHospitalId);
            event.put("sourceHospitalName", source.getName());
            event.put("targetHospitalId", bestTargetId);
            event.put("targetHospitalName", targetHospital != null ? targetHospital.getName() : bestTargetId);
            event.put("benefitScore", maxScore);
            event.put("timestamp", System.currentTimeMillis());

            try {
                webSocketService.broadcastEvent(event);
                sseService.broadcastEvent(event);
            } catch (Exception e) {
                System.err.println("Orchestrator: Failed to broadcast REDIRECT event: " + e.getMessage());
            }
        } else if (waitSource > 5) {
            // Log why no redirect was found for busy hospitals
            System.out.println(String.format(
                    "    ⚠️ No beneficial redirect for %s at %s (Queue: %d, Max benefit: %.2f < threshold: %.2f)",
                    patientId.substring(0, Math.min(8, patientId.length())),
                    sourceHospitalId, (int) waitSource, maxScore, MIN_REDIRECT_BENEFIT));
        }

        return bestTargetId;
    }

    public int getHospitalCount() {
        return hospitalService.getAllHospitals().size();
    }
}
