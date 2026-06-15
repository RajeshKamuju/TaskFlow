import axios from 'axios';

// We create an axios instance with a default base URL.
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// INTERCEPTOR: Automatically attach JWT token to headers if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ===================================================================
// OFFLINE DEVELOPER PLAYGROUND: SIMULATION DATA ENGINE
// ===================================================================
// Since our Java Spring Boot backend is meant to be run on your local machine,
// we intercept outgoing REST routes and simulate them cleanly using localStorage,
// so that your live applet preview compiles and works fully in your browser!

// Initialize mock storage if empty
const initializeMockDb = () => {
  if (!localStorage.getItem('mock_users')) {
    localStorage.setItem('mock_users', JSON.stringify([]));
  }
  if (!localStorage.getItem('mock_tasks')) {
    localStorage.setItem('mock_tasks', JSON.stringify([]));
  }
};

// Safe data parsing helper for Axios configuration objects
const getRequestPayload = (data) => {
  if (!data) return {};
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch (e) {
      return {};
    }
  }
  return data;
};

api.interceptors.request.use(
  (config) => {
    // Override adapter to simulate backend in sandbox browser preview
    config.adapter = async (adapterConfig) => {
      initializeMockDb();
      const url = adapterConfig.url || '';
      const method = (adapterConfig.method || 'get').toLowerCase();

      // Helper to extract the token from headers mapping
      const getAuthenticatedUserEmail = () => {
        let authHeader = adapterConfig.headers?.Authorization || adapterConfig.headers?.get?.('Authorization');
        if (!authHeader && adapterConfig.headers) {
          authHeader = adapterConfig.headers.Authorization;
        }
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return null;
        }
        const token = authHeader.substring(7);
        // Decrypt our virtual JWT token (it stores the email address in plain form)
        return token.split('_jwt_')[0];
      };

      // ---------------------------------------------------------------
      // 1. AUTHENTICATION REQ SIMULATIONS
      // ---------------------------------------------------------------
      if (url.includes('/auth/register') && method === 'post') {
        const payload = getRequestPayload(adapterConfig.data);
        const { name, email, password } = payload;
        if (!name || !email || !password) {
          return Promise.reject({
            response: { status: 400, data: { message: 'All inputs are required' } }
          });
        }

        const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
        if (users.some((u) => u.email === email)) {
          return Promise.reject({
            response: { status: 400, data: { message: 'Registration failed: Email is already in use!' } }
          });
        }

        const newUser = { id: Date.now(), name, email, password };
        users.push(newUser);
        localStorage.setItem('mock_users', JSON.stringify(users));

        // Generate virtual token
        const mockToken = `${email}_jwt_${Date.now()}`;
        return {
          data: { token: mockToken, name, email },
          status: 201,
          statusText: 'Created',
          headers: {},
          config: adapterConfig
        };
      }

      if (url.includes('/auth/login') && method === 'post') {
        const payload = getRequestPayload(adapterConfig.data);
        const { email, password } = payload;
        const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
        
        const foundUser = users.find((u) => u.email === email && u.password === password);
        if (!foundUser) {
          return Promise.reject({
            response: { status: 401, data: { status: 401, message: 'Invalid email or password' } }
          });
        }

        const mockToken = `${email}_jwt_${Date.now()}`;
        return {
          data: { token: mockToken, name: foundUser.name, email: foundUser.email },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: adapterConfig
        };
      }

      // ---------------------------------------------------------------
      // 2. SECURE TASKS LIST CRUD SIMULATIONS
      // ---------------------------------------------------------------
      if (url === '/tasks' || url.startsWith('/tasks/')) {
        const currentUserEmail = getAuthenticatedUserEmail();
        if (!currentUserEmail) {
          return Promise.reject({
            response: { status: 401, data: { message: 'Full authentication is required to access this resource' } }
          });
        }

        const tasks = JSON.parse(localStorage.getItem('mock_tasks') || '[]');

        // GET /api/tasks (Retrieves tasks belonging to the current user)
        if (url === '/tasks' && method === 'get') {
          const userTasks = tasks.filter((t) => t.userEmail === currentUserEmail);
          return {
            data: userTasks,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: adapterConfig
          };
        }

        // POST /api/tasks (Creates new task linked to current user)
        if (url === '/tasks' && method === 'post') {
          const data = getRequestPayload(adapterConfig.data);
          const newTask = {
            id: Date.now(),
            title: data.title,
            description: data.description || '',
            status: data.status || 'PENDING',
            dueDate: data.dueDate || '',
            createdAt: new Date().toISOString(),
            userEmail: currentUserEmail
          };

          tasks.push(newTask);
          localStorage.setItem('mock_tasks', JSON.stringify(tasks));
          return {
            data: newTask,
            status: 201,
            statusText: 'Created',
            headers: {},
            config: adapterConfig
          };
        }

        // PUT /api/tasks/{id} (Updates selected task verifying owner clearance)
        if (url.startsWith('/tasks/') && method === 'put') {
          const id = parseInt(url.split('/tasks/')[1]);
          const data = getRequestPayload(adapterConfig.data);

          const taskIndex = tasks.findIndex((t) => t.id === id && t.userEmail === currentUserEmail);
          if (taskIndex === -1) {
            return Promise.reject({
              response: { status: 404, data: { message: 'Task not found or you are not authorized' } }
            });
          }

          const updatedTask = {
            ...tasks[taskIndex],
            title: data.title,
            description: data.description || '',
            status: data.status,
            dueDate: data.dueDate || ''
          };

          tasks[taskIndex] = updatedTask;
          localStorage.setItem('mock_tasks', JSON.stringify(tasks));

          return {
            data: updatedTask,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: adapterConfig
          };
        }

        // DELETE /api/tasks/{id} (Deletes task verifying ownership)
        if (url.startsWith('/tasks/') && method === 'delete') {
          const id = parseInt(url.split('/tasks/')[1]);
          const taskIndex = tasks.findIndex((t) => t.id === id && t.userEmail === currentUserEmail);
          
          if (taskIndex === -1) {
            return Promise.reject({
              response: { status: 404, data: { message: 'Task not found or you are not authorized' } }
            });
          }

          tasks.splice(taskIndex, 1);
          localStorage.setItem('mock_tasks', JSON.stringify(tasks));

          return {
            data: { message: 'Task successfully deleted' },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: adapterConfig
          };
        }
      }

      return Promise.reject({
        response: { status: 404, data: { message: 'API simulator path not matched' } }
      });
    };

    return config;
  },
  (error) => Promise.reject(error)
);

// INTERCEPTOR: Handle 401 Unauthorized errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Session expired or unauthorized request. Logging out.');
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
