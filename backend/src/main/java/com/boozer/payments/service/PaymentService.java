package com.boozer.payments.service;

import com.boozer.audit.service.AuditLogService;
import com.boozer.orders.domain.OrderContext;
import com.boozer.orders.domain.OrderStatus;
import com.boozer.orders.domain.OrderStateMachine;
import com.boozer.orders.entity.OrderEntity;
import com.boozer.orders.repository.OrderRepository;
import com.boozer.payments.entity.PaymentEntity;
import com.boozer.payments.repository.PaymentRepository;
import com.boozer.rides.service.RideService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final OrderStateMachine orderStateMachine;
    private final RideService rideService;
    private final AuditLogService auditLogService;

    @Transactional
    public PaymentEntity createPaymentOrder(UUID orderId) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));

        String razorpayOrderId = "order_" + UUID.randomUUID().toString().replace("-", "").substring(0, 14);

        PaymentEntity payment = PaymentEntity.builder()
                .order(order)
                .user(order.getUser())
                .razorpayOrderId(razorpayOrderId)
                .amountInr(order.getTotalInr())
                .currency("INR")
                .status("PENDING")
                .refundStatus("NONE")
                .build();

        return paymentRepository.save(payment);
    }

    @Transactional
    public PaymentEntity capturePayment(
            String razorpayOrderId,
            String razorpayPaymentId,
            String razorpaySignature
    ) {
        PaymentEntity payment = paymentRepository.findByRazorpayOrderId(razorpayOrderId)
                .orElseThrow(() -> new IllegalArgumentException("Payment record not found for order: " + razorpayOrderId));

        payment.setRazorpayPaymentId(razorpayPaymentId);
        payment.setRazorpaySignature(razorpaySignature);
        payment.setStatus("CAPTURED");
        paymentRepository.save(payment);

        OrderEntity order = payment.getOrder();
        OrderContext context = OrderContext.builder()
                .orderId(order.getId())
                .currentStatus(order.getStatus())
                .ageCheckAtDoorVerified(false)
                .actorId(order.getUser().getId())
                .actorRole("CUSTOMER")
                .build();

        OrderStatus nextStatus = orderStateMachine.transition(context, OrderStatus.PAID);
        order.setStatus(nextStatus);
        orderRepository.save(order);

        // Issue Safe Ride Voucher automatically on payment capture
        if (Boolean.TRUE.equals(order.getSafeRideVoucherEligible())) {
            rideService.issueRideCredit(order.getUser(), order);
        }

        auditLogService.logAction(
                order.getUser().getId(),
                "CUSTOMER",
                "PAYMENT_CAPTURED",
                "PAYMENT",
                payment.getId().toString(),
                Map.of("previousStatus", "PENDING"),
                Map.of("newStatus", "CAPTURED", "paymentId", razorpayPaymentId, "amount", payment.getAmountInr())
        );

        return payment;
    }
}
