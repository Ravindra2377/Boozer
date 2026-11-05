package com.boozer.orders.domain;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class OrderContext {
    private final UUID orderId;
    private final OrderStatus currentStatus;
    private final boolean ageCheckAtDoorVerified;
    private final UUID actorId;
    private final String actorRole;
}
