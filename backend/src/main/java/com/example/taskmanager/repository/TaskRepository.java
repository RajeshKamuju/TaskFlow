package com.example.taskmanager.repository;

import com.example.taskmanager.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * TaskRepository interface extends JpaRepository to provide out-of-the-box CRUD operations for 'tasks' table.
 */
@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    /**
     * Finding all tasks belonging to a specific user id.
     * SQL equivalent: "SELECT * FROM tasks WHERE user_id = ?"
     * Used for retrieving only the logged-in user's tasks.
     */
    List<Task> findByUserId(Long userId);

    /**
     * Finding a specific task by task id and owning user id.
     * SQL equivalent: "SELECT * FROM tasks WHERE id = ? AND user_id = ?"
     * Essential for securing CRUD operations and verifying ownership!
     */
    Optional<Task> findByIdAndUserId(Long id, Long userId);
}
