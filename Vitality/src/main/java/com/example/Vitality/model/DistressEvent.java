package com.example.Vitality.model;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DistressEvent {
    private String patientId;
    private String type; // e.g., "COLLAPSE", "VOMITING", "IMMOBILITY"
    private double confidence; // 0.0 to 1.0
    private long timestamp;
}
