package com.silvyskitchen.controller;

import com.silvyskitchen.model.AdminUser;
import com.silvyskitchen.repository.AdminUserRepository;
import com.silvyskitchen.service.SessionService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
public class AdminAuthController {

    @Autowired
    private AdminUserRepository adminUserRepository;

    @Autowired
    private SessionService sessionService;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        if (username == null || password == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("status", "error", "message", "Username and password required"));
        }

        Optional<AdminUser> adminOpt = adminUserRepository.findByUsername(username);
        if (adminOpt.isPresent()) {
            AdminUser adminUser = adminOpt.get();
            if (passwordEncoder.matches(password, adminUser.getPassword())) {
                String token = sessionService.createSession(username);
                return ResponseEntity.ok(Map.of(
                        "status", "success",
                        "message", "Login successful",
                        "role", adminUser.getRole(),
                        "username", username,
                        "token", token
                ));
            }
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("status", "error", "message", "Invalid username or password"));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            sessionService.invalidateSession(authHeader.substring(7).trim());
        } else if (authHeader != null && !authHeader.trim().isEmpty()) {
            sessionService.invalidateSession(authHeader.trim());
        }
        return ResponseEntity.ok(Map.of("status", "success", "message", "Logged out successfully"));
    }
}
