package com.boozer.kyc.service;

import com.boozer.audit.service.AuditLogService;
import com.boozer.kyc.entity.KycRecordEntity;
import com.boozer.kyc.repository.KycRepository;
import com.boozer.users.entity.UserEntity;
import com.boozer.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.Period;
import java.util.HexFormat;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class KycService {

    private final KycRepository kycRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    @Value("${boozer.kyc.min-legal-age:21}")
    private int minLegalAge;

    public KycRecordEntity getLatestKyc(UUID userId) {
        return kycRepository.findFirstByUserIdOrderByCreatedAtDesc(userId)
                .orElse(null);
    }

    @Transactional
    public KycRecordEntity verifyIdentity(
            UUID userId,
            String docType,
            String rawDocNumber,
            LocalDate dateOfBirth
    ) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        int age = Period.between(dateOfBirth, LocalDate.now()).getYears();
        boolean isEligible = age >= minLegalAge;

        // Mask document number (e.g. DL-TS092015XXXX4819)
        String maskedDocNumber = maskDocumentNumber(rawDocNumber);
        String rawHash = computeSha256(rawDocNumber + ":" + dateOfBirth);

        String status = isEligible ? "VERIFIED" : "REJECTED";
        String failureReason = isEligible ? null : "User age (" + age + ") is below legal statutory limit (" + minLegalAge + ")";

        KycRecordEntity kycRecord = KycRecordEntity.builder()
                .user(user)
                .docType(docType)
                .provider("DIGILOCKER")
                .providerRef("DGL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .docNumberMasked(maskedDocNumber)
                .ageVerified(isEligible)
                .dateOfBirth(dateOfBirth)
                .verifiedAt(isEligible ? OffsetDateTime.now() : null)
                .status(status)
                .failureReason(failureReason)
                .rawHash(rawHash)
                .build();

        kycRepository.save(kycRecord);

        user.setKycStatus(status);
        user.setDateOfBirth(dateOfBirth);
        userRepository.save(user);

        auditLogService.logAction(
                userId,
                "CUSTOMER",
                "KYC_VERIFICATION_EVALUATED",
                "KYC_RECORD",
                kycRecord.getId().toString(),
                Map.of("previousKycStatus", user.getKycStatus()),
                Map.of("newKycStatus", status, "age", age, "eligible", isEligible)
        );

        return kycRecord;
    }

    private String maskDocumentNumber(String raw) {
        if (raw == null || raw.length() < 6) return "XXXXXX";
        int len = raw.length();
        return raw.substring(0, 4) + "XXXX" + raw.substring(len - 4);
    }

    private String computeSha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            return "hash_unavailable";
        }
    }
}
