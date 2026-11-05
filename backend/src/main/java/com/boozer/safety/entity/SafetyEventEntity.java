package com.boozer.safety.entity;

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
@Table(name = "safety_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SafetyEventEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private UserEntity user;

    @Column(name = "event_type", nullable = false, length = 32)
    @Builder.Default
    private String eventType = "SOS_TRIGGERED";

    @Column(nullable = false, length = 32)
    @Builder.Default
    private String status = "CONTACTS_NOTIFIED";

    @Column(precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(precision = 10, scale = 7)
    private BigDecimal longitude;

    @Column(name = "accuracy_meters", precision = 6, scale = 2)
    private BigDecimal accuracyMeters;

    @Column(name = "battery_level")
    private Integer batteryLevel;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "contacts_notified_count", nullable = false)
    @Builder.Default
    private Integer contactsNotifiedCount = 0;

    @Column(name = "resolved_at")
    private OffsetDateTime resolvedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
