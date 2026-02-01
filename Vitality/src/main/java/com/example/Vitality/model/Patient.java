package com.example.Vitality.model;

import com.example.Vitality.service.TriagePolicyService;
import lombok.Data;
import lombok.Builder;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;

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
    private AtomicReference<DistressStatus> distressStatus = new AtomicReference<>(DistressStatus.NONE);
    
    @Builder.Default
    private long distressEventTimestamp = 0;

    @Builder.Default
    private boolean isTreating = false;
    
    // Global Policy Service Reference
    public static TriagePolicyService policyService;

    public int getSeverity() {
        return this.baseSeverity;
    }

    public double getDynamicPriority() {
        if (isTreating) {
            return 999.0; // Treating patients always have max priority visually
        }

        long waitTimeMs = Math.max(0, System.currentTimeMillis() - arrivalTime);
        double waitTimeMinutes = waitTimeMs / 60000.0;
        
        // Fetch Policies (Safe defaults if service not injected yet)
        double agingFactor = (policyService != null) ? policyService.getAgingFactor() : 0.5;
        double severityWeight = (policyService != null) ? policyService.getSeverityWeight() : 1.0;
        boolean agingEnabled = (policyService != null) ? policyService.isAgingEnabled() : true;
        double distressDecayRate = (policyService != null) ? policyService.getDistressDecay() : 0.5;
        int provisionalBoost = (policyService != null) ? policyService.getDistressProvisionalBoost() : 50;
        int confirmedBoost = (policyService != null) ? policyService.getDistressConfirmedBoost() : 100;
        long timeoutMs = (policyService != null) ? policyService.getDistressProvisionalTimeoutMs() : 120000;

        // Calculate Wait Time Component (only if aging enabled)
        double waitTimeComponent = agingEnabled ? (waitTimeMinutes * agingFactor) : 0.0;

        // Calculate Distress Component with decay
        double distressComponent = distressScore.get(); // Base manual score
        
        DistressStatus status = distressStatus.get();
        if (status == DistressStatus.PENDING) {
            // Check timeout
            long elapsedSinceDistress = System.currentTimeMillis() - distressEventTimestamp;
            if (elapsedSinceDistress > timeoutMs) {
                distressStatus.compareAndSet(DistressStatus.PENDING, DistressStatus.EXPIRED);
                // No boost, expired
            } else {
                // Apply provisional boost with decay over time
                double decayFactor = Math.exp(-distressDecayRate * elapsedSinceDistress / 60000.0);
                distressComponent += provisionalBoost * decayFactor;
            }
        } else if (status == DistressStatus.CONFIRMED) {
            // Apply confirmed boost with decay
            long elapsedSinceDistress = System.currentTimeMillis() - distressEventTimestamp;
            double decayFactor = Math.exp(-distressDecayRate * elapsedSinceDistress / 60000.0);
            distressComponent += confirmedBoost * decayFactor;
        }

        // Dynamic Formula: (Severity * Weight) + (Time * Factor) + Distress
        return (baseSeverity * severityWeight) + waitTimeComponent + distressComponent;
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
    
    // Helper to update distress
    public void updateDistress(DistressStatus newStatus) {
        this.distressStatus.set(newStatus);
        if (newStatus == DistressStatus.PENDING) {
            this.distressEventTimestamp = System.currentTimeMillis();
        }
    }
}