import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

export default function AppLayout() {
  const { isAuthenticated, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // While auth is being validated, show a spinner only inside the
  // app shell — public pages (Landing, Login, Register) are NOT
  // inside AppLayout so they render immediately without waiting.
  if (loading) return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--cream-50)',
    }}>
      <LoadingSpinner message="Loading FinanceTrack..." />
    </div>
  );

  // Auth is settled — if not logged in, redirect to login
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="app-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Header onMenuToggle={() => setSidebarOpen(o => !o)} />
        <main className="page-content"><Outlet /></main>
      </div>
      <style>{`
        .app-layout    { display: flex; min-height: 100vh; background: var(--cream-50); }
        .main-content  { flex: 1; margin-left: var(--sidebar-width); display: flex; flex-direction: column; min-width: 0; }
        .page-content  { flex: 1; padding: 28px 32px; overflow-x: hidden; }
        @media (max-width: 1024px) { .page-content { padding: 24px; } }
        @media (max-width: 768px)  { .main-content { margin-left: 0; } .page-content { padding: 20px 16px; } }
      `}</style>
    </div>
  );
}
