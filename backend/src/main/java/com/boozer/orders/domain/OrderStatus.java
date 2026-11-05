package com.boozer.orders.domain;

/**
 * Boozer Order Lifecycle States.
 * Standard path: CREATED -> PAID -> ACCEPTED -> PACKED -> DISPATCHED -> ARRIVED -> AGE_CHECKED -> DELIVERED.
 * Intermediate exits: CANCELLED, REFUNDED.
 */
public enum OrderStatus {
    CREATED,
    PAID,
    ACCEPTED,
    PACKED,
    DISPATCHED,
    ARRIVED,
    AGE_CHECKED,
    DELIVERED,
    CANCELLED,
    REFUNDED
}
