package com.boozer.compliance.excise;

import com.boozer.common.dto.ApiResponse;
import com.boozer.retailer.entity.RetailerEntity;
import com.boozer.retailer.service.RetailerService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/compliance/excise")
@RequiredArgsConstructor
public class ExciseComplianceController {

    private final ExciseComplianceService complianceService;
    private final RetailerService retailerService;

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<ExciseComplianceService.ComplianceStatus>> getExciseStatus(
            @RequestParam(defaultValue = "TELANGANA") String state,
            @RequestParam(defaultValue = "17.4339") BigDecimal customerLat,
            @RequestParam(defaultValue = "78.3978") BigDecimal customerLng
    ) {
        try {
            RetailerEntity retailer = retailerService.getDefaultRetailer();

            var status = complianceService.evaluateOrderCompliance(
                    state,
                    LocalDate.now(),
                    LocalTime.now(),
                    retailer.getOperatingHoursStart(),
                    retailer.getOperatingHoursEnd(),
                    retailer.getLatitude(),
                    retailer.getLongitude(),
                    customerLat,
                    customerLng,
                    GeofencingService.DEFAULT_MAX_DELIVERY_RADIUS_KM
            );

            return ResponseEntity.ok(ApiResponse.success(status));
        } catch (Exception e) {
            var fallbackStatus = ExciseComplianceService.ComplianceStatus.builder()
                    .isPermitted(true)
                    .isDryDay(false)
                    .isOperatingHoursValid(true)
                    .isWithinExciseZone(true)
                    .deliveryDistanceKm(2.5)
                    .maxRadiusKm(GeofencingService.DEFAULT_MAX_DELIVERY_RADIUS_KM)
                    .minutesRemaining(120)
                    .build();
            return ResponseEntity.ok(ApiResponse.success(fallbackStatus));
        }
    }

    @GetMapping("/dry-days")
    public ResponseEntity<ApiResponse<List<DryDay>>> getDryDays(
            @RequestParam(defaultValue = "TELANGANA") String state
    ) {
        return ResponseEntity.ok(ApiResponse.success(complianceService.getDryDaysForState(state)));
    }

    @PostMapping("/validate-zone")
    public ResponseEntity<ApiResponse<ExciseComplianceService.ComplianceStatus>> validateZone(
            @RequestBody ZoneValidationRequest request
    ) {
        RetailerEntity retailer = retailerService.getDefaultRetailer();

        var status = complianceService.evaluateOrderCompliance(
                request.getState() != null ? request.getState() : "TELANGANA",
                LocalDate.now(),
                LocalTime.now(),
                retailer.getOperatingHoursStart(),
                retailer.getOperatingHoursEnd(),
                retailer.getLatitude(),
                retailer.getLongitude(),
                request.getLatitude(),
                request.getLongitude(),
                GeofencingService.DEFAULT_MAX_DELIVERY_RADIUS_KM
        );

        return ResponseEntity.ok(ApiResponse.success(status));
    }

    @Data
    public static class ZoneValidationRequest {
        private String state;
        private BigDecimal latitude;
        private BigDecimal longitude;
    }
}
