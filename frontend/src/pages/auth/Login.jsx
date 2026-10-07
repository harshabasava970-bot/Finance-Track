import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) { navigate('/dashboard', { replace: true }); return null; }

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email format';
    if (!form.password) e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.fullName.split(' ')[0]}!`);
      navigate(user.role === 'ADMIN' ? '/admin' : '/dashboard', { replace: true });
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setLoading(false); }
  };

  const set = f => e => { setForm(p => ({ ...p, [f]: e.target.value })); setErrors(p => ({ ...p, [f]: '' })); };

  return (
    <div className="auth-page">
      <div className="auth-split-left">
        <img
          src="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80&auto=format&fit=crop"
          alt="Financial planning"
          className="auth-bg-img"
          onError={e => e.target.style.display = 'none'}
        />
        <div className="auth-split-overlay">
          <div className="auth-split-brand">
            <div className="auth-split-logo"><TrendingUp size={20} strokeWidth={2.5} /></div>
            <span>FinanceTrack</span>
          </div>
          <div className="auth-split-quote">
            <h2>"The secret to financial freedom begins with awareness."</h2>
            <p>Track every rupee, understand your habits, and build the future you want.</p>
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
            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-subtitle">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
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
                  placeholder="Your password" value={form.password} onChange={set('password')} autoComplete="current-password"
                  style={{ paddingRight: 42 }} />
                <button type="button" className="input-icon-right" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }} onClick={() => setShowPass(v => !v)}>
                  {showPass ? <EyeOff size={16} color="var(--gray-400)" /> : <Eye size={16} color="var(--gray-400)" />}
                </button>
              </div>
              {errors.password && <div className="form-error">{errors.password}</div>}
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', justifyContent: 'center', gap: 8, marginTop: 4 }} disabled={loading}>
              {loading ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />Signing in...</> : <><span>Sign in</span><ArrowRight size={15} /></>}
            </button>
          </form>

          <div className="auth-demo-box">
            <div className="auth-demo-title">Demo credentials</div>
            <div className="auth-demo-row">
              <span className="auth-demo-label">Admin</span>
              <span className="auth-demo-val">admin@financetrack.com</span>
              <span className="auth-demo-val">Admin@1234</span>
            </div>
          </div>

          <p className="auth-footer-text">
            Don&apos;t have an account? <Link to="/register" className="auth-link">Create one</Link>
          </p>
        </div>
      </div>

      <style>{`
        .auth-page { min-height: 100vh; display: flex; }
        .auth-split-left {
          flex: 1; position: relative; display: none;
          min-height: 100vh; overflow: hidden;
        }
        .auth-bg-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
        .auth-split-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(15,31,61,0.88) 0%, rgba(15,31,61,0.6) 100%);
          display: flex; flex-direction: column; justify-content: space-between;
          padding: 40px;
        }
        .auth-split-brand { display: flex; align-items: center; gap: 10px; color: white; font-size: 1.1rem; font-weight: 800; letter-spacing: -0.03em; }
        .auth-split-logo { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg,#3b82f6,#06b6d4); display: flex; align-items: center; justify-content: center; color: white; }
        .auth-split-quote { color: white; }
        .auth-split-quote h2 { font-size: 1.5rem; font-weight: 700; line-height: 1.4; margin-bottom: 12px; letter-spacing: -0.02em; }
        .auth-split-quote p { font-size: 0.9rem; opacity: 0.65; line-height: 1.7; }

        .auth-split-right {
          width: 100%; max-width: 480px; display: flex; align-items: center; justify-content: center;
          padding: 40px 32px; background: var(--white);
        }
        .auth-form-wrap { width: 100%; max-width: 380px; }
        .auth-form-header { margin-bottom: 32px; }
        .auth-logo-sm { display: flex; align-items: center; gap: 8px; font-size: 1rem; font-weight: 800; color: var(--gray-900); letter-spacing: -0.03em; margin-bottom: 28px; }
        .auth-logo-icon { width: 30px; height: 30px; border-radius: 8px; background: linear-gradient(135deg,var(--blue),#06b6d4); display: flex; align-items: center; justify-content: center; color: white; }
        .auth-title { font-size: 1.75rem; font-weight: 800; color: var(--gray-900); letter-spacing: -0.04em; margin-bottom: 6px; }
        .auth-subtitle { font-size: 0.875rem; color: var(--gray-400); }

        .auth-demo-box {
          margin-top: 24px; padding: 14px 16px;
          background: var(--gray-25); border: 1px solid var(--gray-150);
          border-radius: var(--radius); font-size: 0.8rem;
        }
        .auth-demo-title { font-weight: 700; color: var(--gray-500); margin-bottom: 7px; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.06em; }
        .auth-demo-row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
        .auth-demo-label { background: var(--gray-200); color: var(--gray-600); padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.04em; }
        .auth-demo-val { font-family: var(--font-mono); color: var(--gray-700); font-size: 0.8rem; }

        .auth-footer-text { text-align: center; margin-top: 20px; font-size: 0.875rem; color: var(--gray-400); }
        .auth-link { color: var(--blue); font-weight: 600; }
        .auth-link:hover { text-decoration: underline; }

        @media (min-width: 768px) { .auth-split-left { display: block; } }
        @media (max-width: 480px) { .auth-split-right { padding: 32px 20px; } }
      `}</style>
    </div>
  );
}
