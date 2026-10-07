import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Tag, Calendar, FileText, Save } from 'lucide-react';
import { createTransaction, updateTransaction, getTransactionById } from '../../api/transactions';
import { getCategories } from '../../api/categories';
import { getErrorMessage } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function TransactionForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({
    type: 'EXPENSE', amount: '', categoryId: '', description: '',
    transactionDate: new Date().toISOString().split('T')[0],
  });
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catRes = await getCategories();
        setCategories(catRes.data.data);
        if (isEdit) {
          const txRes = await getTransactionById(id);
          const tx = txRes.data.data;
          setForm({ type: tx.type, amount: tx.amount.toString(), categoryId: tx.categoryId.toString(), description: tx.description || '', transactionDate: tx.transactionDate });
        }
      } catch { toast.error('Failed to load form data'); navigate('/transactions'); }
      finally { setLoadingData(false); }
    };
    fetchData();
  }, [id, isEdit, navigate]);

  useEffect(() => {
    const filtered = categories.filter(c => c.type === form.type);
    setFilteredCategories(filtered);
    if (!filtered.find(c => c.id.toString() === form.categoryId)) {
      setForm(f => ({ ...f, categoryId: '' }));
    }
  }, [form.type, categories]);

  const validate = () => {
    const e = {};
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) e.amount = 'Enter a valid amount greater than 0';
    if (!form.categoryId) e.categoryId = 'Please select a category';
    if (!form.transactionDate) e.transactionDate = 'Date is required';
    return e;
  };

  const set = field => e => { setForm(f => ({ ...f, [field]: e.target.value })); setErrors(er => ({ ...er, [field]: '' })); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const payload = { type: form.type, amount: parseFloat(form.amount), categoryId: parseInt(form.categoryId), description: form.description || null, transactionDate: form.transactionDate };
      if (isEdit) { await updateTransaction(id, payload); toast.success('Transaction updated'); }
      else { await createTransaction(payload); toast.success('Transaction added'); }
      navigate('/transactions');
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setLoading(false); }
  };

  if (loadingData) return <LoadingSpinner message="Loading..." />;

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', animation: 'fadeIn 0.3s ease' }}>
      {/* Back */}
      <Link to="/transactions" className="btn btn-ghost btn-sm" style={{ gap: 6, marginBottom: 20, color: 'var(--gray-500)' }}>
        <ArrowLeft size={15} /> Back to Transactions
      </Link>

      <div className="card">
        {/* Header */}
        <div className="card-header" style={{ background: form.type === 'INCOME' ? 'var(--income-bg)' : 'var(--expense-bg)', borderBottom: `1px solid ${form.type === 'INCOME' ? 'var(--income-border)' : 'var(--expense-border)'}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: form.type === 'INCOME' ? 'var(--income)' : 'var(--expense)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              {form.type === 'INCOME' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
            </div>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--gray-900)' }}>
                {isEdit ? 'Edit Transaction' : 'New Transaction'}
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: 1 }}>
                {isEdit ? 'Update transaction details' : 'Record income or expense'}
              </p>
            </div>
          </div>
        </div>

        <div className="card-body">
          <form onSubmit={handleSubmit} noValidate>
            {/* Type Toggle */}
            <div className="form-group">
              <label className="form-label">Transaction type</label>
              <div style={{ display: 'flex', gap: 10 }}>
                {[
                  { val: 'INCOME', icon: TrendingUp, label: 'Income', color: 'var(--income)', bg: 'var(--income-bg)', border: 'var(--income-border)' },
                  { val: 'EXPENSE', icon: TrendingDown, label: 'Expense', color: 'var(--expense)', bg: 'var(--expense-bg)', border: 'var(--expense-border)' },
                ].map(({ val, icon: Icon, label, color, bg, border }) => (
                  <button key={val} type="button" onClick={() => { setForm(f => ({ ...f, type: val })); setErrors(er => ({ ...er, categoryId: '' })); }}
                    style={{
                      flex: 1, padding: '12px 16px',
                      border: `2px solid ${form.type === val ? color : 'var(--gray-200)'}`,
                      borderRadius: 'var(--radius)',
                      background: form.type === val ? bg : 'var(--white)',
                      color: form.type === val ? color : 'var(--gray-400)',
                      fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
                      transition: 'all var(--t-base) var(--ease)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      fontFamily: 'var(--font-sans)',
                    }}>
                    <Icon size={16} /> {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount */}
            <div className="form-group">
              <label className="form-label">Amount (₹) *</label>
              <div className="input-group">
                <DollarSign size={15} className="input-icon" />
                <input type="number" className={`form-control ${errors.amount ? 'error' : ''}`}
                  placeholder="0.00" value={form.amount} onChange={set('amount')}
                  min="0.01" step="0.01" />
              </div>
              {errors.amount && <div className="form-error">{errors.amount}</div>}
            </div>

            {/* Category */}
            <div className="form-group">
              <label className="form-label">Category *</label>
              <div className="input-group">
                <Tag size={15} className="input-icon" />
                <select className={`form-control ${errors.categoryId ? 'error' : ''}`}
                  value={form.categoryId} onChange={set('categoryId')}>
                  <option value="">Select a category</option>
                  {filteredCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              {errors.categoryId && <div className="form-error">{errors.categoryId}</div>}
            </div>

            {/* Date */}
            <div className="form-group">
              <label className="form-label">Date *</label>
              <div className="input-group">
                <Calendar size={15} className="input-icon" />
                <input type="date" className={`form-control ${errors.transactionDate ? 'error' : ''}`}
                  value={form.transactionDate} onChange={set('transactionDate')} />
              </div>
              {errors.transactionDate && <div className="form-error">{errors.transactionDate}</div>}
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">
                Description <span style={{ color: 'var(--gray-300)', fontWeight: 400 }}>— optional</span>
              </label>
              <textarea className="form-control" rows={3}
                placeholder="Add a note about this transaction..."
                value={form.description} onChange={set('description')}
                style={{ resize: 'vertical' }} maxLength={500} />
              <div className="form-hint">{form.description.length}/500 characters</div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
              <button type="button" className="btn btn-secondary" style={{ flex: 1 }}
                onClick={() => navigate('/transactions')}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ flex: 2, gap: 8 }} disabled={loading}>
                {loading ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />Saving...</>
                  : <><Save size={15} />{isEdit ? 'Update Transaction' : 'Add Transaction'}</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
