package com.example.Vitality.service;

import com.example.Vitality.model.Hospital;
import com.example.Vitality.model.Patient;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.*;

@Service
public class HospitalService {

    private final Map<String, Hospital> cityHospitals = new ConcurrentHashMap<>();

    // Simulation Constants
    private static final int DEFAULT_DOCTORS = 5;
    private static final int TREATMENT_TIME_MS = 2000; // Simulated 2 seconds treatment

    /**
     * initializes a hospital node with a thread pool and priority queue.
     */
    public Hospital createHospital(String id, String name, int maxCapacity) {
        PriorityBlockingQueue<Patient> queue = new PriorityBlockingQueue<>();

        // Custom ThreadFactory to name doctor threads
        ThreadFactory doctorFactory = r -> new Thread(r, "Doctor-" + id + "-" + System.nanoTime());

        ThreadPoolExecutor executor = new ThreadPoolExecutor(
                DEFAULT_DOCTORS,
                DEFAULT_DOCTORS,
                0L, TimeUnit.MILLISECONDS,
                new LinkedBlockingQueue<>(), // Internal task queue for the executor (not the patient queue!)
                doctorFactory);

        Hospital hospital = Hospital.builder()
                .id(id)
                .name(name)
                .maxCapacity(maxCapacity)
                .waitingRoom(queue)
                .medicalStaff(executor)
                .build();

        cityHospitals.put(id, hospital);
        startDoctorLoop(hospital);

        return hospital;
    }

    /**
     * Main simulation loop: Doctors constantly check the waiting room.
     * In a real thread pool, you submit tasks. Here we essentially have a consumer
     * loop.
     * However, for better simulation, we can submit "Treatment Tasks" whenever a
     * patient arrives
     * OR have a poller.
     * 
     * Let's use a simpler approach: When a patient arrives, we try to submit a
     * "TreatPatient" task.
     * If all doctors are busy, the task naturally sits in the EXECUTOR's queue?
     * NO, we want to maintain our own PriorityQueue.
     * 
     * Correct Pattern:
     * Doctors are consumers. They take() from the PriorityBlockingQueue.
     */
    private void startDoctorLoop(Hospital hospital) {
        for (int i = 0; i < DEFAULT_DOCTORS; i++) {
            CompletableFuture.runAsync(() -> {
                while (true) {
                    try {
                        // This blocks until a patient is available
                        Patient p = hospital.getWaitingRoom().take();
                        treatPatient(hospital, p);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
            }, hospital.getMedicalStaff()); // Run inside the hospital's thread pool
        }
    }

    private void treatPatient(Hospital h, Patient p) {
        h.getActiveTreatments().incrementAndGet();
        p.setTreating(true);
        System.out.println("Hospital " + h.getId() + ": Treating patient " + p.getId() + " (Priority: "
                + p.getDynamicPriority() + ")");

        try {
            Thread.sleep(TREATMENT_TIME_MS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } finally {
            h.getActiveTreatments().decrementAndGet();
            System.out.println("Hospital " + h.getId() + ": Finished patient " + p.getId());
        }
    }

    public void admitPatient(String hospitalId, Patient p) {
        Hospital h = cityHospitals.get(hospitalId);
        if (h != null) {
            h.getWaitingRoom().offer(p);
            System.out.println("Admitted " + p.getId() + " to " + hospitalId + " queue.");
        }
    }

    public Hospital getHospital(String id) {
        return cityHospitals.get(id);
    }

    public java.util.Collection<Hospital> getAllHospitals() {
        return cityHospitals.values();
    }
}
