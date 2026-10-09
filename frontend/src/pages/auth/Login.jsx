import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [errors, setErrors]   = useState({});
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

  const set = f => e => {
    setForm(p => ({ ...p, [f]: e.target.value }));
    setErrors(p => ({ ...p, [f]: '' }));
  };

  return (
    <div className="auth-page">
      {/* ── Left panel ── */}
      <div className="auth-left">
        <img
          src="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=900&q=80&auto=format&fit=crop"
          alt="Financial planning workspace"
          className="auth-left-img"
          onError={e => e.target.style.display = 'none'}
        />
        <div className="auth-left-overlay">
          <Link to="/" className="auth-brand">
            <div className="auth-brand-icon"><TrendingUp size={18} strokeWidth={2.5} /></div>
            <span>FinanceTrack</span>
          </Link>
          <div className="auth-left-body">
            <div className="auth-left-quote">
              <span className="auth-quote-mark">"</span>
              The secret to financial freedom begins with awareness.
            </div>
            <p className="auth-left-sub">
              Track every rupee, understand your habits, and build the future you want.
            </p>
            <div className="auth-left-features">
              {[
                'Real-time income & expense tracking',
                'Smart monthly budget management',
                'Visual analytics and reports',
                'Secure JWT authentication',
              ].map(f => (
                <div key={f} className="auth-left-feat">
                  <CheckCircle2 size={15} color="#8ECFAD" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="auth-right">
        <div className="auth-form-wrap">
          {/* Mobile logo */}
          <Link to="/" className="auth-mobile-logo">
            <div className="auth-mobile-icon"><TrendingUp size={16} strokeWidth={2.5} /></div>
            <span>FinanceTrack</span>
          </Link>

          <div className="auth-form-head">
            <h1 className="auth-form-title">Welcome back</h1>
            <p className="auth-form-sub">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <div className="input-group">
                <Mail size={16} className="input-icon" />
                <input
                  type="email"
                  className={`form-control ${errors.email ? 'error' : ''}`}
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={set('email')}
                  autoComplete="email"
                />
              </div>
              {errors.email && <div className="form-error">{errors.email}</div>}
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
              </div>
              <div className="input-group">
                <Lock size={16} className="input-icon" />
                <input
                  type={showPass ? 'text' : 'password'}
                  className={`form-control ${errors.password ? 'error' : ''}`}
                  placeholder="Your password"
                  value={form.password}
                  onChange={set('password')}
                  autoComplete="current-password"
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPass(v => !v)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <div className="form-error">{errors.password}</div>}
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading
                ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />Signing in...</>
                : <><span>Sign in</span><ArrowRight size={15} /></>
              }
            </button>
          </form>

          {/* Demo credentials */}
          <div className="auth-demo-box">
            <div className="auth-demo-title">Demo credentials</div>
            <div className="auth-demo-row">
              <span className="auth-demo-badge">Admin</span>
              <span className="auth-demo-val">admin@financetrack.com</span>
              <span className="auth-demo-sep">·</span>
              <span className="auth-demo-val">Admin@1234</span>
            </div>
          </div>

          <p className="auth-footer-link">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="auth-text-link">Create one free</Link>
          </p>
        </div>
      </div>

      <style>{`
        /* ── Layout ── */
        .auth-page { min-height: 100vh; display: flex; background: var(--white); }

        /* ── Left panel ── */
        .auth-left {
          flex: 1.1; position: relative; display: none;
          min-height: 100vh; overflow: hidden;
        }
        .auth-left-img {
          position: absolute; inset: 0; width: 100%; height: 100%;
          object-fit: cover; object-position: center;
        }
        .auth-left-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(155deg, rgba(26,68,51,0.93) 0%, rgba(36,92,69,0.78) 60%, rgba(26,68,51,0.88) 100%);
          display: flex; flex-direction: column; padding: 44px 48px;
        }
        .auth-brand {
          display: flex; align-items: center; gap: 10px;
          color: white; text-decoration: none;
          font-size: 1.1rem; font-weight: 800; letter-spacing: -0.03em;
          flex-shrink: 0;
        }
        .auth-brand-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2);
          display: flex; align-items: center; justify-content: center; color: white;
        }
        .auth-left-body { flex: 1; display: flex; flex-direction: column; justify-content: flex-end; padding-bottom: 20px; }
        .auth-left-quote {
          font-size: 1.45rem; font-weight: 700; color: white;
          line-height: 1.45; letter-spacing: -0.02em; margin-bottom: 14px;
          position: relative;
        }
        .auth-quote-mark { font-size: 2.5rem; color: rgba(255,255,255,0.25); line-height: 0; vertical-align: -0.4em; margin-right: 4px; }
        .auth-left-sub { font-size: 0.9rem; color: rgba(255,255,255,0.55); line-height: 1.7; margin-bottom: 28px; }
        .auth-left-features { display: flex; flex-direction: column; gap: 11px; }
        .auth-left-feat { display: flex; align-items: center; gap: 10px; font-size: 0.875rem; color: rgba(255,255,255,0.8); font-weight: 500; }

        /* ── Right panel ── */
        .auth-right {
          width: 100%; max-width: 500px;
          display: flex; align-items: center; justify-content: center;
          padding: 48px 40px; background: var(--white);
        }
        .auth-form-wrap { width: 100%; max-width: 400px; }

        /* Mobile logo (hidden on desktop) */
        .auth-mobile-logo {
          display: flex; align-items: center; gap: 8px;
          font-size: 1rem; font-weight: 800; color: var(--charcoal);
          letter-spacing: -0.03em; text-decoration: none;
          margin-bottom: 32px;
        }
        .auth-mobile-icon {
          width: 32px; height: 32px; border-radius: 8px;
          background: var(--primary); display: flex; align-items: center;
          justify-content: center; color: white;
          box-shadow: 0 4px 10px rgba(36,92,69,0.28);
        }

        .auth-form-head { margin-bottom: 28px; }
        .auth-form-title { font-size: 1.85rem; font-weight: 900; color: var(--charcoal); letter-spacing: -0.04em; margin-bottom: 7px; }
        .auth-form-sub { font-size: 0.9rem; color: var(--cream-500); }

        /* Eye toggle */
        .auth-eye-btn {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; padding: 4px;
          color: var(--cream-400); display: flex; align-items: center;
          border-radius: 4px; transition: color 150ms;
        }
        .auth-eye-btn:hover { color: var(--charcoal); }

        /* Submit */
        .auth-submit-btn {
          width: 100%; padding: 13px 20px; margin-top: 6px;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          background: var(--primary); color: white; border: none;
          border-radius: var(--radius-md); font-size: 1rem; font-weight: 700;
          font-family: var(--font-sans); cursor: pointer; letter-spacing: -0.01em;
          box-shadow: 0 4px 14px rgba(36,92,69,0.32);
          transition: all 220ms var(--ease);
        }
        .auth-submit-btn:hover:not(:disabled) { background: var(--primary-dark); transform: translateY(-1px); box-shadow: 0 8px 20px rgba(36,92,69,0.40); }
        .auth-submit-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

        /* Demo box */
        .auth-demo-box {
          margin-top: 24px; padding: 14px 16px;
          background: var(--cream-50); border: 1px solid var(--cream-150);
          border-radius: var(--radius); font-size: 0.8rem;
        }
        .auth-demo-title { font-weight: 700; color: var(--cream-500); margin-bottom: 8px; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.07em; }
        .auth-demo-row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
        .auth-demo-badge { background: var(--primary-light); color: var(--primary); padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em; }
        .auth-demo-val { font-family: var(--font-mono); color: var(--charcoal-700); font-size: 0.8rem; }
        .auth-demo-sep { color: var(--cream-300); }

        .auth-footer-link { text-align: center; margin-top: 22px; font-size: 0.875rem; color: var(--cream-500); }
        .auth-text-link { color: var(--primary); font-weight: 700; text-decoration: none; }
        .auth-text-link:hover { text-decoration: underline; }

        /* ── Responsive ── */
        @media (min-width: 860px) {
          .auth-left { display: flex; }
          .auth-mobile-logo { display: none; }
        }
        @media (max-width: 860px) {
          .auth-right { max-width: 100%; }
        }
        @media (max-width: 480px) {
          .auth-right { padding: 36px 24px; }
          .auth-form-title { font-size: 1.6rem; }
        }
      `}</style>
    </div>
  );
}
