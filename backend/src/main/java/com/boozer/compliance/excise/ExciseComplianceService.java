package com.boozer.compliance.excise;

import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExciseComplianceService {

    private final GeofencingService geofencingService;

    // Buffer: Stop accepting orders 15 minutes before excise curfew
    private static final int DISPATCH_BUFFER_MINUTES = 15;

    // In-memory Statutory Dry Days Calendar (Telangana & Karnataka 2026)
    private static final Map<String, List<DryDay>> DRY_DAYS_REGISTRY = new HashMap<>();

    static {
        List<DryDay> telanganaDryDays = List.of(
                DryDay.builder().date(LocalDate.of(2026, 1, 26)).reason("Republic Day").state("TELANGANA").statutorySection("Section 17(1) TG Excise Act").isMandatoryStatewide(true).build(),
                DryDay.builder().date(LocalDate.of(2026, 2, 17)).reason("Maha Shivaratri").state("TELANGANA").statutorySection("Section 17(2) TG Excise Act").isMandatoryStatewide(true).build(),
                DryDay.builder().date(LocalDate.of(2026, 3, 3)).reason("Holi / Dhulandi").state("TELANGANA").statutorySection("Executive Notification 2026").isMandatoryStatewide(true).build(),
                DryDay.builder().date(LocalDate.of(2026, 4, 14)).reason("Ambedkar Jayanti").state("TELANGANA").statutorySection("Section 17(1) TG Excise Act").isMandatoryStatewide(true).build(),
                DryDay.builder().date(LocalDate.of(2026, 8, 15)).reason("Independence Day").state("TELANGANA").statutorySection("National Holiday Order").isMandatoryStatewide(true).build(),
                DryDay.builder().date(LocalDate.of(2026, 10, 2)).reason("Mahatma Gandhi Jayanti").state("TELANGANA").statutorySection("National Statutory Dry Day").isMandatoryStatewide(true).build(),
                DryDay.builder().date(LocalDate.of(2026, 10, 20)).reason("Vijayadashami / Dussehra").state("TELANGANA").statutorySection("Excise Notification").isMandatoryStatewide(true).build(),
                DryDay.builder().date(LocalDate.of(2026, 11, 25)).reason("Guru Nanak Jayanti").state("TELANGANA").statutorySection("Excise Notification").isMandatoryStatewide(true).build()
        );

        List<DryDay> karnatakaDryDays = List.of(
                DryDay.builder().date(LocalDate.of(2026, 1, 26)).reason("Republic Day").state("KARNATAKA").statutorySection("Karnataka Excise (General Conditions) Rules").isMandatoryStatewide(true).build(),
                DryDay.builder().date(LocalDate.of(2026, 8, 15)).reason("Independence Day").state("KARNATAKA").statutorySection("National Holiday Order").isMandatoryStatewide(true).build(),
                DryDay.builder().date(LocalDate.of(2026, 10, 2)).reason("Mahatma Gandhi Jayanti").state("KARNATAKA").statutorySection("National Statutory Dry Day").isMandatoryStatewide(true).build(),
                DryDay.builder().date(LocalDate.of(2026, 11, 1)).reason("Karnataka Rajyotsava").state("KARNATAKA").statutorySection("State Formation Day Order").isMandatoryStatewide(true).build()
        );

        DRY_DAYS_REGISTRY.put("TELANGANA", telanganaDryDays);
        DRY_DAYS_REGISTRY.put("KARNATAKA", karnatakaDryDays);
    }

    /**
     * Checks if a given date is a statutory dry day in the specified state.
     */
    public Optional<DryDay> checkDryDay(LocalDate date, String state) {
        String normalizedState = state != null ? state.toUpperCase() : "TELANGANA";
        List<DryDay> dryDays = DRY_DAYS_REGISTRY.getOrDefault(normalizedState, Collections.emptyList());

        return dryDays.stream()
                .filter(d -> d.getDate().equals(date))
                .findFirst();
    }

    public List<DryDay> getDryDaysForState(String state) {
        String normalizedState = state != null ? state.toUpperCase() : "TELANGANA";
        return DRY_DAYS_REGISTRY.getOrDefault(normalizedState, Collections.emptyList());
    }

    /**
     * Comprehensive real-time compliance check for order placement.
     */
    public ComplianceStatus evaluateOrderCompliance(
            String state,
            LocalDate orderDate,
            LocalTime orderTime,
            LocalTime storeStartHours,
            LocalTime storeEndHours,
            BigDecimal storeLat,
            BigDecimal storeLng,
            BigDecimal customerLat,
            BigDecimal customerLng,
            double maxRadiusKm
    ) {
        // 1. Dry Day Check
        Optional<DryDay> dryDayOpt = checkDryDay(orderDate, state);
        if (dryDayOpt.isPresent()) {
            DryDay dryDay = dryDayOpt.get();
            return ComplianceStatus.builder()
                    .isPermitted(false)
                    .isDryDay(true)
                    .dryDayReason(dryDay.getReason())
                    .statutoryCitation(dryDay.getStatutorySection())
                    .rejectionMessage("Alcohol sale and delivery is strictly prohibited today (" + dryDay.getReason() + ") under State Excise Regulations.")
                    .build();
        }

        // 2. Operating Hours Check (with 15-minute dispatch buffer)
        LocalTime effectiveCloseTime = storeEndHours.minusMinutes(DISPATCH_BUFFER_MINUTES);
        boolean isOpen = !orderTime.isBefore(storeStartHours) && !orderTime.isAfter(storeEndHours);
        boolean isBeforeBufferCutoff = !orderTime.isAfter(effectiveCloseTime);

        long minutesRemaining = 0;
        if (isOpen && orderTime.isBefore(storeEndHours)) {
            minutesRemaining = Duration.between(orderTime, storeEndHours).toMinutes();
        }

        if (orderTime.isBefore(storeStartHours)) {
            return ComplianceStatus.builder()
                    .isPermitted(false)
                    .isOperatingHoursValid(false)
                    .rejectionMessage("Licensed retail store opens at " + storeStartHours + ". Orders cannot be accepted before statutory opening hours.")
                    .minutesRemaining(minutesRemaining)
                    .build();
        }

        if (!isBeforeBufferCutoff) {
            return ComplianceStatus.builder()
                    .isPermitted(false)
                    .isOperatingHoursValid(false)
                    .rejectionMessage("Excise order curfew reached: Orders must be placed at least " + DISPATCH_BUFFER_MINUTES + " mins before store close (" + storeEndHours + ") to permit legal transit.")
                    .minutesRemaining(minutesRemaining)
                    .build();
        }

        // 3. Geofencing Zone Check
        double distanceKm = geofencingService.calculateDistanceKm(storeLat, storeLng, customerLat, customerLng);
        boolean withinZone = distanceKm <= maxRadiusKm;

        if (!withinZone) {
            return ComplianceStatus.builder()
                    .isPermitted(false)
                    .isWithinExciseZone(false)
                    .deliveryDistanceKm(distanceKm)
                    .maxRadiusKm(maxRadiusKm)
                    .rejectionMessage("Delivery address (" + distanceKm + " km) is outside the licensed excise zone perimeter (" + maxRadiusKm + " km). Orders across excise boundaries are prohibited by law.")
                    .build();
        }

        return ComplianceStatus.builder()
                .isPermitted(true)
                .isDryDay(false)
                .isOperatingHoursValid(true)
                .isWithinExciseZone(true)
                .deliveryDistanceKm(distanceKm)
                .maxRadiusKm(maxRadiusKm)
                .minutesRemaining(minutesRemaining)
                .rejectionMessage(null)
                .build();
    }

    @Data
    @Builder
    public static class ComplianceStatus {
        private boolean isPermitted;
        @Builder.Default
        private boolean isDryDay = false;
        private String dryDayReason;
        private String statutoryCitation;
        @Builder.Default
        private boolean isOperatingHoursValid = true;
        @Builder.Default
        private boolean isWithinExciseZone = true;
        private double deliveryDistanceKm;
        private double maxRadiusKm;
        private long minutesRemaining;
        private String rejectionMessage;
    }
}
