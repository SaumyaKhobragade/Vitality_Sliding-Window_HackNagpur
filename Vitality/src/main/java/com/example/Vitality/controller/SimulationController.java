package com.example.Vitality.controller;

import com.example.Vitality.model.Hospital;
import com.example.Vitality.model.Patient;
import com.example.Vitality.service.HospitalService;
import com.example.Vitality.service.OrchestratorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.Random;
import java.util.HashMap;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api/simulation")
public class SimulationController {

    private final HospitalService hospitalService;
    private final OrchestratorService orchestratorService;
    private final Random random = new Random();

    @Autowired
    public SimulationController(HospitalService hospitalService, OrchestratorService orchestratorService) {
        this.hospitalService = hospitalService;
        this.orchestratorService = orchestratorService;
    }

    @PostMapping("/init")
    public String initializeCity(@RequestBody Map<String, String> body) {
        int hospitalCount = Integer.parseInt(body.get("count"));

        for (int i = 0; i < hospitalCount; i++) {
            Hospital h = hospitalService.createHospital("H" + (i + 1), "Hospital #" + (i + 1), random.nextInt(100) + 1);
            System.out.println(
                    "Initialized Hospital " + h.getId() + " Name: " + h.getName() + " Capacity: " + h.getCapacity());
        }

        return "City Initialized with " + hospitalCount + " hospitals.";
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

    @PostMapping("/surge")
    public String triggerSurge(@RequestBody Map<String, String> body) {
        int count = Integer.parseInt(body.get("count"));
        int hospitalCount = orchestratorService.getHospitalCount();
        for (int i = 0; i < count; i++) {
            String hId = "H" + (random.nextInt(hospitalCount) + 1);
            Patient p = Patient.builder()
                    .baseSeverity(random.nextInt(10) + 1)
                    .targetHospitalId(hId)
                    .arrivalTime(java.time.Instant.now().toEpochMilli())
                    .build();
            hospitalService.admitPatient(hId, p);

        }
        return "Injected " + count + " patients in the queue.";
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

    @GetMapping("/testInitialization")
    public String initForTest() {
        Map<String, String> m = new HashMap<>();
        m.put("count", "3");
        initializeCity(m);
        m.put("count", "1000");
        triggerSurge(m);

        return "Initialized Test With 3 Hospitals and 1000 Patients.";

    }

    @PostMapping("/staffing")
    public String updateStaffing(@RequestBody Map<String, Object> body) {
        String hospitalId = (String) body.get("hospitalId");
        String deptStr = (String) body.get("department");
        int count = Integer.parseInt(body.get("count").toString());

        com.example.Vitality.model.Department dept = com.example.Vitality.model.Department.valueOf(deptStr);
        hospitalService.updateStaffCount(hospitalId, dept, count);
        return "Updated " + hospitalId + " [" + dept + "] to " + count + " active staff.";
    }

    @PostMapping("/staffing/shortage")
    public String triggerGlobalShortage(@RequestBody(required = false) Map<String, Double> body) {
        // Default shortage is 40% (i.e. reduce capacity to 60%)
        double factor = (body != null && body.containsKey("factor")) ? body.get("factor") : 0.6;

        System.out.println(">>> ⚠️  TRIGGERING STAFF SHORTAGE (Factor: " + factor + ") <<<");

        int totalReduced = 0;
        for (Hospital h : orchestratorService.getAllHospitals()) {
            // Reduce Nurses (Default 10)
            int currentNurse = h.getDepartmentalStaff().get(com.example.Vitality.model.Department.NURSE)
                    .getCorePoolSize();
            int newNurse = Math.max(1, (int) (currentNurse * factor));
            hospitalService.updateStaffCount(h.getId(), com.example.Vitality.model.Department.NURSE, newNurse);

            // Reduce General (Default 5)
            int currentGen = h.getDepartmentalStaff().get(com.example.Vitality.model.Department.GENERAL)
                    .getCorePoolSize();
            int newGen = Math.max(1, (int) (currentGen * factor));
            hospitalService.updateStaffCount(h.getId(), com.example.Vitality.model.Department.GENERAL, newGen);

            // Reduce ICU (Default 2 -> likely 1)
            int currentICU = h.getDepartmentalStaff().get(com.example.Vitality.model.Department.ICU).getCorePoolSize();
            int newICU = Math.max(1, (int) (currentICU * factor));
            hospitalService.updateStaffCount(h.getId(), com.example.Vitality.model.Department.ICU, newICU);
        }

        return "Global Staff Shortage Applied (Remaining Capacity: " + (factor * 100)
                + "%). Doctors entering retirement after current patient.";
    }
}
