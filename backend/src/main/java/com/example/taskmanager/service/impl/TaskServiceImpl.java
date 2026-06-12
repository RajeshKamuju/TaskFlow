package com.example.taskmanager.service.impl;

import com.example.taskmanager.dto.TaskDto;
import com.example.taskmanager.entity.Task;
import com.example.taskmanager.entity.User;
import com.example.taskmanager.repository.TaskRepository;
import com.example.taskmanager.repository.UserRepository;
import com.example.taskmanager.service.TaskService;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

/**
 * TaskServiceImpl implements user-task relational rules.
 */
@Service
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public TaskServiceImpl(TaskRepository taskRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    @Override
    public TaskDto createTask(TaskDto taskDto, String userEmail) {
        // 1. Fetch user to link they are the owner
        User user = getUserByEmail(userEmail);

        // 2. Map DTO to Entity
        Task task = new Task();
        task.setTitle(taskDto.getTitle());
        task.setDescription(taskDto.getDescription());
        task.setStatus(taskDto.getStatus());
        task.setDueDate(taskDto.getDueDate());
        task.setUser(user);

        // 3. Save entity
        Task savedTask = taskRepository.save(task);

        // 4. Return DTO to controller layer
        return mapToDto(savedTask);
    }

    @Override
    public List<TaskDto> getAllTasksForUser(String userEmail) {
        User user = getUserByEmail(userEmail);

        // Fetch only tasks linked with this authenticated User's database Primary Key
        List<Task> tasks = taskRepository.findByUserId(user.getId());

        // Map collection to Dtos
        return tasks.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public TaskDto getTaskByIdForUser(Long taskId, String userEmail) {
        User user = getUserByEmail(userEmail);

        // Retrieve task checking ownership criteria
        Task task = taskRepository.findByIdAndUserId(taskId, user.getId())
                .orElseThrow(() -> new RuntimeException("Task not found or you are not authorized to view it"));

        return mapToDto(task);
    }

    @Override
    public TaskDto updateTaskForUser(Long taskId, TaskDto taskDto, String userEmail) {
        User user = getUserByEmail(userEmail);

        // Retrieve task checking ownership criteria
        Task task = taskRepository.findByIdAndUserId(taskId, user.getId())
                .orElseThrow(() -> new RuntimeException("Task not found or you are not authorized to update it"));

        // Update fields
        task.setTitle(taskDto.getTitle());
        task.setDescription(taskDto.getDescription());
        task.setStatus(taskDto.getStatus());
        task.setDueDate(taskDto.getDueDate());

        Task updatedTask = taskRepository.save(task);
        return mapToDto(updatedTask);
    }

    @Override
    public void deleteTaskForUser(Long taskId, String userEmail) {
        User user = getUserByEmail(userEmail);

        // Retrieve task checking ownership criteria
        Task task = taskRepository.findByIdAndUserId(taskId, user.getId())
                .orElseThrow(() -> new RuntimeException("Task not found or you are not authorized to delete it"));

        taskRepository.delete(task);
    }

    // ===================================================================
    // HELPER MAPPING METHODS
    // ===================================================================

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User record could not be found with email: " + email));
    }

    private TaskDto mapToDto(Task task) {
        TaskDto dto = new TaskDto();
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setStatus(task.getStatus());
        dto.setDueDate(task.getDueDate());
        dto.setCreatedAt(task.getCreatedAt());
        dto.setUserId(task.getUser().getId());
        return dto;
    }
}
