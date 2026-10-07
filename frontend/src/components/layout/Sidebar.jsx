import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, ArrowLeftRight, Target, BarChart3,
  User, LogOut, ShieldCheck, Users, Tag, TrendingUp, X
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/budgets', icon: Target, label: 'Budgets' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/profile', icon: User, label: 'Profile' },
];

const adminItems = [
  { to: '/admin', icon: ShieldCheck, label: 'Admin Dashboard' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/categories', icon: Tag, label: 'Categories' },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <>
      {open && <div className="sb-backdrop" onClick={onClose} />}
      <aside className={`sidebar ${open ? 'open' : ''}`}>

        {/* Brand */}
        <div className="sb-brand">
          <div className="sb-logo">
            <TrendingUp size={20} strokeWidth={2.5} />
          </div>
          <span className="sb-brand-name">FinanceTrack</span>
          <button className="sb-close" onClick={onClose} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        {/* User Card */}
        {user && (
          <div className="sb-user">
            <div className="sb-avatar">{initials}</div>
            <div className="sb-user-info">
              <div className="sb-user-name">{user.fullName}</div>
              <div className="sb-user-role">{user.role}</div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="sb-nav">
          <div className="sb-nav-section">
            <span className="sb-nav-label">Menu</span>
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to} to={to}
                className={({ isActive }) => `sb-link ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <span className="sb-link-icon"><Icon size={17} strokeWidth={2} /></span>
                <span className="sb-link-label">{label}</span>
              </NavLink>
            ))}
          </div>

          {isAdmin && (
            <div className="sb-nav-section">
              <span className="sb-nav-label">Admin</span>
              {adminItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to} to={to} end
                  className={({ isActive }) => `sb-link ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <span className="sb-link-icon"><Icon size={17} strokeWidth={2} /></span>
                  <span className="sb-link-label">{label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </nav>

        {/* Logout */}
        <button className="sb-logout" onClick={handleLogout}>
          <LogOut size={16} strokeWidth={2} />
          <span>Log out</span>
        </button>
      </aside>

      <style>{`
        .sidebar {
          width: var(--sidebar-width);
          height: 100vh;
          position: fixed; left: 0; top: 0;
          background: var(--navy);
          display: flex; flex-direction: column;
          z-index: 200;
          transition: transform var(--t-slow) var(--ease);
          overflow-y: auto;
          overflow-x: hidden;
        }
        .sb-backdrop { display: none; }

        /* Brand */
        .sb-brand {
          display: flex; align-items: center; gap: 10px;
          padding: 20px 20px 18px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          flex-shrink: 0;
        }
        .sb-logo {
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg, #3b82f6, #06b6d4);
          display: flex; align-items: center; justify-content: center;
          color: white; flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(59,130,246,0.3);
        }
        .sb-brand-name {
          font-size: 1rem; font-weight: 800; color: #fff;
          letter-spacing: -0.03em; flex: 1;
        }
        .sb-close {
          display: none; background: none; border: none;
          color: rgba(255,255,255,0.4); padding: 4px; cursor: pointer;
          border-radius: 6px; transition: all var(--t-fast);
        }
        .sb-close:hover { color: #fff; background: rgba(255,255,255,0.1); }

        /* User section */
        .sb-user {
          display: flex; align-items: center; gap: 11px;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          flex-shrink: 0;
        }
        .sb-avatar {
          width: 38px; height: 38px; border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #818cf8);
          display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: 0.8rem; color: white; flex-shrink: 0;
          letter-spacing: 0.02em;
        }
        .sb-user-name {
          font-size: 0.875rem; font-weight: 600; color: #fff;
          line-height: 1.2; letter-spacing: -0.01em;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          max-width: 140px;
        }
        .sb-user-role {
          font-size: 0.72rem; color: rgba(255,255,255,0.4);
          text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600;
        }

        /* Nav */
        .sb-nav { flex: 1; padding: 12px 12px; overflow-y: auto; }
        .sb-nav-section { margin-bottom: 8px; }
        .sb-nav-label {
          font-size: 0.68rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.1em;
          color: rgba(255,255,255,0.25);
          padding: 10px 10px 6px; display: block;
        }
        .sb-link {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 10px; border-radius: 9px;
          color: rgba(255,255,255,0.5);
          font-size: 0.875rem; font-weight: 500;
          transition: all var(--t-base) var(--ease);
          margin-bottom: 1px; text-decoration: none;
          letter-spacing: -0.01em;
        }
        .sb-link:hover {
          background: rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.85);
        }
        .sb-link.active {
          background: rgba(59,130,246,0.18);
          color: #93c5fd;
          font-weight: 600;
        }
        .sb-link.active .sb-link-icon { color: #60a5fa; }
        .sb-link-icon { display: flex; align-items: center; width: 20px; flex-shrink: 0; }
        .sb-link-label { flex: 1; }

        /* Logout */
        .sb-logout {
          display: flex; align-items: center; gap: 10px;
          padding: 16px 22px;
          background: none; border: none; border-top: 1px solid rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.35); font-size: 0.875rem; font-weight: 500;
          cursor: pointer; width: 100%; transition: all var(--t-fast);
          letter-spacing: -0.01em; flex-shrink: 0;
        }
        .sb-logout:hover { color: #fca5a5; background: rgba(239,68,68,0.08); }

        /* Mobile */
        @media (max-width: 768px) {
          .sidebar { transform: translateX(-100%); }
          .sidebar.open { transform: translateX(0); }
          .sb-backdrop {
            display: block; position: fixed; inset: 0;
            background: rgba(15, 31, 61, 0.6); z-index: 199;
            backdrop-filter: blur(4px);
          }
          .sb-close { display: flex; }
        }
      `}</style>
    </>
  );
}
