package com.example.Vitality.model;

import lombok.Data;
import lombok.Builder;
import java.util.Set;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.PriorityBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.atomic.AtomicInteger;

@Data
@Builder
public class Hospital {
    private String id;
    private String name;
    private int maxCapacity;

    // Thread pool representing the doctors
    // Not using @Builder for these complex objects, initialized in service or
    // constructor
    private ThreadPoolExecutor medicalStaff;

    // Waiting Room - Thread Safe Priority Queue
    private PriorityBlockingQueue<Patient> waitingRoom;

    // Metrics
    @Builder.Default
    private AtomicInteger activeTreatments = new AtomicInteger(0);

    public int getQueueSize() {
        return waitingRoom.size();
    }

    public int getActiveDoctorCount() {
        return activeTreatments.get();
    }
}
