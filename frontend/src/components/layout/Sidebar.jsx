import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/transactions', icon: '💳', label: 'Transactions' },
  { to: '/budgets', icon: '🎯', label: 'Budgets' },
  { to: '/reports', icon: '📈', label: 'Reports' },
  { to: '/profile', icon: '👤', label: 'Profile' },
];

const adminItems = [
  { to: '/admin', icon: '🛡️', label: 'Admin Dashboard' },
  { to: '/admin/users', icon: '👥', label: 'Users' },
  { to: '/admin/categories', icon: '🏷️', label: 'Categories' },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <>
      {open && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <span className="logo-icon">💰</span>
          <span className="logo-text">FinanceTrack</span>
        </div>

        {user && (
          <div className="sidebar-user">
            <div className="user-avatar">{user.fullName?.charAt(0).toUpperCase()}</div>
            <div className="user-info">
              <div className="user-name">{user.fullName}</div>
              <div className="user-role">{user.role}</div>
            </div>
          </div>
        )}

        <nav className="sidebar-nav">
          <div className="nav-section-label">Main</div>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}

          {isAdmin && (
            <>
              <div className="nav-section-label" style={{ marginTop: 16 }}>Admin</div>
              {adminItems.map(item => (
                <NavLink key={item.to} to={item.to} end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
                  <span className="nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </>
          )}
        </nav>

        <button className="sidebar-logout" onClick={handleLogout}>
          <span>🚪</span> Logout
        </button>
      </aside>

      <style>{`
        .sidebar {
          width: var(--sidebar-width); height: 100vh; position: fixed; left: 0; top: 0;
          background: var(--dark); display: flex; flex-direction: column;
          z-index: 100; transition: transform var(--transition); overflow-y: auto;
        }
        .sidebar-backdrop { display: none; }
        .sidebar-logo {
          display: flex; align-items: center; gap: 10px; padding: 20px 20px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.08); flex-shrink: 0;
        }
        .logo-icon { font-size: 1.6rem; }
        .logo-text { font-size: 1.1rem; font-weight: 700; color: var(--white); }
        .sidebar-user {
          display: flex; align-items: center; gap: 10px; padding: 16px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .user-avatar {
          width: 36px; height: 36px; border-radius: 50%; background: var(--primary);
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; color: white; font-size: 0.9rem; flex-shrink: 0;
        }
        .user-name { font-size: 0.875rem; font-weight: 600; color: var(--white); line-height: 1.2; }
        .user-role { font-size: 0.75rem; color: var(--gray-400); }
        .sidebar-nav { flex: 1; padding: 12px 12px; }
        .nav-section-label { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--gray-500); padding: 8px 8px 4px; }
        .nav-item {
          display: flex; align-items: center; gap: 10px; padding: 10px 12px;
          border-radius: var(--border-radius-sm); color: var(--gray-400);
          font-size: 0.875rem; font-weight: 500; transition: all var(--transition); margin-bottom: 2px;
        }
        .nav-item:hover { background: rgba(255,255,255,0.08); color: var(--white); }
        .nav-item.active { background: var(--primary); color: var(--white); }
        .nav-icon { font-size: 1rem; width: 20px; text-align: center; flex-shrink: 0; }
        .sidebar-logout {
          display: flex; align-items: center; gap: 10px; padding: 16px 20px;
          border: none; background: none; color: var(--gray-400);
          font-size: 0.875rem; cursor: pointer; border-top: 1px solid rgba(255,255,255,0.08);
          width: 100%; transition: color var(--transition);
        }
        .sidebar-logout:hover { color: var(--danger); }
        @media (max-width: 768px) {
          .sidebar { transform: translateX(-100%); }
          .sidebar.open { transform: translateX(0); }
          .sidebar-backdrop { display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 99; }
        }
      `}</style>
    </>
  );
}
