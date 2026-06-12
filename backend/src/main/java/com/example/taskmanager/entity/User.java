package com.example.taskmanager.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

/**
 * User entity represents the database table 'users'.
 * Design details:
 * - Managed by JPA (Hibernate).
 * - Implements a One-to-Many relationship with Task entity.
 */
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Specifying that name cannot be null
    @Column(nullable = false)
    private String name;

    // Email must be unique and cannot be null
    @Column(nullable = false, unique = true)
    private String email;

    // Password cannot be null
    @Column(nullable = false)
    private String password;

    /**
     * One User can have Many Tasks.
     * 'mappedBy = "user"' indicates that the 'user' field in the Task entity owns the relationship.
     * 'cascade = CascadeType.ALL' means if we delete/update a user, their associated tasks are updated/deleted.
     * 'orphanRemoval = true' means if a task is removed from this list, it's deleted from the database.
     */
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Task> tasks = new ArrayList<>();

    // ===================================================================
    // CONSTRUCTORS
    // ===================================================================

    // Default constructor is REQUIRED by JPA. Do not delete!
    public User() {
    }

    // Parameterized constructor holds value initialization for regular code helper
    public User(String name, String email, String password) {
        this.name = name;
        this.email = email;
        this.password = password;
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

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

    public List<Task> getTasks() {
        return tasks;
    }

    public void setTasks(List<Task> tasks) {
        this.tasks = tasks;
    }
}
