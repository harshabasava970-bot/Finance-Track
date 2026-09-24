import { useState, useEffect } from 'react';
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
      <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{category ? 'Edit Category' : 'Add Category'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Category Name *</label>
              <input type="text" className={`form-control ${errors.name ? 'error' : ''}`}
                placeholder="e.g. Utilities" value={form.name}
                onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors({}); }} />
              {errors.name && <div className="form-error">{errors.name}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Type *</label>
              <select className="form-control" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
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
    try {
      const res = await getAdminCategories();
      setCategories(res.data.data);
    } catch { toast.error('Failed to load categories'); }
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
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Category Management</h1>
          <p className="page-subtitle">Manage system-wide transaction categories</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('create')}>+ Add Category</button>
      </div>

      <div className="card">
        <div className="card-header" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <select className="form-control" style={{ width: 160 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="">All Types</option>
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>
            <span style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>{filtered.length} categories</span>
          </div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
            <EmptyState icon="🏷️" title="No categories" message="Add your first system category." />
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => (
                    <tr key={c.id}>
                      <td style={{ color: 'var(--gray-400)', fontSize: '0.8rem' }}>#{c.id}</td>
                      <td style={{ fontWeight: 600, fontSize: '0.875rem' }}>{c.name}</td>
                      <td><span className={`badge badge-${c.type === 'INCOME' ? 'income' : 'expense'}`}>{c.type}</span></td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => setModal(c)}>Edit</button>
                          <button className="btn btn-outline-danger btn-sm" onClick={() => setDeleteId(c.id)}>Delete</button>
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
