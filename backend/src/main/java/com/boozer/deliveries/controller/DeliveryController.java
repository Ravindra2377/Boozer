package com.boozer.deliveries.controller;

import com.boozer.common.dto.ApiResponse;
import com.boozer.deliveries.entity.DeliveryEntity;
import com.boozer.deliveries.service.DeliveryService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}
