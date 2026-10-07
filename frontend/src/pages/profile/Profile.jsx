import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Calendar, Shield, Edit2, Save, X, Lock, ChevronRight } from 'lucide-react';
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

  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

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
      toast.success('Profile updated successfully');
      setEditing(false);
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setLoading(false); }
  };

  const cancelEdit = () => { setEditing(false); setForm({ fullName: user?.fullName || '' }); setErrors({}); };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', animation: 'fadeIn 0.3s ease' }}>

      {/* Profile Header Card */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="prof-banner" />
        <div className="card-body" style={{ paddingTop: 0 }}>
          <div className="prof-header">
            <div className="prof-avatar">{initials}</div>
            <div style={{ flex: 1, minWidth: 0, marginTop: 8 }}>
              <h2 className="prof-name">{user?.fullName}</h2>
              <p className="prof-email">{user?.email}</p>
              <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                <span className={`badge ${user?.role === 'ADMIN' ? 'badge-warning' : 'badge-primary'}`}>
                  <Shield size={10} /> {user?.role}
                </span>
                <span className={`badge ${user?.active ? 'badge-success' : 'badge-danger'}`}>
                  {user?.active ? '● Active' : '● Inactive'}
                </span>
              </div>
            </div>
            {!editing && (
              <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)} style={{ gap: 6, alignSelf: 'flex-start', marginTop: 8 }}>
                <Edit2 size={13} /> Edit Profile
              </button>
            )}
          </div>

          {/* Info Grid */}
          {!editing && (
            <div className="prof-info-grid">
              <div className="prof-info-item">
                <div className="prof-info-label"><User size={13} /> Full Name</div>
                <div className="prof-info-val">{user?.fullName}</div>
              </div>
              <div className="prof-info-item">
                <div className="prof-info-label"><Mail size={13} /> Email Address</div>
                <div className="prof-info-val">{user?.email}</div>
              </div>
              <div className="prof-info-item">
                <div className="prof-info-label"><Calendar size={13} /> Member Since</div>
                <div className="prof-info-val">{formatDate(user?.createdAt)}</div>
              </div>
              <div className="prof-info-item">
                <div className="prof-info-label"><Shield size={13} /> Account Role</div>
                <div className="prof-info-val">{user?.role}</div>
              </div>
            </div>
          )}

          {/* Edit Form */}
          {editing && (
            <form onSubmit={handleSubmit} noValidate style={{ marginTop: 20 }}>
              <div className="form-group">
                <label className="form-label">Full name *</label>
                <input type="text" className={`form-control ${errors.fullName ? 'error' : ''}`}
                  value={form.fullName} onChange={e => { setForm(p => ({ ...p, fullName: e.target.value })); setErrors({}); }} />
                {errors.fullName && <div className="form-error">{errors.fullName}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Email address</label>
                <input type="email" className="form-control" value={user?.email} disabled />
                <div className="form-hint">Email address cannot be changed.</div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={cancelEdit} style={{ gap: 6 }}>
                  <X size={14} /> Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ gap: 6 }}>
                  {loading ? <><span className="spinner" style={{ width: 15, height: 15, borderWidth: 2 }} />Saving...</> : <><Save size={14} />Save Changes</>}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Security Card */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="section-title">Security</div>
            <div className="section-subtitle">Manage your account security</div>
          </div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <Link to="/profile/change-password" className="prof-security-link">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lock size={16} color="var(--gray-600)" />
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-800)' }}>Change Password</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>Update your account password</div>
              </div>
            </div>
            <ChevronRight size={16} color="var(--gray-300)" />
          </Link>
        </div>
      </div>

      <style>{`
        .prof-banner { height: 100px; background: linear-gradient(135deg, var(--navy) 0%, #1e3a6e 50%, #0d9488 100%); border-radius: var(--radius-md) var(--radius-md) 0 0; }
        .prof-header { display: flex; align-items: flex-end; gap: 16px; margin-top: -32px; margin-bottom: 20px; flex-wrap: wrap; }
        .prof-avatar { width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, var(--blue), #818cf8); display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 1.4rem; color: white; letter-spacing: -0.02em; border: 4px solid white; flex-shrink: 0; box-shadow: var(--shadow); }
        .prof-name { font-size: 1.2rem; font-weight: 800; color: var(--gray-900); letter-spacing: -0.03em; margin-bottom: 2px; }
        .prof-email { font-size: 0.875rem; color: var(--gray-400); }
        .prof-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding-top: 20px; border-top: 1px solid var(--gray-100); }
        .prof-info-item { padding: 14px; background: var(--gray-25); border-radius: var(--radius); }
        .prof-info-label { display: flex; align-items: center; gap: 5px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--gray-400); margin-bottom: 5px; }
        .prof-info-val { font-size: 0.875rem; font-weight: 600; color: var(--gray-800); }
        .prof-security-link { display: flex; align-items: center; justify-content: space-between; padding: 16px 24px; text-decoration: none; transition: background var(--t-fast); }
        .prof-security-link:hover { background: var(--gray-25); }

        @media (max-width: 600px) {
          .prof-info-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
