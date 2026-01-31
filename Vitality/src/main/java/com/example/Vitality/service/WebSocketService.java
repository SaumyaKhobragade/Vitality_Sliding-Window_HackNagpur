package com.example.Vitality.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

/**
 * Service responsible for broadcasting real-time messages via WebSocket.
 * Uses SimpMessagingTemplate to send messages to STOMP topics.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class WebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Broadcast city-wide statistics to all connected clients.
     * Topic: /topic/stats
     * 
     * @param stats Map containing citywide metrics (totalHospitals, totalPatientsWaiting, etc.)
     */
    public void broadcastCityStats(Object stats) {
        try {
            messagingTemplate.convertAndSend("/topic/stats", stats);
            log.debug("Broadcast city stats to /topic/stats");
        } catch (Exception e) {
            log.error("Failed to broadcast city stats: {}", e.getMessage(), e);
        }
    }

    /**
     * Broadcast individual hospital updates to all connected clients.
     * Topic: /topic/hospital
     * 
     * @param hospital Hospital object with updated state
     */
    public void broadcastHospitalUpdate(Object hospital) {
        try {
            messagingTemplate.convertAndSend("/topic/hospital", hospital);
            log.debug("Broadcast hospital update to /topic/hospital");
        } catch (Exception e) {
            log.error("Failed to broadcast hospital update: {}", e.getMessage(), e);
        }
    }

    /**
     * Broadcast system events to all connected clients.
     * Topic: /topic/events
     * 
     * @param event Event object containing type, message, timestamp, etc.
     */
    public void broadcastEvent(Object event) {
        try {
            messagingTemplate.convertAndSend("/topic/events", event);
            log.debug("Broadcast event to /topic/events");
        } catch (Exception e) {
            log.error("Failed to broadcast event: {}", e.getMessage(), e);
        }
    }

    /**
     * Generic method to send payload to any custom topic.
     * 
     * @param topic   The destination topic (e.g., "/topic/custom")
     * @param payload The message payload
     */
    public void sendToTopic(String topic, Object payload) {
        try {
            messagingTemplate.convertAndSend(topic, payload);
            log.debug("Sent message to topic: {}", topic);
        } catch (Exception e) {
            log.error("Failed to send message to {}: {}", topic, e.getMessage(), e);
        }
    }
}
