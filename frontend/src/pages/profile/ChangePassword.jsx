import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { changePassword } from '../../api/auth';
import { getErrorMessage } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function ChangePassword() {
  const navigate = useNavigate();
  const [form, setForm]     = useState({ currentPassword:'', newPassword:'', confirmPassword:'' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [show, setShow]     = useState({ current:false, new:false, confirm:false });

  const validate = () => {
    const e = {};
    if (!form.currentPassword) e.currentPassword = 'Current password is required';
    if (!form.newPassword) e.newPassword = 'New password is required';
    else if (form.newPassword.length < 8) e.newPassword = 'Must be at least 8 characters';
    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your new password';
    else if (form.newPassword !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const set = f => e => {
    setForm(p => ({ ...p, [f]:e.target.value }));
    setErrors(er => ({ ...er, [f]:'' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await changePassword(form);
      toast.success('Password changed successfully');
      navigate('/profile');
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setLoading(false); }
  };

  const fields = [
    { key:'currentPassword', label:'Current Password',      placeholder:'Your current password', showKey:'current' },
    { key:'newPassword',     label:'New Password',          placeholder:'Min. 8 characters',     showKey:'new'     },
    { key:'confirmPassword', label:'Confirm New Password',  placeholder:'Re-enter new password', showKey:'confirm' },
  ];

  return (
    <div style={{ maxWidth:500, margin:'0 auto' }} className="fade-in">
      <Link to="/profile" className="btn btn-ghost btn-sm" style={{ gap:6, marginBottom:20, color:'var(--cream-500)' }}>
        <ArrowLeft size={15} /> Back to Profile
      </Link>

      <div className="card">
        <div className="card-header">
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:42, height:42, borderRadius:11, background:'var(--primary-light)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <ShieldCheck size={20} color="var(--primary)" />
            </div>
            <div>
              <div className="section-title">Change Password</div>
              <div className="section-subtitle">Use a strong, unique password</div>
            </div>
          </div>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit} noValidate>
            {fields.map(({ key, label, placeholder, showKey }) => (
              <div className="form-group" key={key}>
                <label className="form-label">{label} *</label>
                <div className="input-group">
                  <Lock size={15} className="input-icon" />
                  <input
                    type={show[showKey] ? 'text' : 'password'}
                    className={`form-control ${errors[key] ? 'error' : ''}`}
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={set(key)}
                    style={{ paddingRight:44 }}
                  />
                  <button type="button"
                    style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', padding:4, color:'var(--cream-400)', display:'flex', alignItems:'center', borderRadius:4 }}
                    onClick={() => setShow(s => ({ ...s, [showKey]:!s[showKey] }))}
                    aria-label={show[showKey] ? 'Hide password' : 'Show password'}>
                    {show[showKey] ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors[key] && <div className="form-error">{errors[key]}</div>}
              </div>
            ))}

            <div className="alert alert-info" style={{ marginTop:4 }}>
              <ShieldCheck size={14} />
              <div style={{ fontSize:'0.8rem' }}>
                Use at least 8 characters with a mix of letters, numbers, and symbols for a strong password.
              </div>
            </div>

            <div style={{ display:'flex', gap:10, marginTop:22 }}>
              <button type="button" className="btn btn-secondary" style={{ flex:1 }}
                onClick={() => navigate('/profile')}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ flex:2, gap:8 }} disabled={loading}>
                {loading
                  ? <><span className="spinner" style={{ width:15, height:15, borderWidth:2 }} />Changing…</>
                  : 'Change Password'
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
