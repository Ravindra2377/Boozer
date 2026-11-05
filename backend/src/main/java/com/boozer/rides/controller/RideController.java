package com.boozer.rides.controller;

import com.boozer.common.dto.ApiResponse;
import com.boozer.rides.entity.RideBookingEntity;
import com.boozer.rides.entity.RideCreditEntity;
import com.boozer.rides.service.RideService;
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
@RequestMapping("/rides")
@RequiredArgsConstructor
public class RideController {

    private final RideService rideService;
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

    @GetMapping("/credits")
    public ResponseEntity<ApiResponse<List<RideCreditEntity>>> getCredits(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId
    ) {
        UUID userId = resolveUserId(headerUserId);
        return ResponseEntity.ok(ApiResponse.success(rideService.getUserCredits(userId)));
    }

    @GetMapping("/estimates")
    public ResponseEntity<ApiResponse<List<RideService.RideEstimateDto>>> getEstimates(
            @RequestParam(defaultValue = "17.4399") double pickupLat,
            @RequestParam(defaultValue = "78.3908") double pickupLng,
            @RequestParam(defaultValue = "17.4239") double dropLat,
            @RequestParam(defaultValue = "78.4738") double dropLng
    ) {
        var estimates = rideService.getEstimates(pickupLat, pickupLng, dropLat, dropLng);
        return ResponseEntity.ok(ApiResponse.success(estimates));
    }

    @PostMapping("/book")
    public ResponseEntity<ApiResponse<RideBookingEntity>> bookRide(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestBody BookRideRequest request
    ) {
        UUID userId = resolveUserId(headerUserId);
        RideBookingEntity booking = rideService.bookRide(
                userId,
                request.getPartner() != null ? request.getPartner() : "UBER",
                request.getPickupAddress() != null ? request.getPickupAddress() : "Road No 36, Jubilee Hills",
                request.getDropoffAddress() != null ? request.getDropoffAddress() : "Banjara Hills, Hyderabad",
                request.getEstimatedFareInr() != null ? request.getEstimatedFareInr() : new BigDecimal("320.00")
        );
        return ResponseEntity.ok(ApiResponse.success("Safe ride booked successfully", booking));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<RideBookingEntity>>> getRideHistory(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId
    ) {
        UUID userId = resolveUserId(headerUserId);
        return ResponseEntity.ok(ApiResponse.success(rideService.getUserRides(userId)));
    }

    @Data
    public static class BookRideRequest {
        private String partner;
        private String pickupAddress;
        private String dropoffAddress;
        private BigDecimal estimatedFareInr;
    }
}
