package com.boozer.retailer.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "retailers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RetailerEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "license_number", nullable = false, unique = true, length = 100)
    private String licenseNumber;

    @Column(name = "trade_name", nullable = false, length = 150)
    private String tradeName;

    @Column(name = "legal_entity_name", nullable = false, length = 200)
    private String legalEntityName;

    @Column(name = "license_status", nullable = false, length = 32)
    @Builder.Default
    private String licenseStatus = "ACTIVE";

    @Column(name = "license_expiry_date", nullable = false)
    private LocalDate licenseExpiryDate;

    @Column(name = "address_line1", nullable = false, length = 255)
    private String addressLine1;

    @Column(name = "address_line2", length = 255)
    private String addressLine2;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(nullable = false, length = 50)
    private String state;

    @Column(name = "postal_code", nullable = false, length = 10)
    private String postalCode;

    @Column(nullable = false, precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(nullable = false, precision = 10, scale = 7)
    private BigDecimal longitude;

    @Column(name = "excise_zone", nullable = false, length = 50)
    private String exciseZone;

    @Column(name = "operating_hours_start", nullable = false)
    private LocalTime operatingHoursStart;

    @Column(name = "operating_hours_end", nullable = false)
    private LocalTime operatingHoursEnd;

    @Column(name = "is_accepting_orders", nullable = false)
    @Builder.Default
    private Boolean isAcceptingOrders = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
