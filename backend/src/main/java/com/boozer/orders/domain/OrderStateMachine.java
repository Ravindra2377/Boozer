package com.boozer.orders.domain;

import com.boozer.audit.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalTime;
import java.util.*;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderStateMachine {

    private final AuditLogService auditLogService;

    // Transition graph for strict state validation
    private static final Map<OrderStatus, Set<OrderStatus>> VALID_TRANSITIONS = new EnumMap<>(OrderStatus.class);

    static {
        VALID_TRANSITIONS.put(OrderStatus.CREATED, EnumSet.of(OrderStatus.PAID, OrderStatus.CANCELLED));
        VALID_TRANSITIONS.put(OrderStatus.PAID, EnumSet.of(OrderStatus.ACCEPTED, OrderStatus.REFUNDED, OrderStatus.CANCELLED));
        VALID_TRANSITIONS.put(OrderStatus.ACCEPTED, EnumSet.of(OrderStatus.PACKED, OrderStatus.CANCELLED, OrderStatus.REFUNDED));
        VALID_TRANSITIONS.put(OrderStatus.PACKED, EnumSet.of(OrderStatus.DISPATCHED, OrderStatus.CANCELLED, OrderStatus.REFUNDED));
        VALID_TRANSITIONS.put(OrderStatus.DISPATCHED, EnumSet.of(OrderStatus.ARRIVED, OrderStatus.CANCELLED));
        VALID_TRANSITIONS.put(OrderStatus.ARRIVED, EnumSet.of(OrderStatus.AGE_CHECKED, OrderStatus.CANCELLED));
        VALID_TRANSITIONS.put(OrderStatus.AGE_CHECKED, EnumSet.of(OrderStatus.DELIVERED));
        VALID_TRANSITIONS.put(OrderStatus.CANCELLED, EnumSet.of(OrderStatus.REFUNDED));
        VALID_TRANSITIONS.put(OrderStatus.DELIVERED, Collections.emptySet());
        VALID_TRANSITIONS.put(OrderStatus.REFUNDED, Collections.emptySet());
    }

    /**
     * Enforces transition validation and hard legal compliance rules.
     */
    public OrderStatus transition(OrderContext context, OrderStatus targetStatus) {
        OrderStatus currentStatus = context.getCurrentStatus();

        Set<OrderStatus> allowed = VALID_TRANSITIONS.getOrDefault(currentStatus, Collections.emptySet());
        if (!allowed.contains(targetStatus)) {
            throw new IllegalStateException(String.format(
                "Invalid order transition: Cannot transition order %s from %s to %s",
                context.getOrderId(), currentStatus, targetStatus
            ));
        }

        // HARD RULE 1: Age verification at the door required before DELIVERED
        if (targetStatus == OrderStatus.DELIVERED) {
            if (!context.isAgeCheckAtDoorVerified()) {
                throw new IllegalStateException(
                    "Compliance violation: Order cannot be marked DELIVERED until doorstep age check is verified."
                );
            }
        }

        log.info("Order {} transitioned from {} to {}", context.getOrderId(), currentStatus, targetStatus);

        // Immutable audit trail recording
        auditLogService.logAction(
            context.getActorId(),
            context.getActorRole(),
            "ORDER_STATUS_CHANGED",
            "ORDER",
            context.getOrderId().toString(),
            Map.of("previousStatus", currentStatus.name()),
            Map.of("newStatus", targetStatus.name())
        );

        return targetStatus;
    }

    /**
     * Hard rule: Pre-creation compliance check enforcing KYC, statutory Dry Days, operating hours, and geofencing.
     */
    public void validateOrderCreation(
            boolean isUserKycVerified,
            boolean isDryDay,
            String dryDayReason,
            LocalTime retailerStartHours,
            LocalTime retailerEndHours,
            LocalTime orderTime,
            boolean isWithinDeliveryRadius
    ) {
        if (!isUserKycVerified) {
            throw new IllegalStateException("Compliance violation: KYC age verification required before placing an alcohol order.");
        }

        if (isDryDay) {
            throw new IllegalStateException("Statutory Excise Prohibition: Sale and delivery of alcohol is strictly prohibited today (" 
                    + (dryDayReason != null ? dryDayReason : "Statutory Dry Day") + ") under the State Excise Act.");
        }

        if (orderTime.isBefore(retailerStartHours) || orderTime.isAfter(retailerEndHours)) {
            throw new IllegalStateException("Compliance violation: Order placed outside licensed retailer excise operating hours.");
        }

        if (!isWithinDeliveryRadius) {
            throw new IllegalStateException("Compliance violation: Delivery address is outside the retailer's licensed 6.5km excise zone perimeter.");
        }
    }
}
