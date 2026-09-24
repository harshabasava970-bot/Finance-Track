import { useState, useEffect, useCallback } from 'react';
import { getReportTransactions, getReportSummary, exportCsv } from '../../api/reports';
import { getCategories } from '../../api/categories';
import { formatCurrency, formatDate, getDateRange, getErrorMessage } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import toast from 'react-hot-toast';

const FILTER_OPTIONS = [
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'last_3_months', label: 'Last 3 Months' },
  { value: 'last_6_months', label: 'Last 6 Months' },
  { value: 'this_year', label: 'This Year' },
  { value: 'custom', label: 'Custom Range' },
];

export default function Reports() {
  const [filter, setFilter] = useState('this_month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [search, setSearch] = useState('');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(0);

  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState({ page: 0, totalPages: 1, totalElements: 0 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const getParams = useCallback(() => {
    const range = filter === 'custom'
      ? { startDate: customStart || undefined, endDate: customEnd || undefined }
      : getDateRange(filter);
    return { ...range, type: typeFilter || undefined, categoryId: categoryId || undefined, search: search || undefined };
  }, [filter, customStart, customEnd, typeFilter, categoryId, search]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = getParams();
      const [txRes, sumRes, catRes] = await Promise.all([
        getReportTransactions({ ...params, page, size: 20, sortBy: 'transactionDate', sortDir }),
        getReportSummary(params),
        getCategories(),
      ]);
      const txData = txRes.data.data;
      setTransactions(txData.content);
      setPagination({ page: txData.pageNumber, totalPages: txData.totalPages, totalElements: txData.totalElements });
      setSummary(sumRes.data.data);
      setCategories(catRes.data.data);
    } catch { toast.error('Failed to load report data'); }
    finally { setLoading(false); }
  }, [getParams, page, sortDir]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { setPage(0); }, [filter, customStart, customEnd, typeFilter, categoryId, search]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = getParams();
      const res = await exportCsv({ ...params, type: typeFilter || undefined, categoryId: categoryId || undefined });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
      const a = document.createElement('a');
      a.href = url; a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
      a.click(); URL.revokeObjectURL(url);
      toast.success('Export downloaded');
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setExporting(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports & History</h1>
          <p className="page-subtitle">Complete transaction history and financial reports</p>
        </div>
        <button className="btn btn-success" onClick={handleExport} disabled={exporting}>
          {exporting ? '⏳ Exporting...' : '⬇️ Export CSV'}
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body" style={{ padding: '16px 20px' }}>
          <div className="filters-bar" style={{ marginBottom: 0 }}>
            <div className="filter-group">
              <label>Period</label>
              <select className="form-control" value={filter} onChange={e => setFilter(e.target.value)}>
                {FILTER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            {filter === 'custom' && (
              <>
                <div className="filter-group">
                  <label>From</label>
                  <input type="date" className="form-control" value={customStart} onChange={e => setCustomStart(e.target.value)} />
                </div>
                <div className="filter-group">
                  <label>To</label>
                  <input type="date" className="form-control" value={customEnd} onChange={e => setCustomEnd(e.target.value)} />
                </div>
              </>
            )}
            <div className="filter-group">
              <label>Type</label>
              <select className="form-control" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                <option value="">All Types</option>
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Category</label>
              <select className="form-control" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                <option value="">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="filter-group" style={{ flex: 2, minWidth: 200 }}>
              <label>Search</label>
              <input type="text" className="form-control" placeholder="Search..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="filter-group">
              <label>Sort</label>
              <select className="form-control" value={sortDir} onChange={e => setSortDir(e.target.value)}>
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="summary-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
          <div className="summary-card">
            <div className="card-icon" style={{ background: '#d1fae5' }}>💰</div>
            <div className="card-label">Total Income</div>
            <div className="card-value" style={{ color: 'var(--success)' }}>{formatCurrency(summary.totalIncome)}</div>
          </div>
          <div className="summary-card">
            <div className="card-icon" style={{ background: '#fee2e2' }}>💸</div>
            <div className="card-label">Total Expenses</div>
            <div className="card-value" style={{ color: 'var(--danger)' }}>{formatCurrency(summary.totalExpenses)}</div>
          </div>
          <div className="summary-card">
            <div className="card-icon" style={{ background: '#dbeafe' }}>⚖️</div>
            <div className="card-label">Net Balance</div>
            <div className="card-value" style={{ color: summary.netBalance >= 0 ? 'var(--success)' : 'var(--danger)' }}>
              {formatCurrency(summary.netBalance)}
            </div>
          </div>
          <div className="summary-card">
            <div className="card-icon" style={{ background: '#fef3c7' }}>📊</div>
            <div className="card-label">Transactions</div>
            <div className="card-value">{pagination.totalElements}</div>
          </div>
        </div>
      )}

      {/* Category breakdown */}
      {summary?.expenseByCategory?.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header"><h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Expense by Category</h3></div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {summary.expenseByCategory.map(c => (
                <div key={c.category} style={{ padding: '12px 16px', background: 'var(--gray-50)', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-800)' }}>{c.category}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{c.percentage?.toFixed(1)}%</div>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--danger)', fontSize: '0.9rem' }}>{formatCurrency(c.total)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card">
        <div className="card-header">
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Transaction History</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{pagination.totalElements} records</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? <LoadingSpinner /> : transactions.length === 0 ? (
            <EmptyState icon="📋" title="No transactions found" message="No transactions match your current filters." />
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
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(t => (
                    <tr key={t.id}>
                      <td style={{ whiteSpace: 'nowrap', color: 'var(--gray-500)', fontSize: '0.85rem' }}>{formatDate(t.transactionDate)}</td>
                      <td><span className={`badge badge-${t.type.toLowerCase()}`}>{t.type}</span></td>
                      <td><span style={{ background: 'var(--gray-100)', padding: '3px 10px', borderRadius: 100, fontSize: '0.8rem' }}>{t.categoryName}</span></td>
                      <td style={{ color: 'var(--gray-600)', fontSize: '0.875rem', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.description || '—'}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: t.type === 'INCOME' ? 'var(--success)' : 'var(--danger)' }}>
                        {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
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
    </div>
  );
}
