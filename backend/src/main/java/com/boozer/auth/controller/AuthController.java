package com.boozer.auth.controller;

import com.boozer.auth.dto.AuthResponse;
import com.boozer.auth.dto.RequestOtpRequest;
import com.boozer.auth.dto.VerifyOtpRequest;
import com.boozer.auth.service.AuthService;
import com.boozer.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/request-otp")
    public ResponseEntity<ApiResponse<String>> requestOtp(@Valid @RequestBody RequestOtpRequest request) {
        String msg = authService.sendOtp(request.getPhone());
        return ResponseEntity.ok(ApiResponse.success(msg, msg));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        AuthResponse response = authService.verifyOtp(request.getPhone(), request.getOtp());
        return ResponseEntity.ok(ApiResponse.success("OTP verified successfully", response));
    }
}
