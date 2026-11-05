package com.boozer.rides.entity;

import com.boozer.orders.entity.OrderEntity;
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
@Table(name = "ride_credits")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RideCreditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private UserEntity user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    @JsonIgnore
    private OrderEntity order;

    @Column(name = "amount_inr", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal amountInr = new BigDecimal("150.00");

    @Column(name = "balance_inr", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal balanceInr = new BigDecimal("150.00");

    @Column(name = "expires_at", nullable = false)
    private OffsetDateTime expiresAt;

    @Column(name = "is_redeemed", nullable = false)
    @Builder.Default
    private Boolean isRedeemed = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
