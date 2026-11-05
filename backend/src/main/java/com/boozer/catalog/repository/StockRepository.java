package com.boozer.catalog.repository;

import com.boozer.catalog.entity.StockEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StockRepository extends JpaRepository<StockEntity, UUID> {
    List<StockEntity> findByRetailerIdAndIsInStockTrue(UUID retailerId);
    Optional<StockEntity> findByRetailerIdAndProductId(UUID retailerId, UUID productId);
}
