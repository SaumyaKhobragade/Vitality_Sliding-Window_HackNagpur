package com.example.Vitality.service;

import com.example.Vitality.model.Hospital;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

@Service
public class OrchestratorService {

    private final HospitalService hospitalService;

    @Autowired
    public OrchestratorService(HospitalService hospitalService) {
        this.hospitalService = hospitalService;
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
            totalPatientsWaiting += h.getQueueSize();
            totalDoctorsActive += h.getActiveDoctorCount();
        }

        stats.put("totalHospitals", hospitals.size());
        stats.put("totalPatientsWaiting", totalPatientsWaiting);
        stats.put("totalDoctorsActive", totalDoctorsActive);

        return stats;
    }

    /**
     * Evaluates if a patient should be redirected from sourceHospital to another
     * hospital.
     * Returns the target Hospital ID (could be the same as source if no redirect).
     */
    public String evaluateRedirection(String patientId, String sourceHospitalId) {
        Hospital source = hospitalService.getHospital(sourceHospitalId);
        if (source == null)
            return null;

        double maxScore = -1.0;
        String bestTargetId = sourceHospitalId;

        // Current estimated wait at source (Simple heuristic: queueSize *
        // avgTreatmentTime / activeDoctors)
        // For hackathon, just use queue size as detailed simulation is hard
        double waitSource = source.getQueueSize();

        for (Hospital candidate : getAllHospitals()) {
            if (candidate.getId().equals(sourceHospitalId))
                continue;

            double waitCandidate = candidate.getQueueSize();
            double travelCost = 5.0; // Simulated cost (e.g. 5 queue positions worth of time)

            // Formula: Benefit = WaitSource - (WaitCandidate + TravelCost)
            double benefit = waitSource - (waitCandidate + travelCost);

            if (benefit > 0 && benefit > maxScore) {
                maxScore = benefit;
                bestTargetId = candidate.getId();
            }
        }

        if (!bestTargetId.equals(sourceHospitalId)) {
            System.out.println("Orchestrator: SUGGEST REDIRECT " + patientId + " from " + sourceHospitalId + " to "
                    + bestTargetId + " (Benefit: " + maxScore + ")");
        }

        return bestTargetId;
    }
}
