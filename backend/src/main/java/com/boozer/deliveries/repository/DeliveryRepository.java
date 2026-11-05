package com.boozer.deliveries.repository;

import com.boozer.deliveries.entity.DeliveryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface DeliveryRepository extends JpaRepository<DeliveryEntity, UUID> {
    Optional<DeliveryEntity> findByOrderId(UUID orderId);
}
