package com.financetrack;

import com.financetrack.dto.request.LoginRequest;
import com.financetrack.dto.request.RegisterRequest;
import com.financetrack.dto.response.AuthResponse;
import com.financetrack.dto.response.UserResponse;
import com.financetrack.entity.User;
import com.financetrack.exception.BadRequestException;
import com.financetrack.repository.UserRepository;
import com.financetrack.security.JwtUtils;
import com.financetrack.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AuthServiceTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void testRegisterSuccess() {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("Test User");
        request.setEmail("test@example.com");
        request.setPassword("Test@1234");
        request.setConfirmPassword("Test@1234");

        UserResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("Test User", response.getFullName());
        assertEquals("test@example.com", response.getEmail());
        assertEquals("USER", response.getRole());
    }

    @Test
    void testRegisterPasswordMismatch() {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("Test User");
        request.setEmail("test2@example.com");
        request.setPassword("Test@1234");
        request.setConfirmPassword("WrongPassword");

        assertThrows(BadRequestException.class, () -> authService.register(request));
    }

    @Test
    void testRegisterDuplicateEmail() {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("Test User");
        request.setEmail("dup@example.com");
        request.setPassword("Test@1234");
        request.setConfirmPassword("Test@1234");

        authService.register(request);

        assertThrows(BadRequestException.class, () -> authService.register(request));
    }

    @Test
    void testPasswordIsHashed() {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("Hash Test");
        request.setEmail("hash@example.com");
        request.setPassword("Test@1234");
        request.setConfirmPassword("Test@1234");

        authService.register(request);

        User user = userRepository.findByEmail("hash@example.com").orElseThrow();
        assertNotEquals("Test@1234", user.getPassword());
        assertTrue(passwordEncoder.matches("Test@1234", user.getPassword()));
    }
}
