package com.example.Vitality.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import lombok.Builder;
import java.util.Map;
import java.util.Queue;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;
import java.util.concurrent.PriorityBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicBoolean;

@Data
@Builder
public class Hospital {
    private String id;
    private String name;
    private int maxCapacity;
    private int x;
    private int y;

    // Multi-Tiered Resources
    @Builder.Default
    public Map<Department, PriorityBlockingQueue<Patient>> waitingRooms = new ConcurrentHashMap<>();

    @Builder.Default
    @JsonIgnore
    private Map<Department, ThreadPoolExecutor> departmentalStaff = new ConcurrentHashMap<>();

    // Controls for graceful shutdown of specific doctor threads
    @Builder.Default
    @JsonIgnore
    private Map<Department, Deque<AtomicBoolean>> staffControl = new ConcurrentHashMap<>();

    // Baseline staff counts for surge scaling (stores original counts)
    @Builder.Default
    private Map<Department, Integer> baselineStaffCount = new ConcurrentHashMap<>();

    // Metrics
    @Builder.Default
    private AtomicInteger activeTreatments = new AtomicInteger(0);

    public Map<String, Integer> getStaffCounts() {
        Map<String, Integer> counts = new java.util.HashMap<>();
        if (departmentalStaff != null) {
            departmentalStaff.forEach((dept, executor) -> {
                counts.put(dept.name(), executor.getCorePoolSize());
            });
        }
        return counts;
    }

    public Map<String, Integer> getActiveStaffCounts() {
        Map<String, Integer> counts = new java.util.HashMap<>();
        if (departmentalStaff != null) {
            departmentalStaff.forEach((dept, executor) -> {
                counts.put(dept.name(), executor.getActiveCount());
            });
        }
        return counts;
    }

    public int getTotalQueueSize() {
        return waitingRooms.values().stream().mapToInt(Queue::size).sum();
    }

    public int getDepartmentQueueSize(Department dept) {
        if (waitingRooms.containsKey(dept)) {
            return waitingRooms.get(dept).size();
        }
        return 0;
    }

    public int getActiveDoctorCount() {
        return activeTreatments.get();
    }

    public String getName() {
        return this.name;
    }

    public String getId() {
        return this.id;
    }

    public int getX() {
        return this.x;
    }

    public int getY() {
        return this.y;
    }

    public int getCapacity() {
        return this.maxCapacity;
    }

}
