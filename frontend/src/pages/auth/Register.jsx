import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required';
    else if (form.fullName.trim().length < 2) e.fullName = 'Name must be at least 2 characters';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email format';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const set = (field) => (e) => { setForm(f => ({ ...f, [field]: e.target.value })); setErrors(er => ({ ...er, [field]: '' })); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Please sign in.');
      navigate('/login');
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
        <h2 className="auth-title">Create your account</h2>
        <p className="auth-subtitle">Start managing your finances today</p>

        <form onSubmit={handleSubmit} noValidate>
          {[
            { field: 'fullName', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
            { field: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com' },
            { field: 'password', label: 'Password', type: 'password', placeholder: 'Min. 8 characters' },
            { field: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: 'Re-enter password' },
          ].map(({ field, label, type, placeholder }) => (
            <div className="form-group" key={field}>
              <label className="form-label">{label}</label>
              <input type={type} className={`form-control ${errors[field] ? 'error' : ''}`}
                placeholder={placeholder} value={form[field]} onChange={set(field)} />
              {errors[field] && <div className="form-error">{errors[field]}</div>}
            </div>
          ))}
          <div className="form-hint" style={{ marginBottom: 16 }}>
            Password must be at least 8 characters.
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
      <style>{`
        .auth-page { min-height: 100vh; background: linear-gradient(135deg, #f0f4ff 0%, #e8f5e9 100%); display: flex; align-items: center; justify-content: center; padding: 20px; }
        .auth-card { background: var(--white); border-radius: 20px; padding: 40px; width: 100%; max-width: 440px; box-shadow: var(--shadow-lg); }
        .auth-logo { display: flex; align-items: center; gap: 8px; font-size: 1.3rem; font-weight: 700; color: var(--gray-900); margin-bottom: 28px; justify-content: center; }
        .auth-title { font-size: 1.5rem; font-weight: 700; color: var(--gray-900); text-align: center; margin-bottom: 8px; }
        .auth-subtitle { color: var(--gray-500); text-align: center; margin-bottom: 28px; font-size: 0.9rem; }
        .auth-footer { text-align: center; margin-top: 20px; color: var(--gray-500); font-size: 0.875rem; }
        .auth-footer a { color: var(--primary); font-weight: 600; }
      `}</style>
    </div>
  );
}
