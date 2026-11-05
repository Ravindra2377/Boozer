package com.boozer.compliance.excise;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Slf4j
@Service
public class GeofencingService {

    private static final double EARTH_RADIUS_KM = 6371.0;
    public static final double DEFAULT_MAX_DELIVERY_RADIUS_KM = 6.5;

    /**
     * Calculates great-circle distance between two GPS coordinates using the Haversine formula.
     */
    public double calculateDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        double distance = EARTH_RADIUS_KM * c;

        return Math.round(distance * 100.0) / 100.0; // round to 2 decimals
    }

    public double calculateDistanceKm(BigDecimal lat1, BigDecimal lon1, BigDecimal lat2, BigDecimal lon2) {
        if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
            return 0.0;
        }
        return calculateDistanceKm(lat1.doubleValue(), lon1.doubleValue(), lat2.doubleValue(), lon2.doubleValue());
    }

    /**
     * Validates whether a delivery location is within the licensed retailer's excise delivery radius.
     */
    public boolean isWithinLicensedZone(
            BigDecimal storeLat,
            BigDecimal storeLng,
            BigDecimal customerLat,
            BigDecimal customerLng,
            double maxRadiusKm
    ) {
        double distanceKm = calculateDistanceKm(storeLat, storeLng, customerLat, customerLng);
        boolean isPermitted = distanceKm <= maxRadiusKm;

        log.debug("Excise Geofence Evaluation: Distance = {} km, Max Permitted = {} km -> Within Zone = {}",
                distanceKm, maxRadiusKm, isPermitted);

        return isPermitted;
    }
}
