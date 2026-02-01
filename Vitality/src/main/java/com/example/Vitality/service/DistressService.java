package com.example.Vitality.service;

import com.example.Vitality.model.DistressStatus;
import com.example.Vitality.model.Patient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class DistressService {

    private final HospitalService hospitalService;
    private final TriagePolicyService triagePolicyService;
    private final WebSocketService webSocketService;

    @Autowired
    public DistressService(HospitalService hospitalService, TriagePolicyService triagePolicyService, WebSocketService webSocketService) {
        this.hospitalService = hospitalService;
        this.triagePolicyService = triagePolicyService;
        this.webSocketService = webSocketService;
    }

    public void triggerDistress(String patientId, int severityBoost) {
        // Initial Trigger -> PENDING
        Patient p = hospitalService.findPatient(patientId);
        if (p != null) {
            p.getDistressScore().addAndGet(severityBoost); // Base score from sensor
            hospitalService.updatePatientDistress(patientId, DistressStatus.PENDING);
            
            webSocketService.broadcastEvent(Map.of(
                "type", "DISTRESS_EVENT",
                "patientId", patientId,
                "status", "PENDING",
                "message", "Provisional boost applied. Waiting for nurse confirmation."
            ));
        }
    }

    public void confirmDistress(String patientId) {
        hospitalService.updatePatientDistress(patientId, DistressStatus.CONFIRMED);
        webSocketService.broadcastEvent(Map.of(
            "type", "DISTRESS_EVENT",
            "patientId", patientId,
            "status", "CONFIRMED",
            "message", "Distress confirmed by nurse."
        ));
    }

    public void dismissDistress(String patientId) {
        hospitalService.updatePatientDistress(patientId, DistressStatus.DISMISSED);
        // Also remove the base score boost if needed, or just let the status handle logic
        // Current logic: DISMISSED status makes the PENDING boost disappear. 
        // But the `distressScore` (sensor raw) might still be there. 
        // For simplicity, we reset raw score too.
        Patient p = hospitalService.findPatient(patientId);
        if (p != null) {
            p.getDistressScore().set(0);
        }

        webSocketService.broadcastEvent(Map.of(
            "type", "DISTRESS_EVENT",
            "patientId", patientId,
            "status", "DISMISSED",
            "message", "Distress signal dismissed."
        ));
    }

    @Scheduled(fixedRate = 5000) // Check every 5 seconds
    public void checkExpiredDistress() {
        long timeoutMs = triagePolicyService.getDistressProvisionalTimeoutMs();
        long now = System.currentTimeMillis();

        hospitalService.getAllActivePatients().forEach(p -> {
            if (p.getDistressStatus().get() == DistressStatus.PENDING) {
                if (now - p.getDistressEventTimestamp() > timeoutMs) {
                    System.out.println(">>> EXPIRED DISTRESS: Patient " + p.getId());
                    p.updateDistress(DistressStatus.EXPIRED);
                    webSocketService.broadcastEvent(Map.of(
                        "type", "DISTRESS_EVENT",
                        "patientId", p.getId(),
                        "status", "EXPIRED",
                        "message", "Provisional boost expired due to timeout."
                    ));
                }
            }
        });
    }
}
