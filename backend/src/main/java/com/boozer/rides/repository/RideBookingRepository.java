package com.boozer.rides.repository;

import com.boozer.rides.entity.RideBookingEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RideBookingRepository extends JpaRepository<RideBookingEntity, UUID> {
    List<RideBookingEntity> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
