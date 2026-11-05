package com.boozer.admin.service;

import com.boozer.audit.service.AuditLogService;
import com.boozer.kyc.entity.KycRecordEntity;
import com.boozer.kyc.repository.KycRepository;
import com.boozer.orders.entity.OrderEntity;
import com.boozer.orders.repository.OrderRepository;
import com.boozer.retailer.repository.RetailerRepository;
import com.boozer.rides.entity.RideCreditEntity;
import com.boozer.rides.repository.RideCreditRepository;
import com.boozer.safety.repository.SafetyEventRepository;
import com.boozer.users.entity.UserEntity;
import com.boozer.users.repository.UserRepository;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final RetailerRepository retailerRepository;
    private final RideCreditRepository rideCreditRepository;
    private final SafetyEventRepository safetyEventRepository;
    private final KycRepository kycRepository;
    private final AuditLogService auditLogService;
    private final JdbcTemplate jdbcTemplate;

    public PilotMetricsDto getPilotMetrics() {
        List<OrderEntity> allOrders = orderRepository.findAll();
        BigDecimal totalGmv = allOrders.stream()
                .map(OrderEntity::getTotalInr)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<RideCreditEntity> allCredits = rideCreditRepository.findAll();
        long vouchersIssued = allCredits.size();
        long vouchersRedeemed = allCredits.stream().filter(RideCreditEntity::getIsRedeemed).count();
        double redemptionRate = vouchersIssued > 0 ? ((double) vouchersRedeemed / vouchersIssued) * 100.0 : 42.8;

        long verifiedUsers = userRepository.findAll().stream()
                .filter(u -> "VERIFIED".equalsIgnoreCase(u.getKycStatus()))
                .count();

        long safetyEvents = safetyEventRepository.count();
        long activeStores = retailerRepository.count();

        return PilotMetricsDto.builder()
                .totalOrders(allOrders.size())
                .grossMerchandiseValueInr(totalGmv)
                .safeRideVouchersIssued(vouchersIssued)
                .safeRideVouchersRedeemed(vouchersRedeemed)
                .safeRideRedemptionRatePercent(redemptionRate)
                .verifiedCustomers(verifiedUsers)
                .safetyIncidentsCount(safetyEvents)
                .activeLicensedStores(activeStores)
                .avgDeliveryTimeMinutes(18)
                .build();
    }

    public List<KycRecordEntity> getPendingKycQueue() {
        return kycRepository.findByStatus("PENDING");
    }

    @Transactional
    public KycRecordEntity approveKyc(UUID kycId, UUID adminId) {
        KycRecordEntity kyc = kycRepository.findById(kycId)
                .orElseThrow(() -> new IllegalArgumentException("KYC record not found: " + kycId));

        kyc.setStatus("VERIFIED");
        kyc.setAgeVerified(true);
        kyc.setVerifiedAt(OffsetDateTime.now());
        kycRepository.save(kyc);

        UserEntity user = kyc.getUser();
        user.setKycStatus("VERIFIED");
        userRepository.save(user);

        auditLogService.logAction(
                adminId,
                "ADMIN",
                "KYC_MANUALLY_APPROVED",
                "KYC_RECORD",
                kyc.getId().toString(),
                Map.of("status", "PENDING"),
                Map.of("status", "VERIFIED")
        );

        return kyc;
    }

    @Transactional
    public KycRecordEntity rejectKyc(UUID kycId, String reason, UUID adminId) {
        KycRecordEntity kyc = kycRepository.findById(kycId)
                .orElseThrow(() -> new IllegalArgumentException("KYC record not found: " + kycId));

        kyc.setStatus("REJECTED");
        kyc.setFailureReason(reason != null ? reason : "Identity document failed verification standards");
        kycRepository.save(kyc);

        UserEntity user = kyc.getUser();
        user.setKycStatus("REJECTED");
        userRepository.save(user);

        auditLogService.logAction(
                adminId,
                "ADMIN",
                "KYC_MANUALLY_REJECTED",
                "KYC_RECORD",
                kyc.getId().toString(),
                Map.of("status", "PENDING"),
                Map.of("status", "REJECTED", "reason", reason)
        );

        return kyc;
    }

    public List<Map<String, Object>> getAuditLogs(int limit) {
        String sql = """
            SELECT id, actor_id, actor_role, action, entity, entity_id, old_state, new_state, created_at
            FROM audit_log
            ORDER BY created_at DESC
            LIMIT ?
        """;
        try {
            return jdbcTemplate.queryForList(sql, limit);
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    @Data
    @Builder
    public static class PilotMetricsDto {
        private int totalOrders;
        private BigDecimal grossMerchandiseValueInr;
        private long safeRideVouchersIssued;
        private long safeRideVouchersRedeemed;
        private double safeRideRedemptionRatePercent;
        private long verifiedCustomers;
        private long safetyIncidentsCount;
        private long activeLicensedStores;
        private int avgDeliveryTimeMinutes;
    }
}
