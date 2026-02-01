package com.example.Vitality;

import com.example.Vitality.model.DistressStatus;
import com.example.Vitality.model.Patient;
import com.example.Vitality.service.DistressService;
import com.example.Vitality.service.HospitalService;
import com.example.Vitality.service.TriagePolicyService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
    "supabase.policy.sync.enabled=false",
    "spring.main.allow-bean-definition-overriding=true"
})
class HitlWorkflowIntegrationTest {

    @Autowired
    private HospitalService hospitalService;

    @Autowired
    private DistressService distressService;

    @Autowired
    private TriagePolicyService triagePolicyService;

    @BeforeEach
    void setup() throws InterruptedException {
        hospitalService.reset();
        hospitalService.createHospital("H1", "Test Hospital", 10);
        // Disable staff to keep patients in queue
        hospitalService.updateStaffCount("H1", com.example.Vitality.model.Department.NURSE, 0);
        hospitalService.updateStaffCount("H1", com.example.Vitality.model.Department.GENERAL, 0);
        hospitalService.updateStaffCount("H1", com.example.Vitality.model.Department.ICU, 0);
        
        // Wait for threads to exit
        Thread.sleep(500); 
    }

    @Test
    void testProvisionalToPermanentWorkflow() {
        // 1. Create Patient
        Patient p = Patient.builder()
                .id("P1")
                .baseSeverity(5)
                .arrivalTime(System.currentTimeMillis())
                .targetHospitalId("H1")
                .build();
        hospitalService.admitPatient("H1", p);

        double basePriority = p.getDynamicPriority();
        int provisionalBoost = triagePolicyService.getDistressProvisionalBoost();
        int confirmedBoost = triagePolicyService.getDistressConfirmedBoost();
        
        System.out.println("DEBUG: Base Priority=" + basePriority);
        System.out.println("DEBUG: Provisional Boost=" + provisionalBoost);

        // 2. Trigger Distress (PENDING)
        distressService.triggerDistress("P1", 0); 
        
        double currentPriority = p.getDynamicPriority();
        System.out.println("DEBUG: Current Priority (PENDING)=" + currentPriority);
        System.out.println("DEBUG: Patient Status=" + p.getDistressStatus().get());
        
        assertEquals(DistressStatus.PENDING, p.getDistressStatus().get());
        assertTrue(currentPriority >= basePriority + provisionalBoost - 0.01, 
            "Priority " + currentPriority + " should be >= " + (basePriority + provisionalBoost));

        // 3. Confirm Distress
        distressService.confirmDistress("P1");
        
        double finalPriority = p.getDynamicPriority();
        System.out.println("DEBUG: Final Priority (CONFIRMED)=" + finalPriority);
        System.out.println("DEBUG: Policy Confirmed Boost=" + triagePolicyService.getDistressConfirmedBoost());
        System.out.println("DEBUG: Policy Severity Weight=" + triagePolicyService.getSeverityWeight());

        assertEquals(DistressStatus.CONFIRMED, p.getDistressStatus().get());
        assertTrue(finalPriority >= basePriority + confirmedBoost - 0.01,
            "Priority " + finalPriority + " should be >= " + (basePriority + confirmedBoost));
    }

    @Test
    void testProvisionalTimeoutWorkflow() throws InterruptedException {
        // 1. Set short timeout for test
        triagePolicyService.updatePolicy("distress_provisional_timeout", 1.0); // 1 second

        Patient p = Patient.builder()
                .id("P2")
                .baseSeverity(5)
                .arrivalTime(System.currentTimeMillis())
                .targetHospitalId("H1")
                .build();
        hospitalService.admitPatient("H1", p);

        double basePriority = p.getDynamicPriority();

        // 2. Trigger Distress
        distressService.triggerDistress("P2", 0);
        assertEquals(DistressStatus.PENDING, p.getDistressStatus().get());
        System.out.println("DEBUG: Triggered PENDING. Priority=" + p.getDynamicPriority());

        // 3. Wait for timeout
        Thread.sleep(1500);
        System.out.println("DEBUG: Time elapsed=" + (System.currentTimeMillis() - p.getDistressEventTimestamp()) + "ms");
        distressService.checkExpiredDistress();

        System.out.println("DEBUG: Status after check=" + p.getDistressStatus().get());
        System.out.println("DEBUG: Final Priority=" + p.getDynamicPriority());

        assertEquals(DistressStatus.EXPIRED, p.getDistressStatus().get());
        assertTrue(Math.abs(p.getDynamicPriority() - basePriority) < 1.0,
            "Priority " + p.getDynamicPriority() + " should be approx " + basePriority);
    }

    @Test
    void testDynamicPolicyUpdateImpact() {
        Patient p = Patient.builder()
                .id("P3")
                .baseSeverity(5)
                .arrivalTime(System.currentTimeMillis())
                .targetHospitalId("H1")
                .build();
        hospitalService.admitPatient("H1", p);

        // 1. Default Severity Weight = 10.0
        triagePolicyService.updatePolicy("severity_weight", 10.0);
        double prio1 = p.getDynamicPriority();
        assertTrue(prio1 >= 50.0);

        // 2. Update Severity Weight to 20.0
        triagePolicyService.updatePolicy("severity_weight", 20.0);
        double prio2 = p.getDynamicPriority();
        assertTrue(prio2 >= 100.0);
        assertTrue(prio2 > prio1);
    }
}
