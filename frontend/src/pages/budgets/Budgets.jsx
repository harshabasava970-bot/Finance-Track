import { useState, useEffect, useCallback } from 'react';
import { Plus, Target, Edit2, Trash2, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getBudgets, createBudget, updateBudget, deleteBudget } from '../../api/budgets';
import { getCategories } from '../../api/categories';
import { formatCurrency, getErrorMessage, getBudgetStatus } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import toast from 'react-hot-toast';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const now = new Date();

function BudgetModal({ budget, categories, onClose, onSave }) {
  const [form, setForm] = useState(budget
    ? { categoryId:budget.categoryId.toString(), amount:budget.amount.toString(), month:budget.month.toString(), year:budget.year.toString() }
    : { categoryId:'', amount:'', month:(now.getMonth()+1).toString(), year:now.getFullYear().toString() }
  );
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const expenseCategories = categories.filter(c => c.type === 'EXPENSE');
  const years = Array.from({ length:5 }, (_, i) => now.getFullYear() - 2 + i);

  const validate = () => {
    const e = {};
    if (!form.categoryId) e.categoryId = 'Category is required';
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) e.amount = 'Enter a valid amount';
    return e;
  };
  const set = f => e => { setForm(p => ({ ...p, [f]:e.target.value })); setErrors(er => ({ ...er, [f]:'' })); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const payload = { categoryId:parseInt(form.categoryId), amount:parseFloat(form.amount), month:parseInt(form.month), year:parseInt(form.year) };
      if (budget) { await updateBudget(budget.id, payload); toast.success('Budget updated'); }
      else        { await createBudget(payload);            toast.success('Budget created'); }
      onSave();
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally       { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth:460 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:'var(--primary-light)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Target size={18} color="var(--primary)" />
            </div>
            <h3 className="modal-title">{budget ? 'Edit Budget' : 'Create Budget'}</h3>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Expense category *</label>
              <select className={`form-control ${errors.categoryId ? 'error' : ''}`}
                value={form.categoryId} onChange={set('categoryId')}>
                <option value="">Select a category</option>
                {expenseCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.categoryId && <div className="form-error">{errors.categoryId}</div>}
              <div className="form-hint">Only expense categories can have budgets</div>
            </div>

            <div className="form-group">
              <label className="form-label">Budget amount (₹) *</label>
              <input type="number" className={`form-control ${errors.amount ? 'error' : ''}`}
                placeholder="0.00" value={form.amount} onChange={set('amount')} min="0.01" step="0.01" />
              {errors.amount && <div className="form-error">{errors.amount}</div>}
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <div className="form-group" style={{ marginBottom:0 }}>
                <label className="form-label">Month</label>
                <select className="form-control" value={form.month} onChange={set('month')}>
                  {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom:0 }}>
                <label className="form-label">Year</label>
                <select className="form-control" value={form.year} onChange={set('year')}>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ gap:7 }}>
              {loading
                ? <><span className="spinner" style={{ width:15, height:15, borderWidth:2 }} />Saving…</>
                : budget ? 'Update Budget' : 'Create Budget'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Budgets() {
  const [budgets, setBudgets]       = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [modal, setModal]           = useState(null);
  const [deleteId, setDeleteId]     = useState(null);
  const [filterMonth, setFilterMonth] = useState((now.getMonth()+1).toString());
  const [filterYear, setFilterYear]   = useState(now.getFullYear().toString());

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [budRes, catRes] = await Promise.all([getBudgets(), getCategories()]);
      setBudgets(budRes.data.data);
      setCategories(catRes.data.data);
    } catch { toast.error('Failed to load budgets'); }
    finally   { setLoading(false); }
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

  const years    = Array.from({ length:5 }, (_, i) => now.getFullYear() - 2 + i);
  const filtered = budgets.filter(b =>
    (filterMonth ? b.month === parseInt(filterMonth) : true) &&
    (filterYear  ? b.year  === parseInt(filterYear)  : true)
  );

  const totalBudgeted = filtered.reduce((s, b) => s + Number(b.amount), 0);
  const totalSpent    = filtered.reduce((s, b) => s + Number(b.spent),  0);
  const overBudget    = filtered.filter(b => b.percentageUsed >= 100).length;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Budget Management</h1>
          <p className="page-subtitle">Set monthly spending limits and track progress</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('create')} style={{ gap:7 }}>
          <Plus size={15} strokeWidth={2.5} /> Create Budget
        </button>
      </div>

      {/* Period filter + alert */}
      <div style={{ display:'flex', gap:10, marginBottom:24, alignItems:'center', flexWrap:'wrap' }}>
        <select className="form-control" style={{ width:160 }}
          value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
          <option value="">All months</option>
          {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
        </select>
        <select className="form-control" style={{ width:110 }}
          value={filterYear} onChange={e => setFilterYear(e.target.value)}>
          <option value="">All years</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        {overBudget > 0 && (
          <div className="alert alert-error" style={{ margin:0, padding:'8px 14px', flex:'1 1 auto' }}>
            <AlertTriangle size={15} />
            {overBudget} budget{overBudget > 1 ? 's' : ''} exceeded — review your spending
          </div>
        )}
      </div>

      {/* Summary strip */}
      {filtered.length > 0 && (
        <div className="bgt-summary">
          <div className="bgt-sum-item">
            <span className="bgt-sum-label">Total Budgeted</span>
            <span className="bgt-sum-val">{formatCurrency(totalBudgeted)}</span>
          </div>
          <div className="bgt-sum-divider" />
          <div className="bgt-sum-item">
            <span className="bgt-sum-label">Total Spent</span>
            <span className="bgt-sum-val" style={{ color:'var(--expense)' }}>{formatCurrency(totalSpent)}</span>
          </div>
          <div className="bgt-sum-divider" />
          <div className="bgt-sum-item">
            <span className="bgt-sum-label">Remaining</span>
            <span className="bgt-sum-val" style={{ color:'var(--income)' }}>{formatCurrency(totalBudgeted - totalSpent)}</span>
          </div>
          <div className="bgt-sum-divider" />
          <div className="bgt-sum-item">
            <span className="bgt-sum-label">Overall Usage</span>
            <span className="bgt-sum-val">
              {totalBudgeted > 0 ? ((totalSpent / totalBudgeted) * 100).toFixed(0) : 0}%
            </span>
          </div>
        </div>
      )}

      {/* Budget cards */}
      {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
        <div className="card">
          <div className="card-body">
            <EmptyState icon={<Target size={40} color="var(--cream-300)" />}
              title="No budgets for this period"
              message="Create a budget to start tracking your spending limits."
              action={
                <button className="btn btn-primary btn-sm" onClick={() => setModal('create')}>
                  <Plus size={13} /> Create Budget
                </button>
              } />
          </div>
        </div>
      ) : (
        <div className="bgt-grid">
          {filtered.map(b => {
            const status = getBudgetStatus(b.percentageUsed);
            const pct    = Math.min(b.percentageUsed, 100);
            return (
              <div key={b.id} className={`bgt-card bgt-card-${status}`}>
                <div className="bgt-card-head">
                  <div>
                    <h3 className="bgt-category">{b.categoryName}</h3>
                    <p className="bgt-period">{MONTHS[b.month-1]} {b.year}</p>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span className={`badge badge-${status === 'danger' ? 'danger' : status === 'warning' ? 'warning' : 'success'}`}>
                      {b.percentageUsed?.toFixed(0)}%
                    </span>
                    {status === 'danger' && <AlertCircle size={16} color="var(--expense)" />}
                    {status === 'good'   && <CheckCircle2 size={16} color="var(--income)" />}
                  </div>
                </div>

                <div style={{ margin:'14px 0 10px' }}>
                  <div className="progress-bar" style={{ height:8 }}>
                    <div className={`progress-fill progress-${status}`} style={{ width:`${pct}%` }} />
                  </div>
                </div>

                <div className="bgt-stats">
                  <div className="bgt-stat">
                    <span className="bgt-stat-label">Budget</span>
                    <span className="bgt-stat-val">{formatCurrency(b.amount)}</span>
                  </div>
                  <div className="bgt-stat">
                    <span className="bgt-stat-label">Spent</span>
                    <span className="bgt-stat-val" style={{ color:'var(--expense)' }}>{formatCurrency(b.spent)}</span>
                  </div>
                  <div className="bgt-stat">
                    <span className="bgt-stat-label">Remaining</span>
                    <span className="bgt-stat-val" style={{ color: Number(b.remaining) >= 0 ? 'var(--income)' : 'var(--expense)' }}>
                      {formatCurrency(b.remaining)}
                    </span>
                  </div>
                </div>

                {b.percentageUsed >= 100 && (
                  <div className="alert alert-error" style={{ marginTop:12, marginBottom:0, padding:'8px 12px', fontSize:'0.8rem' }}>
                    <AlertTriangle size={13} /> Over budget by {formatCurrency(Math.abs(b.remaining))}
                  </div>
                )}
                {b.percentageUsed >= 80 && b.percentageUsed < 100 && (
                  <div className="alert alert-warning" style={{ marginTop:12, marginBottom:0, padding:'8px 12px', fontSize:'0.8rem' }}>
                    <AlertCircle size={13} /> Only {(100 - b.percentageUsed).toFixed(0)}% remaining
                  </div>
                )}

                <div className="bgt-actions">
                  <button className="btn btn-secondary btn-sm" style={{ flex:1, gap:6 }} onClick={() => setModal(b)}>
                    <Edit2 size={13} /> Edit
                  </button>
                  <button className="btn btn-outline-danger btn-sm" style={{ flex:1, gap:6 }} onClick={() => setDeleteId(b.id)}>
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <BudgetModal
          budget={modal === 'create' ? null : modal}
          categories={categories}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); loadData(); }}
        />
      )}

      <ConfirmDialog isOpen={!!deleteId} title="Delete Budget"
        message="Are you sure you want to delete this budget? This action cannot be undone."
        onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />

      <style>{`
        .bgt-summary {
          display:flex; align-items:center;
          background:var(--white); border:1px solid var(--cream-150);
          border-radius:var(--radius-md); box-shadow:var(--shadow-sm);
          margin-bottom:24px; overflow:hidden;
        }
        .bgt-sum-item    { flex:1; padding:18px 20px; text-align:center; }
        .bgt-sum-label   { font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; color:var(--cream-500); display:block; margin-bottom:5px; }
        .bgt-sum-val     { font-size:1.2rem; font-weight:800; color:var(--charcoal); letter-spacing:-0.03em; }
        .bgt-sum-divider { width:1px; height:44px; background:var(--cream-100); flex-shrink:0; }

        .bgt-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(300px,1fr)); gap:20px; }

        .bgt-card {
          background:var(--white); border-radius:var(--radius-md);
          border:1px solid var(--cream-150); padding:20px;
          box-shadow:var(--shadow-sm);
          transition:box-shadow var(--t-base) var(--ease), transform var(--t-base) var(--ease);
        }
        .bgt-card:hover         { box-shadow:var(--shadow); transform:translateY(-2px); }
        .bgt-card-danger  { border-left:3px solid var(--expense); }
        .bgt-card-warning { border-left:3px solid var(--terracotta); }
        .bgt-card-good    { border-left:3px solid var(--income); }

        .bgt-card-head  { display:flex; justify-content:space-between; align-items:flex-start; gap:12px; }
        .bgt-category   { font-size:1rem; font-weight:700; color:var(--charcoal); letter-spacing:-0.02em; }
        .bgt-period     { font-size:0.78rem; color:var(--cream-500); margin-top:3px; }

        .bgt-stats       { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-bottom:16px; }
        .bgt-stat        { background:var(--cream-50); border-radius:var(--radius-sm); padding:10px 12px; }
        .bgt-stat-label  { font-size:0.68rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--cream-500); display:block; margin-bottom:4px; }
        .bgt-stat-val    { font-size:0.875rem; font-weight:700; color:var(--charcoal-700); }

        .bgt-actions { display:flex; gap:10px; margin-top:16px; }

        @media (max-width:600px) {
          .bgt-summary     { flex-direction:column; }
          .bgt-sum-divider { width:100%; height:1px; }
          .bgt-grid        { grid-template-columns:1fr; }
          .bgt-stats       { grid-template-columns:repeat(3,1fr); }
        }
        @media (max-width:400px) {
          .bgt-stats { grid-template-columns:1fr 1fr; }
        }
      `}</style>
    </div>
  );
}
