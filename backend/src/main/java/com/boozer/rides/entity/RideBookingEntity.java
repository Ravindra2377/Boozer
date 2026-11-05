package com.boozer.rides.entity;

import com.boozer.users.entity.UserEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "ride_bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RideBookingEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private UserEntity user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "credit_id")
    private RideCreditEntity credit;

    @Column(nullable = false, length = 32)
    private String partner;

    @Column(name = "partner_booking_ref", length = 100)
    private String partnerBookingRef;

    @Column(name = "pickup_address", nullable = false, length = 255)
    private String pickupAddress;

    @Column(name = "dropoff_address", nullable = false, length = 255)
    private String dropoffAddress;

    @Column(name = "estimated_fare_inr", nullable = false, precision = 10, scale = 2)
    private BigDecimal estimatedFareInr;

    @Column(name = "discount_applied_inr", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal discountAppliedInr = new BigDecimal("150.00");

    @Column(name = "final_fare_inr", nullable = false, precision = 10, scale = 2)
    private BigDecimal finalFareInr;

    @Column(nullable = false, length = 32)
    @Builder.Default
    private String status = "BOOKED";

    @Column(name = "deep_link_url", length = 500)
    private String deepLinkUrl;

    @Column(name = "driver_name", length = 100)
    private String driverName;

    @Column(name = "driver_phone", length = 20)
    private String driverPhone;

    @Column(name = "vehicle_number", length = 30)
    private String vehicleNumber;

    @Column(name = "driver_lat", precision = 10, scale = 7)
    private BigDecimal driverLat;

    @Column(name = "driver_lng", precision = 10, scale = 7)
    private BigDecimal driverLng;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
