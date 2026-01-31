package com.example.triage.service;

import com.example.triage.model.Patient;
import com.example.triage.repository.PatientRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class SentinelService {

    private static final Logger log = LoggerFactory.getLogger(SentinelService.class);

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private HospitalService hospitalService;

    private static final int SURGE_THRESHOLD_PER_MIN = 5;
    private static final int LOOKBACK_MINUTES = 2;
    private static final int COOLDOWN_SECONDS = 30;
    private static final int STAFF_THRESHOLD = 2; // Trigger surge if doctors < 2
    private static final int MIN_PATIENTS_THRESHOLD = 10; // Explicit minimum for testing

    private LocalDateTime lastSurgeTriggerTime = LocalDateTime.MIN;

    @Scheduled(fixedRate = 30000) // Every 30 seconds
    public void monitorArrivalRate() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime twoMinutesAgo = now.minusMinutes(LOOKBACK_MINUTES);
        List<Patient> recentPatients = patientRepository.findAllByArrivalTimeAfter(twoMinutesAgo);

        double arrivalRate = (double) recentPatients.size() / LOOKBACK_MINUTES;
        int activeDoctors = hospitalService.getActiveDoctors();

        // Surge if (arrival rate high AND enough patients) OR staffing level critical
        boolean criteriaMet = (arrivalRate >= SURGE_THRESHOLD_PER_MIN
                && recentPatients.size() >= MIN_PATIENTS_THRESHOLD)
                || activeDoctors < STAFF_THRESHOLD;

        if (criteriaMet) {
            lastSurgeTriggerTime = now;
            if (!hospitalService.isSurgeActive()) {
                log.info("Sentinel: Surge activated. Rate: {}/min, Doctors: {}.", arrivalRate, activeDoctors);
                hospitalService.setSurgeActive(true);
            }
        } else {
            // Check if cooldown has passed
            if (hospitalService.isSurgeActive()) {
                long secondsSinceLastSurge = Duration.between(lastSurgeTriggerTime, now).toSeconds();
                if (secondsSinceLastSurge >= COOLDOWN_SECONDS) {
                    log.info("Sentinel: Surge deactivated after {} sec cooldown.", secondsSinceLastSurge);
                    hospitalService.setSurgeActive(false);
                } else {
                    log.debug("Sentinel: Criteria normal, but cooling down. {} sec remaining.",
                            COOLDOWN_SECONDS - secondsSinceLastSurge);
                }
            }
        }
    }
}
