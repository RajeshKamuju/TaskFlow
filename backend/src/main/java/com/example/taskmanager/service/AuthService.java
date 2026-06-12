package com.example.taskmanager.service;

import com.example.taskmanager.dto.AuthResponseDto;
import com.example.taskmanager.dto.UserLoginDto;
import com.example.taskmanager.dto.UserRegisterDto;

/**
 * AuthService interface defining the methods for registration and authentication.
 * Follows the standard interface-implementation pattern.
 */
public interface AuthService {

    /**
     * Registers a new user in the database.
     * @param registerDto Contains name, email, credentials
     * @return AuthResponseDto populated with a fresh JWT token
     */
    AuthResponseDto register(UserRegisterDto registerDto);

    /**
     * Authenticates a user and returns a token on success.
     * @param loginDto Contains email, password
     * @return AuthResponseDto populated with a fresh JWT token
     */
    AuthResponseDto login(UserLoginDto loginDto);
}
