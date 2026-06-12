package com.example.taskmanager.repository;

import com.example.taskmanager.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * UserRepository interface extends JpaRepository to provide out-of-the-box CRUD operations for 'users' table.
 * Let's explain to the interviewer:
 * - 'User' is our target entity.
 * - 'Long' is the data type of the entity's primary key class.
 * - Spring Data JPA automatically implements this interface at runtime!
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Custom finder method. Automatically converts to SQL: "SELECT * FROM users WHERE email = ?"
     * Optional is used to handle situations where a user may or may not exist safely without throwing NullPointerExceptions.
     */
    Optional<User> findByEmail(String email);

    /**
     * Helper to verify if an email exists quickly during registration.
     * SQL query: "SELECT count(*) FROM users WHERE email = ?"
     */
    boolean existsByEmail(String email);
}
