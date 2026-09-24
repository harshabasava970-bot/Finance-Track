import { useLocation } from 'react-router-dom';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/transactions': 'Transactions',
  '/transactions/new': 'Add Transaction',
  '/budgets': 'Budget Management',
  '/reports': 'Reports & History',
  '/profile': 'My Profile',
  '/profile/change-password': 'Change Password',
  '/admin': 'Admin Dashboard',
  '/admin/users': 'User Management',
  '/admin/categories': 'Category Management',
};

export default function Header({ onMenuToggle }) {
  const location = useLocation();
  const title = Object.entries(pageTitles).find(([path]) =>
    location.pathname === path || location.pathname.startsWith(path + '/')
  )?.[1] || 'FinanceTrack';

  return (
    <header className="app-header">
      <button className="menu-btn" onClick={onMenuToggle} aria-label="Toggle menu">
        <span /><span /><span />
      </button>
      <h1 className="header-title">{title}</h1>
      <div className="header-right">
        <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
        </span>
      </div>
      <style>{`
        .app-header {
          height: var(--header-height); background: var(--white);
          border-bottom: 1px solid var(--gray-100); padding: 0 24px;
          display: flex; align-items: center; gap: 16px;
          position: sticky; top: 0; z-index: 50;
          box-shadow: 0 1px 4px rgba(0,0,0,0.05);
        }
        .menu-btn {
          display: none; flex-direction: column; gap: 5px;
          background: none; border: none; padding: 6px; cursor: pointer;
        }
        .menu-btn span { display: block; width: 22px; height: 2px; background: var(--gray-600); border-radius: 2px; }
        .header-title { font-size: 1.1rem; font-weight: 600; color: var(--gray-900); flex: 1; }
        .header-right { margin-left: auto; }
        @media (max-width: 768px) {
          .menu-btn { display: flex; }
          .app-header { padding: 0 16px; }
        }
      `}</style>
    </header>
  );
}
