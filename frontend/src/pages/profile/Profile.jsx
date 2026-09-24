import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from '../../api/auth';
import { formatDate, getErrorMessage } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({ fullName: user?.fullName || '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Name is required';
    else if (form.fullName.trim().length < 2) e.fullName = 'Name must be at least 2 characters';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await updateProfile({ fullName: form.fullName.trim() });
      await refreshUser();
      toast.success('Profile updated');
      setEditing(false);
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>
              {user?.fullName?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: 4 }}>{user?.fullName}</h2>
              <div style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>{user?.email}</div>
              <span className={`badge badge-${user?.role === 'ADMIN' ? 'warning' : 'primary'}`} style={{ marginTop: 6 }}>
                {user?.role}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24, padding: 16, background: 'var(--gray-50)', borderRadius: 10 }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Member Since</div>
              <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{formatDate(user?.createdAt)}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Account Status</div>
              <span className={`badge badge-${user?.active ? 'success' : 'danger'}`}>{user?.active ? 'Active' : 'Inactive'}</span>
            </div>
          </div>

          {!editing ? (
            <button className="btn btn-primary" onClick={() => setEditing(true)}>Edit Profile</button>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input type="text" className={`form-control ${errors.fullName ? 'error' : ''}`}
                  value={form.fullName} onChange={e => { setForm(f => ({ ...f, fullName: e.target.value })); setErrors({}); }} />
                {errors.fullName && <div className="form-error">{errors.fullName}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-control" value={user?.email} disabled />
                <div className="form-hint">Email cannot be changed.</div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setEditing(false); setForm({ fullName: user?.fullName || '' }); setErrors({}); }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>Security</h3>
          <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', marginBottom: 16 }}>
            Keep your account secure by using a strong, unique password.
          </p>
          <Link to="/profile/change-password" className="btn btn-secondary">Change Password</Link>
        </div>
      </div>
    </div>
  );
}
