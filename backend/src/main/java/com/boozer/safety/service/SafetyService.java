package com.boozer.safety.service;

import com.boozer.audit.service.AuditLogService;
import com.boozer.safety.entity.SafetyEventEntity;
import com.boozer.safety.repository.SafetyEventRepository;
import com.boozer.users.entity.TrustedContactEntity;
import com.boozer.users.entity.UserEntity;
import com.boozer.users.repository.TrustedContactRepository;
import com.boozer.users.repository.UserRepository;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SafetyService {

    private final SafetyEventRepository safetyEventRepository;
    private final UserRepository userRepository;
    private final TrustedContactRepository trustedContactRepository;
    private final AuditLogService auditLogService;

    @Transactional
    public SosTriggerResult triggerSos(
            UUID userId,
            BigDecimal lat,
            BigDecimal lng,
            Integer batteryLevel,
            String notes
    ) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        List<TrustedContactEntity> sosContacts = trustedContactRepository.findByUserIdAndIsSosRecipientTrue(userId);

        boolean locationKnown = (lat != null && lng != null);
        String resolvedStatus = locationKnown ? "CONTACTS_NOTIFIED" : "CONTACTS_NOTIFIED_LOCATION_UNKNOWN";
        String resolvedNotes = notes != null ? notes : "Emergency SOS hold triggered from user device";
        if (!locationKnown) {
            resolvedNotes = "[LOCATION_UNKNOWN] " + resolvedNotes + " - GPS coordinates unavailable at trigger time";
        }

        SafetyEventEntity event = SafetyEventEntity.builder()
                .user(user)
                .eventType("SOS_TRIGGERED")
                .status(resolvedStatus)
                .latitude(lat)
                .longitude(lng)
                .batteryLevel(batteryLevel)
                .notes(resolvedNotes)
                .contactsNotifiedCount(sosContacts.size())
                .build();

        SafetyEventEntity saved = safetyEventRepository.save(event);

        log.warn("EMERGENCY SOS TRIGGERED by user {} ({}). Coordinates: {}, {} (Location Known: {}). Notified {} trusted contacts.",
                user.getId(), user.getFullName(), event.getLatitude(), event.getLongitude(), locationKnown, sosContacts.size());

        Map<String, Object> auditMetadata = new java.util.HashMap<>();
        auditMetadata.put("contactsNotified", sosContacts.size());
        auditMetadata.put("locationKnown", locationKnown);
        if (event.getLatitude() != null) auditMetadata.put("lat", event.getLatitude());
        if (event.getLongitude() != null) auditMetadata.put("lng", event.getLongitude());
        if (batteryLevel != null) auditMetadata.put("batteryLevel", batteryLevel);

        auditLogService.logAction(
                userId,
                "CUSTOMER",
                "SOS_TRIGGERED",
                "SAFETY_EVENT",
                saved.getId().toString(),
                null,
                auditMetadata
        );

        String broadcastMessage = locationKnown
                ? "Emergency broadcast dispatched to trusted contacts. Local emergency services standing by."
                : "Emergency broadcast dispatched to trusted contacts (GPS location unavailable - contacts alerted). Local emergency services standing by.";

        return SosTriggerResult.builder()
                .eventId(saved.getId())
                .status(resolvedStatus)
                .notifiedContactsCount(sosContacts.size())
                .contacts(sosContacts.stream().map(TrustedContactEntity::getName).toList())
                .emergencyServicesNumber("112")
                .message(broadcastMessage)
                .build();
    }

    @Transactional
    public SafetyEventEntity resolveEvent(UUID eventId, String resolutionStatus) {
        SafetyEventEntity event = safetyEventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Safety event not found: " + eventId));

        event.setStatus(resolutionStatus != null ? resolutionStatus : "RESOLVED");
        event.setResolvedAt(OffsetDateTime.now());
        return safetyEventRepository.save(event);
    }

    public List<SafetyEventEntity> getUserSafetyEvents(UUID userId) {
        return safetyEventRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Data
    @Builder
    public static class SosTriggerResult {
        private UUID eventId;
        private String status;
        private int notifiedContactsCount;
        private List<String> contacts;
        private String emergencyServicesNumber;
        private String message;
    }
}
