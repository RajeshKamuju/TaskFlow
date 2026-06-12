package com.example.taskmanager.service.impl;

import com.example.taskmanager.dto.AuthResponseDto;
import com.example.taskmanager.dto.UserLoginDto;
import com.example.taskmanager.dto.UserRegisterDto;
import com.example.taskmanager.entity.User;
import com.example.taskmanager.repository.UserRepository;
import com.example.taskmanager.security.JwtUtils;
import com.example.taskmanager.service.AuthService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * AuthServiceImpl implements authentication rules, managing registration and login processes.
 */
@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;

    public AuthServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           JwtUtils jwtUtils,
                           AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.authenticationManager = authenticationManager;
    }

    @Override
    public AuthResponseDto register(UserRegisterDto registerDto) {
        // 1. Verify email uniqueness
        if (userRepository.existsByEmail(registerDto.getEmail())) {
            throw new RuntimeException("Registration failed: Email is already in use!");
        }

        // 2. Create User entity with cryptographically hashed password
        User user = new User();
        user.setName(registerDto.getName());
        user.setEmail(registerDto.getEmail());
        user.setPassword(passwordEncoder.encode(registerDto.getPassword()));

        // 3. Save database changes
        User savedUser = userRepository.save(user);

        // 4. Issue fresh JWT Token
        String token = jwtUtils.generateToken(savedUser.getEmail());

        // 5. Package and return custom auth details!
        return new AuthResponseDto(token, savedUser.getName(), savedUser.getEmail());
    }

    @Override
    public AuthResponseDto login(UserLoginDto loginDto) {
        // 1. Utilize Spring AuthenticationManager to verify coordinates (email & password).
        // If password encoding comparison fails, this throws BadCredentialsException automatically.
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginDto.getEmail(), loginDto.getPassword())
        );

        // 2. If login succeeded, load user entity from db to construct return payload details
        User user = userRepository.findByEmail(loginDto.getEmail())
                .orElseThrow(() -> new RuntimeException("Authentication Error: User records could not be found"));

        // 3. Generate JWT Token
        String token = jwtUtils.generateToken(user.getEmail());

        // 4. Return payload containing Token and user profiles
        return new AuthResponseDto(token, user.getName(), user.getEmail());
    }
}
