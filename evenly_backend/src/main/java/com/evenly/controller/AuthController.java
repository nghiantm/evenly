package com.evenly.controller;

import com.evenly.dto.AuthDTO;
import com.evenly.dto.AuthResponseDTO;
import com.evenly.dto.RefreshDTO;
import com.evenly.dto.RefreshResponseDTO;
import com.evenly.entity.UserInfo;
import com.evenly.exception.InvalidCredentialException;
import com.evenly.service.JwtService;
import com.evenly.service.UserInfoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserInfoService service;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @GetMapping("/welcome")
    public String welcome() {
        return "Welcome this endpoint is not secure";
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody UserInfo userInfo) {
        String message = service.register(userInfo);
        return ResponseEntity.ok(message);
    }

    /*
    @GetMapping("/userProfile")
    @PreAuthorize("hasAuthority('ROLE_USER')")
    public String userProfile() {
        return "Welcome to User Profile";
    }

     */

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@RequestBody AuthDTO authRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(authRequest.getEmail(), authRequest.getPassword())
        );

        if (!authentication.isAuthenticated()) {
            throw new InvalidCredentialException("Invalid credential.");
        }

        Map<String, String> tokens = jwtService.generateLoginTokens(authRequest.getEmail());

        AuthResponseDTO loginResponse = new AuthResponseDTO();
        loginResponse.setAccessToken(tokens.get("accessToken"));
        loginResponse.setRefreshToken(tokens.get("refreshToken"));

        return ResponseEntity.ok(loginResponse);
    }

    @PostMapping("/refresh")
    public ResponseEntity<RefreshResponseDTO> refresh(@RequestBody RefreshDTO refreshRequest) {
        RefreshResponseDTO refreshDTO = new RefreshResponseDTO();
        Map<String, String> tokens = jwtService.refreshToken(refreshRequest.getRefreshToken(), refreshRequest.getEmail());
        refreshDTO.setRefreshToken(tokens.get("refreshToken"));
        refreshDTO.setAccessToken(tokens.get("accessToken"));

        return ResponseEntity.ok(refreshDTO);
    }
}
