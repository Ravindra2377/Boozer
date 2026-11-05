package com.boozer.orders.entity;

import com.boozer.catalog.entity.ProductEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @JsonIgnore
    private OrderEntity order;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false)
    private ProductEntity product;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "unit_mrp_inr", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitMrpInr;

    @Column(name = "total_mrp_inr", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalMrpInr;
}
