package com.example.taskmanager.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * UserLoginDto represents the parameters received in a Login Request.
 */
public class UserLoginDto {

    @NotBlank(message = "Email is required")
    @Email(message = "Format must be a valid email address")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    // Default Constructor
    public UserLoginDto() {
    }

    // Parameterized Constructor
    public UserLoginDto(String email, String password) {
        this.email = email;
        this.password = password;
    }

    // Getters and Setters
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
