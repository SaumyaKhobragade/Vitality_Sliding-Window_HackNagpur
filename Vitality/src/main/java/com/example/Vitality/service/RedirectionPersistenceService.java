package com.example.Vitality.service;

import com.example.Vitality.model.Hospital;
import com.example.Vitality.model.Patient;
import okhttp3.*;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;

/**
 * Service for persisting redirection decisions to Supabase.
 * Stores redirection decisions in the database for audit trails and real-time updates.
 */
@Service
public class RedirectionPersistenceService {

    private final OkHttpClient httpClient;
    private final HospitalService hospitalService;

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.anon.key}")
    private String supabaseAnonKey;

    @Autowired
    public RedirectionPersistenceService(HospitalService hospitalService) {
        this.httpClient = new OkHttpClient();
        this.hospitalService = hospitalService;
    }

    /**
     * Saves a redirection decision to the database.
     *
     * @param patient         The patient being redirected
     * @param sourceHospital  The source hospital
     * @param targetHospital  The target hospital
     * @param reason          The reason for redirection
     * @param decisionType    Type of decision (safe, conditional, standard)
     * @param confidenceScore Confidence score (0-100)
     * @param status          Status (completed, pending, failed)
     * @return true if saved successfully, false otherwise
     */
    public boolean saveRedirectionDecision(
            Patient patient,
            Hospital sourceHospital,
            Hospital targetHospital,
            String reason,
            String decisionType,
            int confidenceScore,
            String status) {

        try {
            String endpoint = supabaseUrl + "/rest/v1/redirection_decisions";

            // Get patient UUID from display_id
            String patientUuid = getPatientUuid(patient.getId());
            String sourceHospitalUuid = getHospitalUuid(sourceHospital.getId());
            String targetHospitalUuid = getHospitalUuid(targetHospital.getId());

            if (patientUuid == null || sourceHospitalUuid == null || targetHospitalUuid == null) {
                System.err.println("⚠️  Cannot save redirection to DB: Patient or Hospital not found in Supabase");
                System.err.println("    Patient UUID: " + (patientUuid != null ? "✓" : "✗"));
                System.err.println("    Source Hospital UUID: " + (sourceHospitalUuid != null ? "✓" : "✗"));
                System.err.println("    Target Hospital UUID: " + (targetHospitalUuid != null ? "✓" : "✗"));
                System.err.println("    (This is normal if simulation data is not persisted to Supabase)");
                return false;
            }

            JSONObject payload = new JSONObject();
            payload.put("patient_id", patientUuid);
            payload.put("from_hospital_id", sourceHospitalUuid);
            payload.put("to_hospital_id", targetHospitalUuid);
            payload.put("decision_type", decisionType);
            payload.put("reason", reason);
            payload.put("status", status);
            payload.put("confidence_score", confidenceScore);
            payload.put("policy_applied", "Standard Triage Policy");

            RequestBody body = RequestBody.create(
                    payload.toString(),
                    MediaType.parse("application/json"));

            Request request = new Request.Builder()
                    .url(endpoint)
                    .header("apikey", supabaseAnonKey)
                    .header("Authorization", "Bearer " + supabaseAnonKey)
                    .header("Content-Type", "application/json")
                    .header("Prefer", "return=minimal")
                    .post(body)
                    .build();

            Response response = httpClient.newCall(request).execute();

            if (response.isSuccessful()) {
                System.out.println("✅ Redirection decision saved to database");
                return true;
            } else {
                System.err.println("❌ Failed to save redirection: HTTP " + response.code());
                if (response.body() != null) {
                    System.err.println("   Error: " + response.body().string());
                }
                return false;
            }

        } catch (IOException e) {
            System.err.println("❌ Error saving redirection decision: " + e.getMessage());
            return false;
        }
    }

    /**
     * Get patient UUID from display_id (patient ID string)
     */
    private String getPatientUuid(String displayId) {
        try {
            String endpoint = supabaseUrl + "/rest/v1/patients?display_id=eq." + displayId + "&select=id";

            Request request = new Request.Builder()
                    .url(endpoint)
                    .header("apikey", supabaseAnonKey)
                    .header("Authorization", "Bearer " + supabaseAnonKey)
                    .get()
                    .build();

            Response response = httpClient.newCall(request).execute();
            if (response.isSuccessful() && response.body() != null) {
                String body = response.body().string();
                org.json.JSONArray results = new org.json.JSONArray(body);
                if (results.length() > 0) {
                    return results.getJSONObject(0).getString("id");
                }
            }
        } catch (Exception e) {
            System.err.println("Error fetching patient UUID: " + e.getMessage());
        }
        return null;
    }

    /**
     * Get hospital UUID from hospital ID string
     */
    private String getHospitalUuid(String hospitalId) {
        try {
            // First try to get from hospital name mapping
            Hospital hospital = hospitalService.getHospital(hospitalId);
            if (hospital == null) {
                return null;
            }

            String endpoint = supabaseUrl + "/rest/v1/hospitals?name=eq." + 
                              java.net.URLEncoder.encode(hospital.getName(), "UTF-8") + "&select=id";

            Request request = new Request.Builder()
                    .url(endpoint)
                    .header("apikey", supabaseAnonKey)
                    .header("Authorization", "Bearer " + supabaseAnonKey)
                    .get()
                    .build();

            Response response = httpClient.newCall(request).execute();
            if (response.isSuccessful() && response.body() != null) {
                String body = response.body().string();
                org.json.JSONArray results = new org.json.JSONArray(body);
                if (results.length() > 0) {
                    return results.getJSONObject(0).getString("id");
                }
            }
        } catch (Exception e) {
            System.err.println("Error fetching hospital UUID: " + e.getMessage());
        }
        return null;
    }
}
