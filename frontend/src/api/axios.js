import axios from 'axios';

const BASE_URL = 'https://financetrack-backend-it64.onrender.com';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 90000,
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
      // Only redirect to /login if the user is NOT already on a public page
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

// Ping a public auth endpoint to wake Render from sleep
export const pingBackend = () =>
  api.post('/api/auth/login', {}, { timeout: 90000 })
    .catch(() => { /* any response (including 400/401) means server is awake */ });

export default api;
