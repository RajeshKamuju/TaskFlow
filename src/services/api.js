import axios from 'axios';

// Get current backend mode (persisted in localStorage)
export const getBackendMode = () => {
  const saved = localStorage.getItem('backend_mode');
  if (saved) return saved;
  // If we are running on localhost, default to Spring Boot live connection
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'springboot';
  }
  // Otherwise, default to Sandbox simulator so the app works instantly in the AI Studio preview
  return 'sandbox';
};

// Toggle the backend mode and reload the application
export const toggleBackendMode = () => {
  const current = getBackendMode();
  const next = current === 'springboot' ? 'sandbox' : 'springboot';
  localStorage.setItem('backend_mode', next);
  // Clear any existing session to prevent contamination
  localStorage.removeItem('token');
  localStorage.removeItem('userName');
  localStorage.removeItem('userEmail');
  window.location.reload();
};

// We define our baseURL dynamically.
const getBaseURL = () => {
  const mode = getBackendMode();
  if (mode === 'springboot') {
    return 'http://localhost:8080/api';
  }
  return '/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// INTERCEPTOR: Update baseURL dynamically and attach JWT token to headers if present
api.interceptors.request.use(
  (config) => {
    config.baseURL = getBaseURL();
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
    // Only intercept and mock if backend_mode is set to 'sandbox'
    const isMock = getBackendMode() === 'sandbox';
    if (!isMock) {
      return config;
    }

    config.adapter = async (adapterConfig) => {
      initializeMockDb();
      
      // Determine request URL details
      let url = adapterConfig.url || '';
      // If URL has the baseURL prepended, isolate the relative portion
      if (url.startsWith('http://') || url.startsWith('https://')) {
        const parts = url.split('/api');
        url = parts.length > 1 ? '/api' + parts[1] : url;
      }
      const relativeUrl = url.replace(/^\/api/, '');
      const method = (adapterConfig.method || 'get').toLowerCase();

      // Helper to extract email from Bearer token
      const getAuthenticatedUserEmail = () => {
        let authHeader = adapterConfig.headers?.Authorization || adapterConfig.headers?.get?.('Authorization');
        if (!authHeader && adapterConfig.headers) {
          authHeader = adapterConfig.headers.Authorization;
        }
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return null;
        }
        const token = authHeader.substring(7);
        return token.split('_jwt_')[0];
      };

      // 1. AUTHENTICATION REQ SIMULATIONS
      if (relativeUrl.includes('/auth/register') && method === 'post') {
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

        const mockToken = `${email}_jwt_${Date.now()}`;
        return {
          data: { token: mockToken, name, email },
          status: 201,
          statusText: 'Created',
          headers: {},
          config: adapterConfig
        };
      }

      if (relativeUrl.includes('/auth/login') && method === 'post') {
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

      // 2. SECURE TASKS LIST CRUD SIMULATIONS
      if (relativeUrl === '/tasks' || relativeUrl.startsWith('/tasks/')) {
        const currentUserEmail = getAuthenticatedUserEmail();
        if (!currentUserEmail) {
          return Promise.reject({
            response: { status: 401, data: { message: 'Full authentication is required to access this resource' } }
          });
        }

        const tasks = JSON.parse(localStorage.getItem('mock_tasks') || '[]');

        if (relativeUrl === '/tasks' && method === 'get') {
          const userTasks = tasks.filter((t) => t.userEmail === currentUserEmail);
          return {
            data: userTasks,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: adapterConfig
          };
        }

        if (relativeUrl === '/tasks' && method === 'post') {
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

        if (relativeUrl.startsWith('/tasks/') && method === 'put') {
          const id = parseInt(relativeUrl.split('/tasks/')[1]);
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

        if (relativeUrl.startsWith('/tasks/') && method === 'delete') {
          const id = parseInt(relativeUrl.split('/tasks/')[1]);
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
        response: { status: 404, data: { message: `API simulator path not matched for ${relativeUrl}` } }
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
