import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState, createContext, useContext } from 'react';
import { AuthProvider } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import AdminLayout from './components/layout/AdminLayout';
import { pingBackend } from './api/axios';

// Pages
import Landing from './pages/auth/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import Transactions from './pages/transactions/Transactions';
import TransactionForm from './pages/transactions/TransactionForm';
import Budgets from './pages/budgets/Budgets';
import Reports from './pages/reports/Reports';
import Profile from './pages/profile/Profile';
import ChangePassword from './pages/profile/ChangePassword';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import CategoryManagement from './pages/admin/CategoryManagement';

// ── Server-ready context ──────────────────────────────────────────────────────
export const ServerReadyContext = createContext(false);
export const useServerReady = () => useContext(ServerReadyContext);

// ── Warmup banner ─────────────────────────────────────────────────────────────
function ServerWarmup({ onReady }) {
  const [show, setShow] = useState(false);
  const [dots, setDots] = useState('');

  useEffect(() => {
    // Show banner after 3s — fast connections won't see it
    const showTimer = setTimeout(() => setShow(true), 3000);

    pingBackend().finally(() => {
      clearTimeout(showTimer);
      setShow(false);
      onReady();
    });

    return () => clearTimeout(showTimer);
  }, [onReady]);

  // Animated dots while waiting
  useEffect(() => {
    if (!show) return;
    const t = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 500);
    return () => clearInterval(t);
  }, [show]);

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      background: '#1a4433', color: 'white', borderRadius: 12,
      padding: '14px 22px', display: 'flex', alignItems: 'center', gap: 12,
      fontSize: '0.875rem', fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontWeight: 500, zIndex: 9999, boxShadow: '0 8px 32px rgba(0,0,0,0.30)',
      border: '1px solid rgba(142,207,173,0.2)',
    }}>
      <span style={{
        width: 16, height: 16,
        border: '2.5px solid rgba(255,255,255,0.2)',
        borderTopColor: '#8ECFAD', borderRadius: '50%',
        animation: 'warmupSpin 0.8s linear infinite',
        flexShrink: 0, display: 'inline-block',
      }} />
      <span>
        Connecting to server{dots}
        <span style={{ opacity: 0.55, fontSize: '0.78rem', marginLeft: 6 }}>
          (Render free tier wakes in ~30s)
        </span>
      </span>
      <style>{`@keyframes warmupSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [serverReady, setServerReady] = useState(false);

  // Keep-alive: ping every 13 minutes so Render never sleeps during active session
  useEffect(() => {
    if (!serverReady) return;
    const keepAlive = setInterval(() => {
      fetch(`https://financetrack-backend-it64.onrender.com/actuator/health`, { method: 'GET' })
        .catch(() => {});
    }, 13 * 60 * 1000);
    return () => clearInterval(keepAlive);
  }, [serverReady]);

  return (
    <ServerReadyContext.Provider value={serverReady}>
      <BrowserRouter>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: '10px',
                fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                fontSize: '0.875rem',
                background: '#FFFFFF',
                color: '#242923',
                border: '1px solid #E7E5DE',
                boxShadow: '0 8px 24px rgba(36,41,35,0.12)',
              },
              success: { iconTheme: { primary: '#245C45', secondary: '#fff' } },
              error:   { iconTheme: { primary: '#B94A48', secondary: '#fff' } },
            }}
          />

          <ServerWarmup onReady={() => setServerReady(true)} />

          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/transactions/new" element={<TransactionForm />} />
              <Route path="/transactions/edit/:id" element={<TransactionForm />} />
              <Route path="/budgets" element={<Budgets />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/change-password" element={<ChangePassword />} />

              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<UserManagement />} />
                <Route path="/admin/categories" element={<CategoryManagement />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ServerReadyContext.Provider>
  );
}
