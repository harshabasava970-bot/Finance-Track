import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, CreditCard, Tag, Shield, ChevronRight } from 'lucide-react';
import { getAdminStats, getAdminUsers } from '../../api/admin';
import { formatDate } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([getAdminStats(), getAdminUsers()]);
        setStats(statsRes.data.data);
        setRecentUsers(usersRes.data.data.slice(0, 5));
      } catch { toast.error('Failed to load admin data'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">System overview and management</p>
        </div>
        <span className="badge badge-navy" style={{ padding: '7px 14px', fontSize: '0.78rem' }}>
          <Shield size={12} /> Admin Panel
        </span>
      </div>

      <div className="db-stat-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eff6ff' }}><Users size={20} color="var(--blue)" /></div>
          <div className="stat-label">Total Users</div>
          <div className="stat-value">{stats?.totalUsers ?? 0}</div>
          <div className="stat-sub"><Link to="/admin/users" style={{ color: 'var(--blue)', fontSize: '0.78rem', fontWeight: 600 }}>Manage users →</Link></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--income-bg)' }}><CreditCard size={20} color="var(--income)" /></div>
          <div className="stat-label">Total Transactions</div>
          <div className="stat-value">{stats?.totalTransactions ?? 0}</div>
          <div className="stat-sub">System-wide</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <div className="card">
          <div className="card-header">
            <div className="section-title">Recent Users</div>
            <Link to="/admin/users" className="btn btn-ghost btn-sm" style={{ gap: 4 }}>View all <ChevronRight size={13} /></Link>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <table className="table">
              <thead><tr><th>User</th><th>Role</th><th>Joined</th><th>Status</th></tr></thead>
              <tbody>
                {recentUsers.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--gray-800)' }}>{u.fullName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{u.email}</div>
                    </td>
                    <td><span className={`badge ${u.role === 'ADMIN' ? 'badge-warning' : 'badge-primary'}`}>{u.role}</span></td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>{formatDate(u.createdAt)}</td>
                    <td><span className={`badge ${u.active ? 'badge-success' : 'badge-danger'}`}>{u.active ? 'Active' : 'Inactive'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div className="section-title">Quick Actions</div></div>
          <div className="card-body" style={{ padding: 0 }}>
            {[
              { to: '/admin/users', icon: Users, label: 'Manage Users', sub: 'View & control accounts' },
              { to: '/admin/categories', icon: Tag, label: 'Manage Categories', sub: 'System categories' },
              { to: '/dashboard', icon: CreditCard, label: 'My Dashboard', sub: 'Personal view' },
            ].map(({ to, icon: Icon, label, sub }) => (
              <Link key={to} to={to} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderBottom: '1px solid var(--gray-50)', textDecoration: 'none', transition: 'background var(--t-fast)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-25)'}
                onMouseLeave={e => e.currentTarget.style.background = ''}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={16} color="var(--gray-600)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-800)' }}>{label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{sub}</div>
                </div>
                <ChevronRight size={14} color="var(--gray-300)" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .db-stat-grid { display: grid; gap: 18px; }
      `}</style>
    </div>
  );
}
