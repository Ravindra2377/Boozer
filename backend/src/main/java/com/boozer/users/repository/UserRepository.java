package com.boozer.users.repository;

import com.boozer.users.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, UUID> {
    Optional<UserEntity> findByPhone(String phone);
    Optional<UserEntity> findByEmail(String email);
    boolean existsByPhone(String phone);
}
