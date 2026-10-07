import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';
import { getAdminCategories, createAdminCategory, updateAdminCategory, deleteAdminCategory } from '../../api/admin';
import { getErrorMessage } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import toast from 'react-hot-toast';

function CategoryModal({ category, onClose, onSave }) {
  const [form, setForm] = useState({ name: category?.name || '', type: category?.type || 'EXPENSE' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      if (category) { await updateAdminCategory(category.id, form); toast.success('Category updated'); }
      else { await createAdminCategory(form); toast.success('Category created'); }
      onSave();
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Tag size={16} color="var(--blue)" />
            </div>
            <h3 className="modal-title">{category ? 'Edit Category' : 'Add Category'}</h3>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Category name *</label>
              <input type="text" className={`form-control ${errors.name ? 'error' : ''}`}
                placeholder="e.g. Utilities, Groceries"
                value={form.name} onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setErrors({}); }} />
              {errors.name && <div className="form-error">{errors.name}</div>}
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Type *</label>
              <div style={{ display: 'flex', gap: 10 }}>
                {['INCOME', 'EXPENSE'].map(t => (
                  <button key={t} type="button"
                    onClick={() => setForm(p => ({ ...p, type: t }))}
                    style={{
                      flex: 1, padding: '10px', border: `2px solid ${form.type === t ? (t === 'INCOME' ? 'var(--income)' : 'var(--expense)') : 'var(--gray-200)'}`,
                      borderRadius: 'var(--radius)', background: form.type === t ? (t === 'INCOME' ? 'var(--income-bg)' : 'var(--expense-bg)') : 'white',
                      color: form.type === t ? (t === 'INCOME' ? 'var(--income)' : 'var(--expense)') : 'var(--gray-400)',
                      fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'var(--font-sans)',
                      transition: 'all var(--t-base)',
                    }}>
                    {t === 'INCOME' ? '↑ Income' : '↓ Expense'}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ gap: 7 }}>
              {loading ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />Saving...</> : category ? 'Update' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [typeFilter, setTypeFilter] = useState('');

  const loadCategories = async () => {
    setLoading(true);
    try { const res = await getAdminCategories(); setCategories(res.data.data); }
    catch { toast.error('Failed to load categories'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadCategories(); }, []);

  const handleDelete = async () => {
    try {
      await deleteAdminCategory(deleteId);
      toast.success('Category deleted');
      setDeleteId(null);
      loadCategories();
    } catch (err) { toast.error(getErrorMessage(err)); }
  };

  const filtered = categories.filter(c => !typeFilter || c.type === typeFilter);

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Category Management</h1>
          <p className="page-subtitle">Manage system-wide transaction categories</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('create')} style={{ gap: 7 }}>
          <Plus size={15} strokeWidth={2.5} /> Add Category
        </button>
      </div>

      <div className="card">
        <div className="card-header" style={{ gap: 12 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {[{ val: '', label: 'All' }, { val: 'INCOME', label: '↑ Income' }, { val: 'EXPENSE', label: '↓ Expense' }].map(({ val, label }) => (
              <button key={val} className={`btn btn-sm ${typeFilter === val ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setTypeFilter(val)}>{label}</button>
            ))}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--gray-400)', marginLeft: 'auto' }}>{filtered.length} categories</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
            <EmptyState icon={<Tag size={40} color="var(--gray-200)" />} title="No categories"
              message="Add your first system category." />
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr><th>#</th><th>Name</th><th>Type</th><th style={{ textAlign: 'center', width: 120 }}>Actions</th></tr>
                </thead>
                <tbody>
                  {filtered.map(c => (
                    <tr key={c.id}>
                      <td style={{ color: 'var(--gray-300)', fontSize: '0.78rem' }}>#{c.id}</td>
                      <td style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--gray-800)' }}>{c.name}</td>
                      <td><span className={`badge badge-${c.type.toLowerCase()}`}>{c.type === 'INCOME' ? '↑' : '↓'} {c.type}</span></td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                          <button className="btn btn-ghost btn-icon" title="Edit" onClick={() => setModal(c)}>
                            <Edit2 size={14} />
                          </button>
                          <button className="btn btn-ghost btn-icon" title="Delete" onClick={() => setDeleteId(c.id)}
                            style={{ color: 'var(--expense)' }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <CategoryModal category={modal === 'create' ? null : modal}
          onClose={() => setModal(null)} onSave={() => { setModal(null); loadCategories(); }} />
      )}

      <ConfirmDialog isOpen={!!deleteId} title="Delete Category"
        message="Deleting this category may affect existing transactions. Are you sure?"
        onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
