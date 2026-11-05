package com.boozer.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class RequestOtpRequest {
    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^\\+?[0-9]{10,14}$", message = "Phone must be a valid phone number")
    private String phone;
}
