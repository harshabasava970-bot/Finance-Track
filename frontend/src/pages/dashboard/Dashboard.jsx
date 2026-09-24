import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { getDashboardSummary, getMonthlyData, getCategorySpending, getBudgetAnalysis } from '../../api/dashboard';
import { formatCurrency, getDateRange, getBudgetStatus } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const COLORS = ['#4f46e5','#06b6d4','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#14b8a6'];

const FILTER_OPTIONS = [
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'last_3_months', label: 'Last 3 Months' },
  { value: 'last_6_months', label: 'Last 6 Months' },
  { value: 'this_year', label: 'This Year' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
        <p style={{ fontWeight: 600, marginBottom: 4, color: '#1e293b' }}>{label}</p>
        {payload.map(p => (
          <p key={p.name} style={{ color: p.color, fontSize: '0.8rem' }}>
            {p.name}: {formatCurrency(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [filter, setFilter] = useState('this_month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [summary, setSummary] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [categories, setCategories] = useState([]);
  const [budgetAnalysis, setBudgetAnalysis] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      let params = {};
      if (filter === 'custom') {
        if (customStart) params.startDate = customStart;
        if (customEnd) params.endDate = customEnd;
      } else {
        const range = getDateRange(filter);
        if (range.startDate) params.startDate = range.startDate;
        if (range.endDate) params.endDate = range.endDate;
      }

      const now = new Date();
      const [sumRes, monRes, catRes, budRes] = await Promise.all([
        getDashboardSummary(params),
        getMonthlyData(filter === 'this_month' || filter === 'last_month'
          ? getDateRange('last_6_months')
          : params),
        getCategorySpending(params),
        getBudgetAnalysis({ month: now.getMonth() + 1, year: now.getFullYear() }),
      ]);

      setSummary(sumRes.data.data);
      setMonthly(monRes.data.data);
      setCategories(catRes.data.data);
      setBudgetAnalysis(budRes.data.data);
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [filter, customStart, customEnd]);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;

  const summaryCards = summary ? [
    { label: 'Total Income', value: summary.totalIncome, icon: '💰', color: '#d1fae5', textColor: '#065f46' },
    { label: 'Total Expenses', value: summary.totalExpenses, icon: '💸', color: '#fee2e2', textColor: '#991b1b' },
    { label: 'Balance', value: summary.balance, icon: '⚖️', color: '#dbeafe', textColor: '#1e40af' },
    { label: 'Savings', value: summary.totalSavings, icon: '🏦', color: '#fef3c7', textColor: '#92400e' },
  ] : [];

  return (
    <div>
      {/* Filters */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Financial Dashboard</h1>
          <p className="page-subtitle">Your complete financial overview</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <select className="form-control" style={{ width: 160 }} value={filter} onChange={e => setFilter(e.target.value)}>
            {FILTER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            <option value="custom">Custom Range</option>
          </select>
          {filter === 'custom' && (
            <>
              <input type="date" className="form-control" style={{ width: 150 }} value={customStart} onChange={e => setCustomStart(e.target.value)} />
              <input type="date" className="form-control" style={{ width: 150 }} value={customEnd} onChange={e => setCustomEnd(e.target.value)} />
            </>
          )}
          <Link to="/transactions/new" className="btn btn-primary">+ Add Transaction</Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        {summaryCards.map(card => (
          <div key={card.label} className="summary-card">
            <div className="card-icon" style={{ background: card.color }}>
              {card.icon}
            </div>
            <div className="card-label">{card.label}</div>
            <div className="card-value" style={{ color: card.textColor }}>{formatCurrency(card.value)}</div>
            {card.label === 'Balance' && summary && (
              <div className="card-sub">{summary.totalTransactions} transactions</div>
            )}
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Income vs Expense */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--gray-900)' }}>Income vs Expenses</h3>
          </div>
          <div className="card-body">
            {monthly.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gray-400)' }}>No data for this period</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={monthly} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="monthName" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="income" name="Income" fill="#10b981" radius={[4,4,0,0]} />
                  <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Expense by Category */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--gray-900)' }}>Expense Breakdown</h3>
          </div>
          <div className="card-body">
            {categories.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gray-400)' }}>No expenses for this period</div>
            ) : (
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                <ResponsiveContainer width="55%" height={220}>
                  <PieChart>
                    <Pie data={categories} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                      dataKey="total" nameKey="category" paddingAngle={2}>
                      {categories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex: 1, minWidth: 100 }}>
                  {categories.slice(0, 6).map((c, i) => (
                    <div key={c.category} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                      <div style={{ flex: 1, fontSize: '0.75rem', color: 'var(--gray-700)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.category}</div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-900)' }}>{c.percentage?.toFixed(1)}%</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Monthly Trend */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Monthly Spending Trend</h3>
          </div>
          <div className="card-body">
            {monthly.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gray-400)' }}>No data</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={monthly} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="monthName" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" fill="url(#colorExpenses)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Budget Analysis */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Budget vs Actual (This Month)</h3>
            <Link to="/budgets" style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>Manage →</Link>
          </div>
          <div className="card-body">
            {budgetAnalysis.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gray-400)' }}>
                No budgets set. <Link to="/budgets" style={{ color: 'var(--primary)' }}>Create one</Link>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={budgetAnalysis} layout="vertical" margin={{ top: 0, right: 10, left: 60, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="categoryName" tick={{ fontSize: 11 }} width={58} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="amount" name="Budget" fill="#4f46e5" radius={[0,4,4,0]} />
                  <Bar dataKey="spent" name="Spent" fill="#f59e0b" radius={[0,4,4,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Budget Progress Cards */}
      {budgetAnalysis.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Budget Progress</h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {budgetAnalysis.map(b => {
                const status = getBudgetStatus(b.percentageUsed);
                return (
                  <div key={b.id} style={{ padding: 16, border: '1px solid var(--gray-100)', borderRadius: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontWeight: 600, color: 'var(--gray-800)', fontSize: '0.9rem' }}>{b.categoryName}</span>
                      <span className={`badge badge-${status === 'danger' ? 'danger' : status === 'warning' ? 'warning' : 'success'}`}>
                        {b.percentageUsed?.toFixed(1)}%
                      </span>
                    </div>
                    <div className="progress-bar" style={{ marginBottom: 8 }}>
                      <div className={`progress-fill progress-${status}`}
                        style={{ width: `${Math.min(b.percentageUsed, 100)}%` }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--gray-500)' }}>
                      <span>Spent: {formatCurrency(b.spent)}</span>
                      <span>Budget: {formatCurrency(b.amount)}</span>
                    </div>
                    {b.percentageUsed >= 100 && (
                      <div style={{ marginTop: 6, fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 600 }}>⚠️ Budget exceeded!</div>
                    )}
                    {b.percentageUsed >= 80 && b.percentageUsed < 100 && (
                      <div style={{ marginTop: 6, fontSize: '0.75rem', color: 'var(--warning)', fontWeight: 600 }}>⚡ Approaching budget limit</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
