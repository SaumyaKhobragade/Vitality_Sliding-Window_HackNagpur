package com.example.Vitality.service;

import com.example.Vitality.model.Hospital;
import com.example.Vitality.model.Patient;
import com.example.Vitality.model.Department;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.PriorityBlockingQueue;

import org.springframework.scheduling.annotation.Scheduled;

@Service
public class OrchestratorService {

    // Auto-monitor every 5 seconds
    @Scheduled(fixedRate = 7000)
    public void monitorAndRedirect() {
        if (hospitalService.getAllHospitals().isEmpty())
            return;

        StringBuilder queueStats = new StringBuilder(">> [Auto-Monitor] Queues: ");
        int totalScanned = 0;
        int totalMoved = 0;

        // Iterate all hospitals
        for (Hospital h : hospitalService.getAllHospitals()) {
            // Append stats for debugging
            int nurseQ = h.getDepartmentQueueSize(Department.NURSE);
            int genQ = h.getDepartmentQueueSize(Department.GENERAL);
            int icuQ = h.getDepartmentQueueSize(Department.ICU);
            queueStats.append(
                    String.format("[%s(%d,%d): N%d G%d I%d] ", h.getId(), h.getX(), h.getY(), nurseQ, genQ, icuQ));

            for (Department dept : Department.values()) {
                int[] stats = checkQueueForRedirects(h, dept);
                totalScanned += stats[0];
                totalMoved += stats[1];
            }
        }

        System.out.println(queueStats.toString());
        System.out.println(">> [Auto-Monitor] Cycle Result -> Scanned: " + totalScanned + " | Moved: " + totalMoved);
    }

    private int[] checkQueueForRedirects(Hospital source, Department dept) {
        // if (!source.getWaitingRooms().containsKey(dept))
        // return new int[] { 0, 0 };

        // Snapshot array to avoid Cme
        // Use getOrDefault to prevent NullPointer
        java.util.Queue<Patient> q = source.getWaitingRooms().get(dept);
        if (q == null)
            return new int[] { 0, 0 };

        Object[] patients = q.toArray();
        int scanned = 0;
        int moved = 0;

        for (Object obj : patients) {
            if (scanned++ > 50) // Increased limit
                break;

            Patient p = (Patient) obj;
            String bestTarget = evaluateRedirection(p.getId(), source.getId());

            if (bestTarget != null && !bestTarget.equals(source.getId())) {
                boolean success = hospitalService.transferPatient(p.getId(), source.getId(), bestTarget);
                if (success)
                    moved++;
            }
        }
        return new int[] { scanned, moved };
    }

    private final HospitalService hospitalService;
    private final SurgeDetectorService surgeDetectorService;
    private final WebSocketService webSocketService;

    @Autowired
    public OrchestratorService(HospitalService hospitalService, SurgeDetectorService surgeDetectorService,
            WebSocketService webSocketService) {
        this.hospitalService = hospitalService;
        this.surgeDetectorService = surgeDetectorService;
        this.webSocketService = webSocketService;
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

        List<Map<String, Object>> hospitalDetails = new ArrayList<>();

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

        double maxScore = -1.0;
        String bestTargetId = sourceHospitalId;

        // Get queue size ONLY for the relevant department
        double waitSource = source.getDepartmentQueueSize(requiredDept);

        for (Hospital candidate : getAllHospitals()) {
            if (candidate.getId().equals(sourceHospitalId))
                continue;

            double waitCandidate = candidate.getDepartmentQueueSize(requiredDept);

            // Balanced Formula: Cost = Queue + (Distance * 0.1)
            // 10 units distance = 1 patient in queue.
            double dist = Math.hypot(source.getX() - candidate.getX(), source.getY() - candidate.getY());
            double distancePenalty = dist * 0.1;

            double benefit = waitSource - (waitCandidate + distancePenalty);

            if (benefit > 0 && benefit > maxScore) {
                maxScore = benefit;
                bestTargetId = candidate.getId();
            }
        }

        if (!bestTargetId.equals(sourceHospitalId)) {
            System.out.println("Orchestrator: SUGGEST REDIRECT " + patientId + " from " + sourceHospitalId + " to "
                    + bestTargetId + " (Benefit: " + maxScore + ")");

            // Broadcast suggestion/event
            Map<String, Object> event = java.util.Map.of(
                    "type", "PATIENT_REDIRECTED",
                    "patientId", patientId,
                    "sourceHospitalId", sourceHospitalId,
                    "targetHospitalId", bestTargetId,
                    "benefitScore", maxScore,
                    "timestamp", System.currentTimeMillis());
            try {
                webSocketService.broadcastEvent(event);
                // System.out.println("Orchestrator: Broadcasted REDIRECT event for " +
                // patientId);
            } catch (Exception e) {
                System.err.println("Orchestrator: Failed to broadcast REDIRECT event: " + e.getMessage());
            }
        }

        return bestTargetId;
    }

    public int getHospitalCount() {
        return hospitalService.getAllHospitals().size();
    }
}
