package com.evenly.service;

import com.evenly.entity.RefreshToken;
import com.evenly.exception.InvalidCredentialException;
import com.evenly.repository.RefreshTokenRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;

@Component
public class JwtService {

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Value("${JWT_KEY}")
    private String SECRET;

    // Generate token with given user name
    public String generateToken(String userName) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, userName);
    }

    private String generateRefreshToken(String userName) {
        Map<String, Object> claims = new HashMap<>();
        return createRefreshToken(claims, userName);
    }

    // Create a JWT token with specified claims and subject (user name)
    private String createToken(Map<String, Object> claims, String userName) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(userName)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 30)) // Token valid for 30 minutes
                .signWith(getSignKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    private String createRefreshToken(Map<String, Object> claims, String userName) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(userName)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24 * 7)) // Token valid for 7 days
                .signWith(getSignKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // Get the signing key for JWT token
    private Key getSignKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // Extract the username from the token
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // Extract the expiration date from the token
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    // Extract a claim from the token
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    // Extract all claims from the token
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // Check if the token is expired
    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    // Validate the token against user details and expiration
    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    public Map<String, String> refreshToken(String token, String email) {
        if (!extractUsername(token).equals(email) || isTokenExpired(token)) {
            throw new InvalidCredentialException("Invalid refresh token.");
        }

        String refreshToken = generateRefreshToken(email);
        String accessToken = generateToken(email);

        upsertRefreshToken(email, refreshToken);

        return Map.of("accessToken", accessToken, "refreshToken", refreshToken);
    }

    public Map<String, String> generateLoginTokens(String email) {
        String accessToken = generateToken(email);
        String refreshToken = generateRefreshToken(email);

        upsertRefreshToken(email, refreshToken);

        return Map.of("accessToken", accessToken, "refreshToken", refreshToken);
    }

    private void upsertRefreshToken(String email, String refreshToken) {
        Optional<RefreshToken> dbRecord = refreshTokenRepository.getRefreshTokenByEmail(email);
        if (dbRecord.isEmpty()) {
            RefreshToken record = new RefreshToken();
            record.setEmail(email);
            record.setRefreshToken(refreshToken);
            refreshTokenRepository.save(record);
        } else {
            dbRecord.get().setRefreshToken(refreshToken);
            refreshTokenRepository.save(dbRecord.get());
        }
    }
}
