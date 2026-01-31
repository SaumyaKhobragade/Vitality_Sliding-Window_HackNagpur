package com.example.triage.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import java.time.LocalDateTime;

@Entity
public class Patient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private int severity; // 1-10
    private LocalDateTime arrivalTime;
    private String hospitalId;
    private String status; // WAITING, IN_PROGRESS, TREATED

    public Patient() {
    }

    public Patient(Long id, int severity, LocalDateTime arrivalTime, String hospitalId, String status) {
        this.id = id;
        this.severity = severity;
        this.arrivalTime = arrivalTime;
        this.hospitalId = hospitalId;
        this.status = status;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public int getSeverity() {
        return severity;
    }

    public void setSeverity(int severity) {
        this.severity = severity;
    }

    public LocalDateTime getArrivalTime() {
        return arrivalTime;
    }

    public void setArrivalTime(LocalDateTime arrivalTime) {
        this.arrivalTime = arrivalTime;
    }

    public String getHospitalId() {
        return hospitalId;
    }

    public void setHospitalId(String hospitalId) {
        this.hospitalId = hospitalId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    // Manual Builder implementation for TestController
    public static class PatientBuilder {
        private Long id;
        private int severity;
        private LocalDateTime arrivalTime;
        private String hospitalId;
        private String status;

        public PatientBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public PatientBuilder severity(int severity) {
            this.severity = severity;
            return this;
        }

        public PatientBuilder arrivalTime(LocalDateTime arrivalTime) {
            this.arrivalTime = arrivalTime;
            return this;
        }

        public PatientBuilder hospitalId(String hospitalId) {
            this.hospitalId = hospitalId;
            return this;
        }

        public PatientBuilder status(String status) {
            this.status = status;
            return this;
        }

        public Patient build() {
            return new Patient(id, severity, arrivalTime, hospitalId, status);
        }
    }

    public static PatientBuilder builder() {
        return new PatientBuilder();
    }
}
