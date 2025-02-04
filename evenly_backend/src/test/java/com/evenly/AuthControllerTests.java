package com.evenly;

import com.evenly.controller.AuthController;
import com.evenly.dto.AuthDTO;
import com.evenly.dto.AuthResponseDTO;
import com.evenly.entity.UserInfo;
import com.evenly.exception.InvalidCredentialException;
import com.evenly.service.JwtService;
import com.evenly.service.UserInfoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AuthControllerTests {

    @InjectMocks
    private AuthController authController;

    @Mock
    private UserInfoService userInfoService;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testWelcome() {
        String response = authController.welcome();
        assertEquals("Welcome this endpoint is not secure", response);
    }

    @Test
    void testRegister() {
        UserInfo mockUser = new UserInfo();
        mockUser.setName("John Doe");
        mockUser.setEmail("john.doe@example.com");
        mockUser.setPassword("password123");

        when(userInfoService.register(mockUser)).thenReturn("User registered successfully");

        ResponseEntity<String> response = authController.register(mockUser);

        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
        assertEquals("User registered successfully", response.getBody());
        verify(userInfoService, times(1)).register(mockUser);
    }

    @Test
    void testLogin_Successful() {
        AuthDTO mockAuthRequest = new AuthDTO();
        mockAuthRequest.setEmail("john.doe@example.com");
        mockAuthRequest.setPassword("password123");

        Authentication mockAuthentication = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(mockAuthentication);
        when(mockAuthentication.isAuthenticated()).thenReturn(true);
        when(jwtService.generateToken(mockAuthRequest.getEmail())).thenReturn("mocked-jwt-token");

        ResponseEntity<AuthResponseDTO> response = authController.login(mockAuthRequest);

        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertEquals("mocked-jwt-token", response.getBody().getAccessToken());

        verify(authenticationManager, times(1))
                .authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtService, times(1)).generateToken(mockAuthRequest.getEmail());
    }

    @Test
    void testLogin_InvalidCredential() {
        AuthDTO mockAuthRequest = new AuthDTO();
        mockAuthRequest.setEmail("john.doe@example.com");
        mockAuthRequest.setPassword("wrong-password");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new InvalidCredentialException("Invalid credential."));

        InvalidCredentialException exception = assertThrows(InvalidCredentialException.class, () -> {
            authController.login(mockAuthRequest);
        });

        assertEquals("Invalid credential.", exception.getMessage());
        verify(authenticationManager, times(1))
                .authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtService, never()).generateToken(anyString());
    }
}
