import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, Edit2, Trash2, TrendingUp, TrendingDown, SlidersHorizontal, X, ArrowUpDown } from 'lucide-react';
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
  const [categories, setCategories]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [pagination, setPagination]     = useState({ page:0, totalPages:1, totalElements:0 });
  const [deleteId, setDeleteId]         = useState(null);
  const [filters, setFilters]           = useState({ type:'', categoryId:'', startDate:'', endDate:'', search:'' });
  const [page, setPage]                 = useState(0);
  const [sortDir, setSortDir]           = useState('desc');
  const [showFilters, setShowFilters]   = useState(false);

  const loadCategories = async () => {
    try { const res = await getCategories(); setCategories(res.data.data); } catch {}
  };

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, size:10, sortBy:'transactionDate', sortDir };
      if (filters.type)       params.type       = filters.type;
      if (filters.categoryId) params.categoryId = filters.categoryId;
      if (filters.startDate)  params.startDate  = filters.startDate;
      if (filters.endDate)    params.endDate    = filters.endDate;
      if (filters.search)     params.search     = filters.search;
      const res  = await getTransactions(params);
      const data = res.data.data;
      setTransactions(data.content);
      setPagination({ page:data.pageNumber, totalPages:data.totalPages, totalElements:data.totalElements });
    } catch { toast.error('Failed to load transactions'); }
    finally   { setLoading(false); }
  }, [page, filters, sortDir]);

  useEffect(() => { loadCategories(); }, []);
  useEffect(() => { loadTransactions(); }, [loadTransactions]);

  const setFilter = (field, value) => { setFilters(f => ({ ...f, [field]:value })); setPage(0); };
  const clearFilters = () => { setFilters({ type:'', categoryId:'', startDate:'', endDate:'', search:'' }); setPage(0); };
  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  const handleDelete = async () => {
    try {
      await deleteTransaction(deleteId);
      toast.success('Transaction deleted');
      setDeleteId(null);
      loadTransactions();
    } catch (err) { toast.error(getErrorMessage(err)); }
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">{pagination.totalElements} total transactions</p>
        </div>
        <Link to="/transactions/new" className="btn btn-primary" style={{ gap:7 }}>
          <Plus size={15} strokeWidth={2.5} /> Add Transaction
        </Link>
      </div>

      {/* Filters bar */}
      <div className="card" style={{ marginBottom:20 }}>
        <div className="card-body" style={{ padding:'16px 20px' }}>
          <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
            {/* Search */}
            <div className="input-group" style={{ flex:'2 1 200px' }}>
              <Search size={15} className="input-icon" />
              <input type="text" className="form-control" placeholder="Search transactions…"
                value={filters.search} onChange={e => setFilter('search', e.target.value)} />
              {filters.search && (
                <button className="txn-clear-search" onClick={() => setFilter('search', '')}>
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Type quick filter */}
            <div className="txn-type-tabs">
              {[
                { val:'',        label:'All'      },
                { val:'INCOME',  label:'↑ Income' },
                { val:'EXPENSE', label:'↓ Expense'},
              ].map(({ val, label }) => (
                <button key={val}
                  className={`txn-type-tab ${filters.type === val ? `active-${val || 'all'}` : ''}`}
                  onClick={() => setFilter('type', val)}>
                  {label}
                </button>
              ))}
            </div>

            <button className={`btn btn-secondary btn-sm ${showFilters ? 'txn-filter-active' : ''}`}
              onClick={() => setShowFilters(v => !v)} style={{ gap:6 }}>
              <SlidersHorizontal size={14} />
              Filters
              {hasActiveFilters && <span className="txn-filter-dot" />}
            </button>

            {hasActiveFilters && (
              <button className="btn btn-ghost btn-sm" onClick={clearFilters}
                style={{ gap:4, color:'var(--expense)' }}>
                <X size={13} /> Clear
              </button>
            )}

            <div style={{ marginLeft:'auto' }}>
              <select className="form-control btn-sm"
                style={{ width:'auto', fontSize:'0.8125rem', padding:'7px 32px 7px 12px' }}
                value={sortDir} onChange={e => { setSortDir(e.target.value); setPage(0); }}>
                <option value="desc">Newest first</option>
                <option value="asc">Oldest first</option>
              </select>
            </div>
          </div>

          {/* Expanded filters */}
          {showFilters && (
            <div className="txn-expanded-filters">
              <div className="filter-group">
                <span className="filter-label">Category</span>
                <select className="form-control" value={filters.categoryId}
                  onChange={e => setFilter('categoryId', e.target.value)}>
                  <option value="">All categories</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <span className="filter-label">From date</span>
                <input type="date" className="form-control" value={filters.startDate}
                  onChange={e => setFilter('startDate', e.target.value)} />
              </div>
              <div className="filter-group">
                <span className="filter-label">To date</span>
                <input type="date" className="form-control" value={filters.endDate}
                  onChange={e => setFilter('endDate', e.target.value)} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-body" style={{ padding:0 }}>
          {loading ? <LoadingSpinner /> : transactions.length === 0 ? (
            <EmptyState icon="💳" title="No transactions found"
              message={hasActiveFilters ? 'Try adjusting your filters.' : 'Add your first transaction to get started.'}
              action={
                <Link to="/transactions/new" className="btn btn-primary btn-sm">
                  <Plus size={13} /> Add Transaction
                </Link>
              } />
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th style={{ textAlign:'right' }}>Amount</th>
                    <th style={{ textAlign:'center', width:100 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(t => (
                    <tr key={t.id}>
                      <td>
                        <span style={{ fontSize:'0.8rem', color:'var(--cream-600)', fontWeight:500 }}>
                          {formatDate(t.transactionDate)}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${t.type.toLowerCase()}`}>
                          {t.type === 'INCOME' ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                          {t.type}
                        </span>
                      </td>
                      <td><span className="chip">{t.categoryName}</span></td>
                      <td style={{ maxWidth:200 }}>
                        <span style={{ fontSize:'0.855rem', color:'var(--cream-600)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', display:'block' }}>
                          {t.description || <span style={{ color:'var(--cream-300)', fontStyle:'italic' }}>No description</span>}
                        </span>
                      </td>
                      <td style={{ textAlign:'right' }}>
                        <span className={`txn-amount ${t.type === 'INCOME' ? 'inc' : 'exp'}`}>
                          {t.type === 'INCOME' ? '+' : '−'}{formatCurrency(t.amount)}
                        </span>
                      </td>
                      <td style={{ textAlign:'center' }}>
                        <div style={{ display:'flex', gap:6, justifyContent:'center' }}>
                          <button className="btn btn-ghost btn-icon" title="Edit"
                            onClick={() => navigate(`/transactions/edit/${t.id}`)}>
                            <Edit2 size={14} />
                          </button>
                          <button className="btn btn-ghost btn-icon" title="Delete"
                            onClick={() => setDeleteId(t.id)}
                            style={{ color:'var(--expense)' }}>
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
        {!loading && transactions.length > 0 && (
          <div className="card-footer">
            <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      <ConfirmDialog isOpen={!!deleteId} title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action is permanent."
        onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />

      <style>{`
        .txn-type-tabs { display:flex; background:var(--cream-100); border-radius:var(--radius); padding:3px; gap:2px; }
        .txn-type-tab {
          padding:6px 12px; border-radius:8px; border:none; background:transparent;
          font-size:0.8rem; font-weight:500; color:var(--cream-500); cursor:pointer;
          transition:all var(--t-fast); white-space:nowrap; font-family:var(--font-sans);
        }
        .txn-type-tab:hover { color:var(--charcoal); }
        .txn-type-tab.active-all     { background:white; color:var(--charcoal);      font-weight:600; box-shadow:var(--shadow-xs); }
        .txn-type-tab.active-INCOME  { background:var(--income-bg); color:var(--income);  font-weight:700; }
        .txn-type-tab.active-EXPENSE { background:var(--expense-bg); color:var(--expense); font-weight:700; }

        .txn-filter-active { border-color:var(--primary) !important; color:var(--primary) !important; }
        .txn-filter-dot { width:7px; height:7px; border-radius:50%; background:var(--terracotta); flex-shrink:0; }

        .txn-clear-search {
          position:absolute; right:10px; top:50%; transform:translateY(-50%);
          background:none; border:none; cursor:pointer; color:var(--cream-400);
          display:flex; align-items:center; padding:2px; border-radius:4px;
          transition:color var(--t-fast);
        }
        .txn-clear-search:hover { color:var(--charcoal); }

        .txn-expanded-filters {
          margin-top:14px; padding-top:14px;
          border-top:1px solid var(--cream-100);
          display:flex; gap:12px; flex-wrap:wrap;
        }

        .txn-amount { font-size:0.95rem; font-weight:700; }
        .txn-amount.inc { color:var(--income);  }
        .txn-amount.exp { color:var(--expense); }

        @media (max-width:768px) {
          .txn-type-tabs { flex-wrap:wrap; }
          .txn-expanded-filters { flex-direction:column; }
        }
        @media (max-width:640px) {
          .table th:nth-child(4),
          .table td:nth-child(4) { display:none; }
        }
        @media (max-width:480px) {
          .table th:nth-child(2),
          .table td:nth-child(2) { display:none; }
        }
      `}</style>
    </div>
  );
}
