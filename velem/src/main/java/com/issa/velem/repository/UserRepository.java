package com.issa.velem.repository;

import com.issa.velem.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    // Find user by email (very important for login & registration)
    Optional<User> findByEmail(String email);

    // Check if email already exists (for registration validation)
    boolean existsByEmail(String email);
}
