package com.example.taskmanager.service;

import com.example.taskmanager.dto.TaskDto;
import java.util.List;

/**
 * TaskService interface defines user-scoped CRUD methods.
 * Ensures the logged-in user's email acts as a required security clearance parameter!
 */
public interface TaskService {

    /**
     * Creates a new task for the logged-in user.
     */
    TaskDto createTask(TaskDto taskDto, String userEmail);

    /**
     * Retrieves all tasks belonging to the logged-in user.
     */
    List<TaskDto> getAllTasksForUser(String userEmail);

    /**
     * Retrieves a single task by ID for the logged-in user.
     */
    TaskDto getTaskByIdForUser(Long taskId, String userEmail);

    /**
     * Updates an existing task after confirming ownership.
     */
    TaskDto updateTaskForUser(Long taskId, TaskDto taskDto, String userEmail);

    /**
     * Deletes a task after confirming ownership.
     */
    void deleteTaskForUser(Long taskId, String userEmail);
}
