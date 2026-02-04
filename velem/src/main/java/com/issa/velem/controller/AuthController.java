package com.issa.velem.controller;

import com.issa.velem.entity.User;
import com.issa.velem.service.UserService;
import com.issa.velem.util.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserService userService, JwtUtil jwtUtil, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");
        String firstName = request.get("firstName");
        String lastName = request.get("lastName");

        if (email == null || password == null || firstName == null || lastName == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "All fields are required"));
        }

        try {
            User savedUser = userService.registerUser(email, password, firstName, lastName);
            
            // Generate JWT token immediately after registration
            String token = jwtUtil.generateToken(savedUser.getEmail());
            
            return ResponseEntity.ok(Map.of(
                "message", "User registered successfully",
                "token", token,
                "userId", savedUser.getId().toString(),
                "email", savedUser.getEmail(),
                "firstName", savedUser.getFirstName(),
                "lastName", savedUser.getLastName()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required"));
        }

        Optional<User> userOpt = userService.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid email or password"));
        }

        User user = userOpt.get();
        if (!passwordEncoder.matches(password, user.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid email or password"));
        }

        // Generate JWT
        String token = jwtUtil.generateToken(user.getEmail());

        return ResponseEntity.ok(Map.of(
            "token", token,
            "userId", user.getId().toString(),
            "email", user.getEmail(),
            "firstName", user.getFirstName(),
            "lastName", user.getLastName()
        ));
    }
    
    // Optional: Add a validate endpoint to check if token is still valid
    @PostMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        if (token == null) {
            return ResponseEntity.badRequest().body(Map.of("valid", false));
        }
        
        try {
            String email = jwtUtil.extractEmail(token);
            boolean isValid = jwtUtil.validateToken(token, email);
            return ResponseEntity.ok(Map.of("valid", isValid, "email", email));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("valid", false));
        }
    }
}