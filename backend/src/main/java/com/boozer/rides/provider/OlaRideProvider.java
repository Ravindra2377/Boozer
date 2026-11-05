package com.boozer.rides.provider;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class OlaRideProvider implements RideProvider {

    @Override
    public String getPartnerName() {
        return "OLA";
    }

    @Override
    public RideEstimate estimateFare(
            double pickupLat,
            double pickupLng,
            double dropoffLat,
            double dropoffLng,
            BigDecimal creditAmount
    ) {
        double distanceKm = Math.max(1.0, Math.sqrt(Math.pow(dropoffLat - pickupLat, 2) + Math.pow(dropoffLng - pickupLng, 2)) * 111);
        BigDecimal estimatedTotal = BigDecimal.valueOf(50.00).add(BigDecimal.valueOf(16.50 * distanceKm));
        BigDecimal creditApplied = creditAmount != null ? creditAmount.min(estimatedTotal) : BigDecimal.ZERO;
        BigDecimal netPayable = estimatedTotal.subtract(creditApplied);

        String deepLink = generateDeepLink(pickupLat, pickupLng, dropoffLat, dropoffLng, "BOOZER_SAFE");

        return new RideEstimate(
                getPartnerName(),
                "Ola Prime / Mini",
                estimatedTotal.setScale(2, java.math.RoundingMode.HALF_UP),
                creditApplied.setScale(2, java.math.RoundingMode.HALF_UP),
                netPayable.setScale(2, java.math.RoundingMode.HALF_UP),
                7,
                deepLink
        );
    }

    @Override
    public String generateDeepLink(
            double pickupLat,
            double pickupLng,
            double dropoffLat,
            double dropoffLng,
            String promoCode
    ) {
        return String.format(
                "ola://ride?lat=%f&lng=%f&drop_lat=%f&drop_lng=%f",
                pickupLat, pickupLng, dropoffLat, dropoffLng
        );
    }

    @Override
    public boolean supportsDirectBooking() {
        return false;
    }
}
