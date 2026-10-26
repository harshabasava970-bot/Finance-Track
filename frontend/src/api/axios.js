import axios from 'axios';

const BASE_URL = 'https://financetrack-backend-it64.onrender.com';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 120000,
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

/**
 * Ping /actuator/health (public, no auth needed) to wake Render from sleep.
 * Retries every 5s until the server responds, up to 10 attempts (50s total).
 */
export const pingBackend = () => {
  return new Promise((resolve) => {
    let attempts = 0;
    const maxAttempts = 12; // 12 × 5s = 60s max

    const tryPing = () => {
      attempts++;
      axios.get(`${BASE_URL}/actuator/health`, { timeout: 8000 })
        .then(() => resolve(true))
        .catch(() => {
          if (attempts < maxAttempts) {
            setTimeout(tryPing, 5000); // retry every 5s
          } else {
            resolve(false); // give up after 60s, let page load anyway
          }
        });
    };

    tryPing();
  });
};

export default api;
