package com.boozer.users.controller;

import com.boozer.common.dto.ApiResponse;
import com.boozer.users.entity.TrustedContactEntity;
import com.boozer.users.entity.UserEntity;
import com.boozer.users.repository.UserRepository;
import com.boozer.users.service.UserService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    private UUID resolveUserId(String headerUserId) {
        if (headerUserId != null && !headerUserId.isBlank()) {
            try {
                return UUID.fromString(headerUserId);
            } catch (Exception ignored) {}
        }
        // Fallback to first user in system
        return userRepository.findAll().stream().findFirst()
                .map(UserEntity::getId)
                .orElse(UUID.fromString("00000000-0000-0000-0000-000000000001"));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserEntity>> getProfile(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId
    ) {
        UUID userId = resolveUserId(headerUserId);
        return ResponseEntity.ok(ApiResponse.success(userService.getUserById(userId)));
    }

    @GetMapping("/contacts")
    public ResponseEntity<ApiResponse<List<TrustedContactEntity>>> getContacts(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId
    ) {
        UUID userId = resolveUserId(headerUserId);
        return ResponseEntity.ok(ApiResponse.success(userService.getUserContacts(userId)));
    }

    @PostMapping("/contacts")
    public ResponseEntity<ApiResponse<TrustedContactEntity>> addContact(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestBody ContactRequest request
    ) {
        UUID userId = resolveUserId(headerUserId);
        TrustedContactEntity contact = userService.addContact(
                userId,
                request.getName(),
                request.getPhone(),
                request.getRelationship(),
                request.isSosRecipient()
        );
        return ResponseEntity.ok(ApiResponse.success("Trusted contact added", contact));
    }

    @DeleteMapping("/contacts/{id}")
    public ResponseEntity<ApiResponse<String>> deleteContact(@PathVariable UUID id) {
        userService.deleteContact(id);
        return ResponseEntity.ok(ApiResponse.success("Contact deleted", "OK"));
    }

    @Data
    public static class ContactRequest {
        private String name;
        private String phone;
        private String relationship;
        private boolean sosRecipient = true;
    }
}
