import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin, register as apiRegister, getProfile } from '../api/auth';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Initialise user from cache immediately — no flicker on first render
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  // Start loading=false if there is no token at all — no need to wait.
  // Start loading=true only when a token exists and needs validation.
  const [loading, setLoading] = useState(() => {
    return !!localStorage.getItem('token');
  });

  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // Use a short 8-second timeout for the auth check so the app
      // doesn't block for 90 seconds during Render cold-start.
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);

      const res = await getProfile();
      clearTimeout(timer);

      const userData = res.data.data;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));

    } catch (err) {
      const status = err?.response?.status;

      if (status === 401 || status === 403) {
        // Real auth failure — token is invalid, clear it
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } else {
        // Network error, timeout, or server cold-starting.
        // Keep the cached user so the session survives.
        const stored = localStorage.getItem('user');
        if (stored) {
          try { setUser(JSON.parse(stored)); } catch { setUser(null); }
        }
        // Don't clear token — it may still be valid once backend wakes up
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const login = async (email, password) => {
    const res = await apiLogin({ email, password });
    const { token, user: userData } = res.data.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (data) => {
    const res = await apiRegister(data);
    return res.data.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const refreshUser = async () => {
    await fetchProfile();
  };

  const isAdmin         = user?.role === 'ADMIN';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, isAdmin, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
