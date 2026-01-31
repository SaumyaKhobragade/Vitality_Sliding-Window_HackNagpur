package com.example.Vitality.service;

import com.example.Vitality.model.Department;
import com.example.Vitality.model.Hospital;
import com.example.Vitality.model.Patient;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.*;

@Service
public class HospitalService {

    private final Map<String, Hospital> cityHospitals = new ConcurrentHashMap<>();
    // Global registry to find patients easily regardless of their state (Waiting or
    // Treating)
    private final Map<String, Patient> masterPatientIndex = new ConcurrentHashMap<>();

    // Simulation Constants
    private static final int TREATMENT_TIME_MS = 60000; // Simulated 60 seconds treatment

    /**
     * initializes a hospital node with multiple departmental thread pools.
     */
    public Hospital createHospital(String id, String name, int maxCapacity) {
        Hospital hospital = Hospital.builder()
                .id(id)
                .name(name)
                .maxCapacity(maxCapacity)
                .build();

        // Initialize Departments
        initDepartment(hospital, Department.NURSE, 10); // 10 Nurses
        initDepartment(hospital, Department.GENERAL, 5); // 5 General Doctors
        initDepartment(hospital, Department.ICU, 2); // 2 ICU Specialists

        cityHospitals.put(id, hospital);
        return hospital;
    }

    private void initDepartment(Hospital h, Department dept, int staffCount) {
        PriorityBlockingQueue<Patient> queue = new PriorityBlockingQueue<>();
        h.getWaitingRooms().put(dept, queue);

        ThreadFactory factory = r -> new Thread(r, h.getId() + "-" + dept + "-" + System.nanoTime());
        ThreadPoolExecutor executor = new ThreadPoolExecutor(
                staffCount, staffCount, 0L, TimeUnit.MILLISECONDS,
                new LinkedBlockingQueue<>(), factory);

        h.getDepartmentalStaff().put(dept, executor);

        // Start consumers for this department
        startDoctorLoop(h, dept, executor, queue, staffCount);
    }

    private void startDoctorLoop(Hospital hospital, Department dept, ThreadPoolExecutor executor,
            PriorityBlockingQueue<Patient> queue, int staffCount) {
        for (int i = 0; i < staffCount; i++) {
            CompletableFuture.runAsync(() -> {
                while (true) {
                    try {
                        // Blocks until patient available in THIS department's queue
                        Patient p = queue.take();
                        treatPatient(hospital, dept, p);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
            }, executor);
        }
    }

    private void treatPatient(Hospital h, Department dept, Patient p) {
        h.getActiveTreatments().incrementAndGet();
        p.setTreating(true);
        System.out.println("Hospital " + h.getId() + " [" + dept + "]: Treating patient " + p.getId() + " (Priority: "
                + p.getDynamicPriority() + ")");

        try {
            Thread.sleep(TREATMENT_TIME_MS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } finally {
            h.getActiveTreatments().decrementAndGet();
            masterPatientIndex.remove(p.getId());
            System.out.println("Hospital " + h.getId() + " [" + dept + "]: Finished patient " + p.getId());
        }
    }

    public void admitPatient(String hospitalId, Patient p) {
        Hospital h = cityHospitals.get(hospitalId);
        if (h != null) {
            masterPatientIndex.put(p.getId(), p);

            // Routing Logic (Vertical Scaling)
            Department targetDept;
            if (p.getBaseSeverity() <= 3) {
                targetDept = Department.NURSE;
            } else if (p.getBaseSeverity() <= 7) {
                targetDept = Department.GENERAL;
            } else {
                targetDept = Department.ICU;
            }

            h.getWaitingRooms().get(targetDept).offer(p);
            System.out.println("Admitted " + p.getId() + " to " + hospitalId + " -> " + targetDept + " Queue");
        }
    }

    public Hospital getHospital(String id) {
        return cityHospitals.get(id);
    }

    public Patient findPatient(String patientId) {
        return masterPatientIndex.get(patientId);
    }

    public java.util.Collection<Hospital> getAllHospitals() {
        return cityHospitals.values();
    }
}
