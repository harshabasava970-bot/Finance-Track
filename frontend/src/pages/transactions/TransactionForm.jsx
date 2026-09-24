import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
    type: 'EXPENSE',
    amount: '',
    categoryId: '',
    description: '',
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
          setForm({
            type: tx.type,
            amount: tx.amount.toString(),
            categoryId: tx.categoryId.toString(),
            description: tx.description || '',
            transactionDate: tx.transactionDate,
          });
        }
      } catch {
        toast.error('Failed to load form data');
        navigate('/transactions');
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [id, isEdit, navigate]);

  useEffect(() => {
    setFilteredCategories(categories.filter(c => c.type === form.type));
    if (!categories.find(c => c.id.toString() === form.categoryId && c.type === form.type)) {
      setForm(f => ({ ...f, categoryId: '' }));
    }
  }, [form.type, categories]);

  const validate = () => {
    const e = {};
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) e.amount = 'Amount must be greater than 0';
    if (!form.categoryId) e.categoryId = 'Category is required';
    if (!form.transactionDate) e.transactionDate = 'Date is required';
    return e;
  };

  const set = (field) => (e) => { setForm(f => ({ ...f, [field]: e.target.value })); setErrors(er => ({ ...er, [field]: '' })); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const payload = {
        type: form.type,
        amount: parseFloat(form.amount),
        categoryId: parseInt(form.categoryId),
        description: form.description || null,
        transactionDate: form.transactionDate,
      };
      if (isEdit) {
        await updateTransaction(id, payload);
        toast.success('Transaction updated successfully');
      } else {
        await createTransaction(payload);
        toast.success('Transaction added successfully');
      }
      navigate('/transactions');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) return <LoadingSpinner message="Loading..." />;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">{isEdit ? 'Edit Transaction' : 'Add Transaction'}</h1>
          <p className="page-subtitle">{isEdit ? 'Update transaction details' : 'Record a new income or expense'}</p>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit} noValidate>
            {/* Type Toggle */}
            <div className="form-group">
              <label className="form-label">Transaction Type</label>
              <div style={{ display: 'flex', gap: 12 }}>
                {['INCOME', 'EXPENSE'].map(type => (
                  <button key={type} type="button"
                    style={{
                      flex: 1, padding: '12px', border: `2px solid ${form.type === type ? (type === 'INCOME' ? 'var(--success)' : 'var(--danger)') : 'var(--gray-200)'}`,
                      borderRadius: 10, background: form.type === type ? (type === 'INCOME' ? '#d1fae5' : '#fee2e2') : 'var(--white)',
                      color: form.type === type ? (type === 'INCOME' ? '#065f46' : '#991b1b') : 'var(--gray-500)',
                      fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s',
                    }}
                    onClick={() => { setForm(f => ({ ...f, type })); setErrors(er => ({ ...er, categoryId: '' })); }}>
                    {type === 'INCOME' ? '💰 Income' : '💸 Expense'}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Amount (₹) *</label>
              <input type="number" className={`form-control ${errors.amount ? 'error' : ''}`}
                placeholder="0.00" value={form.amount} onChange={set('amount')}
                min="0.01" step="0.01" />
              {errors.amount && <div className="form-error">{errors.amount}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className={`form-control ${errors.categoryId ? 'error' : ''}`}
                value={form.categoryId} onChange={set('categoryId')}>
                <option value="">Select a category</option>
                {filteredCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.categoryId && <div className="form-error">{errors.categoryId}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Date *</label>
              <input type="date" className={`form-control ${errors.transactionDate ? 'error' : ''}`}
                value={form.transactionDate} onChange={set('transactionDate')} />
              {errors.transactionDate && <div className="form-error">{errors.transactionDate}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Description <span style={{ color: 'var(--gray-400)' }}>(optional)</span></label>
              <textarea className="form-control" rows={3}
                placeholder="Add a note about this transaction..."
                value={form.description} onChange={set('description')}
                style={{ resize: 'vertical' }} maxLength={500} />
              <div className="form-hint">{form.description.length}/500 characters</div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button type="button" className="btn btn-secondary" style={{ flex: 1 }}
                onClick={() => navigate('/transactions')}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={loading}>
                {loading ? 'Saving...' : isEdit ? 'Update Transaction' : 'Add Transaction'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
