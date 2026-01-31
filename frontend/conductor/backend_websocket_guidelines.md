# Java Backend WebSocket Implementation Guidelines

This document outlines the implementation requirements for the Java Spring Boot backend to support the real-time visualization features of the Vitality frontend.

## 1. Dependencies

Ensure the following dependencies are included in your `pom.xml` (Maven) or `build.gradle` (Gradle).

**Maven:**
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-websocket</artifactId>
</dependency>
```

**Gradle:**
```groovy
implementation 'org.springframework.boot:spring-boot-starter-websocket'
```

## 2. WebSocket Configuration

Configure the WebSocket message broker to support STOMP over SockJS.

**File:** `src/main/java/com/vitality/config/WebSocketConfig.java`

```java
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable a simple memory-based message broker to carry messages back to the client on destinations prefixed with "/topic"
        config.enableSimpleBroker("/topic");
        
        // Designate the prefix for messages that are bound for methods annotated with @MessageMapping
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Register the "/ws" endpoint, enabling SockJS fallback options so that alternate transports can be used if WebSocket is not available.
        // CORS configuration is crucial for the frontend to connect from a different port (e.g., localhost:3000).
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*") // Configure appropriate allowed origins for production
                .withSockJS();
    }
}
```

## 3. Data Models

The backend models must serialize to JSON matching the frontend interfaces.

### 3.1. Enums
**File:** `src/main/java/com/vitality/model/Department.java`
```java
public enum Department {
    NURSE,
    GENERAL,
    ICU
}
```

### 3.2. Patient
**File:** `src/main/java/com/vitality/model/Patient.java`
```java
import java.util.UUID;

public class Patient {
    private String id;
    private int baseSeverity; // 1-10
    private long arrivalTime; // Timestamp in ms
    private String targetHospitalId;
    private int distressScore;
    private boolean treating;
    private int dynamicPriority;

    // Constructors, Getters, Setters
}
```

### 3.3. Hospital
**File:** `src/main/java/com/vitality/model/Hospital.java`
```java
import java.util.List;
import java.util.Map;

public class Hospital {
    private String id;
    private String name;
    private int maxCapacity;
    
    // Map of Department Enum to List of Patients
    private Map<Department, List<Patient>> waitingRooms;
    
    private int activeTreatments;
    
    // Computed fields (should be included in JSON serialization)
    private int totalQueueSize;
    private int activeDoctorCount;

    // Constructors, Getters, Setters
}
```

### 3.4. CityStats
**File:** `src/main/java/com/vitality/model/CityStats.java`
```java
public class CityStats {
    private int totalHospitals;
    private int totalPatientsWaiting;
    private int totalDoctorsActive;
    private boolean surgeActive;

    // Constructors, Getters, Setters
}
```

## 4. Messaging Workflow

The backend should broadcast updates to specific topics when the simulation state changes.

### 4.1. Topics
- **Global Stats:** `/topic/stats`
    - **Payload:** `CityStats` object.
    - **Trigger:** Periodic update (e.g., every 1-2 seconds) or significant city-wide event.

- **Hospital Updates:** `/topic/hospital`
    - **Payload:** `Hospital` object.
    - **Trigger:** Whenever a patient adds/leaves a queue, or treatment status changes in a specific hospital. 
    - *Note:* The frontend currently subscribes to this single topic. For scalability, consider publishing to `/topic/hospital/{id}` in the future, but the current frontend expects a stream of updated hospital objects on this shared topic.

### 4.2. Scheduler / Event Publisher Example

**File:** `src/main/java/com/vitality/service/SimulationPublisher.java`

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class SimulationPublisher {

    @Autowired
    private SimpMessagingTemplate template;
    
    @Autowired
    private SimulationService simulationService; // Your core logic service

    // Broadcast global stats every second
    @Scheduled(fixedRate = 1000)
    public void broadcastStats() {
        CityStats stats = simulationService.getCityStats();
        template.convertAndSend("/topic/stats", stats);
    }

    // Call this method whenever a hospital's state changes significantly
    public void publishHospitalUpdate(Hospital hospital) {
        template.convertAndSend("/topic/hospital", hospital);
    }
}
```

## 5. Security Notes

- Ensure `CorsConfiguration` allows the frontend origin (`http://localhost:3000` or similar).
- If Spring Security is added later, ensure the `/ws/**` endpoints are permitted.

## 6. Verification

To verify the implementation:
1.  Start the Spring Boot application.
2.  Start the Next.js frontend.
3.  Check the frontend console for "WebSocket Connected".
4.  Verify that `DashboardStats` and `HospitalStatusList` components update in real-time without page refreshes.
