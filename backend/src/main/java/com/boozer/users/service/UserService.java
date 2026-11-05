package com.boozer.users.service;

import com.boozer.users.entity.TrustedContactEntity;
import com.boozer.users.entity.UserEntity;
import com.boozer.users.repository.TrustedContactRepository;
import com.boozer.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final TrustedContactRepository trustedContactRepository;

    public UserEntity getUserById(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
    }

    public List<TrustedContactEntity> getUserContacts(UUID userId) {
        return trustedContactRepository.findByUserId(userId);
    }

    @Transactional
    public TrustedContactEntity addContact(UUID userId, String name, String phone, String relationship, boolean isSosRecipient) {
        UserEntity user = getUserById(userId);
        TrustedContactEntity contact = TrustedContactEntity.builder()
                .user(user)
                .name(name)
                .phone(phone)
                .relationship(relationship)
                .isSosRecipient(isSosRecipient)
                .build();
        return trustedContactRepository.save(contact);
    }

    @Transactional
    public void deleteContact(UUID contactId) {
        trustedContactRepository.deleteById(contactId);
    }
}
