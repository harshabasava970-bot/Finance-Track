import { useState, useEffect, useCallback } from 'react';
import { getBudgets, createBudget, updateBudget, deleteBudget } from '../../api/budgets';
import { getCategories } from '../../api/categories';
import { formatCurrency, getErrorMessage, getBudgetStatus } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import toast from 'react-hot-toast';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

const now = new Date();

function BudgetModal({ budget, categories, onClose, onSave }) {
  const [form, setForm] = useState(budget
    ? { categoryId: budget.categoryId.toString(), amount: budget.amount.toString(), month: budget.month.toString(), year: budget.year.toString() }
    : { categoryId: '', amount: '', month: (now.getMonth() + 1).toString(), year: now.getFullYear().toString() }
  );
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const expenseCategories = categories.filter(c => c.type === 'EXPENSE');
  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i);

  const validate = () => {
    const e = {};
    if (!form.categoryId) e.categoryId = 'Category is required';
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) e.amount = 'Amount must be greater than 0';
    if (!form.month) e.month = 'Month is required';
    if (!form.year) e.year = 'Year is required';
    return e;
  };

  const set = field => e => { setForm(f => ({ ...f, [field]: e.target.value })); setErrors(er => ({ ...er, [field]: '' })); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const payload = { categoryId: parseInt(form.categoryId), amount: parseFloat(form.amount), month: parseInt(form.month), year: parseInt(form.year) };
      if (budget) { await updateBudget(budget.id, payload); toast.success('Budget updated'); }
      else { await createBudget(payload); toast.success('Budget created'); }
      onSave();
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{budget ? 'Edit Budget' : 'Create Budget'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className={`form-control ${errors.categoryId ? 'error' : ''}`} value={form.categoryId} onChange={set('categoryId')}>
                <option value="">Select expense category</option>
                {expenseCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.categoryId && <div className="form-error">{errors.categoryId}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Budget Amount (₹) *</label>
              <input type="number" className={`form-control ${errors.amount ? 'error' : ''}`}
                placeholder="0.00" value={form.amount} onChange={set('amount')} min="0.01" step="0.01" />
              {errors.amount && <div className="form-error">{errors.amount}</div>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Month *</label>
                <select className={`form-control ${errors.month ? 'error' : ''}`} value={form.month} onChange={set('month')}>
                  {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                </select>
                {errors.month && <div className="form-error">{errors.month}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Year *</label>
                <select className={`form-control ${errors.year ? 'error' : ''}`} value={form.year} onChange={set('year')}>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                {errors.year && <div className="form-error">{errors.year}</div>}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : budget ? 'Update' : 'Create Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | budget object
  const [deleteId, setDeleteId] = useState(null);
  const [filterMonth, setFilterMonth] = useState((now.getMonth() + 1).toString());
  const [filterYear, setFilterYear] = useState(now.getFullYear().toString());

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [budRes, catRes] = await Promise.all([getBudgets(), getCategories()]);
      setBudgets(budRes.data.data);
      setCategories(catRes.data.data);
    } catch { toast.error('Failed to load budgets'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDelete = async () => {
    try {
      await deleteBudget(deleteId);
      toast.success('Budget deleted');
      setDeleteId(null);
      loadData();
    } catch (err) { toast.error(getErrorMessage(err)); }
  };

  const filtered = budgets.filter(b =>
    (filterMonth ? b.month === parseInt(filterMonth) : true) &&
    (filterYear ? b.year === parseInt(filterYear) : true)
  );

  const totalBudgeted = filtered.reduce((s, b) => s + Number(b.amount), 0);
  const totalSpent = filtered.reduce((s, b) => s + Number(b.spent), 0);

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Budget Management</h1>
          <p className="page-subtitle">Set and track your monthly spending limits</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('create')}>+ Create Budget</button>
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <select className="form-control" style={{ width: 150 }} value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
          <option value="">All Months</option>
          {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        <select className="form-control" style={{ width: 110 }} value={filterYear} onChange={e => setFilterYear(e.target.value)}>
          <option value="">All Years</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Summary */}
      {filtered.length > 0 && (
        <div className="summary-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
          <div className="summary-card">
            <div className="card-icon" style={{ background: '#dbeafe' }}>🎯</div>
            <div className="card-label">Total Budgeted</div>
            <div className="card-value">{formatCurrency(totalBudgeted)}</div>
          </div>
          <div className="summary-card">
            <div className="card-icon" style={{ background: '#fee2e2' }}>💸</div>
            <div className="card-label">Total Spent</div>
            <div className="card-value" style={{ color: 'var(--danger)' }}>{formatCurrency(totalSpent)}</div>
          </div>
          <div className="summary-card">
            <div className="card-icon" style={{ background: '#d1fae5' }}>💰</div>
            <div className="card-label">Remaining</div>
            <div className="card-value" style={{ color: 'var(--success)' }}>{formatCurrency(totalBudgeted - totalSpent)}</div>
          </div>
        </div>
      )}

      {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
        <div className="card">
          <div className="card-body">
            <EmptyState icon="🎯" title="No budgets found"
              message="Create a budget to start tracking your spending limits."
              action={<button className="btn btn-primary" onClick={() => setModal('create')}>Create Budget</button>} />
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
          {filtered.map(b => {
            const status = getBudgetStatus(b.percentageUsed);
            return (
              <div key={b.id} className="card">
                <div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: 4 }}>{b.categoryName}</h3>
                      <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                        {MONTHS[b.month - 1]} {b.year}
                      </div>
                    </div>
                    <span className={`badge badge-${status === 'danger' ? 'danger' : status === 'warning' ? 'warning' : 'success'}`}>
                      {b.percentageUsed?.toFixed(1)}%
                    </span>
                  </div>

                  <div className="progress-bar" style={{ marginBottom: 12 }}>
                    <div className={`progress-fill progress-${status}`}
                      style={{ width: `${Math.min(b.percentageUsed, 100)}%` }} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
                    <div style={{ textAlign: 'center', padding: '8px', background: 'var(--gray-50)', borderRadius: 8 }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--gray-500)', marginBottom: 2 }}>Budget</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--gray-900)' }}>{formatCurrency(b.amount)}</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '8px', background: '#fee2e2', borderRadius: 8 }}>
                      <div style={{ fontSize: '0.7rem', color: '#991b1b', marginBottom: 2 }}>Spent</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#991b1b' }}>{formatCurrency(b.spent)}</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '8px', background: '#d1fae5', borderRadius: 8 }}>
                      <div style={{ fontSize: '0.7rem', color: '#065f46', marginBottom: 2 }}>Remaining</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#065f46' }}>{formatCurrency(b.remaining)}</div>
                    </div>
                  </div>

                  {b.percentageUsed >= 100 && (
                    <div className="alert alert-error" style={{ padding: '8px 12px', marginBottom: 12 }}>⚠️ Budget exceeded by {formatCurrency(Math.abs(b.remaining))}</div>
                  )}
                  {b.percentageUsed >= 80 && b.percentageUsed < 100 && (
                    <div className="alert alert-warning" style={{ padding: '8px 12px', marginBottom: 12 }}>⚡ {(100 - b.percentageUsed).toFixed(1)}% of budget remaining</div>
                  )}

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => setModal(b)}>Edit</button>
                    <button className="btn btn-outline-danger btn-sm" style={{ flex: 1 }} onClick={() => setDeleteId(b.id)}>Delete</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <BudgetModal budget={modal === 'create' ? null : modal} categories={categories}
          onClose={() => setModal(null)} onSave={() => { setModal(null); loadData(); }} />
      )}

      <ConfirmDialog isOpen={!!deleteId} title="Delete Budget"
        message="Are you sure you want to delete this budget? This action cannot be undone."
        onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
