package com.example.taskmanager.entity;

/**
 * Status enum representing the current state of a Task.
 * Standard Java enum that maps cleanly to the database values.
 */
public enum Status {
    PENDING,
    IN_PROGRESS,
    COMPLETED
}
