import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">System overview and management</p>
        </div>
      </div>

      <div className="summary-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginBottom: 28 }}>
        <div className="summary-card">
          <div className="card-icon" style={{ background: '#dbeafe' }}>👥</div>
          <div className="card-label">Total Users</div>
          <div className="card-value">{stats?.totalUsers ?? 0}</div>
          <div className="card-sub"><Link to="/admin/users" style={{ color: 'var(--primary)', fontSize: '0.8rem' }}>Manage →</Link></div>
        </div>
        <div className="summary-card">
          <div className="card-icon" style={{ background: '#d1fae5' }}>💳</div>
          <div className="card-label">Total Transactions</div>
          <div className="card-value">{stats?.totalTransactions ?? 0}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Recent Users</h3>
            <Link to="/admin/users" style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>View all →</Link>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <table className="table">
              <thead><tr><th>Name</th><th>Role</th><th>Joined</th><th>Status</th></tr></thead>
              <tbody>
                {recentUsers.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{u.fullName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{u.email}</div>
                    </td>
                    <td><span className={`badge badge-${u.role === 'ADMIN' ? 'warning' : 'primary'}`}>{u.role}</span></td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{formatDate(u.createdAt)}</td>
                    <td><span className={`badge badge-${u.active ? 'success' : 'danger'}`}>{u.active ? 'Active' : 'Inactive'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Quick Actions</h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Link to="/admin/users" className="btn btn-secondary" style={{ justifyContent: 'flex-start', gap: 12 }}>
                <span>👥</span> Manage Users
              </Link>
              <Link to="/admin/categories" className="btn btn-secondary" style={{ justifyContent: 'flex-start', gap: 12 }}>
                <span>🏷️</span> Manage Categories
              </Link>
              <Link to="/dashboard" className="btn btn-secondary" style={{ justifyContent: 'flex-start', gap: 12 }}>
                <span>📊</span> View My Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
