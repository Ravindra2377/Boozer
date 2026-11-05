package com.boozer.admin.controller;

import com.boozer.admin.service.AdminService;
import com.boozer.common.dto.ApiResponse;
import com.boozer.kyc.entity.KycRecordEntity;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/metrics")
    public ResponseEntity<ApiResponse<AdminService.PilotMetricsDto>> getMetrics() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getPilotMetrics()));
    }

    @GetMapping("/kyc-queue")
    public ResponseEntity<ApiResponse<List<KycRecordEntity>>> getPendingKycQueue() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getPendingKycQueue()));
    }

    @PatchMapping("/kyc/{id}/approve")
    public ResponseEntity<ApiResponse<KycRecordEntity>> approveKyc(
            @PathVariable UUID id,
            @RequestHeader(value = "X-Admin-Id", required = false) String adminId
    ) {
        UUID actor = adminId != null ? UUID.fromString(adminId) : UUID.randomUUID();
        return ResponseEntity.ok(ApiResponse.success("KYC approved", adminService.approveKyc(id, actor)));
    }

    @PatchMapping("/kyc/{id}/reject")
    public ResponseEntity<ApiResponse<KycRecordEntity>> rejectKyc(
            @PathVariable UUID id,
            @RequestBody(required = false) RejectRequest request,
            @RequestHeader(value = "X-Admin-Id", required = false) String adminId
    ) {
        UUID actor = adminId != null ? UUID.fromString(adminId) : UUID.randomUUID();
        String reason = request != null ? request.getReason() : "Document verification failed";
        return ResponseEntity.ok(ApiResponse.success("KYC rejected", adminService.rejectKyc(id, reason, actor)));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAuditLogs(
            @RequestParam(defaultValue = "50") int limit
    ) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAuditLogs(limit)));
    }

    @Data
    public static class RejectRequest {
        private String reason;
    }
}
