package com.example.Vitality.controller;

import com.example.Vitality.model.Hospital;
import com.example.Vitality.model.Patient;
import com.example.Vitality.service.HospitalService;
import com.example.Vitality.service.OrchestratorService;
import com.example.Vitality.service.SseService;
import com.example.Vitality.service.WebSocketService;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import java.util.Random;
import java.util.HashMap;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api/simulation")
public class SimulationController {

    private final HospitalService hospitalService;
    private final OrchestratorService orchestratorService;
    private final WebSocketService webSocketService;
    private final SseService sseService;
    private final com.example.Vitality.service.DistressService distressService;
    private final OkHttpClient httpClient;
    private final Random random = new Random();

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.anon.key}")
    private String supabaseAnonKey;

    @Autowired
    public SimulationController(HospitalService hospitalService, OrchestratorService orchestratorService,
            WebSocketService webSocketService, SseService sseService,
            com.example.Vitality.service.DistressService distressService) {
        this.hospitalService = hospitalService;
        this.orchestratorService = orchestratorService;
        this.webSocketService = webSocketService;
        this.sseService = sseService;
        this.distressService = distressService;
        this.httpClient = new OkHttpClient();
    }

    @PostMapping("/init")
    public String initializeCity(@RequestBody Map<String, String> body) {
        try {
            // Fetch hospitals from Supabase REST API
            String endpoint = supabaseUrl + "/rest/v1/hospitals?select=*";

            Request request = new Request.Builder()
                    .url(endpoint)
                    .header("apikey", supabaseAnonKey)
                    .header("Authorization", "Bearer " + supabaseAnonKey)
                    .get()
                    .build();

            Response response = httpClient.newCall(request).execute();

            if (!response.isSuccessful()) {
                System.err.println("❌ Failed to fetch hospitals from Supabase: HTTP " + response.code());
                return initializeWithFallback(body);
            }

            String responseBody = response.body().string();
            JSONArray hospitals = new JSONArray(responseBody);

            if (hospitals.length() == 0) {
                System.out.println("⚠️ No hospitals found in Supabase. Using fallback.");
                return initializeWithFallback(body);
            }

            System.out.println(">>> Initializing city with " + hospitals.length() + " hospitals from Supabase...");

            for (int i = 0; i < hospitals.length(); i++) {
                JSONObject dbHospital = hospitals.getJSONObject(i);
                String id = dbHospital.getString("id");
                String name = dbHospital.getString("name");
                int capacity = dbHospital.optInt("max_capacity", 100);

                Hospital h = hospitalService.createHospital(id, name, capacity);
                System.out.println("✅ Initialized Hospital: " + h.getName() + " (ID: "
                        + id.substring(0, Math.min(8, id.length())) + "...) Capacity: " + h.getCapacity());
            }

            // Broadcast initialization event
            Map<String, Object> event = new HashMap<>();
            event.put("type", "CITY_INITIALIZED");
            event.put("hospitalCount", hospitals.length());
            event.put("timestamp", System.currentTimeMillis());
            event.put("message", "City initialized with " + hospitals.length() + " hospitals from Supabase");
            webSocketService.broadcastEvent(event);
            sseService.broadcastEvent(event);

            return "City Initialized with " + hospitals.length() + " hospitals from Supabase.";

        } catch (Exception e) {
            System.err.println("❌ Error fetching hospitals from Supabase: " + e.getMessage());
            e.printStackTrace();
            return initializeWithFallback(body);
        }
    }

    private String initializeWithFallback(Map<String, String> body) {
        int hospitalCount = body.containsKey("count") ? Integer.parseInt(body.get("count")) : 10;

        System.out.println(">>> Initializing city with " + hospitalCount + " sequential hospitals (fallback)...");

        for (int i = 0; i < hospitalCount; i++) {
            String id = "H" + (i + 1);
            String name = "Hospital #" + (i + 1);
            Hospital h = hospitalService.createHospital(id, name, random.nextInt(100) + 50);
            System.out.println("✅ Initialized Hospital: " + h.getName() + " (ID: " + id
                    + ") Capacity: " + h.getCapacity());
        }

        Map<String, Object> event = new HashMap<>();
        event.put("type", "CITY_INITIALIZED");
        event.put("hospitalCount", hospitalCount);
        event.put("timestamp", System.currentTimeMillis());
        event.put("message", "City initialized with " + hospitalCount + " sequential hospitals (fallback)");
        webSocketService.broadcastEvent(event);
        sseService.broadcastEvent(event);

        return "City Initialized with " + hospitalCount + " sequential hospitals (fallback).";
    }

    @PostMapping("/patient")
    public Map<String, Object> injectPatient(@RequestBody Map<String, Object> body) {
        String hospitalId = (String) body.get("hospitalId");
        int severity = (int) body.get("severity");

        Patient p = Patient.builder()
                .baseSeverity(severity)
                .arrivalTime(java.time.Instant.now().toEpochMilli())
                .targetHospitalId(hospitalId)
                .build();

        hospitalService.admitPatient(hospitalId, p);

        // Broadcast patient admission event
        Map<String, Object> event = new HashMap<>();
        event.put("type", "PATIENT_ADMITTED");
        event.put("hospitalId", hospitalId);
        event.put("patientId", p.getId());
        event.put("severity", severity);
        event.put("timestamp", System.currentTimeMillis());
        event.put("message", "Patient " + p.getId() + " admitted to " + hospitalId + " with severity " + severity);
        webSocketService.broadcastEvent(event);
        sseService.broadcastEvent(event);

        // Broadcast updated hospital state
        Hospital updatedHospital = hospitalService.getHospital(hospitalId);
        if (updatedHospital != null) {
            webSocketService.broadcastHospitalUpdate(updatedHospital);
            sseService.broadcastHospital(updatedHospital);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("patientId", p.getId());
        response.put("status", "success");
        return response;
    }

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        return orchestratorService.getCityStats();
    }

    @GetMapping("/hospital/{id}")
    public Hospital getHospital(@PathVariable String id) {
        return hospitalService.getHospital(id);
    }

    @GetMapping("/hospitals")
    public java.util.Collection<Hospital> getAllHospitals() {
        return hospitalService.getAllHospitals();
    }

    @PostMapping("/redirect/evaluate")
    public String evaluateRedirect(@RequestBody Map<String, String> body) {
        String patientId = body.get("patientId");
        String currentHospitalId = body.get("currentHospitalId");

        return orchestratorService.evaluateRedirection(patientId, currentHospitalId);
    }

    @PostMapping("/surge")
    public String triggerSurge(@RequestBody Map<String, String> body) {
        int count = Integer.parseInt(body.get("count"));
        int hospitalCount = orchestratorService.getHospitalCount();
        for (int i = 0; i < count; i++) {
            String hId = "H" + (random.nextInt(hospitalCount) + 1);
            Patient p = Patient.builder()
                    .baseSeverity(random.nextInt(10) + 1)
                    .targetHospitalId(hId)
                    .arrivalTime(java.time.Instant.now().toEpochMilli())
                    .build();
            hospitalService.admitPatient(hId, p);

        }

        // Broadcast surge event
        Map<String, Object> event = new HashMap<>();
        event.put("type", "SURGE_TRIGGERED");
        event.put("count", count);
        event.put("timestamp", System.currentTimeMillis());
        event.put("message", "Surge: " + count + " patients injected into city hospitals");
        webSocketService.broadcastEvent(event);
        sseService.broadcastEvent(event);

        return "Injected " + count + " patients in the queue.";
    }

    /**
     * Flood 3 hospitals with 200 patients each to trigger redirections.
     * Simply adds patients to queues - existing simulation handles the rest.
     */
    @PostMapping("/flood")
    public Map<String, Object> floodHospitals(@RequestBody(required = false) Map<String, Object> body) {
        int patientsPerHospital = body != null && body.containsKey("patientsPerHospital")
                ? ((Number) body.get("patientsPerHospital")).intValue()
                : 200;
        int hospitalsToFlood = body != null && body.containsKey("hospitalsToFlood")
                ? ((Number) body.get("hospitalsToFlood")).intValue()
                : 3;

        java.util.Collection<Hospital> allHospitals = hospitalService.getAllHospitals();

        // Auto-initialize hospitals from Supabase if none exist (since frontend Run
        // Simulation is separate)
        if (allHospitals.isEmpty()) {
            try {
                String endpoint = supabaseUrl + "/rest/v1/hospitals?select=*";
                Request request = new Request.Builder()
                        .url(endpoint)
                        .header("apikey", supabaseAnonKey)
                        .header("Authorization", "Bearer " + supabaseAnonKey)
                        .get()
                        .build();
                Response response = httpClient.newCall(request).execute();

                if (response.isSuccessful()) {
                    String responseBody = response.body().string();
                    JSONArray hospitals = new JSONArray(responseBody);

                    for (int i = 0; i < hospitals.length(); i++) {
                        JSONObject dbHospital = hospitals.getJSONObject(i);
                        String id = dbHospital.getString("id");
                        String name = dbHospital.getString("name");
                        int capacity = dbHospital.optInt("max_capacity", 100);
                        hospitalService.createHospital(id, name, capacity);
                    }
                    allHospitals = hospitalService.getAllHospitals();
                }
            } catch (Exception e) {
                // Fallback: create 10 sequential hospitals if Supabase fails
                for (int i = 0; i < 10; i++) {
                    String id = "H" + (i + 1);
                    hospitalService.createHospital(id, "Hospital #" + (i + 1), random.nextInt(100) + 50);
                }
                allHospitals = hospitalService.getAllHospitals();
            }
        }

        // Still no hospitals? Return error
        if (allHospitals.isEmpty()) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to initialize hospitals.");
            return errorResponse;
        }

        // Select random hospitals to flood
        java.util.List<Hospital> hospitalList = new java.util.ArrayList<>(allHospitals);
        java.util.Collections.shuffle(hospitalList);

        int flooded = Math.min(hospitalsToFlood, hospitalList.size());
        java.util.List<String> floodedHospitals = new java.util.ArrayList<>();
        int totalPatients = 0;

        for (int h = 0; h < flooded; h++) {
            Hospital hospital = hospitalList.get(h);
            String hospitalId = hospital.getId();
            floodedHospitals.add(hospital.getName());

            // Add patients to the queue (existing simulation logic handles
            // treatment/redirects)
            for (int i = 0; i < patientsPerHospital; i++) {
                Patient p = Patient.builder()
                        .baseSeverity(random.nextInt(8) + 2) // Severity 2-9
                        .targetHospitalId(hospitalId)
                        .arrivalTime(java.time.Instant.now().toEpochMilli())
                        .build();
                hospitalService.admitPatient(hospitalId, p);
                totalPatients++;
            }
        }

        // Broadcast flood event to frontend
        Map<String, Object> event = new HashMap<>();
        event.put("type", "HOSPITALS_FLOODED");
        event.put("hospitalsFlooded", floodedHospitals);
        event.put("patientsPerHospital", patientsPerHospital);
        event.put("totalPatients", totalPatients);
        event.put("timestamp", System.currentTimeMillis());
        event.put("message", "🌊 Flooded " + flooded + " hospitals: " + String.join(", ", floodedHospitals));
        webSocketService.broadcastEvent(event);
        sseService.broadcastEvent(event);

        // Return response
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("hospitalsFlooded", floodedHospitals);
        response.put("patientsPerHospital", patientsPerHospital);
        response.put("totalPatients", totalPatients);
        response.put("message", "Added " + totalPatients + " patients to " + flooded
                + " hospitals. Existing simulation will handle redirects.");
        return response;
    }

    @PostMapping("/distress")
    public String triggerDistress(@RequestBody Map<String, Object> body) {
        String hospitalId = (String) body.get("hospitalId");
        String patientId = (String) body.get("patientId");
        int distressLevel = (int) body.get("distressLevel"); // e.g. 50 (Provisional Boost)

        distressService.triggerDistress(patientId, distressLevel);
        return "Triggered PENDING distress for " + patientId;
    }

    @PostMapping("/distress/confirm")
    public String confirmDistress(@RequestBody Map<String, String> body) {
        String patientId = body.get("patientId");
        distressService.confirmDistress(patientId);
        return "Confirmed distress for " + patientId;
    }

    @PostMapping("/distress/dismiss")
    public String dismissDistress(@RequestBody Map<String, String> body) {
        String patientId = body.get("patientId");
        distressService.dismissDistress(patientId);
        return "Dismissed distress for " + patientId;
    }

    @GetMapping("/testInitialization")
    public String initForTest() {
        Map<String, String> m = new HashMap<>();
        m.put("count", "3");
        initializeCity(m);
        m.put("count", "1000");
        triggerSurge(m);

        return "Initialized Test With 3 Hospitals and 1000 Patients.";

    }

    @GetMapping("/testRedirect")
    public String redirectSurge() {
        Map<String, String> m = new HashMap<>();
        m.put("count", "10");
        initializeCity(m);
        for (int i = 0; i < 200; i++) {
            String hId = "H1";
            Patient p = Patient.builder()
                    .baseSeverity(2)
                    .targetHospitalId(hId)
                    .arrivalTime(java.time.Instant.now().toEpochMilli())
                    .build();
            hospitalService.admitPatient(hId, p);
        }
        for (int i = 0; i < 200; i++) {
            String hId = "H7";
            Patient p = Patient.builder()
                    .baseSeverity(10)
                    .targetHospitalId(hId)
                    .arrivalTime(java.time.Instant.now().toEpochMilli())
                    .build();
            hospitalService.admitPatient(hId, p);

        }
        return "Redirect Surge initialized.";
    }

    public String getMethodName(@RequestParam String param) {
        return new String();
    }

    @PostMapping("/staffing")
    public String updateStaffing(@RequestBody Map<String, Object> body) {
        String hospitalId = (String) body.get("hospitalId");
        String deptStr = (String) body.get("department");
        int count = Integer.parseInt(body.get("count").toString());

        com.example.Vitality.model.Department dept = com.example.Vitality.model.Department.valueOf(deptStr);
        hospitalService.updateStaffCount(hospitalId, dept, count);
        return "Updated " + hospitalId + " [" + dept + "] to " + count + " active staff.";
    }

    @PostMapping("/staffing/shortage")
    public String triggerGlobalShortage(@RequestBody(required = false) Map<String, Double> body) {
        // Default shortage is 40% (i.e. reduce capacity to 60%)
        double factor = (body != null && body.containsKey("factor")) ? body.get("factor") : 0.6;

        System.out.println(">>> ⚠️  TRIGGERING STAFF SHORTAGE (Factor: " + factor + ") <<<");

        int totalReduced = 0;
        for (Hospital h : orchestratorService.getAllHospitals()) {
            // Reduce Nurses (Default 10)
            int currentNurse = h.getDepartmentalStaff().get(com.example.Vitality.model.Department.NURSE)
                    .getCorePoolSize();
            int newNurse = Math.max(1, (int) (currentNurse * factor));
            hospitalService.updateStaffCount(h.getId(), com.example.Vitality.model.Department.NURSE, newNurse);

            // Reduce General (Default 5)
            int currentGen = h.getDepartmentalStaff().get(com.example.Vitality.model.Department.GENERAL)
                    .getCorePoolSize();
            int newGen = Math.max(1, (int) (currentGen * factor));
            hospitalService.updateStaffCount(h.getId(), com.example.Vitality.model.Department.GENERAL, newGen);

            // Reduce ICU (Default 2 -> likely 1)
            int currentICU = h.getDepartmentalStaff().get(com.example.Vitality.model.Department.ICU).getCorePoolSize();
            int newICU = Math.max(1, (int) (currentICU * factor));
            hospitalService.updateStaffCount(h.getId(), com.example.Vitality.model.Department.ICU, newICU);
        }

        return "Global Staff Shortage Applied (Remaining Capacity: " + (factor * 100)
                + "%). Doctors entering retirement after current patient.";
    }
}
