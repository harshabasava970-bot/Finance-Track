import { useState, useEffect } from 'react';
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
    try {
      const res = await getAdminUsers();
      setUsers(res.data.data);
    } catch { toast.error('Failed to load users'); }
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
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">{users.length} registered users</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ padding: '16px 20px' }}>
          <input type="text" className="form-control" style={{ maxWidth: 300 }}
            placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
          <span style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>{filtered.length} results</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
            <EmptyState icon="👥" title="No users found" message="No users match your search." />
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => (
                    <tr key={u.id}>
                      <td style={{ color: 'var(--gray-400)', fontSize: '0.8rem' }}>#{u.id}</td>
                      <td style={{ fontWeight: 600, fontSize: '0.875rem' }}>{u.fullName}</td>
                      <td style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>{u.email}</td>
                      <td><span className={`badge badge-${u.role === 'ADMIN' ? 'warning' : 'primary'}`}>{u.role}</span></td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{formatDate(u.createdAt)}</td>
                      <td><span className={`badge badge-${u.active ? 'success' : 'danger'}`}>{u.active ? 'Active' : 'Inactive'}</span></td>
                      <td style={{ textAlign: 'center' }}>
                        {u.role !== 'ADMIN' && (
                          <button className={`btn btn-sm ${u.active ? 'btn-outline-danger' : 'btn-success'}`}
                            onClick={() => setToggleTarget(u)}>
                            {u.active ? 'Deactivate' : 'Activate'}
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
        confirmClass={`btn ${toggleTarget?.active ? 'btn-danger' : 'btn-success'}`} />
    </div>
  );
}
