package com.example.Vitality.controller;

import com.example.Vitality.service.TriagePolicyService;
import com.example.Vitality.service.PolicySyncService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/policies")
@CrossOrigin(origins = "*") // Allow frontend access
public class PolicyController {

    private final TriagePolicyService triagePolicyService;
    private final Optional<PolicySyncService> policySyncService;

    @Autowired
    public PolicyController(TriagePolicyService triagePolicyService, 
                          @Autowired(required = false) PolicySyncService policySyncService) {
        this.triagePolicyService = triagePolicyService;
        this.policySyncService = Optional.ofNullable(policySyncService);
    }

    @GetMapping
    public ResponseEntity<Map<String, Double>> getAllPolicies() {
        return ResponseEntity.ok(triagePolicyService.getAllPolicies());
    }

    @PostMapping("/update")
    public ResponseEntity<String> updatePolicy(@RequestBody Map<String, Object> payload) {
        String key = (String) payload.get("key");
        Object valueObj = payload.get("value");
        
        if (key == null || valueObj == null) {
            return ResponseEntity.badRequest().body("Missing key or value");
        }

        try {
            double value = Double.parseDouble(valueObj.toString());
            triagePolicyService.updatePolicy(key, value);
            return ResponseEntity.ok("Policy updated: " + key + " -> " + value);
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body("Invalid value format. Must be a number.");
        }
    }

    @PostMapping("/sync")
    public ResponseEntity<String> forcePolicySync() {
        if (policySyncService.isEmpty()) {
            return ResponseEntity.badRequest().body("Policy sync service is disabled");
        }
        
        try {
            policySyncService.get().forceSyncNow();
            return ResponseEntity.ok("Policy sync triggered successfully");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Sync failed: " + e.getMessage());
        }
    }

    @GetMapping("/sync/status")
    public ResponseEntity<String> getSyncStatus() {
        if (policySyncService.isEmpty()) {
            return ResponseEntity.ok("Policy sync is disabled (supabase.policy.sync.enabled=false)");
        }
        
        return ResponseEntity.ok(policySyncService.get().getSyncStatus());
    }
}
