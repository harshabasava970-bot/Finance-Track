import axios from 'axios';

// Backend URL - update this if your Render service URL changes
const BASE_URL = 'https://financetrack-backend-it64.onrender.com';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 90000, // 90 seconds — covers Render cold start (~50-60s)
});

// Attach JWT token to every request
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

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Ping the backend to wake it from Render's free-tier sleep.
 * Called once on app load. Silently succeeds or fails — never throws.
 */
export const pingBackend = () =>
  api.get('/api/health', { timeout: 90000 }).catch(() => {
    // Render may not have a /health endpoint — that's fine, the request
    // still wakes the dyno. Any response (including 404) means it's awake.
  });

export default api;
