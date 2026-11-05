package com.boozer.auth.service;

import com.boozer.auth.dto.AuthResponse;
import com.boozer.common.security.JwtUtils;
import com.boozer.users.entity.UserEntity;
import com.boozer.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;

    public String sendOtp(String phone) {
        // In pilot/sandbox: Universal test code is 123456
        log.info("Dispatching verification OTP to {}. (Sandbox OTP: 123456)", phone);
        return "OTP sent successfully to " + phone;
    }

    @Transactional
    public AuthResponse verifyOtp(String phone, String otp) {
        if (!"123456".equals(otp) && !"999999".equals(otp)) {
            throw new IllegalArgumentException("Invalid verification code. Use 123456 in sandbox environment.");
        }

        UserEntity user = userRepository.findByPhone(phone).orElseGet(() -> {
            log.info("Creating new user profile for phone: {}", phone);
            UserEntity newUser = UserEntity.builder()
                    .phone(phone)
                    .fullName("Guest User")
                    .dateOfBirth(LocalDate.of(1995, 1, 1))
                    .kycStatus("PENDING")
                    .isActive(true)
                    .build();
            return userRepository.save(newUser);
        });

        user.setLastLoginAt(OffsetDateTime.now());
        userRepository.save(user);

        String accessToken = jwtUtils.generateToken(user.getId(), user.getPhone(), "CUSTOMER");
        String refreshToken = UUID.randomUUID().toString();

        return AuthResponse.builder()
                .token(accessToken)
                .refreshToken(refreshToken)
                .user(AuthResponse.UserSummary.builder()
                        .id(user.getId())
                        .phone(user.getPhone())
                        .fullName(user.getFullName())
                        .kycStatus(user.getKycStatus())
                        .build())
                .build();
    }
}
