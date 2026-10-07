import { useState, useEffect } from 'react';
import { Search, UserCheck, UserX } from 'lucide-react';
import { getAdminUsers, toggleUserActive } from '../../api/admin';
import { formatDate, getErrorMessage } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import toast from 'react-hot-toast';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toggleTarget, setToggleTarget] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    try { const res = await getAdminUsers(); setUsers(res.data.data); }
    catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadUsers(); }, []);

  const handleToggle = async () => {
    try {
      await toggleUserActive(toggleTarget.id);
      toast.success(`User ${toggleTarget.active ? 'deactivated' : 'activated'}`);
      setToggleTarget(null);
      loadUsers();
    } catch (err) { toast.error(getErrorMessage(err)); }
  };

  const filtered = users.filter(u =>
    u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">{users.length} registered users</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ gap: 16 }}>
          <div className="input-group" style={{ maxWidth: 320 }}>
            <Search size={15} className="input-icon" />
            <input type="text" className="form-control" placeholder="Search by name or email..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--gray-400)', marginLeft: 'auto' }}>{filtered.length} results</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
            <EmptyState icon="👥" title="No users found" message="No users match your search." />
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr><th>#</th><th>User</th><th>Role</th><th>Joined</th><th>Status</th><th style={{ textAlign: 'center' }}>Action</th></tr>
                </thead>
                <tbody>
                  {filtered.map(u => (
                    <tr key={u.id}>
                      <td style={{ color: 'var(--gray-300)', fontSize: '0.78rem' }}>#{u.id}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,var(--blue),#818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.72rem', fontWeight: 800, flexShrink: 0 }}>
                            {u.fullName?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--gray-800)' }}>{u.fullName}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className={`badge ${u.role === 'ADMIN' ? 'badge-warning' : 'badge-primary'}`}>{u.role}</span></td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>{formatDate(u.createdAt)}</td>
                      <td><span className={`badge ${u.active ? 'badge-success' : 'badge-danger'}`}>{u.active ? '● Active' : '● Inactive'}</span></td>
                      <td style={{ textAlign: 'center' }}>
                        {u.role !== 'ADMIN' && (
                          <button className={`btn btn-sm ${u.active ? 'btn-outline-danger' : 'btn-teal'}`}
                            style={{ gap: 5 }} onClick={() => setToggleTarget(u)}>
                            {u.active ? <><UserX size={13} />Deactivate</> : <><UserCheck size={13} />Activate</>}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog isOpen={!!toggleTarget}
        title={toggleTarget?.active ? 'Deactivate User' : 'Activate User'}
        message={`Are you sure you want to ${toggleTarget?.active ? 'deactivate' : 'activate'} ${toggleTarget?.fullName}?`}
        onConfirm={handleToggle} onCancel={() => setToggleTarget(null)}
        confirmText={toggleTarget?.active ? 'Deactivate' : 'Activate'}
        confirmClass={`btn ${toggleTarget?.active ? 'btn-danger' : 'btn-teal'}`} />
    </div>
  );
}
