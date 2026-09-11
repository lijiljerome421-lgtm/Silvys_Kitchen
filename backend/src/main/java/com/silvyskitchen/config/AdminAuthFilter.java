package com.silvyskitchen.config;

import com.silvyskitchen.service.SessionService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class AdminAuthFilter extends OncePerRequestFilter {

    @Autowired
    private SessionService sessionService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Always allow CORS OPTIONS preflight requests to pass through
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String path = request.getRequestURI();
        String method = request.getMethod();

        // Check if request requires admin authentication
        if (isProtectedEndpoint(path, method)) {
            String authHeader = request.getHeader("Authorization");
            String token = null;
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7).trim();
            } else if (authHeader != null && !authHeader.trim().isEmpty()) {
                token = authHeader.trim();
            } else {
                token = request.getHeader("X-Admin-Token");
            }

            if (!sessionService.isValidToken(token)) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"status\":\"error\",\"message\":\"Unauthorized: Missing or invalid authentication token\"}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean isProtectedEndpoint(String path, String method) {
        // Admin all products list
        if (path.equals("/api/products/admin/all")) {
            return true;
        }

        // Admin review endpoints
        if (path.startsWith("/api/admin/reviews")) {
            return true;
        }

        // Product modification operations (POST, PUT, PATCH, DELETE)
        if (path.startsWith("/api/products")) {
            // GET requests for public catalog, single product, and image viewing do not require auth
            if ("GET".equalsIgnoreCase(method)) {
                return false;
            }
            // All POST, PUT, PATCH, DELETE operations on /api/products require authentication
            return true;
        }

        return false;
    }
}
