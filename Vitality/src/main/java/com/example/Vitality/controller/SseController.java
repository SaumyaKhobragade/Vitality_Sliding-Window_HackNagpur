package com.example.Vitality.controller;

import com.example.Vitality.service.SseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/**
 * REST Controller for Server-Sent Events (SSE) streaming endpoints.
 * Provides real-time data streams for stats, hospital updates, and events.
 */
@RestController
@RequestMapping("/api/sse")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class SseController {

    private final SseService sseService;

    /**
     * SSE endpoint for city statistics stream.
     * Broadcasts stats every 2 seconds.
     */
    @GetMapping(value = "/stats", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamStats() {
        log.info("New SSE connection for /stats");
        return sseService.subscribeStats();
    }

    /**
     * SSE endpoint for hospital updates stream.
     * Broadcasts whenever a hospital state changes.
     */
    @GetMapping(value = "/hospital", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamHospital() {
        log.info("New SSE connection for /hospital");
        return sseService.subscribeHospital();
    }

    /**
     * SSE endpoint for system events stream.
     * Broadcasts events like patient admissions, surges, distress signals.
     */
    @GetMapping(value = "/events", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamEvents() {
        log.info("New SSE connection for /events");
        return sseService.subscribeEvents();
    }
}
