package com.boozer.rides.service;

import com.boozer.audit.service.AuditLogService;
import com.boozer.orders.entity.OrderEntity;
import com.boozer.rides.entity.RideBookingEntity;
import com.boozer.rides.entity.RideCreditEntity;
import com.boozer.rides.provider.OlaRideProvider;
import com.boozer.rides.provider.RideProvider;
import com.boozer.rides.provider.UberRideProvider;
import com.boozer.rides.repository.RideBookingRepository;
import com.boozer.rides.repository.RideCreditRepository;
import com.boozer.users.entity.UserEntity;
import com.boozer.users.repository.UserRepository;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class RideService {

    private final RideCreditRepository rideCreditRepository;
    private final RideBookingRepository rideBookingRepository;
    private final UserRepository userRepository;
    private final UberRideProvider uberRideProvider;
    private final OlaRideProvider olaRideProvider;
    private final AuditLogService auditLogService;

    @Transactional
    public RideCreditEntity issueRideCredit(UserEntity user, OrderEntity order) {
        RideCreditEntity credit = RideCreditEntity.builder()
                .user(user)
                .order(order)
                .amountInr(new BigDecimal("150.00"))
                .balanceInr(new BigDecimal("150.00"))
                .expiresAt(OffsetDateTime.now().plusHours(24))
                .isRedeemed(false)
                .build();
        RideCreditEntity saved = rideCreditRepository.save(credit);
        log.info("Issued ₹150 Safe Ride credit voucher {} for user {}", saved.getId(), user.getId());
        return saved;
    }

    public List<RideEstimateDto> getEstimates(double pickupLat, double pickupLng, double dropLat, double dropLng) {
        List<RideEstimateDto> estimates = new ArrayList<>();

        // Uber estimate
        var uberEst = uberRideProvider.estimateFare(pickupLat, pickupLng, dropLat, dropLng);
        estimates.add(RideEstimateDto.builder()
                .partner("UBER")
                .vehicleType("Uber Go / Premier")
                .estimatedFareInr(uberEst.getEstimatedFareInr())
                .etaMinutes(uberEst.getEtaMinutes())
                .voucherApplicable(true)
                .finalFareInr(uberEst.getEstimatedFareInr().subtract(new BigDecimal("150.00")).max(BigDecimal.ZERO))
                .build());

        // Ola estimate
        var olaEst = olaRideProvider.estimateFare(pickupLat, pickupLng, dropLat, dropLng);
        estimates.add(RideEstimateDto.builder()
                .partner("OLA")
                .vehicleType("Ola Prime Sedan")
                .estimatedFareInr(olaEst.getEstimatedFareInr())
                .etaMinutes(olaEst.getEtaMinutes())
                .voucherApplicable(true)
                .finalFareInr(olaEst.getEstimatedFareInr().subtract(new BigDecimal("150.00")).max(BigDecimal.ZERO))
                .build());

        return estimates;
    }

    @Transactional
    public RideBookingEntity bookRide(
            UUID userId,
            String partner,
            String pickupAddress,
            String dropoffAddress,
            BigDecimal estimatedFareInr
    ) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        // Find available credit
        Optional<RideCreditEntity> creditOpt = rideCreditRepository.findFirstByUserIdAndIsRedeemedFalseOrderByCreatedAtDesc(userId);
        BigDecimal discount = BigDecimal.ZERO;
        RideCreditEntity credit = null;

        if (creditOpt.isPresent()) {
            credit = creditOpt.get();
            discount = credit.getBalanceInr().min(estimatedFareInr);
            credit.setBalanceInr(credit.getBalanceInr().subtract(discount));
            if (credit.getBalanceInr().compareTo(BigDecimal.ZERO) == 0) {
                credit.setIsRedeemed(true);
            }
            rideCreditRepository.save(credit);
        }

        BigDecimal finalFare = estimatedFareInr.subtract(discount).max(BigDecimal.ZERO);

        RideBookingEntity booking = RideBookingEntity.builder()
                .user(user)
                .credit(credit)
                .partner(partner.toUpperCase())
                .partnerBookingRef("RIDE-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .pickupAddress(pickupAddress)
                .dropoffAddress(dropoffAddress)
                .estimatedFareInr(estimatedFareInr)
                .discountAppliedInr(discount)
                .finalFareInr(finalFare)
                .status("BOOKED")
                .deepLinkUrl(partner.equalsIgnoreCase("UBER")
                        ? "https://m.uber.com/ul/?action=setPickup&client_id=boozer_app"
                        : "https://book.olacabs.com/?partner=boozer_app")
                .driverName("Suresh Varma")
                .driverPhone("+91 98490 12890")
                .vehicleNumber("TS09 EQ 4092")
                .driverLat(new BigDecimal("17.4399"))
                .driverLng(new BigDecimal("78.3908"))
                .build();

        RideBookingEntity saved = rideBookingRepository.save(booking);

        auditLogService.logAction(
                userId,
                "CUSTOMER",
                "SAFE_RIDE_BOOKED",
                "RIDE_BOOKING",
                saved.getId().toString(),
                null,
                Map.of("partner", partner, "finalFare", finalFare, "voucherDiscount", discount)
        );

        return saved;
    }

    public List<RideBookingEntity> getUserRides(UUID userId) {
        return rideBookingRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<RideCreditEntity> getUserCredits(UUID userId) {
        return rideCreditRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Data
    @Builder
    public static class RideEstimateDto {
        private String partner;
        private String vehicleType;
        private BigDecimal estimatedFareInr;
        private int etaMinutes;
        private boolean voucherApplicable;
        private BigDecimal finalFareInr;
    }
}
