package com.example.Vitality.service;

import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TriagePolicyService {

    // Default Configuration (Fallback)
    private final Map<String, Double> policyMap = new ConcurrentHashMap<>();

    public TriagePolicyService() {
        // Initialize with defaults matching the DB migration
        policyMap.put("distress_provisional_boost", 50.0);
        policyMap.put("distress_confirmed_boost", 100.0);
        policyMap.put("distress_provisional_timeout", 120.0); // seconds
        policyMap.put("severity_weight", 10.0);
        policyMap.put("aging_factor", 0.5);
    }

    public double getPolicyValue(String key, double defaultValue) {
        return policyMap.getOrDefault(key, defaultValue);
    }

    public void updatePolicy(String key, double value) {
        policyMap.put(key, value);
        System.out.println(">>> POLICY UPDATE: " + key + " = " + value);
    }

    public Map<String, Double> getAllPolicies() {
        return new ConcurrentHashMap<>(policyMap);
    }
    
    // Type-safe getters for core logic
    public int getDistressProvisionalBoost() {
        return (int) getPolicyValue("distress_provisional_boost", 50.0);
    }

    public int getDistressConfirmedBoost() {
        return (int) getPolicyValue("distress_confirmed_boost", 100.0);
    }

    public long getDistressProvisionalTimeoutMs() {
        return (long) (getPolicyValue("distress_provisional_timeout", 120.0) * 1000);
    }

    public double getSeverityWeight() {
        return getPolicyValue("severity_weight", 10.0);
    }

    public double getAgingFactor() {
        return getPolicyValue("aging_factor", 0.5);
    }

    public double getDistressDecay() {
        return getPolicyValue("distress_decay", 0.5);
    }

    public boolean isAgingEnabled() {
        return getPolicyValue("enable_aging", 1.0) > 0;
    }
}
