package com.boozer.orders.controller;

import com.boozer.common.dto.ApiResponse;
import com.boozer.orders.domain.OrderStatus;
import com.boozer.orders.entity.OrderEntity;
import com.boozer.orders.service.OrderService;
import com.boozer.retailer.entity.RetailerEntity;
import com.boozer.retailer.repository.RetailerRepository;
import com.boozer.users.entity.UserEntity;
import com.boozer.users.repository.UserRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;
    private final RetailerRepository retailerRepository;

    private UUID resolveUserId(String headerUserId) {
        if (headerUserId != null && !headerUserId.isBlank()) {
            try {
                return UUID.fromString(headerUserId);
            } catch (Exception ignored) {}
        }
        return userRepository.findAll().stream().findFirst()
                .map(UserEntity::getId)
                .orElse(UUID.fromString("00000000-0000-0000-0000-000000000001"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderEntity>>> getOrders(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId
    ) {
        UUID userId = resolveUserId(headerUserId);
        return ResponseEntity.ok(ApiResponse.success(orderService.getUserOrders(userId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderEntity>> getOrder(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrderById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<OrderEntity>> createOrder(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestBody CreateOrderRequest request
    ) {
        UUID userId = resolveUserId(headerUserId);

        UUID retailerId = request.getRetailerId();
        if (retailerId == null) {
            retailerId = retailerRepository.findAll().stream().findFirst()
                    .map(RetailerEntity::getId)
                    .orElseThrow(() -> new IllegalStateException("No licensed retailer registered."));
        }

        if (request.getDeliveryAddress() == null || request.getDeliveryAddress().trim().isEmpty()) {
            throw new IllegalArgumentException("Delivery address is required to place an order.");
        }

        OrderEntity order = orderService.createOrder(
                userId,
                retailerId,
                request.getItems(),
                request.getDeliveryAddress().trim(),
                request.getDeliveryNotes() != null ? request.getDeliveryNotes() : "Standard doorstep delivery"
        );

        return ResponseEntity.ok(ApiResponse.success("Order placed successfully", order));
    }

    @PatchMapping("/{id}/transition")
    public ResponseEntity<ApiResponse<OrderEntity>> transitionOrder(
            @PathVariable UUID id,
            @RequestBody TransitionRequest request
    ) {
        OrderEntity order = orderService.transitionStatus(
                id,
                request.getTargetStatus(),
                request.isAgeCheckAtDoorVerified(),
                request.getActorId() != null ? request.getActorId() : UUID.randomUUID(),
                request.getActorRole() != null ? request.getActorRole() : "RETAILER_STAFF"
        );
        return ResponseEntity.ok(ApiResponse.success("Order status updated to " + request.getTargetStatus(), order));
    }

    @PostMapping("/{id}/help")
    public ResponseEntity<ApiResponse<OrderService.OrderSupportResult>> requestOrderHelp(
            @PathVariable UUID id,
            @RequestBody HelpRequest request
    ) {
        var supportResult = orderService.handleGetHelp(id, request.getQueryType(), request.getNotes());
        return ResponseEntity.ok(ApiResponse.success("Assistance ticket opened", supportResult));
    }

    @Data
    public static class CreateOrderRequest {
        private UUID retailerId;
        private List<OrderService.OrderItemRequest> items;
        private String deliveryAddress;
        private String deliveryNotes;
    }

    @Data
    public static class TransitionRequest {
        private OrderStatus targetStatus;
        private boolean ageCheckAtDoorVerified;
        private UUID actorId;
        private String actorRole;
    }

    @Data
    public static class HelpRequest {
        private String queryType;
        private String notes;
    }
}
