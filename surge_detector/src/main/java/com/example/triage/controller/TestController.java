package com.example.triage.controller;

import com.example.triage.model.Patient;
import com.example.triage.service.HospitalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @Autowired
    private HospitalService hospitalService;

    private final Random random = new Random();

    @PostMapping("/surge")
    public String triggerSurge() {
        for (int i = 0; i < 20; i++) {
            Patient p = Patient.builder()
                    .severity(random.nextInt(10) + 1)
                    .arrivalTime(LocalDateTime.now())
                    .hospitalId("HOSP-001")
                    .status("WAITING")
                    .build();
            hospitalService.addPatientToQueue(p);
        }
        return "Injected 20 random patients into the triage system.";
    }

    @PostMapping("/staffing")
    public String updateStaffing(@RequestParam int doctors) {
        hospitalService.setActiveDoctors(doctors);
        return "Active doctors updated to: " + doctors;
    }

    @PostMapping("/add")
    public String addPatients(@RequestParam int count) {
        for (int i = 0; i < count; i++) {
            Patient p = Patient.builder()
                    .severity(random.nextInt(10) + 1)
                    .arrivalTime(LocalDateTime.now())
                    .hospitalId("HOSP-001")
                    .status("WAITING")
                    .build();
            hospitalService.addPatientToQueue(p);
        }
        return "Injected " + count + " random patients.";
    }

    @PostMapping("/clear")
    public String clearAll() {
        hospitalService.clearAll();
        return "System cleared (DB and Queue).";
    }

    @GetMapping("/status")
    public Map<String, Object> getStatus() {
        return Map.of(
                "surgeActive", hospitalService.isSurgeActive(),
                "activeDoctors", hospitalService.getActiveDoctors(),
                "queueSize", hospitalService.getQueueSize());
    }
}
