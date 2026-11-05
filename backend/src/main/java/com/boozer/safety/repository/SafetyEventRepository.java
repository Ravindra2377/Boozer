package com.boozer.safety.repository;

import com.boozer.safety.entity.SafetyEventEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SafetyEventRepository extends JpaRepository<SafetyEventEntity, UUID> {
    List<SafetyEventEntity> findByUserIdOrderByCreatedAtDesc(UUID userId);
    List<SafetyEventEntity> findByStatus(String status);
}
