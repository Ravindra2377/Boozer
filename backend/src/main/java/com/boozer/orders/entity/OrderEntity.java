package com.boozer.orders.entity;

import com.boozer.orders.domain.OrderStatus;
import com.boozer.retailer.entity.RetailerEntity;
import com.boozer.users.entity.UserEntity;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class OrderEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "order_number", nullable = false, unique = true, length = 32)
    private String orderNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "retailer_id", nullable = false)
    private RetailerEntity retailer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    @Builder.Default
    private OrderStatus status = OrderStatus.CREATED;

    @Column(name = "subtotal_inr", nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotalInr;

    @Column(name = "delivery_fee_inr", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal deliveryFeeInr = new BigDecimal("49.00");

    @Column(name = "convenience_fee_inr", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal convenienceFeeInr = new BigDecimal("19.00");

    @Column(name = "tax_inr", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal taxInr = BigDecimal.ZERO;

    @Column(name = "total_inr", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalInr;

    @Column(name = "safe_ride_voucher_eligible", nullable = false)
    @Builder.Default
    private Boolean safeRideVoucherEligible = true;

    @Column(name = "delivery_address", columnDefinition = "TEXT", nullable = false)
    private String deliveryAddress;

    @Column(name = "delivery_notes")
    private String deliveryNotes;

    @Column(name = "placed_at", nullable = false)
    @Builder.Default
    private OffsetDateTime placedAt = OffsetDateTime.now();

    @Column(name = "accepted_at")
    private OffsetDateTime acceptedAt;

    @Column(name = "dispatched_at")
    private OffsetDateTime dispatchedAt;

    @Column(name = "delivered_at")
    private OffsetDateTime deliveredAt;

    @Column(name = "cancelled_at")
    private OffsetDateTime cancelledAt;

    @Column(name = "cancellation_reason")
    private String cancellationReason;

    @Column(name = "age_check_at_door_verified", nullable = false)
    @Builder.Default
    private Boolean ageCheckAtDoorVerified = false;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<OrderItemEntity> items = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
