import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';
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

/* ── Render cold-start warm-up banner ── */
function WarmupBanner() {
  const [show, setShow] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Show banner only after 3 seconds of waiting (avoids flash on fast connections)
    const showTimer = setTimeout(() => setShow(true), 3000);

    pingBackend().finally(() => {
      clearTimeout(showTimer);
      setShow(false);
      setDone(true);
    });

    return () => clearTimeout(showTimer);
  }, []);

  if (!show || done) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      background: '#242923', color: 'white', borderRadius: 12,
      padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10,
      fontSize: '0.855rem', fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontWeight: 500, zIndex: 9999, boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
      border: '1px solid rgba(255,255,255,0.08)', whiteSpace: 'nowrap',
    }}>
      <span style={{
        width: 14, height: 14, border: '2px solid rgba(255,255,255,0.2)',
        borderTopColor: '#8ECFAD', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite', flexShrink: 0,
        display: 'inline-block',
      }} />
      Waking up the server… this takes ~30 seconds on first load
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
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

        {/* Pings backend on load; shows banner if it takes > 3 seconds */}
        <WarmupBanner />

        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Authenticated */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/transactions/new" element={<TransactionForm />} />
            <Route path="/transactions/edit/:id" element={<TransactionForm />} />
            <Route path="/budgets" element={<Budgets />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/change-password" element={<ChangePassword />} />

            {/* Admin - nested under AppLayout + AdminLayout guard */}
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/categories" element={<CategoryManagement />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
