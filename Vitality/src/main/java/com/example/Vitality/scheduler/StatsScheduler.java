package com.example.Vitality.scheduler;

import com.example.Vitality.service.OrchestratorService;
import com.example.Vitality.service.WebSocketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Scheduler component for broadcasting real-time city statistics.
 * Executes every 2 seconds to push live updates to connected WebSocket clients.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class StatsScheduler {

    private final OrchestratorService orchestratorService;
    private final WebSocketService webSocketService;

    /**
     * Broadcast city statistics every 2 seconds to /topic/stats.
     * Includes error handling to prevent scheduler from stopping on exceptions.
     */
    @Scheduled(fixedRate = 2000)
    public void broadcastStats() {
        try {
            // Fetch current city statistics
            Map<String, Object> stats = orchestratorService.getCityStats();
            
            // Broadcast to all connected WebSocket clients
            webSocketService.broadcastCityStats(stats);
            
            log.trace("Broadcasted city stats: {} hospitals, {} patients waiting", 
                     stats.get("totalHospitals"), 
                     stats.get("totalPatientsWaiting"));
                     
        } catch (Exception e) {
            // Log error but don't let it kill the scheduler
            log.error("Error broadcasting stats in scheduler: {}", e.getMessage(), e);
        }
    }
}
