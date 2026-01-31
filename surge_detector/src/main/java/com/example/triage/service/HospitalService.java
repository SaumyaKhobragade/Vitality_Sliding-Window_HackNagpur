package com.example.triage.service;

import com.example.triage.model.Patient;
import com.example.triage.repository.PatientRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.PriorityBlockingQueue;

@Service
public class HospitalService {

    @Autowired
    private PatientRepository patientRepository;

    private static final Logger log = LoggerFactory.getLogger(HospitalService.class);

    private volatile boolean surgeActive = false;
    private volatile int activeDoctors = 5; // Default staffing

    public boolean isSurgeActive() {
        return surgeActive;
    }

    public synchronized void setSurgeActive(boolean surgeActive) {
        if (this.surgeActive != surgeActive) {
            this.surgeActive = surgeActive;
            log.info("HospitalService: Surge mode toggled to {}. Re-evaluating queue...", surgeActive);
            reEvaluateQueue();
        }
    }

    private synchronized void reEvaluateQueue() {
        // PriorityBlockingQueue doesn't re-sort automatically when comparator's state
        // changes.
        // We drain and re-add to force re-sorting with new weights.
        List<Patient> temp = new ArrayList<>();
        queue.drainTo(temp);
        queue.addAll(temp);
        log.info("HospitalService: Re-evaluation complete. {} patients re-prioritized.", temp.size());
    }

    public int getActiveDoctors() {
        return activeDoctors;
    }

    public void setActiveDoctors(int activeDoctors) {
        this.activeDoctors = activeDoctors;
    }

    private final PriorityBlockingQueue<Patient> queue;

    public HospitalService() {
        this.queue = new PriorityBlockingQueue<>(11, getDynamicComparator());
    }

    private Comparator<Patient> getDynamicComparator() {
        return (p1, p2) -> {
            double p1Priority = calculatePriority(p1);
            double p2Priority = calculatePriority(p2);
            // Higher priority value comes first
            return Double.compare(p2Priority, p1Priority);
        };
    }

    private double calculatePriority(Patient p) {
        long waitTimeMinutes = Duration.between(p.getArrivalTime(), LocalDateTime.now()).toMinutes();
        double severityWeight = surgeActive ? 0.5 : 0.7;
        double waitTimeWeight = surgeActive ? 0.5 : 0.3;

        return (p.getSeverity() * severityWeight) + (waitTimeMinutes * waitTimeWeight);
    }

    public synchronized void addPatientToQueue(Patient patient) {
        patient.setStatus("WAITING");
        patientRepository.save(patient);
        queue.add(patient);
    }

    public synchronized Patient getNextPatient() {
        return queue.poll();
    }

    public synchronized void clearAll() {
        patientRepository.deleteAll();
        queue.clear();
        log.info("HospitalService: System cleared. Database and queue are empty.");
    }

    public int getQueueSize() {
        return queue.size();
    }
}
