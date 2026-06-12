package com.example.taskmanager.dto;

import com.example.taskmanager.entity.Status;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * TaskDto is used to transfer task details between client (frontend) and server (api).
 * Prevents recursive Jackson JSON loops by utilizing flat fields instead of full nested User Entity!
 */
public class TaskDto {

    private Long id;

    @NotBlank(message = "Task title cannot be blank")
    private String title;

    private String description;

    @NotNull(message = "Task status is required")
    private Status status;

    private LocalDate dueDate;

    private LocalDateTime createdAt;

    // Standard field representing user identity
    private Long userId;

    // Default Constructor
    public TaskDto() {
    }

    // Parameterized Constructor
    public TaskDto(Long id, String title, String description, Status status, LocalDate dueDate, LocalDateTime createdAt, Long userId) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.status = status;
        this.dueDate = dueDate;
        this.createdAt = createdAt;
        this.userId = userId;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}
