import { useState, useEffect, useCallback } from 'react';
import { Download, Search, TrendingUp, TrendingDown, Wallet, Hash, X, SlidersHorizontal } from 'lucide-react';
import { getReportTransactions, getReportSummary, exportCsv } from '../../api/reports';
import { getCategories } from '../../api/categories';
import { formatCurrency, formatDate, getDateRange, getErrorMessage } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import toast from 'react-hot-toast';

const PERIOD_OPTIONS = [
  { value:'this_month',    label:'This Month'    },
  { value:'last_month',    label:'Last Month'    },
  { value:'last_3_months', label:'3 Months'      },
  { value:'last_6_months', label:'6 Months'      },
  { value:'this_year',     label:'This Year'     },
  { value:'custom',        label:'Custom Range'  },
];

export default function Reports() {
  const [period, setPeriod]           = useState('this_month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd]     = useState('');
  const [typeFilter, setTypeFilter]   = useState('');
  const [categoryId, setCategoryId]   = useState('');
  const [search, setSearch]           = useState('');
  const [sortDir, setSortDir]         = useState('desc');
  const [page, setPage]               = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary]           = useState(null);
  const [pagination, setPagination]     = useState({ page:0, totalPages:1, totalElements:0 });
  const [categories, setCategories]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [exporting, setExporting]       = useState(false);

  const getParams = useCallback(() => {
    const range = period === 'custom'
      ? { startDate: customStart || undefined, endDate: customEnd || undefined }
      : getDateRange(period);
    return {
      ...range,
      type:       typeFilter  || undefined,
      categoryId: categoryId  || undefined,
      search:     search      || undefined,
    };
  }, [period, customStart, customEnd, typeFilter, categoryId, search]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = getParams();
      const [txRes, sumRes, catRes] = await Promise.all([
        getReportTransactions({ ...params, page, size:20, sortBy:'transactionDate', sortDir }),
        getReportSummary(params),
        getCategories(),
      ]);
      const txData = txRes.data.data;
      setTransactions(txData.content);
      setPagination({ page:txData.pageNumber, totalPages:txData.totalPages, totalElements:txData.totalElements });
      setSummary(sumRes.data.data);
      setCategories(catRes.data.data);
    } catch { toast.error('Failed to load reports'); }
    finally   { setLoading(false); }
  }, [getParams, page, sortDir]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { setPage(0); }, [period, customStart, customEnd, typeFilter, categoryId, search]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await exportCsv(getParams());
      const url = URL.createObjectURL(new Blob([res.data], { type:'text/csv' }));
      const a   = document.createElement('a');
      a.href     = url;
      a.download = `financetrack_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('CSV exported successfully');
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally       { setExporting(false); }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports &amp; History</h1>
          <p className="page-subtitle">Analyze your complete financial history</p>
        </div>
        <button className="btn btn-teal" onClick={handleExport} disabled={exporting} style={{ gap:7 }}>
          <Download size={15} strokeWidth={2} />
          {exporting ? 'Exporting…' : 'Export CSV'}
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom:24 }}>
        <div className="card-body" style={{ padding:'16px 20px' }}>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
            {/* Period tabs */}
            <div className="rpt-period-tabs">
              {PERIOD_OPTIONS.map(o => (
                <button key={o.value}
                  className={`rpt-period-tab ${period === o.value ? 'active' : ''}`}
                  onClick={() => setPeriod(o.value)}>
                  {o.label}
                </button>
              ))}
            </div>

            {period === 'custom' && (
              <>
                <input type="date" className="form-control" style={{ width:160 }}
                  value={customStart} onChange={e => setCustomStart(e.target.value)} />
                <input type="date" className="form-control" style={{ width:160 }}
                  value={customEnd} onChange={e => setCustomEnd(e.target.value)} />
              </>
            )}

            <div className="input-group" style={{ flex:'1 1 180px' }}>
              <Search size={15} className="input-icon" />
              <input type="text" className="form-control" placeholder="Search transactions…"
                value={search} onChange={e => setSearch(e.target.value)} />
              {search && (
                <button className="rpt-clear" onClick={() => setSearch('')}><X size={13} /></button>
              )}
            </div>

            <button className="btn btn-secondary btn-sm" onClick={() => setShowFilters(v => !v)} style={{ gap:6 }}>
              <SlidersHorizontal size={14} /> More filters
            </button>
          </div>

          {showFilters && (
            <div style={{ marginTop:14, paddingTop:14, borderTop:'1px solid var(--cream-100)', display:'flex', gap:12, flexWrap:'wrap' }}>
              <div className="filter-group">
                <span className="filter-label">Type</span>
                <select className="form-control" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                  <option value="">All types</option>
                  <option value="INCOME">Income</option>
                  <option value="EXPENSE">Expense</option>
                </select>
              </div>
              <div className="filter-group">
                <span className="filter-label">Category</span>
                <select className="form-control" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                  <option value="">All categories</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="filter-group">
                <span className="filter-label">Sort</span>
                <select className="form-control" value={sortDir} onChange={e => setSortDir(e.target.value)}>
                  <option value="desc">Newest first</option>
                  <option value="asc">Oldest first</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="rpt-stat-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background:'var(--income-bg)' }}>
              <TrendingUp size={18} color="var(--income)" />
            </div>
            <div className="stat-label">Total Income</div>
            <div className="stat-value" style={{ color:'var(--income)' }}>{formatCurrency(summary.totalIncome)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background:'var(--expense-bg)' }}>
              <TrendingDown size={18} color="var(--expense)" />
            </div>
            <div className="stat-label">Total Expenses</div>
            <div className="stat-value" style={{ color:'var(--expense)' }}>{formatCurrency(summary.totalExpenses)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: Number(summary.netBalance) >= 0 ? 'var(--income-bg)' : 'var(--expense-bg)' }}>
              <Wallet size={18} color={Number(summary.netBalance) >= 0 ? 'var(--income)' : 'var(--expense)'} />
            </div>
            <div className="stat-label">Net Balance</div>
            <div className="stat-value" style={{ color: Number(summary.netBalance) >= 0 ? 'var(--income)' : 'var(--expense)' }}>
              {formatCurrency(summary.netBalance)}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background:'var(--cream-100)' }}>
              <Hash size={18} color="var(--cream-600)" />
            </div>
            <div className="stat-label">Transactions</div>
            <div className="stat-value">{pagination.totalElements}</div>
          </div>
        </div>
      )}

      {/* Category breakdown */}
      {summary?.expenseByCategory?.length > 0 && (
        <div className="card" style={{ marginBottom:24 }}>
          <div className="card-header">
            <div className="section-title">Expense by Category</div>
          </div>
          <div className="card-body">
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:10 }}>
              {summary.expenseByCategory.map(c => (
                <div key={c.category} className="rpt-cat-item">
                  <div>
                    <div style={{ fontSize:'0.855rem', fontWeight:600, color:'var(--charcoal-700)', marginBottom:3 }}>{c.category}</div>
                    <div style={{ fontSize:'0.75rem', color:'var(--cream-500)' }}>{c.percentage?.toFixed(1)}% of expenses</div>
                  </div>
                  <div style={{ fontSize:'0.9rem', fontWeight:700, color:'var(--expense)' }}>{formatCurrency(c.total)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Transaction table */}
      <div className="card">
        <div className="card-header">
          <div className="section-title">Transaction History</div>
          <span style={{ fontSize:'0.8rem', color:'var(--cream-500)' }}>{pagination.totalElements} records</span>
        </div>
        <div className="card-body" style={{ padding:0 }}>
          {loading ? <LoadingSpinner /> : transactions.length === 0 ? (
            <EmptyState icon="📋" title="No transactions found" message="Try adjusting your filters or date range." />
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
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(t => (
                    <tr key={t.id}>
                      <td style={{ color:'var(--cream-600)', fontSize:'0.8rem', fontWeight:500, whiteSpace:'nowrap' }}>{formatDate(t.transactionDate)}</td>
                      <td><span className={`badge badge-${t.type.toLowerCase()}`}>{t.type === 'INCOME' ? '↑' : '↓'} {t.type}</span></td>
                      <td><span className="chip">{t.categoryName}</span></td>
                      <td style={{ maxWidth:220 }}>
                        <span style={{ fontSize:'0.855rem', color:'var(--cream-600)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', display:'block' }}>
                          {t.description || '—'}
                        </span>
                      </td>
                      <td style={{ textAlign:'right', fontWeight:700, fontSize:'0.9rem', color: t.type === 'INCOME' ? 'var(--income)' : 'var(--expense)', whiteSpace:'nowrap' }}>
                        {t.type === 'INCOME' ? '+' : '−'}{formatCurrency(t.amount)}
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

      <style>{`
        .rpt-period-tabs { display:flex; background:var(--cream-100); border-radius:var(--radius); padding:3px; gap:2px; flex-wrap:wrap; }
        .rpt-period-tab {
          padding:6px 12px; border-radius:8px; border:none; background:transparent;
          font-size:0.8rem; font-weight:500; color:var(--cream-500); cursor:pointer;
          transition:all var(--t-fast); white-space:nowrap; font-family:var(--font-sans);
        }
        .rpt-period-tab:hover  { color:var(--charcoal); }
        .rpt-period-tab.active { background:white; color:var(--charcoal); font-weight:600; box-shadow:var(--shadow-xs); }

        .rpt-clear {
          position:absolute; right:10px; top:50%; transform:translateY(-50%);
          background:none; border:none; cursor:pointer; color:var(--cream-400);
          display:flex; align-items:center; padding:2px; border-radius:4px;
          transition:color var(--t-fast);
        }
        .rpt-clear:hover { color:var(--charcoal); }

        .rpt-stat-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:18px; margin-bottom:24px; }

        .rpt-cat-item {
          padding:12px 14px; background:var(--cream-50);
          border:1px solid var(--cream-100); border-radius:var(--radius);
          display:flex; justify-content:space-between; align-items:center; gap:8px;
          transition:box-shadow var(--t-fast);
        }
        .rpt-cat-item:hover { box-shadow:var(--shadow-sm); }

        @media (max-width:900px) {
          .rpt-stat-grid { grid-template-columns:repeat(2,1fr); }
        }
        @media (max-width:600px) {
          .rpt-stat-grid  { grid-template-columns:1fr 1fr; }
          .rpt-period-tabs { overflow-x:auto; flex-wrap:nowrap; }
          .table th:nth-child(4),
          .table td:nth-child(4) { display:none; }
        }
      `}</style>
    </div>
  );
}
