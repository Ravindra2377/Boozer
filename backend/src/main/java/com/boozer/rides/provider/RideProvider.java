package com.boozer.rides.provider;

import java.math.BigDecimal;

public interface RideProvider {

    String getPartnerName();

    RideEstimate estimateFare(
            double pickupLat,
            double pickupLng,
            double dropoffLat,
            double dropoffLng,
            BigDecimal creditAmount
    );

    String generateDeepLink(
            double pickupLat,
            double pickupLng,
            double dropoffLat,
            double dropoffLng,
            String promoCode
    );

    boolean supportsDirectBooking();

    record RideEstimate(
            String partnerName,
            String vehicleType,
            BigDecimal estimatedTotalFare,
            BigDecimal creditDiscountApplied,
            BigDecimal netPayableFare,
            int etaMinutes,
            String deepLinkUrl
    ) {}
}
