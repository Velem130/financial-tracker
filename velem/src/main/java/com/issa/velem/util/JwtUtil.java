package com.issa.velem.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.function.Function;

@Component
public class JwtUtil {

    // SIMPLE 32-CHARACTER SECRET
    private final String secret = "MyFinanceTrackerSecretKey2025XYZ";
    
    // 24 HOUR EXPIRATION
    private final Long expiration = 86400000L;

    public JwtUtil() {
        // Debug output
        System.out.println("=== JWT UTIL DEBUG ===");
        System.out.println("Secret: " + secret);
        System.out.println("Length: " + secret.length());
        System.out.println("=== END DEBUG ===");
    }

    // Generate signing key from secret
    private Key getSigningKey() {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        System.out.println("Bytes: " + keyBytes.length + ", Bits: " + (keyBytes.length * 8));
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // Extract email (subject) from token
    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // Extract expiration date
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    // Generic method to extract any claim
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claimsResolver.apply(claims);
    }

    // Generate JWT token
    public String generateToken(String email) {
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey())
                .compact();
    }

    // Validate token
    public boolean validateToken(String token, String email) {
        final String extractedEmail = extractEmail(token);
        return extractedEmail.equals(email) && !extractExpiration(token).before(new Date());
    }
}
