import axios from 'axios';

const BASE_URL = 'https://financetrack-backend-it64.onrender.com';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 120000,  // 2 minutes — covers Render cold start
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const publicPaths = ['/', '/login', '/register'];
      if (!publicPaths.includes(window.location.pathname)) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Ping the login endpoint (public, always exists) to wake Render from sleep.
// Returns a promise that resolves once the server responds (any response = awake).
export const pingBackend = () =>
  api.post('/api/auth/login', {}, { timeout: 120000 })
    .catch(() => { /* 400/422 = server is awake, that's fine */ });

export default api;
