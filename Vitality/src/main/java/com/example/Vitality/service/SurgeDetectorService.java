package com.example.Vitality.service;

import com.example.Vitality.model.Patient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.util.Deque;
import java.util.concurrent.ConcurrentLinkedDeque;

@Service
public class SurgeDetectorService {

    private static final long TIME_WINDOW_MS = 60000; // 1 Minute
    private static final int SURGE_THRESHOLD = 10; // > 10 patients/min triggers surge

    // Sliding window of arrival timestamps
    private final Deque<Long> arrivalTimestamps = new ConcurrentLinkedDeque<>();

    private volatile boolean surgeActive = false;

    private final HospitalService hospitalService;
    private final TriagePolicyService triagePolicyService;
    private final SseService sseService;

    @Autowired
    public SurgeDetectorService(@Lazy HospitalService hospitalService,
            TriagePolicyService triagePolicyService,
            SseService sseService) {
        this.hospitalService = hospitalService;
        this.triagePolicyService = triagePolicyService;
        this.sseService = sseService;
    }

    public void recordArrival() {
        long now = System.currentTimeMillis();
        arrivalTimestamps.add(now);
        pruneOldEntries(now);
        checkSurgeStatus();
    }

    private void pruneOldEntries(long now) {
        while (!arrivalTimestamps.isEmpty() && (now - arrivalTimestamps.peekFirst() > TIME_WINDOW_MS)) {
            arrivalTimestamps.pollFirst();
        }
    }

    private void checkSurgeStatus() {
        int currentRate = arrivalTimestamps.size();
        boolean shouldBeActive = currentRate >= SURGE_THRESHOLD;

        if (surgeActive != shouldBeActive) {
            surgeActive = shouldBeActive;
            if (surgeActive) {
                System.out.println(">>> 🚨 SURGE DETECTED! (Rate: " + currentRate
                        + "/min) >>> Switching to SURVIVAL MODE (Time Weight: 1.0)");
                triagePolicyService.updatePolicy("aging_factor", 1.0); // Boost wait time importance

                // SURGE RESPONSE: Increase all hospital threads by 40%
                hospitalService.scaleAllHospitals(1.4);

                // Broadcast surge detected event via SSE
                java.util.Map<String, Object> event = new java.util.HashMap<>();
                event.put("type", "SURGE_DETECTED");
                event.put("timestamp", System.currentTimeMillis());
                event.put("rate", currentRate);
                event.put("scalingFactor", 1.4);
                event.put("message", "Hospitals scaling to 140% capacity");
                sseService.broadcastEvent(event);
            } else {
                System.out.println(">>> 🟢 SURGE ENDED. (Rate: " + currentRate
                        + "/min) >>> Returning to NORMAL MODE (Time Weight: 0.5)");
                triagePolicyService.updatePolicy("aging_factor", 0.5); // Normal balance

                // SURGE RECOVERY: Restore all hospitals to baseline
                hospitalService.scaleAllHospitals(1.0);

                // Broadcast surge ended event via SSE
                java.util.Map<String, Object> event = new java.util.HashMap<>();
                event.put("type", "SURGE_ENDED");
                event.put("timestamp", System.currentTimeMillis());
                event.put("rate", currentRate);
                event.put("scalingFactor", 1.0);
                event.put("message", "Hospitals restored to baseline capacity");
                sseService.broadcastEvent(event);
            }
        }
    }

    public boolean isSurgeActive() {
        return surgeActive;
    }

    public int getCurrentRate() {
        // Prune before returning to be accurate
        pruneOldEntries(System.currentTimeMillis());
        return arrivalTimestamps.size();
    }

    public void reset() {
        arrivalTimestamps.clear();
        surgeActive = false;
        triagePolicyService.updatePolicy("aging_factor", 0.5); // Reset Factor
        System.out.println("Surge Detector Reset.");
    }
}
