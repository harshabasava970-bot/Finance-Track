import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.fullName}!`);
      navigate(user.role === 'ADMIN' ? '/admin' : '/dashboard', { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo"><span>💰</span> FinanceTrack</div>
        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-subtitle">Sign in to your account to continue</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className={`form-control ${errors.email ? 'error' : ''}`}
              placeholder="you@example.com" value={form.email}
              onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setErrors(err => ({ ...err, email: '' })); }} />
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className={`form-control ${errors.password ? 'error' : ''}`}
              placeholder="Enter your password" value={form.password}
              onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setErrors(err => ({ ...err, password: '' })); }} />
            {errors.password && <div className="form-error">{errors.password}</div>}
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-demo">
          <strong>Demo Credentials</strong>
          <div>Admin: admin@financetrack.com / Admin@1234</div>
        </div>

        <p className="auth-footer">
          Don&apos;t have an account? <Link to="/register">Create one</Link>
        </p>
      </div>

      <style>{`
        .auth-page { min-height: 100vh; background: linear-gradient(135deg, #f0f4ff 0%, #e8f5e9 100%); display: flex; align-items: center; justify-content: center; padding: 20px; }
        .auth-card { background: var(--white); border-radius: 20px; padding: 40px; width: 100%; max-width: 440px; box-shadow: var(--shadow-lg); }
        .auth-logo { display: flex; align-items: center; gap: 8px; font-size: 1.3rem; font-weight: 700; color: var(--gray-900); margin-bottom: 28px; justify-content: center; }
        .auth-title { font-size: 1.5rem; font-weight: 700; color: var(--gray-900); text-align: center; margin-bottom: 8px; }
        .auth-subtitle { color: var(--gray-500); text-align: center; margin-bottom: 28px; font-size: 0.9rem; }
        .auth-demo { background: var(--primary-light); border-radius: var(--border-radius-sm); padding: 12px 16px; margin-top: 20px; font-size: 0.8rem; color: var(--primary-dark); }
        .auth-demo strong { display: block; margin-bottom: 4px; }
        .auth-footer { text-align: center; margin-top: 20px; color: var(--gray-500); font-size: 0.875rem; }
        .auth-footer a { color: var(--primary); font-weight: 600; }
      `}</style>
    </div>
  );
}
