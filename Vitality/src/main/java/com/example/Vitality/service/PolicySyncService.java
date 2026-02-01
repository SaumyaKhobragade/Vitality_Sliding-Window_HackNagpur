package com.example.Vitality.service;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Syncs triage policies from Supabase database to in-memory TriagePolicyService.
 * Polls the database every 30 seconds (configurable) to check for policy updates.
 */
@Service
@ConditionalOnProperty(name = "supabase.policy.sync.enabled", havingValue = "true", matchIfMissing = true)
public class PolicySyncService {

    private final TriagePolicyService triagePolicyService;
    private final OkHttpClient httpClient;

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.anon.key}")
    private String supabaseAnonKey;

    private String lastSyncedPolicyId = null;
    private String lastSyncedTimestamp = null;

    @Autowired
    public PolicySyncService(TriagePolicyService triagePolicyService) {
        this.triagePolicyService = triagePolicyService;
        this.httpClient = new OkHttpClient();
    }

    /**
     * Scheduled task that runs every 30 seconds to sync policies from Supabase.
     */
    @Scheduled(fixedRateString = "${supabase.policy.sync.interval:30000}")
    public void syncPoliciesFromSupabase() {
        try {
            String endpoint = supabaseUrl + "/rest/v1/policies?is_active=eq.true&select=*";

            Request request = new Request.Builder()
                    .url(endpoint)
                    .header("apikey", supabaseAnonKey)
                    .header("Authorization", "Bearer " + supabaseAnonKey)
                    .get()
                    .build();

            Response response = httpClient.newCall(request).execute();

            if (!response.isSuccessful()) {
                System.err.println("❌ Failed to fetch policies from Supabase: HTTP " + response.code());
                return;
            }

            String responseBody = response.body().string();
            JSONArray policies = new JSONArray(responseBody);

            if (policies.length() == 0) {
                System.out.println("⚠️  No active policy found in Supabase. Using defaults.");
                return;
            }

            // Get the first active policy (should only be one)
            JSONObject activePolicy = policies.getJSONObject(0);
            String policyId = activePolicy.getString("id");
            String policyName = activePolicy.getString("name");
            String updatedAt = activePolicy.getString("updated_at");

            // Check if policy has changed since last sync
            if (policyId.equals(lastSyncedPolicyId) && updatedAt.equals(lastSyncedTimestamp)) {
                // No changes, skip update
                return;
            }

            // Extract policy parameters
            double severityWeight = activePolicy.getDouble("severity_weight");
            int agingRateMinutes = activePolicy.getInt("aging_rate_minutes");
            boolean enableAging = activePolicy.getBoolean("enable_aging");
            double distressDecay = activePolicy.getDouble("distress_decay");
            boolean isAlertMode = activePolicy.getBoolean("is_alert_mode");

            // Update in-memory policy service
            triagePolicyService.updatePolicy("severity_weight", severityWeight);
            
            // Convert aging_rate_minutes to aging_factor (points per minute)
            // The frontend stores "how often to escalate" but we need "how much per minute"
            double agingFactor = 60.0 / agingRateMinutes; // e.g., 15 min → 4 points/min
            triagePolicyService.updatePolicy("aging_factor", agingFactor);
            
            triagePolicyService.updatePolicy("enable_aging", enableAging ? 1.0 : 0.0);
            triagePolicyService.updatePolicy("distress_decay", distressDecay);
            
            // Store alert mode as a policy value for potential future use
            triagePolicyService.updatePolicy("alert_mode", isAlertMode ? 1.0 : 0.0);

            // Update sync tracking
            lastSyncedPolicyId = policyId;
            lastSyncedTimestamp = updatedAt;

            // Log success
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss"));
            System.out.println("\n═══════════════════════════════════════════════════════");
            System.out.println("✅ POLICY SYNCED from Supabase at " + timestamp);
            System.out.println("   Policy: " + policyName + " (" + policyId + ")");
            System.out.println("   Severity Weight: " + severityWeight);
            System.out.println("   Aging Factor: " + agingFactor + " (from " + agingRateMinutes + " min)");
            System.out.println("   Aging Enabled: " + enableAging);
            System.out.println("   Distress Decay: " + distressDecay);
            System.out.println("   Alert Mode: " + isAlertMode);
            System.out.println("═══════════════════════════════════════════════════════\n");

        } catch (Exception e) {
            System.err.println("❌ Error syncing policies from Supabase: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Manually trigger a policy sync (useful for testing or immediate updates).
     */
    public void forceSyncNow() {
        System.out.println("🔄 Forcing immediate policy sync...");
        syncPoliciesFromSupabase();
    }

    /**
     * Get sync status information.
     */
    public String getSyncStatus() {
        if (lastSyncedPolicyId == null) {
            return "No policy synced yet. Waiting for first sync...";
        }
        return "Last synced policy: " + lastSyncedPolicyId + " at " + lastSyncedTimestamp;
    }
}
