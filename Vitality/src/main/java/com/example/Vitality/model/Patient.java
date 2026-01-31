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
    public double getDynamicPriority() {
        long waitSeconds = (Instant.now().toEpochMilli() - arrivalTime) / 1000;
        return baseSeverity + (waitSeconds * 0.1) + distressScore.get();
    }

    @Override
    public int compareTo(Patient other) {
        // Higher priority comes first
        return Double.compare(other.getDynamicPriority(), this.getDynamicPriority());
    }
}
