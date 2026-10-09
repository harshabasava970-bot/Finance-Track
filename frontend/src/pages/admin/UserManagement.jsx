import { useState, useEffect } from 'react';
import { Search, UserCheck, UserX, Filter } from 'lucide-react';
import { getAdminUsers, toggleUserActive } from '../../api/admin';
import { formatDate, getErrorMessage } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import toast from 'react-hot-toast';

const PAGE_SIZE = 10;

export default function UserManagement() {
  const [users, setUsers]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [roleFilter, setRoleFilter]   = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage]               = useState(0);
  const [toggleTarget, setToggleTarget] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    try { const res = await getAdminUsers(); setUsers(res.data.data); }
    catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadUsers(); }, []);
  // Reset page when filters change
  useEffect(() => { setPage(0); }, [search, roleFilter, statusFilter]);

  const handleToggle = async () => {
    try {
      await toggleUserActive(toggleTarget.id);
      toast.success(`User ${toggleTarget.active ? 'deactivated' : 'activated'}`);
      setToggleTarget(null);
      loadUsers();
    } catch (err) { toast.error(getErrorMessage(err)); }
  };

  // Filter logic
  const filtered = users.filter(u => {
    const matchSearch = !search ||
      u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole   = !roleFilter   || u.role === roleFilter;
    const matchStatus = statusFilter === '' ? true
      : statusFilter === 'active'   ? u.active === true
      : u.active === false;
    return matchSearch && matchRole && matchStatus;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">{users.length} registered users</p>
        </div>
      </div>

      <div className="card">
        {/* Search + filters */}
        <div className="card-header" style={{ flexWrap:'wrap', gap:12 }}>
          <div className="input-group" style={{ flex:'2 1 200px', maxWidth:340 }}>
            <Search size={15} className="input-icon" />
            <input type="text" className="form-control" placeholder="Search by name or email…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
            <div className="filter-group" style={{ flexDirection:'row', alignItems:'center', gap:6, marginBottom:0 }}>
              <Filter size={13} color="var(--cream-500)" />
              <select className="form-control btn-sm" style={{ width:'auto', minWidth:110 }}
                value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                <option value="">All roles</option>
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <select className="form-control btn-sm" style={{ width:'auto', minWidth:110 }}
              value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <span style={{ fontSize:'0.8rem', color:'var(--cream-500)', marginLeft:'auto', whiteSpace:'nowrap' }}>
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="card-body" style={{ padding:0 }}>
          {loading ? <LoadingSpinner /> : paginated.length === 0 ? (
            <EmptyState icon="👥" title="No users found" message="No users match your search or filters." />
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>User</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Status</th>
                    <th style={{ textAlign:'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(u => (
                    <tr key={u.id}>
                      <td style={{ color:'var(--cream-400)', fontSize:'0.78rem' }}>#{u.id}</td>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div className="um-avatar">{u.fullName?.charAt(0).toUpperCase()}</div>
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
                      <td style={{ textAlign:'center' }}>
                        {u.role !== 'ADMIN' && (
                          <button className={`btn btn-sm ${u.active ? 'btn-outline-danger' : 'btn-outline-primary'}`}
                            style={{ gap:5 }} onClick={() => setToggleTarget(u)}>
                            {u.active
                              ? <><UserX size={13} />Deactivate</>
                              : <><UserCheck size={13} />Activate</>
                            }
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

        {/* Pagination */}
        {!loading && filtered.length > PAGE_SIZE && (
          <div className="card-footer" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
            <span style={{ fontSize:'0.8rem', color:'var(--cream-500)' }}>
              Page {page + 1} of {totalPages} · {filtered.length} users
            </span>
            <div className="pagination">
              <button disabled={page === 0} onClick={() => setPage(0)}>«</button>
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)}>‹</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
                return (
                  <button key={p} className={page === p ? 'active' : ''} onClick={() => setPage(p)}>
                    {p + 1}
                  </button>
                );
              })}
              <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>›</button>
              <button disabled={page >= totalPages - 1} onClick={() => setPage(totalPages - 1)}>»</button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog isOpen={!!toggleTarget}
        title={toggleTarget?.active ? 'Deactivate User' : 'Activate User'}
        message={`Are you sure you want to ${toggleTarget?.active ? 'deactivate' : 'activate'} ${toggleTarget?.fullName}?`}
        onConfirm={handleToggle} onCancel={() => setToggleTarget(null)}
        confirmText={toggleTarget?.active ? 'Deactivate' : 'Activate'}
        confirmClass={`btn ${toggleTarget?.active ? 'btn-danger' : 'btn-primary'}`} />

      <style>{`
        .um-avatar {
          width:34px; height:34px; border-radius:50%;
          background:linear-gradient(135deg, var(--primary), #4CAF85);
          display:flex; align-items:center; justify-content:center;
          color:white; font-size:0.78rem; font-weight:800; flex-shrink:0;
        }
        @media (max-width:640px) {
          .table th:nth-child(4), .table td:nth-child(4) { display:none; }
        }
        @media (max-width:480px) {
          .table th:nth-child(1), .table td:nth-child(1) { display:none; }
        }
      `}</style>
    </div>
  );
}
