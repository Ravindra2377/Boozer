package com.boozer.kyc.repository;

import com.boozer.kyc.entity.KycRecordEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface KycRepository extends JpaRepository<KycRecordEntity, UUID> {
    Optional<KycRecordEntity> findFirstByUserIdOrderByCreatedAtDesc(UUID userId);
    List<KycRecordEntity> findByStatus(String status);
}
