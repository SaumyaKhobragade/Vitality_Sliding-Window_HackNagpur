package com.example.Vitality.model;

import lombok.Data;
import lombok.Builder;
import java.util.Map;
import java.util.Queue;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.PriorityBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.atomic.AtomicInteger;

@Data
@Builder
public class Hospital {
    private String id;
    private String name;
    private int maxCapacity;

    // Multi-Tiered Resources
    @Builder.Default
    public Map<Department, PriorityBlockingQueue<Patient>> waitingRooms = new ConcurrentHashMap<>();

    @Builder.Default
    private Map<Department, ThreadPoolExecutor> departmentalStaff = new ConcurrentHashMap<>();

    // Metrics
    @Builder.Default
    private AtomicInteger activeTreatments = new AtomicInteger(0);

    public int getTotalQueueSize() {
        return waitingRooms.values().stream().mapToInt(Queue::size).sum();
    }

    public int getActiveDoctorCount() {
        return activeTreatments.get();
    }
}
