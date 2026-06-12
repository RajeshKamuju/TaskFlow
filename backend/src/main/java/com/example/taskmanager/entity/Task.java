package com.example.taskmanager.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Task entity represents the database table 'tasks'.
 * Design details:
 * - Managed by JPA (Hibernate).
 * - Implements a Many-to-One relationship back to the User entity.
 */
@Entity
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Title cannot be empty in the database
    @Column(nullable = false)
    private String title;

    // We allow a broader description text column
    @Column(length = 1000)
    private String description;

    // Status mapping using Enum type STRING so database stores 'PENDING' instead of 0
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.PENDING;

    // LocalDate represents Year-Month-Day
    @Column(name = "due_date")
    private LocalDate dueDate;

    // LocalDateTime represents complete date-time including hours/minutes/seconds
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Many Tasks can belong to One User.
     * '@JoinColumn' specifies the foreign key column name as 'user_id' in our 'tasks' table.
     * 'fetch = FetchType.LAZY' optimizes load performance by loading user info only when called.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // ===================================================================
    // LIFECYCLE CALLBACKS
    // ===================================================================

    /**
     * JPA standard callback. Just before persisting research, auto-initialize the creation timestamp!
     * This avoids having to write 'task.setCreatedAt(LocalDateTime.now())' manually every single time!
     */
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // ===================================================================
    // CONSTRUCTORS
    // ===================================================================

    // Default constructor is REQUIRED by JPA.
    public Task() {
    }

    // Parameterized constructor for general creation
    public Task(String title, String description, Status status, LocalDate dueDate, User user) {
        this.title = title;
        this.description = description;
        this.status = status;
        this.dueDate = dueDate;
        this.user = user;
    }

    // ===================================================================
    // GETTERS AND SETTERS
    // ===================================================================

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

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
