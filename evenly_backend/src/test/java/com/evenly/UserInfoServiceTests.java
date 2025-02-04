package com.evenly;

import com.evenly.entity.UserInfo;
import com.evenly.exception.InvalidCredentialException;
import com.evenly.repository.UserInfoRepository;
import com.evenly.service.UserInfoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import static org.junit.jupiter.api.Assertions.*;

public class UserInfoServiceTests {

    @InjectMocks
    private UserInfoService userService;

    @Mock
    private UserInfoRepository userInfoRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private UserInfo userInfo;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this); // Initialize mocks

        userInfo = new UserInfo();
        userInfo.setEmail("test@example.com");
        userInfo.setPassword("password123");
    }

    @Test
    public void testRegister_Success() {
        // Arrange
        when(userInfoRepository.existsByEmail(userInfo.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(userInfo.getPassword())).thenReturn("encodedPassword");

        // Act
        userService.register(userInfo);

        // Assert
        verify(userInfoRepository, times(1)).save(userInfo);
        assertEquals("encodedPassword", userInfo.getPassword()); // Ensure the password is encoded
    }

    @Test
    public void testRegister_EmailAlreadyExists() {
        // Arrange
        when(userInfoRepository.existsByEmail(userInfo.getEmail())).thenReturn(true);

        // Act & Assert
        InvalidCredentialException exception = assertThrows(InvalidCredentialException.class, () -> {
            userService.register(userInfo);
        });

        assertEquals("Email already exists.", exception.getMessage());
        verify(userInfoRepository, never()).save(any()); // Verify that save is never called
    }
}
