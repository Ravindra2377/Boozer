package com.boozer.safety.controller;

import com.boozer.common.dto.ApiResponse;
import com.boozer.safety.entity.SafetyEventEntity;
import com.boozer.safety.service.SafetyService;
import com.boozer.users.entity.UserEntity;
import com.boozer.users.repository.UserRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/safety")
@RequiredArgsConstructor
public class SafetyController {

    private final SafetyService safetyService;
    private final UserRepository userRepository;

    private UUID resolveUserId(String headerUserId) {
        if (headerUserId != null && !headerUserId.isBlank()) {
            try {
                return UUID.fromString(headerUserId);
            } catch (Exception ignored) {}
        }
        return userRepository.findAll().stream().findFirst()
                .map(UserEntity::getId)
                .orElse(UUID.fromString("00000000-0000-0000-0000-000000000001"));
    }

    @PostMapping("/sos")
    public ResponseEntity<ApiResponse<SafetyService.SosTriggerResult>> triggerSos(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestBody(required = false) SosRequest request
    ) {
        UUID userId = resolveUserId(headerUserId);
        BigDecimal lat = request != null ? request.getLatitude() : null;
        BigDecimal lng = request != null ? request.getLongitude() : null;
        Integer battery = request != null ? request.getBatteryLevel() : null;
        String notes = request != null ? request.getNotes() : null;

        var result = safetyService.triggerSos(userId, lat, lng, battery, notes);
        return ResponseEntity.ok(ApiResponse.success("EMERGENCY SOS DISPATCHED", result));
    }

    @GetMapping("/events")
    public ResponseEntity<ApiResponse<List<SafetyEventEntity>>> getEvents(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId
    ) {
        UUID userId = resolveUserId(headerUserId);
        return ResponseEntity.ok(ApiResponse.success(safetyService.getUserSafetyEvents(userId)));
    }

    @PatchMapping("/events/{id}/resolve")
    public ResponseEntity<ApiResponse<SafetyEventEntity>> resolveEvent(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "RESOLVED") String status
    ) {
        SafetyEventEntity event = safetyService.resolveEvent(id, status);
        return ResponseEntity.ok(ApiResponse.success("Safety event resolved", event));
    }

    @Data
    public static class SosRequest {
        private BigDecimal latitude;
        private BigDecimal longitude;
        private Integer batteryLevel;
        private String notes;
    }
}
