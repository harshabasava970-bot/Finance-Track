import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, Mail, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required';
    else if (form.fullName.trim().length < 2) e.fullName = 'Name must be at least 2 characters';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email format';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Must be at least 8 characters';
    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const set = f => e => { setForm(p => ({ ...p, [f]: e.target.value })); setErrors(p => ({ ...p, [f]: '' })); };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setLoading(false); }
  };

  const pwStrength = form.password.length >= 8 && /[A-Z]/.test(form.password) && /[0-9]/.test(form.password);

  return (
    <div className="auth-page">
      <div className="auth-split-left">
        <img
          src="https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&q=80&auto=format&fit=crop"
          alt="Financial growth"
          className="auth-bg-img"
          onError={e => e.target.style.display = 'none'}
        />
        <div className="auth-split-overlay">
          <div className="auth-split-brand">
            <div className="auth-split-logo"><TrendingUp size={20} strokeWidth={2.5} /></div>
            <span>FinanceTrack</span>
          </div>
          <div className="auth-split-features">
            {['Track all income & expenses','Set smart monthly budgets','Visual analytics & reports','Secure JWT authentication'].map(f => (
              <div key={f} className="auth-split-feat">
                <CheckCircle2 size={16} color="#34d399" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-split-right">
        <div className="auth-form-wrap">
          <div className="auth-form-header">
            <div className="auth-logo-sm">
              <div className="auth-logo-icon"><TrendingUp size={16} strokeWidth={2.5} /></div>
              <span>FinanceTrack</span>
            </div>
            <h1 className="auth-title">Create your account</h1>
            <p className="auth-subtitle">Start managing your finances today — free forever</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label">Full name</label>
              <div className="input-group">
                <User size={16} className="input-icon" />
                <input type="text" className={`form-control ${errors.fullName ? 'error' : ''}`}
                  placeholder="John Doe" value={form.fullName} onChange={set('fullName')} autoComplete="name" />
              </div>
              {errors.fullName && <div className="form-error">{errors.fullName}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Email address</label>
              <div className="input-group">
                <Mail size={16} className="input-icon" />
                <input type="email" className={`form-control ${errors.email ? 'error' : ''}`}
                  placeholder="you@example.com" value={form.email} onChange={set('email')} autoComplete="email" />
              </div>
              {errors.email && <div className="form-error">{errors.email}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-group">
                <Lock size={16} className="input-icon" />
                <input type={showPass ? 'text' : 'password'} className={`form-control ${errors.password ? 'error' : ''}`}
                  placeholder="Min. 8 characters" value={form.password} onChange={set('password')} autoComplete="new-password"
                  style={{ paddingRight: 42 }} />
                <button type="button" className="input-icon-right" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }} onClick={() => setShowPass(v => !v)}>
                  {showPass ? <EyeOff size={16} color="var(--gray-400)" /> : <Eye size={16} color="var(--gray-400)" />}
                </button>
              </div>
              {form.password.length > 0 && (
                <div className="pw-strength">
                  <div className="pw-bar"><div className={`pw-fill ${form.password.length >= 8 ? (pwStrength ? 'pw-strong' : 'pw-medium') : 'pw-weak'}`} /></div>
                  <span>{form.password.length < 8 ? 'Too short' : pwStrength ? 'Strong' : 'Add uppercase & number'}</span>
                </div>
              )}
              {errors.password && <div className="form-error">{errors.password}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm password</label>
              <div className="input-group">
                <Lock size={16} className="input-icon" />
                <input type="password" className={`form-control ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="Re-enter password" value={form.confirmPassword} onChange={set('confirmPassword')} autoComplete="new-password" />
              </div>
              {errors.confirmPassword && <div className="form-error">{errors.confirmPassword}</div>}
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', justifyContent: 'center', gap: 8 }} disabled={loading}>
              {loading ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />Creating account...</> : <><span>Create Account</span><ArrowRight size={15} /></>}
            </button>
          </form>

          <p className="auth-footer-text">
            Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
          </p>
        </div>
      </div>

      <style>{`
        .auth-split-feat { display: flex; align-items: center; gap: 10px; color: rgba(255,255,255,0.85); font-size: 0.9rem; margin-bottom: 14px; font-weight: 500; }
        .auth-split-features { margin-bottom: 40px; }
        .pw-strength { display: flex; align-items: center; gap: 8px; margin-top: 7px; }
        .pw-bar { flex: 1; height: 4px; background: var(--gray-100); border-radius: 4px; overflow: hidden; }
        .pw-fill { height: 100%; border-radius: 4px; transition: all 0.3s; }
        .pw-weak { width: 33%; background: var(--expense); }
        .pw-medium { width: 66%; background: var(--warning); }
        .pw-strong { width: 100%; background: var(--income); }
        .pw-strength span { font-size: 0.75rem; color: var(--gray-400); white-space: nowrap; }
      `}</style>
    </div>
  );
}
