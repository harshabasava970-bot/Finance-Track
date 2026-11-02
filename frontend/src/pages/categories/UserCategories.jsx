import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag, X } from 'lucide-react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../api/categories';
import { getErrorMessage } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import toast from 'react-hot-toast';

function CategoryModal({ category, onClose, onSave }) {
  const [form, setForm] = useState({
    name: category?.name || '',
    type: category?.type || 'EXPENSE',
    description: category?.description || '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      if (category) {
        await updateCategory(category.id, form);
        toast.success('Category updated');
      } else {
        await createCategory(form);
        toast.success('Category created');
      }
      onSave();
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Tag size={16} color="var(--primary)" />
            </div>
            <h3 className="modal-title">{category ? 'Edit Category' : 'Add Category'}</h3>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Category name *</label>
              <input type="text" className={`form-control ${errors.name ? 'error' : ''}`}
                placeholder="e.g. Rent, Salary, Freelance"
                value={form.name}
                onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setErrors({}); }} />
              {errors.name && <div className="form-error">{errors.name}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Type *</label>
              <div style={{ display: 'flex', gap: 10 }}>
                {['INCOME', 'EXPENSE'].map(t => (
                  <button key={t} type="button"
                    onClick={() => setForm(p => ({ ...p, type: t }))}
                    style={{
                      flex: 1, padding: '10px', cursor: 'pointer',
                      border: `2px solid ${form.type === t ? (t === 'INCOME' ? 'var(--income)' : 'var(--expense)') : 'var(--cream-200)'}`,
                      borderRadius: 'var(--radius)',
                      background: form.type === t ? (t === 'INCOME' ? 'var(--income-bg)' : 'var(--expense-bg)') : 'white',
                      color: form.type === t ? (t === 'INCOME' ? 'var(--income)' : 'var(--expense)') : 'var(--cream-500)',
                      fontWeight: 600, fontSize: '0.875rem', fontFamily: 'var(--font-sans)',
                      transition: 'all var(--t-base)',
                    }}>
                    {t === 'INCOME' ? '↑ Income' : '↓ Expense'}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Description <span style={{ color: 'var(--cream-400)', fontWeight: 400 }}>— optional</span></label>
              <input type="text" className="form-control"
                placeholder="Short description"
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ gap: 7 }}>
              {loading
                ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />Saving…</>
                : category ? 'Update' : 'Create Category'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UserCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [modal, setModal]           = useState(null);
  const [deleteId, setDeleteId]     = useState(null);
  const [typeFilter, setTypeFilter] = useState('');

  const load = async () => {
    setLoading(true);
    try { const res = await getCategories(); setCategories(res.data.data); }
    catch { toast.error('Failed to load categories'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async () => {
    try {
      await deleteCategory(deleteId);
      toast.success('Category deleted');
      setDeleteId(null);
      load();
    } catch (err) { toast.error(getErrorMessage(err)); }
  };

  const filtered = categories.filter(c => !typeFilter || c.type === typeFilter);
  const userCats   = filtered.filter(c => !c.isSystem);
  const systemCats = filtered.filter(c => c.isSystem);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">Manage your personal categories</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('create')} style={{ gap: 7 }}>
          <Plus size={15} strokeWidth={2.5} /> Add Category
        </button>
      </div>

      {/* Type filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[{ val: '', label: 'All' }, { val: 'INCOME', label: '↑ Income' }, { val: 'EXPENSE', label: '↓ Expense' }].map(({ val, label }) => (
          <button key={val}
            className={`btn btn-sm ${typeFilter === val ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTypeFilter(val)}>
            {label}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          {/* User categories */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <div className="section-title">My Categories</div>
              <span style={{ fontSize: '0.8rem', color: 'var(--cream-500)' }}>{userCats.length} categories</span>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {userCats.length === 0 ? (
                <EmptyState
                  icon={<Tag size={36} color="var(--cream-300)" />}
                  title="No personal categories yet"
                  message="Create custom categories for your transactions."
                  action={
                    <button className="btn btn-primary btn-sm" onClick={() => setModal('create')}>
                      <Plus size={13} /> Add Category
                    </button>
                  } />
              ) : (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr><th>Name</th><th>Type</th><th>Description</th><th style={{ textAlign: 'center', width: 100 }}>Actions</th></tr>
                    </thead>
                    <tbody>
                      {userCats.map(c => (
                        <tr key={c.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 28, height: 28, borderRadius: 7, background: c.type === 'INCOME' ? 'var(--income-bg)' : 'var(--expense-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Tag size={12} color={c.type === 'INCOME' ? 'var(--income)' : 'var(--expense)'} />
                              </div>
                              <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--charcoal-700)' }}>{c.name}</span>
                            </div>
                          </td>
                          <td><span className={`badge badge-${c.type.toLowerCase()}`}>{c.type === 'INCOME' ? '↑' : '↓'} {c.type}</span></td>
                          <td style={{ fontSize: '0.82rem', color: 'var(--cream-500)' }}>{c.description || '—'}</td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                              <button className="btn btn-ghost btn-icon" title="Edit" onClick={() => setModal(c)}>
                                <Edit2 size={14} />
                              </button>
                              <button className="btn btn-ghost btn-icon" title="Delete"
                                onClick={() => setDeleteId(c.id)}
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

          {/* System categories (read-only) */}
          <div className="card">
            <div className="card-header">
              <div className="section-title">System Categories</div>
              <span style={{ fontSize: '0.8rem', color: 'var(--cream-500)' }}>Read-only · {systemCats.length} categories</span>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr><th>Name</th><th>Type</th></tr>
                  </thead>
                  <tbody>
                    {systemCats.map(c => (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--charcoal-700)' }}>{c.name}</td>
                        <td><span className={`badge badge-${c.type.toLowerCase()}`}>{c.type === 'INCOME' ? '↑' : '↓'} {c.type}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {modal && (
        <CategoryModal
          category={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); load(); }}
        />
      )}

      <ConfirmDialog isOpen={!!deleteId} title="Delete Category"
        message="Are you sure? This category will be deleted. If it's used in transactions, deletion will be blocked."
        onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
