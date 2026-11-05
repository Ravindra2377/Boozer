package com.boozer.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VerifyOtpRequest {
    @NotBlank(message = "Phone number is required")
    private String phone;

    @NotBlank(message = "OTP is required")
    private String otp;
}
