package com.boozer.payments.controller;

import com.boozer.common.dto.ApiResponse;
import com.boozer.payments.entity.PaymentEntity;
import com.boozer.payments.service.PaymentService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-order")
    public ResponseEntity<ApiResponse<PaymentEntity>> createOrder(@RequestParam UUID orderId) {
        PaymentEntity payment = paymentService.createPaymentOrder(orderId);
        return ResponseEntity.ok(ApiResponse.success("Razorpay payment order initialized", payment));
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<PaymentEntity>> verifyPayment(@RequestBody PaymentVerificationRequest request) {
        PaymentEntity payment = paymentService.capturePayment(
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature()
        );
        return ResponseEntity.ok(ApiResponse.success("Payment verified and captured successfully", payment));
    }

    @Data
    public static class PaymentVerificationRequest {
        private String razorpayOrderId;
        private String razorpayPaymentId;
        private String razorpaySignature;
    }
}
