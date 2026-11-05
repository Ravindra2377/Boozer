package com.boozer.orders.repository;

import com.boozer.orders.domain.OrderStatus;
import com.boozer.orders.entity.OrderEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<OrderEntity, UUID> {
    Optional<OrderEntity> findByOrderNumber(String orderNumber);
    List<OrderEntity> findByUserIdOrderByCreatedAtDesc(UUID userId);
    List<OrderEntity> findByRetailerIdOrderByCreatedAtDesc(UUID retailerId);
    List<OrderEntity> findByStatus(OrderStatus status);
}
