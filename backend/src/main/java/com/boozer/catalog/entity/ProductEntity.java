package com.boozer.catalog.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 100)
    private String brand;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 32)
    private String category;

    @Column(length = 100)
    private String subcategory;

    @Column(nullable = false, precision = 4, scale = 2)
    private BigDecimal abv;

    @Column(name = "volume_ml", nullable = false)
    private Integer volumeMl;

    @Column(name = "statutory_mrp_inr", nullable = false, precision = 10, scale = 2)
    private BigDecimal statutoryMrpInr;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
