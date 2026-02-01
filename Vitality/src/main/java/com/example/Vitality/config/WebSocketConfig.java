package com.example.Vitality.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;

/**
 * WebSocket Configuration for STOMP-based real-time communication.
 * Enables bi-directional communication between Spring Boot backend and Next.js frontend.
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    /**
     * Configure message broker for broadcasting to subscribers.
     * - /topic: For broadcasting messages to multiple subscribers (pub-sub model)
     * - /app: Prefix for messages routed to @MessageMapping methods
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable simple in-memory message broker for broadcasting
        // Clients subscribe to topics like "/topic/stats", "/topic/hospital", "/topic/events"
        config.enableSimpleBroker("/topic");
        
        // Prefix for application destination (messages from clients to server)
        config.setApplicationDestinationPrefixes("/app");
    }

    /**
     * Register STOMP endpoints for WebSocket handshake.
     * - Endpoint: /ws (matches frontend SockJS connection URL)
     * - SockJS fallback enabled for browsers without WebSocket support
     * - CORS configured to accept all origins (configure restrictively in production)
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")  // Allow all origins for development
                .withSockJS()  // Enable SockJS fallback for compatibility
                .setClientLibraryUrl("https://cdn.jsdelivr.net/npm/sockjs-client@1/dist/sockjs.min.js");
    }

    /**
     * Configure WebSocket transport options
     */
    @Override
    public void configureWebSocketTransport(WebSocketTransportRegistration registration) {
        registration.setMessageSizeLimit(128 * 1024)  // 128 KB
                    .setSendBufferSizeLimit(512 * 1024)  // 512 KB
                    .setSendTimeLimit(20000);  // 20 seconds
    }
}
