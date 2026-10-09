import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, Mail, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm]       = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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

  const set = f => e => {
    setForm(p => ({ ...p, [f]: e.target.value }));
    setErrors(p => ({ ...p, [f]: '' }));
  };

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

  const pwLen = form.password.length;
  const pwStrong = pwLen >= 8 && /[A-Z]/.test(form.password) && /[0-9]/.test(form.password);
  const pwMedium = pwLen >= 8;
  const pwLevel  = pwLen === 0 ? 0 : !pwMedium ? 1 : pwStrong ? 3 : 2;
  const pwLabels = ['', 'Too short', 'Add uppercase & number', 'Strong'];
  const pwColors = ['', 'var(--expense)', 'var(--terracotta)', 'var(--income)'];

  return (
    <div className="auth-page">
      {/* ── Left panel ── */}
      <div className="auth-left">
        <img
          src="https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=900&q=80&auto=format&fit=crop"
          alt="Financial growth"
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
              Financial clarity is the first step to financial freedom.
            </div>
            <p className="auth-left-sub">
              Join thousands who track their money, set budgets, and achieve their financial goals with FinanceTrack.
            </p>
            <div className="auth-left-features">
              {[
                'Track all income & expenses effortlessly',
                'Set smart monthly budgets per category',
                'Visual analytics — charts & reports',
                'Secure JWT authentication',
              ].map(f => (
                <div key={f} className="auth-left-feat">
                  <CheckCircle2 size={15} color="#8ECFAD" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
            <div className="auth-left-trust">
              <ShieldCheck size={14} color="rgba(255,255,255,0.45)" />
              <span>Your data is encrypted and private</span>
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
            <h1 className="auth-form-title">Create your account</h1>
            <p className="auth-form-sub">Start managing your finances today — free forever</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label">Full name</label>
              <div className="input-group">
                <User size={16} className="input-icon" />
                <input
                  type="text"
                  className={`form-control ${errors.fullName ? 'error' : ''}`}
                  placeholder="John Doe"
                  value={form.fullName}
                  onChange={set('fullName')}
                  autoComplete="name"
                />
              </div>
              {errors.fullName && <div className="form-error">{errors.fullName}</div>}
            </div>

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
              <label className="form-label">Password</label>
              <div className="input-group">
                <Lock size={16} className="input-icon" />
                <input
                  type={showPass ? 'text' : 'password'}
                  className={`form-control ${errors.password ? 'error' : ''}`}
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={set('password')}
                  autoComplete="new-password"
                  style={{ paddingRight: 44 }}
                />
                <button type="button" className="auth-eye-btn" onClick={() => setShowPass(v => !v)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {pwLen > 0 && (
                <div className="pw-strength-row">
                  <div className="pw-bars">
                    {[1,2,3].map(i => (
                      <div key={i} className="pw-bar-seg" style={{ background: i <= pwLevel ? pwColors[pwLevel] : 'var(--cream-150)' }} />
                    ))}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: pwColors[pwLevel], fontWeight: 600 }}>{pwLabels[pwLevel]}</span>
                </div>
              )}
              {errors.password && <div className="form-error">{errors.password}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm password</label>
              <div className="input-group">
                <Lock size={16} className="input-icon" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  className={`form-control ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="Re-enter password"
                  value={form.confirmPassword}
                  onChange={set('confirmPassword')}
                  autoComplete="new-password"
                  style={{ paddingRight: 44 }}
                />
                <button type="button" className="auth-eye-btn" onClick={() => setShowConfirm(v => !v)}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}>
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && <div className="form-error">{errors.confirmPassword}</div>}
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading
                ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />Creating account...</>
                : <><span>Create Account</span><ArrowRight size={15} /></>
              }
            </button>
          </form>

          <p className="auth-footer-link">
            Already have an account?{' '}
            <Link to="/login" className="auth-text-link">Sign in</Link>
          </p>
        </div>
      </div>

      <style>{`
        .auth-page { min-height: 100vh; display: flex; background: var(--white); }

        .auth-left { flex: 1; position: relative; display: none; min-height: 100vh; overflow: hidden; }
        .auth-left-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
        .auth-left-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(155deg, rgba(26,68,51,0.93) 0%, rgba(36,92,69,0.78) 55%, rgba(199,121,91,0.25) 100%);
          display: flex; flex-direction: column; padding: 44px 48px;
        }
        .auth-brand {
          display: flex; align-items: center; gap: 10px;
          color: white; text-decoration: none;
          font-size: 1.1rem; font-weight: 800; letter-spacing: -0.03em; flex-shrink: 0;
        }
        .auth-brand-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2);
          display: flex; align-items: center; justify-content: center; color: white;
        }
        .auth-left-body { flex: 1; display: flex; flex-direction: column; justify-content: flex-end; padding-bottom: 24px; }
        .auth-left-quote { font-size: 1.4rem; font-weight: 700; color: white; line-height: 1.45; letter-spacing: -0.02em; margin-bottom: 14px; }
        .auth-quote-mark { font-size: 2.5rem; color: rgba(255,255,255,0.25); line-height: 0; vertical-align: -0.4em; margin-right: 4px; }
        .auth-left-sub { font-size: 0.875rem; color: rgba(255,255,255,0.55); line-height: 1.7; margin-bottom: 26px; }
        .auth-left-features { display: flex; flex-direction: column; gap: 11px; margin-bottom: 24px; }
        .auth-left-feat { display: flex; align-items: center; gap: 10px; font-size: 0.875rem; color: rgba(255,255,255,0.8); font-weight: 500; }
        .auth-left-trust { display: flex; align-items: center; gap: 7px; font-size: 0.78rem; color: rgba(255,255,255,0.4); }

        .auth-right {
          width: 100%; max-width: 520px;
          display: flex; align-items: center; justify-content: center;
          padding: 40px 40px; background: var(--white);
        }
        .auth-form-wrap { width: 100%; max-width: 420px; }

        .auth-mobile-logo {
          display: flex; align-items: center; gap: 8px;
          font-size: 1rem; font-weight: 800; color: var(--charcoal);
          letter-spacing: -0.03em; text-decoration: none; margin-bottom: 28px;
        }
        .auth-mobile-icon {
          width: 32px; height: 32px; border-radius: 8px;
          background: var(--primary); display: flex; align-items: center;
          justify-content: center; color: white;
          box-shadow: 0 4px 10px rgba(36,92,69,0.28);
        }

        .auth-form-head { margin-bottom: 26px; }
        .auth-form-title { font-size: 1.75rem; font-weight: 900; color: var(--charcoal); letter-spacing: -0.04em; margin-bottom: 7px; }
        .auth-form-sub { font-size: 0.875rem; color: var(--cream-500); }

        .auth-eye-btn {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; padding: 4px;
          color: var(--cream-400); display: flex; align-items: center;
          border-radius: 4px; transition: color 150ms;
        }
        .auth-eye-btn:hover { color: var(--charcoal); }

        .pw-strength-row { display: flex; align-items: center; gap: 10px; margin-top: 8px; }
        .pw-bars { display: flex; gap: 4px; flex: 1; }
        .pw-bar-seg { flex: 1; height: 4px; border-radius: 4px; transition: background 300ms; }

        .auth-submit-btn {
          width: 100%; padding: 13px 20px; margin-top: 8px;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          background: var(--primary); color: white; border: none;
          border-radius: var(--radius-md); font-size: 1rem; font-weight: 700;
          font-family: var(--font-sans); cursor: pointer; letter-spacing: -0.01em;
          box-shadow: 0 4px 14px rgba(36,92,69,0.32);
          transition: all 220ms var(--ease);
        }
        .auth-submit-btn:hover:not(:disabled) { background: var(--primary-dark); transform: translateY(-1px); box-shadow: 0 8px 20px rgba(36,92,69,0.40); }
        .auth-submit-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

        .auth-footer-link { text-align: center; margin-top: 22px; font-size: 0.875rem; color: var(--cream-500); }
        .auth-text-link { color: var(--primary); font-weight: 700; text-decoration: none; }
        .auth-text-link:hover { text-decoration: underline; }

        @media (min-width: 860px) {
          .auth-left { display: flex; }
          .auth-mobile-logo { display: none; }
        }
        @media (max-width: 860px) { .auth-right { max-width: 100%; } }
        @media (max-width: 480px) {
          .auth-right { padding: 32px 20px; }
          .auth-form-title { font-size: 1.5rem; }
        }
      `}</style>
    </div>
  );
}
