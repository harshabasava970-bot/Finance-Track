import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../../api/auth';
import { getErrorMessage } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function ChangePassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.currentPassword) e.currentPassword = 'Current password is required';
    if (!form.newPassword) e.newPassword = 'New password is required';
    else if (form.newPassword.length < 8) e.newPassword = 'Must be at least 8 characters';
    if (!form.confirmPassword) e.confirmPassword = 'Please confirm new password';
    else if (form.newPassword !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const set = f => e => { setForm(frm => ({ ...frm, [f]: e.target.value })); setErrors(er => ({ ...er, [f]: '' })); };

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

  return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">Change Password</h1>
      </div>
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit} noValidate>
            {[
              { field: 'currentPassword', label: 'Current Password', placeholder: 'Your current password' },
              { field: 'newPassword', label: 'New Password', placeholder: 'Min. 8 characters' },
              { field: 'confirmPassword', label: 'Confirm New Password', placeholder: 'Re-enter new password' },
            ].map(({ field, label, placeholder }) => (
              <div className="form-group" key={field}>
                <label className="form-label">{label} *</label>
                <input type="password" className={`form-control ${errors[field] ? 'error' : ''}`}
                  placeholder={placeholder} value={form[field]} onChange={set(field)} />
                {errors[field] && <div className="form-error">{errors[field]}</div>}
              </div>
            ))}
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => navigate('/profile')}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={loading}>
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
