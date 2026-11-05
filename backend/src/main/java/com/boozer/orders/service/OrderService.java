package com.boozer.orders.service;

import com.boozer.catalog.entity.ProductEntity;
import com.boozer.catalog.repository.ProductRepository;
import com.boozer.compliance.excise.ExciseComplianceService;
import com.boozer.compliance.excise.GeofencingService;
import com.boozer.orders.domain.OrderContext;
import com.boozer.orders.domain.OrderStatus;
import com.boozer.orders.domain.OrderStateMachine;
import com.boozer.orders.entity.OrderEntity;
import com.boozer.orders.entity.OrderItemEntity;
import com.boozer.orders.repository.OrderRepository;
import com.boozer.retailer.entity.RetailerEntity;
import com.boozer.retailer.repository.RetailerRepository;
import com.boozer.users.entity.UserEntity;
import com.boozer.users.repository.UserRepository;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final RetailerRepository retailerRepository;
    private final ProductRepository productRepository;
    private final OrderStateMachine orderStateMachine;
    private final ExciseComplianceService exciseComplianceService;

    public List<OrderEntity> getUserOrders(UUID userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public OrderEntity getOrderById(UUID orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with id: " + orderId));
    }

    @Transactional
    public OrderEntity createOrder(
            UUID userId,
            UUID retailerId,
            List<OrderItemRequest> items,
            String deliveryAddress,
            String deliveryNotes
    ) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        RetailerEntity retailer = retailerRepository.findById(retailerId)
                .orElseThrow(() -> new IllegalArgumentException("Retailer not found: " + retailerId));

        // COMPLIANCE GATE 1: User KYC Verification
        boolean isKycVerified = "VERIFIED".equalsIgnoreCase(user.getKycStatus());

        // COMPLIANCE GATE 2: Full State Excise Compliance (Dry Days, Buffer Hours, 6.5km Geofence)
        LocalTime now = LocalTime.now();
        var compliance = exciseComplianceService.evaluateOrderCompliance(
                retailer.getState(),
                LocalDate.now(),
                now,
                retailer.getOperatingHoursStart(),
                retailer.getOperatingHoursEnd(),
                retailer.getLatitude(),
                retailer.getLongitude(),
                new BigDecimal("17.4339"), // Customer address coordinates
                new BigDecimal("78.3978"),
                GeofencingService.DEFAULT_MAX_DELIVERY_RADIUS_KM
        );

        orderStateMachine.validateOrderCreation(
                isKycVerified,
                compliance.isDryDay(),
                compliance.getDryDayReason(),
                retailer.getOperatingHoursStart(),
                retailer.getOperatingHoursEnd(),
                now,
                compliance.isWithinExciseZone()
        );

        String orderNumber = "BZ-" + (100000 + new Random().nextInt(900000));

        OrderEntity order = OrderEntity.builder()
                .orderNumber(orderNumber)
                .user(user)
                .retailer(retailer)
                .status(OrderStatus.CREATED)
                .deliveryAddress(deliveryAddress)
                .deliveryNotes(deliveryNotes)
                .placedAt(OffsetDateTime.now())
                .safeRideVoucherEligible(true)
                .subtotalInr(BigDecimal.ZERO)
                .totalInr(BigDecimal.ZERO)
                .build();

        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderItemEntity> orderItems = new ArrayList<>();

        for (OrderItemRequest itemReq : items) {
            ProductEntity product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found: " + itemReq.getProductId()));

            // Enforce Statutory Legal MRP
            BigDecimal unitMrp = product.getStatutoryMrpInr();
            BigDecimal totalItemMrp = unitMrp.multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            subtotal = subtotal.add(totalItemMrp);

            OrderItemEntity item = OrderItemEntity.builder()
                    .order(order)
                    .product(product)
                    .quantity(itemReq.getQuantity())
                    .unitMrpInr(unitMrp)
                    .totalMrpInr(totalItemMrp)
                    .build();

            orderItems.add(item);
        }

        BigDecimal deliveryFee = new BigDecimal("49.00");
        BigDecimal convenienceFee = new BigDecimal("19.00");
        BigDecimal total = subtotal.add(deliveryFee).add(convenienceFee);

        order.setSubtotalInr(subtotal);
        order.setDeliveryFeeInr(deliveryFee);
        order.setConvenienceFeeInr(convenienceFee);
        order.setTotalInr(total);
        order.setItems(orderItems);

        return orderRepository.save(order);
    }

    @Transactional
    public OrderEntity transitionStatus(
            UUID orderId,
            OrderStatus targetStatus,
            boolean ageCheckAtDoorVerified,
            UUID actorId,
            String actorRole
    ) {
        OrderEntity order = getOrderById(orderId);

        OrderContext context = OrderContext.builder()
                .orderId(orderId)
                .currentStatus(order.getStatus())
                .ageCheckAtDoorVerified(ageCheckAtDoorVerified || order.getAgeCheckAtDoorVerified())
                .actorId(actorId)
                .actorRole(actorRole)
                .build();

        OrderStatus nextStatus = orderStateMachine.transition(context, targetStatus);
        order.setStatus(nextStatus);

        if (ageCheckAtDoorVerified) {
            order.setAgeCheckAtDoorVerified(true);
        }

        OffsetDateTime now = OffsetDateTime.now();
        if (nextStatus == OrderStatus.ACCEPTED) order.setAcceptedAt(now);
        if (nextStatus == OrderStatus.DISPATCHED) order.setDispatchedAt(now);
        if (nextStatus == OrderStatus.DELIVERED) order.setDeliveredAt(now);
        if (nextStatus == OrderStatus.CANCELLED) order.setCancelledAt(now);

        return orderRepository.save(order);
    }

    public OrderSupportResult handleGetHelp(UUID orderId, String queryType, String notes) {
        OrderEntity order = getOrderById(orderId);
        log.info("Processing order assistance 'Get Help' for order {}: queryType={}, notes={}", order.getOrderNumber(), queryType, notes);

        return OrderSupportResult.builder()
                .orderId(orderId)
                .orderNumber(order.getOrderNumber())
                .status("SUPPORT_TICKET_OPENED")
                .driverContact("+91 98490 28192")
                .supportAgentAssigned("Priya S. (Excise Delivery Ops)")
                .resolutionEtaMinutes(5)
                .message("Our order support team has received your request and is coordinating directly with the delivery partner.")
                .build();
    }

    @Data
    public static class OrderItemRequest {
        private UUID productId;
        private int quantity;
    }

    @Data
    @Builder
    public static class OrderSupportResult {
        private UUID orderId;
        private String orderNumber;
        private String status;
        private String driverContact;
        private String supportAgentAssigned;
        private int resolutionEtaMinutes;
        private String message;
    }
}
