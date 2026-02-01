package com.example.Vitality.model;

import lombok.Data;
import lombok.Builder;
import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Represents a patient in the triage system.
 * Priority is calculated dynamically based on severity, wait time, and
 * distress.
 */
@Data
@Builder
public class Patient implements Comparable<Patient> {

    @Builder.Default
    private String id = UUID.randomUUID().toString();

    private int baseSeverity; // 1-10
    private long arrivalTime;

    private String targetHospitalId;

    // Mutable state for distress signals
    @Builder.Default
    private AtomicInteger distressScore = new AtomicInteger(0);

    @Builder.Default
    private boolean isTreating = false;

    /**
     * Calculates the dynamic priority score.
     * Higher score = Higher priority.
     * Formula: BaseSeverity + (WaitTimeSeconds * 0.1) + DistressScore
     */
    // Base Constants
    private static double AGING_FACTOR = 0.5; // Normal Mode

    public static void setAgingFactor(double factor) {
        AGING_FACTOR = factor;
    }

    public static double getAgingFactor() {
        return AGING_FACTOR;
    }

    public int getSeverity() {
        return this.baseSeverity;
    }

    public double getDynamicPriority() {
        if (isTreating) {
            return 999.0; // Treating patients always have max priority visually
        }

        long waitTimeMs = System.currentTimeMillis() - arrivalTime;
        double waitTimeMinutes = waitTimeMs / 60000.0;

        // Dynamic Formula: Base + (Time * Factor) + Distress
        return baseSeverity + (waitTimeMinutes * AGING_FACTOR) + distressScore.get();
    }

    @Override
    public int compareTo(Patient other) {
        // Higher priority comes first
        return Double.compare(other.getDynamicPriority(), this.getDynamicPriority());
    }

    public int getTreatmentTime() {
        if (this.baseSeverity < 4) {
            return 5000;
        } else if (this.baseSeverity > 7) {
            return 20000;
        }
        return 10000;
    }
}
