package com.boozer.rides.repository;

import com.boozer.rides.entity.RideCreditEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RideCreditRepository extends JpaRepository<RideCreditEntity, UUID> {
    List<RideCreditEntity> findByUserIdOrderByCreatedAtDesc(UUID userId);
    Optional<RideCreditEntity> findFirstByUserIdAndIsRedeemedFalseOrderByCreatedAtDesc(UUID userId);
}
