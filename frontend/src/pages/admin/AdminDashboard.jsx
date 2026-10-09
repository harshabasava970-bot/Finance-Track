import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, CreditCard, Tag, Shield, ChevronRight, Activity } from 'lucide-react';
import { getAdminStats, getAdminUsers } from '../../api/admin';
import { formatDate } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats]           = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([getAdminStats(), getAdminUsers()]);
        setStats(statsRes.data.data);
        setRecentUsers(usersRes.data.data.slice(0, 6));
      } catch { toast.error('Failed to load admin data'); }
      finally   { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">System overview and management</p>
        </div>
        <span className="badge badge-navy" style={{ padding:'7px 14px', fontSize:'0.78rem', display:'flex', alignItems:'center', gap:5 }}>
          <Shield size={12} /> Admin Panel
        </span>
      </div>

      {/* Stat cards */}
      <div className="adm-stat-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background:'var(--primary-light)' }}>
            <Users size={20} color="var(--primary)" />
          </div>
          <div className="stat-label">Total Users</div>
          <div className="stat-value">{stats?.totalUsers ?? 0}</div>
          <div className="stat-sub">
            <Link to="/admin/users" style={{ color:'var(--primary)', fontSize:'0.78rem', fontWeight:600 }}>
              Manage users →
            </Link>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background:'var(--income-bg)' }}>
            <CreditCard size={20} color="var(--income)" />
          </div>
          <div className="stat-label">Total Transactions</div>
          <div className="stat-value">{stats?.totalTransactions ?? 0}</div>
          <div className="stat-sub">System-wide</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background:'var(--terracotta-bg)' }}>
            <Tag size={20} color="var(--terracotta)" />
          </div>
          <div className="stat-label">Categories</div>
          <div className="stat-value">{stats?.totalCategories ?? '—'}</div>
          <div className="stat-sub">
            <Link to="/admin/categories" style={{ color:'var(--terracotta)', fontSize:'0.78rem', fontWeight:600 }}>
              Manage →
            </Link>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background:'var(--cream-100)' }}>
            <Activity size={20} color="var(--cream-600)" />
          </div>
          <div className="stat-label">Active Users</div>
          <div className="stat-value">{stats?.activeUsers ?? '—'}</div>
          <div className="stat-sub">Currently active</div>
        </div>
      </div>

      {/* Content row */}
      <div className="adm-content-row">
        {/* Recent users table */}
        <div className="card">
          <div className="card-header">
            <div className="section-title">Recent Users</div>
            <Link to="/admin/users" className="btn btn-ghost btn-sm" style={{ gap:4 }}>
              View all <ChevronRight size={13} />
            </Link>
          </div>
          <div className="card-body" style={{ padding:0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div className="adm-user-avatar">{u.fullName?.charAt(0).toUpperCase()}</div>
                        <div>
                          <div style={{ fontWeight:600, fontSize:'0.875rem', color:'var(--charcoal-700)' }}>{u.fullName}</div>
                          <div style={{ fontSize:'0.75rem', color:'var(--cream-500)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${u.role === 'ADMIN' ? 'badge-warning' : 'badge-primary'}`}>{u.role}</span>
                    </td>
                    <td style={{ fontSize:'0.8rem', color:'var(--cream-500)' }}>{formatDate(u.createdAt)}</td>
                    <td>
                      <span className={`badge ${u.active ? 'badge-success' : 'badge-danger'}`}>
                        {u.active ? '● Active' : '● Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick actions */}
        <div className="card">
          <div className="card-header">
            <div className="section-title">Quick Actions</div>
          </div>
          <div className="card-body" style={{ padding:0 }}>
            {[
              { to:'/admin/users',      icon:Users,      iconBg:'var(--primary-light)', iconColor:'var(--primary)',    label:'Manage Users',      sub:'View & control accounts'  },
              { to:'/admin/categories', icon:Tag,        iconBg:'var(--terracotta-bg)', iconColor:'var(--terracotta)', label:'Manage Categories', sub:'System transaction categories' },
              { to:'/dashboard',        icon:CreditCard, iconBg:'var(--income-bg)',     iconColor:'var(--income)',     label:'My Dashboard',      sub:'Switch to personal view'  },
            ].map(({ to, icon:Icon, iconBg, iconColor, label, sub }) => (
              <Link key={to} to={to} className="adm-quick-link">
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:38, height:38, borderRadius:10, background:iconBg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Icon size={16} color={iconColor} />
                  </div>
                  <div>
                    <div style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--charcoal-700)' }}>{label}</div>
                    <div style={{ fontSize:'0.75rem', color:'var(--cream-500)' }}>{sub}</div>
                  </div>
                </div>
                <ChevronRight size={14} color="var(--cream-300)" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .adm-stat-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:18px; margin-bottom:24px; }

        .adm-content-row { display:grid; grid-template-columns:2fr 1fr; gap:20px; }

        .adm-user-avatar {
          width:34px; height:34px; border-radius:50%;
          background:linear-gradient(135deg, var(--primary), #4CAF85);
          display:flex; align-items:center; justify-content:center;
          color:white; font-size:0.78rem; font-weight:800; flex-shrink:0;
        }

        .adm-quick-link {
          display:flex; align-items:center; justify-content:space-between;
          padding:14px 20px; text-decoration:none;
          border-bottom:1px solid var(--cream-50);
          transition:background var(--t-fast);
        }
        .adm-quick-link:last-child { border-bottom:none; }
        .adm-quick-link:hover { background:var(--cream-25); }

        @media (max-width:1100px) {
          .adm-stat-grid { grid-template-columns:repeat(2,1fr); }
        }
        @media (max-width:800px) {
          .adm-content-row { grid-template-columns:1fr; }
        }
        @media (max-width:540px) {
          .adm-stat-grid { grid-template-columns:1fr 1fr; }
        }
      `}</style>
    </div>
  );
}
