package com.boozer.users.repository;

import com.boozer.users.entity.TrustedContactEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TrustedContactRepository extends JpaRepository<TrustedContactEntity, UUID> {
    List<TrustedContactEntity> findByUserId(UUID userId);
    List<TrustedContactEntity> findByUserIdAndIsSosRecipientTrue(UUID userId);
}
