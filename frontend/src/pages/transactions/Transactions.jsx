import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getTransactions, deleteTransaction } from '../../api/transactions';
import { getCategories } from '../../api/categories';
import { formatCurrency, formatDate, getErrorMessage } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Pagination from '../../components/common/Pagination';
import toast from 'react-hot-toast';

export default function Transactions() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 0, totalPages: 1, totalElements: 0 });
  const [deleteId, setDeleteId] = useState(null);
  const [filters, setFilters] = useState({ type: '', categoryId: '', startDate: '', endDate: '', search: '' });
  const [page, setPage] = useState(0);
  const [sortDir, setSortDir] = useState('desc');

  const loadCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data.data);
    } catch { /* noop */ }
  };

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, size: 10, sortBy: 'transactionDate', sortDir };
      if (filters.type) params.type = filters.type;
      if (filters.categoryId) params.categoryId = filters.categoryId;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.search) params.search = filters.search;
      const res = await getTransactions(params);
      const data = res.data.data;
      setTransactions(data.content);
      setPagination({ page: data.pageNumber, totalPages: data.totalPages, totalElements: data.totalElements });
    } catch {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [page, filters, sortDir]);

  useEffect(() => { loadCategories(); }, []);
  useEffect(() => { loadTransactions(); }, [loadTransactions]);

  const handleFilter = (field, value) => {
    setFilters(f => ({ ...f, [field]: value }));
    setPage(0);
  };

  const handleDelete = async () => {
    try {
      await deleteTransaction(deleteId);
      toast.success('Transaction deleted');
      setDeleteId(null);
      loadTransactions();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">{pagination.totalElements} total transaction{pagination.totalElements !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/transactions/new" className="btn btn-primary">+ Add Transaction</Link>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body" style={{ padding: '16px 20px' }}>
          <div className="filters-bar" style={{ marginBottom: 0 }}>
            <div className="filter-group" style={{ flex: 2, minWidth: 200 }}>
              <label>Search</label>
              <input type="text" className="form-control" placeholder="Search transactions..."
                value={filters.search} onChange={e => handleFilter('search', e.target.value)} />
            </div>
            <div className="filter-group">
              <label>Type</label>
              <select className="form-control" value={filters.type} onChange={e => handleFilter('type', e.target.value)}>
                <option value="">All Types</option>
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Category</label>
              <select className="form-control" value={filters.categoryId} onChange={e => handleFilter('categoryId', e.target.value)}>
                <option value="">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name} ({c.type})</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label>From</label>
              <input type="date" className="form-control" value={filters.startDate} onChange={e => handleFilter('startDate', e.target.value)} />
            </div>
            <div className="filter-group">
              <label>To</label>
              <input type="date" className="form-control" value={filters.endDate} onChange={e => handleFilter('endDate', e.target.value)} />
            </div>
            <div className="filter-group">
              <label>Sort</label>
              <select className="form-control" value={sortDir} onChange={e => { setSortDir(e.target.value); setPage(0); }}>
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
            <button className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-end' }}
              onClick={() => { setFilters({ type: '', categoryId: '', startDate: '', endDate: '', search: '' }); setPage(0); }}>
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? <LoadingSpinner /> : transactions.length === 0 ? (
            <EmptyState icon="💳" title="No transactions found"
              message="Add your first transaction to get started."
              action={<Link to="/transactions/new" className="btn btn-primary">Add Transaction</Link>} />
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(t => (
                    <tr key={t.id}>
                      <td style={{ whiteSpace: 'nowrap', color: 'var(--gray-500)', fontSize: '0.85rem' }}>
                        {formatDate(t.transactionDate)}
                      </td>
                      <td>
                        <span className={`badge badge-${t.type.toLowerCase()}`}>{t.type}</span>
                      </td>
                      <td>
                        <span style={{ background: 'var(--gray-100)', padding: '3px 10px', borderRadius: 100, fontSize: '0.8rem', color: 'var(--gray-700)' }}>
                          {t.categoryName}
                        </span>
                      </td>
                      <td style={{ color: 'var(--gray-600)', fontSize: '0.875rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {t.description || '—'}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: t.type === 'INCOME' ? 'var(--success)' : 'var(--danger)', fontSize: '0.95rem' }}>
                        {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/transactions/edit/${t.id}`)}>Edit</button>
                          <button className="btn btn-outline-danger btn-sm" onClick={() => setDeleteId(t.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {!loading && transactions.length > 0 && (
          <div className="card-footer">
            <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      <ConfirmDialog isOpen={!!deleteId}
        title="Delete Transaction" message="Are you sure you want to delete this transaction? This cannot be undone."
        onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
