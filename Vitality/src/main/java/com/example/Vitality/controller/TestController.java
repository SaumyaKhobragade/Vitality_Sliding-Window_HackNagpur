package com.example.Vitality.controller;

import com.example.Vitality.model.Patient;
import com.example.Vitality.service.HospitalService;
import com.example.Vitality.service.TriagePolicyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Testing endpoint to verify policy integration
 */
@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*")
public class TestController {

    private final TriagePolicyService policyService;
    private final HospitalService hospitalService;

    @Autowired
    public TestController(TriagePolicyService policyService, HospitalService hospitalService) {
        this.policyService = policyService;
        this.hospitalService = hospitalService;
    }

    /**
     * Test endpoint to calculate priority for a sample patient
     * GET /api/test/priority?severity=8&waitMinutes=10
     */
    @GetMapping("/priority")
    public ResponseEntity<Map<String, Object>> testPriorityCalculation(
            @RequestParam(defaultValue = "8") int severity,
            @RequestParam(defaultValue = "10") int waitMinutes) {
        
        Map<String, Object> result = new HashMap<>();
        
        // Get current policy values
        double severityWeight = policyService.getSeverityWeight();
        double agingFactor = policyService.getAgingFactor();
        boolean agingEnabled = policyService.isAgingEnabled();
        double distressDecay = policyService.getDistressDecay();
        
        // Calculate priority manually
        double waitComponent = agingEnabled ? (waitMinutes * agingFactor) : 0.0;
        double calculatedPriority = (severity * severityWeight) + waitComponent;
        
        // Build response
        result.put("input", Map.of(
            "severity", severity,
            "waitMinutes", waitMinutes
        ));
        
        result.put("activePolicies", Map.of(
            "severityWeight", severityWeight,
            "agingFactor", agingFactor,
            "agingEnabled", agingEnabled,
            "distressDecay", distressDecay
        ));
        
        result.put("calculation", Map.of(
            "formula", "(severity × weight) + (waitTime × agingFactor)",
            "severityComponent", severity * severityWeight,
            "waitComponent", waitComponent,
            "totalPriority", calculatedPriority
        ));
        
        result.put("message", "Priority calculated using current policies from Supabase");
        
        return ResponseEntity.ok(result);
    }

    /**
     * Get all current policy values
     * GET /api/test/policies
     */
    @GetMapping("/policies")
    public ResponseEntity<Map<String, Object>> getCurrentPolicies() {
        Map<String, Object> result = new HashMap<>();
        
        result.put("all", policyService.getAllPolicies());
        
        result.put("typed", Map.of(
            "severityWeight", policyService.getSeverityWeight(),
            "agingFactor", policyService.getAgingFactor(),
            "agingEnabled", policyService.isAgingEnabled(),
            "distressDecay", policyService.getDistressDecay(),
            "distressProvisionalBoost", policyService.getDistressProvisionalBoost(),
            "distressConfirmedBoost", policyService.getDistressConfirmedBoost(),
            "distressTimeoutMs", policyService.getDistressProvisionalTimeoutMs()
        ));
        
        return ResponseEntity.ok(result);
    }
}
