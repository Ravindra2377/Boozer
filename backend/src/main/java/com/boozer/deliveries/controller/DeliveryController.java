package com.boozer.deliveries.controller;

import com.boozer.common.dto.ApiResponse;
import com.boozer.deliveries.entity.DeliveryEntity;
import com.boozer.deliveries.service.DeliveryService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.math.BigDecimal;
import java.util.UUID;

@RestController
@RequestMapping("/deliveries")
@RequiredArgsConstructor
public class DeliveryController {

    private final DeliveryService deliveryService;

    @GetMapping("/order/{orderId}")
    public ResponseEntity<ApiResponse<DeliveryEntity>> getDeliveryStatus(@PathVariable UUID orderId) {
        DeliveryEntity delivery = deliveryService.getDeliveryForOrder(orderId);
        return ResponseEntity.ok(ApiResponse.success(delivery));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DeliveryEntity>> getDeliveryById(@PathVariable UUID id) {
        DeliveryEntity delivery = deliveryService.getDeliveryById(id);
        return ResponseEntity.ok(ApiResponse.success(delivery));
    }

    @PostMapping("/order/{orderId}/location")
    public ResponseEntity<ApiResponse<DeliveryEntity>> updateRiderLocation(
            @PathVariable UUID orderId,
            @RequestBody RiderLocationRequest request
    ) {
        DeliveryEntity updated = deliveryService.updateRiderLocation(
                orderId,
                request.getLat(),
                request.getLng(),
                request.getSpeedKmh(),
                request.getHeadingDegrees()
        );
        return ResponseEntity.ok(ApiResponse.success("Rider location updated successfully", updated));
    }

    @PostMapping("/{deliveryId}/location")
    public ResponseEntity<ApiResponse<DeliveryEntity>> updateLocationByDeliveryId(
            @PathVariable UUID deliveryId,
            @RequestBody RiderLocationRequest request
    ) {
        DeliveryEntity delivery = deliveryService.getDeliveryById(deliveryId);
        UUID orderId = delivery.getOrder() != null ? delivery.getOrder().getId() : null;
        if (orderId == null) {
            throw new IllegalStateException("Delivery is not attached to an order");
        }
        DeliveryEntity updated = deliveryService.updateRiderLocation(
                orderId,
                request.getLat(),
                request.getLng(),
                request.getSpeedKmh(),
                request.getHeadingDegrees()
        );
        return ResponseEntity.ok(ApiResponse.success("Rider location updated successfully", updated));
    }

    @GetMapping(value = "/order/{orderId}/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamDeliveryLocation(@PathVariable UUID orderId) {
        SseEmitter emitter = new SseEmitter(180_000L); // 3-minute timeout
        deliveryService.registerEmitter(orderId, emitter);
        return emitter;
    }

    @PostMapping("/order/{orderId}/verify-age")
    public ResponseEntity<ApiResponse<Boolean>> verifyDoorstepAge(
            @PathVariable UUID orderId,
            @RequestBody DoorstepVerifyRequest request
    ) {
        boolean verified = deliveryService.verifyDoorstepAgeCheck(orderId, request.getOtp());
        if (verified) {
            return ResponseEntity.ok(ApiResponse.success("Doorstep age check confirmed. Order marked DELIVERED.", true));
        } else {
            return ResponseEntity.badRequest().body(ApiResponse.failure("Invalid doorstep verification code. Delivery cannot be handed over."));
        }
    }

    @Data
    public static class DoorstepVerifyRequest {
        private String otp;
    }

    @Data
    public static class RiderLocationRequest {
        private BigDecimal lat;
        private BigDecimal lng;
        private BigDecimal speedKmh;
        private BigDecimal headingDegrees;
        private BigDecimal accuracy;
    }
}
