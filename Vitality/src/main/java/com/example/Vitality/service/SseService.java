package com.example.Vitality.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Service responsible for managing Server-Sent Events (SSE) connections
 * and broadcasting real-time messages to connected clients.
 */
@Service
@Slf4j
public class SseService {

    private final List<SseEmitter> statsEmitters = new CopyOnWriteArrayList<>();
    private final List<SseEmitter> hospitalEmitters = new CopyOnWriteArrayList<>();
    private final List<SseEmitter> eventsEmitters = new CopyOnWriteArrayList<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Register a new SSE emitter for stats stream
     */
    public SseEmitter subscribeStats() {
        SseEmitter emitter = createEmitter(statsEmitters);
        log.info("New SSE client subscribed to stats. Total: {}", statsEmitters.size());
        return emitter;
    }

    /**
     * Register a new SSE emitter for hospital stream
     */
    public SseEmitter subscribeHospital() {
        SseEmitter emitter = createEmitter(hospitalEmitters);
        log.info("New SSE client subscribed to hospital. Total: {}", hospitalEmitters.size());
        return emitter;
    }

    /**
     * Register a new SSE emitter for events stream
     */
    public SseEmitter subscribeEvents() {
        SseEmitter emitter = createEmitter(eventsEmitters);
        log.info("New SSE client subscribed to events. Total: {}", eventsEmitters.size());
        return emitter;
    }

    private SseEmitter createEmitter(List<SseEmitter> emitterList) {
        SseEmitter emitter = new SseEmitter(0L); // No timeout
        emitterList.add(emitter);

        emitter.onCompletion(() -> {
            emitterList.remove(emitter);
            log.debug("SSE client disconnected");
        });
        emitter.onTimeout(() -> {
            emitterList.remove(emitter);
            log.debug("SSE client timed out");
        });
        emitter.onError(e -> {
            emitterList.remove(emitter);
            log.debug("SSE client error: {}", e.getMessage());
        });

        return emitter;
    }

    /**
     * Broadcast city stats to all subscribed clients
     */
    public void broadcastStats(Object stats) {
        broadcast(statsEmitters, "stats", stats);
    }

    /**
     * Broadcast hospital update to all subscribed clients
     */
    public void broadcastHospital(Object hospital) {
        broadcast(hospitalEmitters, "hospital", hospital);
    }

    /**
     * Broadcast event to all subscribed clients
     */
    public void broadcastEvent(Object event) {
        log.debug("Broadcasting event to {} clients", eventsEmitters.size());
        broadcast(eventsEmitters, "event", event);
    }

    private void broadcast(List<SseEmitter> emitters, String eventName, Object data) {
        if (emitters.isEmpty()) {
            log.debug("No SSE clients connected for event: {}", eventName);
            return;
        }

        String jsonData;
        try {
            jsonData = objectMapper.writeValueAsString(data);
        } catch (Exception e) {
            log.error("Failed to serialize SSE data: {}", e.getMessage());
            return;
        }

        log.debug("Broadcasting {} to {} SSE clients", eventName, emitters.size());
        List<SseEmitter> deadEmitters = new java.util.ArrayList<>();

        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name(eventName)
                        .data(jsonData));
            } catch (IOException e) {
                log.debug("SSE client disconnected: {}", e.getMessage());
                deadEmitters.add(emitter);
            }
        }

        emitters.removeAll(deadEmitters);
        if (!deadEmitters.isEmpty()) {
            log.debug("Removed {} dead SSE connections", deadEmitters.size());
        }
    }
}
