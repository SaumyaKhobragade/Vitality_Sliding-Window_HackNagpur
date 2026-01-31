
package com.example.Vitality.controller;

import com.example.Vitality.model.Hospital;
import com.example.Vitality.model.Patient;
import com.example.Vitality.service.HospitalService;
import com.example.Vitality.service.OrchestratorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/simulation")
public class SimulationController {

    private final HospitalService hospitalService;
    private final OrchestratorService orchestratorService;

    @Autowired
    public SimulationController(HospitalService hospitalService, OrchestratorService orchestratorService) {
        this.hospitalService = hospitalService;
        this.orchestratorService = orchestratorService;
    }

    @PostMapping("/init")
    public String initializeCity() {
        // Create 3 default hospitals
        hospitalService.createHospital("H1", "City General", 100);
        hospitalService.createHospital("H2", "St. Marys", 50);
        hospitalService.createHospital("H3", "Trauma Center", 80);
        return "City Initialized with 3 Hospitals (H1, H2, H3)";
    }

    @PostMapping("/patient")
    public String injectPatient(@RequestBody Map<String, Object> body) {
        String hospitalId = (String) body.get("hospitalId");
        int severity = (int) body.get("severity");

        Patient p = Patient.builder()
                .baseSeverity(severity)
                .arrivalTime(java.time.Instant.now().toEpochMilli())
                .targetHospitalId(hospitalId)
                .build();

        hospitalService.admitPatient(hospitalId, p);
        return "Patient " + p.getId() + " admitted to " + hospitalId + " with severity " + severity;
    }

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        return orchestratorService.getCityStats();
    }

    @GetMapping("/hospital/{id}")
    public Hospital getHospital(@PathVariable String id) {
        return hospitalService.getHospital(id);
    }

    @PostMapping("/redirect/evaluate")
    public String evaluateRedirect(@RequestBody Map<String, String> body) {
        String patientId = body.get("patientId");
        String currentHospitalId = body.get("currentHospitalId");

        return orchestratorService.evaluateRedirection(patientId, currentHospitalId);
    }

    @PostMapping("/distress")
    public String triggerDistress(@RequestBody Map<String, Object> body) {
        String hospitalId = (String) body.get("hospitalId");
        String patientId = (String) body.get("patientId");
        int distressLevel = (int) body.get("distressLevel"); // e.g. 5 for "Collapse"

        // Fix: Find patient globally, as they might be in treatment (removed from
        // queue)
        Patient p = hospitalService.findPatient(patientId);

        if (p != null) {
            p.getDistressScore().addAndGet(distressLevel);
            String status = p.isTreating() ? " (IN TREATMENT)" : " (WAITING)";
            return "Updated distress for " + patientId + status + " -> New Priority: " + p.getDynamicPriority();
        }

        return "Patient not found (ID: " + patientId + ")";
    }
}
