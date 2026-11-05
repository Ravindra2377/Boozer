package com.boozer.deliveries.entity;

import com.boozer.orders.entity.OrderEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "deliveries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "order_id", nullable = false)
    @JsonIgnore
    private OrderEntity order;

    @Column(name = "rider_name", nullable = false, length = 100)
    private String riderName;

    @Column(name = "rider_phone", nullable = false, length = 20)
    private String riderPhone;

    @Column(name = "rider_lat", precision = 10, scale = 7)
    private BigDecimal riderLat;

    @Column(name = "rider_lng", precision = 10, scale = 7)
    private BigDecimal riderLng;

    @Column(nullable = false, length = 32)
    @Builder.Default
    private String status = "IN_TRANSIT";

    @Column(name = "doorstep_otp", length = 6)
    @Builder.Default
    private String doorstepOtp = "4819";

    @Column(name = "assigned_at", nullable = false)
    @Builder.Default
    private OffsetDateTime assignedAt = OffsetDateTime.now();

    @Column(name = "picked_up_at")
    private OffsetDateTime pickedUpAt;

    @Column(name = "delivered_at")
    private OffsetDateTime deliveredAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
