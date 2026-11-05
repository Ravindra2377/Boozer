package com.boozer.kyc.entity;

import com.boozer.users.entity.UserEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "kyc_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KycRecordEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private UserEntity user;

    @Column(name = "doc_type", nullable = false, length = 50)
    private String docType;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String provider = "DIGILOCKER";

    @Column(name = "provider_ref", length = 255)
    private String providerRef;

    @Column(name = "doc_number_masked", nullable = false, length = 50)
    private String docNumberMasked;

    @Column(name = "age_verified", nullable = false)
    @Builder.Default
    private Boolean ageVerified = false;

    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    @Column(name = "verified_at")
    private OffsetDateTime verifiedAt;

    @Column(nullable = false, length = 32)
    @Builder.Default
    private String status = "PENDING";

    @Column(name = "failure_reason")
    private String failureReason;

    @Column(name = "raw_hash", length = 64)
    private String rawHash;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
