package com.boozer.rides.provider;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
public class UberRideProvider implements RideProvider {

    @Override
    public String getPartnerName() {
        return "UBER";
    }

    @Override
    public RideEstimate estimateFare(
            double pickupLat,
            double pickupLng,
            double dropoffLat,
            double dropoffLng,
            BigDecimal creditAmount
    ) {
        // Approximate distance-based fare calculation for pilot MVP
        double distanceKm = calculateHaversineDistance(pickupLat, pickupLng, dropoffLat, dropoffLng);
        BigDecimal baseFare = BigDecimal.valueOf(60.00);
        BigDecimal perKmRate = BigDecimal.valueOf(18.00);
        BigDecimal estimatedTotal = baseFare.add(perKmRate.multiply(BigDecimal.valueOf(distanceKm)));

        BigDecimal creditApplied = creditAmount != null ? creditAmount.min(estimatedTotal) : BigDecimal.ZERO;
        BigDecimal netPayable = estimatedTotal.subtract(creditApplied);

        String deepLink = generateDeepLink(pickupLat, pickupLng, dropoffLat, dropoffLng, "BOOZER_SAFE");

        return new RideEstimate(
                getPartnerName(),
                "Uber Premier / Go",
                estimatedTotal.setScale(2, java.math.RoundingMode.HALF_UP),
                creditApplied.setScale(2, java.math.RoundingMode.HALF_UP),
                netPayable.setScale(2, java.math.RoundingMode.HALF_UP),
                5,
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
                "https://m.uber.com/ul/?action=setPickup&pickup[latitude]=%f&pickup[longitude]=%f&dropoff[latitude]=%f&dropoff[longitude]=%f&product_id=premier",
                pickupLat, pickupLng, dropoffLat, dropoffLng
        );
    }

    @Override
    public boolean supportsDirectBooking() {
        // In week 1-8, fall back to deep links with vouchers; swap in direct API in phase 2
        return false;
    }

    private double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Earth radius in km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.max(1.0, R * c);
    }
}
