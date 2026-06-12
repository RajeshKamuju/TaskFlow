package com.example.taskmanager.controller;

import com.example.taskmanager.dto.TaskDto;
import com.example.taskmanager.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

/**
 * TaskController maps our basic secured CRUD operations.
 * Spring Security blocks anyone with an invalid or expired token before these methods are even called.
 */
@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    /**
     * POST /api/tasks
     * Creates a new task representing the logged-in user.
     */
    @PostMapping
    public ResponseEntity<TaskDto> createTask(@Valid @RequestBody TaskDto taskDto, Principal principal) {
        // principal.getName() returns the subject of our loaded JWT token (user email address)
        String userEmail = principal.getName();
        TaskDto createdTask = taskService.createTask(taskDto, userEmail);
        return new ResponseEntity<>(createdTask, HttpStatus.CREATED);
    }

    /**
     * GET /api/tasks
     * Fetches all tasks belonging to the logged-in user.
     */
    @GetMapping
    public ResponseEntity<List<TaskDto>> getAllTasks(Principal principal) {
        String userEmail = principal.getName();
        List<TaskDto> tasks = taskService.getAllTasksForUser(userEmail);
        return ResponseEntity.ok(tasks);
    }

    /**
     * GET /api/tasks/{id}
     * Fetches details of a single task. Enforces ownership check.
     */
    @GetMapping("/{id}")
    public ResponseEntity<TaskDto> getTaskById(@PathVariable Long id, Principal principal) {
        String userEmail = principal.getName();
        TaskDto task = taskService.getTaskByIdForUser(id, userEmail);
        return ResponseEntity.ok(task);
    }

    /**
     * PUT /api/tasks/{id}
     * Updates an existing task. Enforces validation and ownership check.
     */
    @PutMapping("/{id}")
    public ResponseEntity<TaskDto> updateTask(@PathVariable Long id, 
                                              @Valid @RequestBody TaskDto taskDto, 
                                              Principal principal) {
        String userEmail = principal.getName();
        TaskDto updatedTask = taskService.updateTaskForUser(id, taskDto, userEmail);
        return ResponseEntity.ok(updatedTask);
    }

    /**
     * DELETE /api/tasks/{id}
     * Deletes a task. Enforces ownership check.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<MapResponse> deleteTask(@PathVariable Long id, Principal principal) {
        String userEmail = principal.getName();
        taskService.deleteTaskForUser(id, userEmail);
        return ResponseEntity.ok(new MapResponse("Task successfully deleted"));
    }

    /**
     * Minimal helper DTO to return simple json status strings on delete,
     * instead of plain strings which can sometimes be tricky for fetch/axios clients.
     */
    public static class MapResponse {
        private String message;

        public MapResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}
