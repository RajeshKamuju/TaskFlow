# Task Management System (Java Full Stack Assignment)

Welcome! This repository hosts a robust, beginner-friendly **Task Management System** designed for internship assignments and coding interviews. Built as a senior developer-mentored project, it balances professional design patterns with clear, readable code structures.

---

## 🛠️ Architecture & Tech Stack

### 1. Backend (`/backend`)
*   **Java 21 & Spring Boot 3**: High-performance enterprise-ready foundation.
*   **Spring Security & JWT**: Stateless token-based user authentication.
*   **Spring Data JPA**: Clean ORM layer with Hibernate.
*   **H2 / MySQL Connection**: Ready-to-use configuration mapping.
*   **Layered Package Architecture**:
    *   `controller`: Exposes REST endpoints to the outer world.
    *   `service` / `impl`: Real business-logic engine.
    *   `repository`: Direct data persistence wrappers.
    *   `entity`: Mapping classes representing database tables.
    *   `dto`: Standard Data Transfer Objects decoupling APIs from db states.
    *   `security`: Security Filters, UserDetailsService, and JWT tokens.
    *   `exception`: Global exception handler mapping clean error responses.

### 2. Frontend (`/src`)
*   **React (JavaScript only, `.jsx`)**: Clean, vanilla Hook-based components.
*   **Bootstrap 5**: Responsive layout grid support for Desktop, Tablet, and Mobile.
*   **Axios**: Native HTTP request clients with Header Token Interceptors.
*   **React Router v6**: Explicit route security with `<ProtectedRoute />`.

---

## 🚀 How to Run the Project Locally

### Prerequisites
*   Java Development Kit (JDK 21) installed.
*   Node.js (v18 or higher) installed with NPM.
*   MySQL Server running on port `3306` (or switch to H2 in properties).

### Running the Backend
1. Open a terminal path in the `/backend` directory.
2. Initialize the MySQL database named `task_db` in your database client.
3. Configure your database username and password inside `/backend/src/main/resources/application.properties`.
4. Command to compile and boot up the Spring Boot application:
   ```bash
   ./mvnw spring-boot:run
   ```
   *Note: On Windows systems, use `mvnw.cmd spring-boot:run`.*
5. The API server will boot up and bind to `http://localhost:8080`.

### Running the Frontend
1. Open a terminal at the root path.
2. Ensure dependencies are fully installed:
   ```bash
   npm install
   ```
3. Boot up the local Webpack/Vite development server:
   ```bash
   npm run dev
   ```
4. Access the responsive client in your browser at `http://localhost:3000`.

---

## 🔒 Security & Relational Logic Notes
*   **Scoped Task Isolation**: The user entity maps a standard `@OneToMany` relationship with Tasks. Whenever an API action triggers (like retrieving tasks or editing one), the repository runs `findByIdAndUserId` to guarantee that user `A` can **never** access or corrupt a task belonging to user `B`.
