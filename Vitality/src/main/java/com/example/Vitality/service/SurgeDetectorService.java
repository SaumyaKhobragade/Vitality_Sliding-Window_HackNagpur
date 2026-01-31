package com.example.Vitality.service;

import com.example.Vitality.model.Patient;
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
                Patient.setAgingFactor(1.0); // Boost wait time importance
            } else {
                System.out.println(">>> 🟢 SURGE ENDED. (Rate: " + currentRate
                        + "/min) >>> Returning to NORMAL MODE (Time Weight: 0.5)");
                Patient.setAgingFactor(0.5); // Normal balance
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
        Patient.setAgingFactor(0.5); // Reset Factor
        System.out.println("Surge Detector Reset.");
    }
}
