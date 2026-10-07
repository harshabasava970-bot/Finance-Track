import { useLocation, Link } from 'react-router-dom';
import { Menu, Bell, ChevronDown, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const pageTitles = {
  '/dashboard': { title: 'Dashboard', sub: 'Your financial overview' },
  '/transactions': { title: 'Transactions', sub: 'Track every rupee' },
  '/transactions/new': { title: 'Add Transaction', sub: 'Record income or expense' },
  '/budgets': { title: 'Budgets', sub: 'Set and track spending limits' },
  '/reports': { title: 'Reports', sub: 'Analytics and insights' },
  '/profile': { title: 'Profile', sub: 'Manage your account' },
  '/profile/change-password': { title: 'Change Password', sub: 'Keep your account secure' },
  '/admin': { title: 'Admin Dashboard', sub: 'System overview' },
  '/admin/users': { title: 'User Management', sub: 'Manage registered users' },
  '/admin/categories': { title: 'Category Management', sub: 'Manage transaction categories' },
};

export default function Header({ onMenuToggle }) {
  const { user } = useAuth();
  const location = useLocation();

  const matched = Object.entries(pageTitles).find(([path]) =>
    location.pathname === path || location.pathname.startsWith(path + '/')
  );
  const meta = matched?.[1] || { title: 'FinanceTrack', sub: '' };

  const isEditPage = location.pathname.startsWith('/transactions/edit/');
  const displayTitle = isEditPage ? 'Edit Transaction' : meta.title;

  return (
    <header className="app-header">
      <button className="hdr-menu-btn" onClick={onMenuToggle} aria-label="Toggle menu">
        <Menu size={20} strokeWidth={2} />
      </button>

      <div className="hdr-page-info">
        <h1 className="hdr-title">{displayTitle}</h1>
        {meta.sub && <p className="hdr-sub">{meta.sub}</p>}
      </div>

      <div className="hdr-actions">
        {location.pathname === '/transactions' && (
          <Link to="/transactions/new" className="btn btn-primary btn-sm hdr-add-btn">
            <Plus size={14} strokeWidth={2.5} />
            <span>Add</span>
          </Link>
        )}
        <div className="hdr-user">
          <div className="hdr-avatar">
            {user?.fullName?.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>
      </div>

      <style>{`
        .app-header {
          height: var(--header-height);
          background: var(--white);
          border-bottom: 1px solid var(--gray-100);
          padding: 0 28px;
          display: flex; align-items: center; gap: 16px;
          position: sticky; top: 0; z-index: 100;
          box-shadow: 0 1px 0 var(--gray-100);
        }
        .hdr-menu-btn {
          display: none; background: none; border: none;
          color: var(--gray-500); padding: 7px; border-radius: var(--radius-sm);
          cursor: pointer; transition: all var(--t-fast); flex-shrink: 0;
        }
        .hdr-menu-btn:hover { background: var(--gray-100); color: var(--gray-800); }
        .hdr-page-info { flex: 1; min-width: 0; }
        .hdr-title {
          font-size: 1rem; font-weight: 700; color: var(--gray-900);
          letter-spacing: -0.02em; line-height: 1.2;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .hdr-sub { font-size: 0.72rem; color: var(--gray-400); margin-top: 1px; }
        .hdr-actions { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
        .hdr-add-btn { gap: 5px; }
        .hdr-user { cursor: pointer; }
        .hdr-avatar {
          width: 34px; height: 34px; border-radius: 50%;
          background: linear-gradient(135deg, var(--blue), #818cf8);
          display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: 0.8rem; color: white; letter-spacing: 0.02em;
        }
        @media (max-width: 768px) {
          .app-header { padding: 0 16px; }
          .hdr-menu-btn { display: flex; }
          .hdr-sub { display: none; }
        }
      `}</style>
    </header>
  );
}
