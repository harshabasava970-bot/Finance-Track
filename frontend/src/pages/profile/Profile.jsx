import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Calendar, Shield, Edit2, Save, X, Lock, ChevronRight, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from '../../api/auth';
import { formatDate, getErrorMessage } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [form, setForm]       = useState({ fullName: user?.fullName || '' });
  const [errors, setErrors]   = useState({});
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

  const cancelEdit = () => {
    setEditing(false);
    setForm({ fullName: user?.fullName || '' });
    setErrors({});
  };

  return (
    <div style={{ maxWidth:700, margin:'0 auto' }} className="fade-in">

      {/* Profile header card */}
      <div className="card" style={{ marginBottom:20 }}>
        {/* Banner */}
        <div className="prof-banner">
          <div className="prof-banner-pattern" />
        </div>

        <div className="card-body" style={{ paddingTop:0 }}>
          <div className="prof-header">
            <div className="prof-avatar">{initials}</div>
            <div style={{ flex:1, minWidth:0, marginTop:8 }}>
              <h2 className="prof-name">{user?.fullName}</h2>
              <p className="prof-email">{user?.email}</p>
              <div style={{ display:'flex', gap:8, marginTop:10, flexWrap:'wrap' }}>
                <span className={`badge ${user?.role === 'ADMIN' ? 'badge-warning' : 'badge-primary'}`}>
                  <Shield size={10} /> {user?.role}
                </span>
                <span className={`badge ${user?.active ? 'badge-success' : 'badge-danger'}`}>
                  {user?.active ? '● Active' : '● Inactive'}
                </span>
              </div>
            </div>
            {!editing && (
              <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}
                style={{ gap:6, alignSelf:'flex-start', marginTop:8 }}>
                <Edit2 size={13} /> Edit Profile
              </button>
            )}
          </div>

          {/* Info grid */}
          {!editing && (
            <div className="prof-info-grid">
              {[
                { icon:<User size={13} />,     label:'Full Name',     val:user?.fullName          },
                { icon:<Mail size={13} />,     label:'Email Address', val:user?.email             },
                { icon:<Calendar size={13} />, label:'Member Since',  val:formatDate(user?.createdAt) },
                { icon:<Shield size={13} />,   label:'Account Role',  val:user?.role              },
              ].map(({ icon, label, val }) => (
                <div key={label} className="prof-info-item">
                  <div className="prof-info-label">{icon} {label}</div>
                  <div className="prof-info-val">{val}</div>
                </div>
              ))}
            </div>
          )}

          {/* Edit form */}
          {editing && (
            <form onSubmit={handleSubmit} noValidate style={{ marginTop:24 }}>
              <div className="form-group">
                <label className="form-label">Full name *</label>
                <div className="input-group">
                  <User size={15} className="input-icon" />
                  <input type="text" className={`form-control ${errors.fullName ? 'error' : ''}`}
                    value={form.fullName}
                    onChange={e => { setForm(p => ({ ...p, fullName:e.target.value })); setErrors({}); }} />
                </div>
                {errors.fullName && <div className="form-error">{errors.fullName}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Email address</label>
                <div className="input-group">
                  <Mail size={15} className="input-icon" />
                  <input type="email" className="form-control" value={user?.email} disabled />
                </div>
                <div className="form-hint">Email address cannot be changed.</div>
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <button type="button" className="btn btn-secondary" onClick={cancelEdit} style={{ gap:6 }}>
                  <X size={14} /> Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ gap:6 }}>
                  {loading
                    ? <><span className="spinner" style={{ width:15, height:15, borderWidth:2 }} />Saving…</>
                    : <><Save size={14} />Save Changes</>
                  }
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Security card */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="section-title">Security</div>
            <div className="section-subtitle">Manage your account security</div>
          </div>
        </div>
        <div className="card-body" style={{ padding:0 }}>
          <Link to="/profile/change-password" className="prof-security-link">
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:38, height:38, borderRadius:10, background:'var(--primary-light)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Lock size={16} color="var(--primary)" />
              </div>
              <div>
                <div style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--charcoal-700)' }}>Change Password</div>
                <div style={{ fontSize:'0.78rem', color:'var(--cream-500)' }}>Update your account password</div>
              </div>
            </div>
            <ChevronRight size={16} color="var(--cream-300)" />
          </Link>
        </div>
      </div>

      <style>{`
        .prof-banner {
          height:110px;
          background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 55%, #4CAF85 100%);
          border-radius:var(--radius-md) var(--radius-md) 0 0;
          position:relative; overflow:hidden;
        }
        .prof-banner-pattern {
          position:absolute; inset:0;
          background-image: repeating-linear-gradient(
            45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px,
            transparent 1px, transparent 20px
          );
        }
        .prof-header     { display:flex; align-items:flex-end; gap:16px; margin-top:-36px; margin-bottom:20px; flex-wrap:wrap; }
        .prof-avatar     {
          width:76px; height:76px; border-radius:50%;
          background:linear-gradient(135deg, var(--primary), #4CAF85);
          display:flex; align-items:center; justify-content:center;
          font-weight:900; font-size:1.5rem; color:white; letter-spacing:-0.02em;
          border:4px solid white; flex-shrink:0; box-shadow:var(--shadow-md);
        }
        .prof-name  { font-size:1.25rem; font-weight:800; color:var(--charcoal); letter-spacing:-0.03em; margin-bottom:3px; }
        .prof-email { font-size:0.875rem; color:var(--cream-500); }

        .prof-info-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; padding-top:20px; border-top:1px solid var(--cream-100); }
        .prof-info-item { padding:14px 16px; background:var(--cream-50); border-radius:var(--radius); border:1px solid var(--cream-100); }
        .prof-info-label { display:flex; align-items:center; gap:5px; font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:var(--cream-500); margin-bottom:6px; }
        .prof-info-val   { font-size:0.875rem; font-weight:600; color:var(--charcoal-700); }

        .prof-security-link {
          display:flex; align-items:center; justify-content:space-between;
          padding:16px 24px; text-decoration:none;
          transition:background var(--t-fast);
        }
        .prof-security-link:hover { background:var(--cream-25); }

        @media (max-width:600px) {
          .prof-info-grid { grid-template-columns:1fr; }
          .prof-header    { flex-direction:column; align-items:flex-start; }
        }
      `}</style>
    </div>
  );
}
