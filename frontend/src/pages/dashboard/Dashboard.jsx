import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  TrendingUp, TrendingDown, Wallet, PiggyBank, ArrowUpRight,
  ArrowDownRight, Plus, ChevronRight, Target, Calendar
} from 'lucide-react';
import { getDashboardSummary, getMonthlyData, getCategorySpending, getBudgetAnalysis } from '../../api/dashboard';
import { getTransactions } from '../../api/transactions';
import { formatCurrency, getDateRange, getBudgetStatus, formatDate } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const CHART_COLORS = ['#3b82f6','#0d9488','#8b5cf6','#f59e0b','#ec4899','#06b6d4','#84cc16','#f97316'];

const FILTERS = [
  { value: 'this_month', label: 'This month' },
  { value: 'last_month', label: 'Last month' },
  { value: 'last_3_months', label: '3 months' },
  { value: 'last_6_months', label: '6 months' },
  { value: 'this_year', label: 'This year' },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'white', border: '1px solid var(--gray-150)', borderRadius: 10, padding: '10px 14px', boxShadow: 'var(--shadow-md)', minWidth: 160 }}>
      <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--gray-500)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ fontSize: '0.85rem', color: p.color, fontWeight: 600, margin: '2px 0' }}>
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const [filter, setFilter] = useState('this_month');
  const [summary, setSummary] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [categories, setCategories] = useState([]);
  const [budgetAnalysis, setBudgetAnalysis] = useState([]);
  const [recentTxns, setRecentTxns] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const range = getDateRange(filter);
      const params = {};
      if (range.startDate) params.startDate = range.startDate;
      if (range.endDate) params.endDate = range.endDate;

      const now = new Date();

      // Load each API independently — one failure won't crash the whole dashboard
      const results = await Promise.allSettled([
        getDashboardSummary(params),
        getMonthlyData(getDateRange('last_6_months')),
        getCategorySpending(params),
        getBudgetAnalysis({ month: now.getMonth() + 1, year: now.getFullYear() }),
        getTransactions({ page: 0, size: 5, sortBy: 'transactionDate', sortDir: 'desc' }),
      ]);

      if (results[0].status === 'fulfilled') setSummary(results[0].value.data.data);
      else toast.error('Could not load summary data');

      if (results[1].status === 'fulfilled') setMonthly(results[1].value.data.data);
      if (results[2].status === 'fulfilled') setCategories(results[2].value.data.data);
      if (results[3].status === 'fulfilled') setBudgetAnalysis(results[3].value.data.data);
      if (results[4].status === 'fulfilled') setRecentTxns(results[4].value.data.data?.content || []);

    } catch (e) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return <LoadingSpinner message="Loading your dashboard..." />;

  const balance = summary?.balance ?? 0;
  const balancePositive = Number(balance) >= 0;

  return (
    <div className="dashboard" style={{ animation: 'fadeIn 0.3s ease' }}>

      {/* ── Hero Welcome ── */}
      <div className="db-hero">
        <div className="db-hero-text">
          <p className="db-greeting">{getGreeting()},</p>
          <h1 className="db-name">{user?.fullName?.split(' ')[0] || 'there'} 👋</h1>
          <p className="db-tagline">Here&apos;s your financial snapshot for {FILTERS.find(f => f.value === filter)?.label}.</p>
        </div>
        <div className="db-hero-right">
          <div className="db-filter-tabs">
            {FILTERS.map(f => (
              <button key={f.value} className={`db-filter-tab ${filter === f.value ? 'active' : ''}`} onClick={() => setFilter(f.value)}>
                {f.label}
              </button>
            ))}
          </div>
          <Link to="/transactions/new" className="btn btn-primary btn-sm" style={{ gap: 6, marginLeft: 8 }}>
            <Plus size={14} strokeWidth={2.5} /> Add Transaction
          </Link>
        </div>
      </div>

      {/* ── Hero Image Band ── */}
      <div className="db-hero-band">
        <img
          src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1400&q=75&auto=format&fit=crop&crop=center"
          alt="Financial planning"
          className="db-band-img"
          onError={e => e.target.parentElement.style.display = 'none'}
        />
        <div className="db-band-overlay">
          <div className="db-band-stats">
            <div className="db-band-stat">
              <span className="db-band-label">Balance</span>
              <span className={`db-band-val ${balancePositive ? 'pos' : 'neg'}`}>{formatCurrency(balance)}</span>
            </div>
            <div className="db-band-divider" />
            <div className="db-band-stat">
              <span className="db-band-label">Income</span>
              <span className="db-band-val pos">{formatCurrency(summary?.totalIncome ?? 0)}</span>
            </div>
            <div className="db-band-divider" />
            <div className="db-band-stat">
              <span className="db-band-label">Expenses</span>
              <span className="db-band-val neg">{formatCurrency(summary?.totalExpenses ?? 0)}</span>
            </div>
            <div className="db-band-divider" />
            <div className="db-band-stat">
              <span className="db-band-label">Savings</span>
              <span className="db-band-val pos">{formatCurrency(summary?.totalSavings ?? 0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="db-stat-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eff6ff' }}>
            <Wallet size={20} color="#3b82f6" />
          </div>
          <div className="stat-label">Net Balance</div>
          <div className="stat-value" style={{ color: balancePositive ? 'var(--income)' : 'var(--expense)' }}>
            {formatCurrency(balance)}
          </div>
          <div className="stat-sub">{summary?.totalTransactions ?? 0} transactions</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--income-bg)' }}>
            <TrendingUp size={20} color="var(--income)" />
          </div>
          <div className="stat-label">Total Income</div>
          <div className="stat-value" style={{ color: 'var(--income)' }}>{formatCurrency(summary?.totalIncome ?? 0)}</div>
          <div className="stat-change up"><ArrowUpRight size={13} /> Earnings</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--expense-bg)' }}>
            <TrendingDown size={20} color="var(--expense)" />
          </div>
          <div className="stat-label">Total Expenses</div>
          <div className="stat-value" style={{ color: 'var(--expense)' }}>{formatCurrency(summary?.totalExpenses ?? 0)}</div>
          <div className="stat-change down"><ArrowDownRight size={13} /> Spending</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7' }}>
            <PiggyBank size={20} color="#d97706" />
          </div>
          <div className="stat-label">Savings</div>
          <div className="stat-value" style={{ color: '#d97706' }}>{formatCurrency(summary?.totalSavings ?? 0)}</div>
          <div className="stat-sub">Positive balance</div>
        </div>
      </div>

      {/* ── Charts Row ── */}
      <div className="db-charts-row">
        {/* Income vs Expenses */}
        <div className="card db-chart-card">
          <div className="card-header">
            <div>
              <div className="section-title">Income vs Expenses</div>
              <div className="section-subtitle">Last 6 months comparison</div>
            </div>
          </div>
          <div className="card-body" style={{ paddingTop: 8 }}>
            {monthly.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 0' }}>
                <div className="empty-icon">📊</div>
                <p>No data for this period</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={monthly} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barGap={4} barCategoryGap="28%">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" vertical={false} />
                  <XAxis dataKey="monthName" tick={{ fontSize: 11, fill: 'var(--gray-400)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--gray-400)' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 16 }} />
                  <Bar dataKey="income" name="Income" fill="#059669" radius={[5,5,0,0]} />
                  <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[5,5,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Category Spending Pie */}
        <div className="card db-chart-card">
          <div className="card-header">
            <div>
              <div className="section-title">Spending by Category</div>
              <div className="section-subtitle">Where your money goes</div>
            </div>
          </div>
          <div className="card-body" style={{ paddingTop: 8 }}>
            {categories.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 0' }}>
                <div className="empty-icon">🍩</div>
                <p>No expenses this period</p>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <ResponsiveContainer width="55%" height={220}>
                  <PieChart>
                    <Pie data={categories} cx="50%" cy="50%" innerRadius={52} outerRadius={82}
                      dataKey="total" nameKey="category" paddingAngle={3} strokeWidth={0}>
                      {categories.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={v => formatCurrency(v)} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex: 1 }}>
                  {categories.slice(0, 6).map((c, i) => (
                    <div key={c.category} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: CHART_COLORS[i % CHART_COLORS.length], flexShrink: 0 }} />
                      <span style={{ fontSize: '0.78rem', color: 'var(--gray-600)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.category}</span>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--gray-800)' }}>{c.percentage?.toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Spending Trend ── */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div>
            <div className="section-title">Monthly Spending Trend</div>
            <div className="section-subtitle">Expense progression over time</div>
          </div>
        </div>
        <div className="card-body" style={{ paddingTop: 8 }}>
          {monthly.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 0' }}><p>No data available</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthly} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" vertical={false} />
                <XAxis dataKey="monthName" tick={{ fontSize: 11, fill: 'var(--gray-400)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--gray-400)' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                <Area type="monotone" dataKey="income" name="Income" stroke="#059669" fill="url(#incGrad)" strokeWidth={2} dot={{ r: 3, fill: '#059669', strokeWidth: 0 }} />
                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" fill="url(#expGrad)" strokeWidth={2} dot={{ r: 3, fill: '#ef4444', strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Bottom Row: Budgets + Recent Transactions ── */}
      <div className="db-bottom-row">
        {/* Budget Progress */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="section-title">Budget Progress</div>
              <div className="section-subtitle">Current month spending limits</div>
            </div>
            <Link to="/budgets" className="btn btn-ghost btn-sm" style={{ gap: 4 }}>
              View all <ChevronRight size={14} />
            </Link>
          </div>
          <div className="card-body">
            {budgetAnalysis.length === 0 ? (
              <div className="empty-state" style={{ padding: '32px 0' }}>
                <div className="empty-icon"><Target size={32} color="var(--gray-300)" /></div>
                <h3>No budgets set</h3>
                <p>Create budgets to track spending limits</p>
                <Link to="/budgets" className="btn btn-primary btn-sm" style={{ marginTop: 16 }}>
                  <Plus size={13} /> Create Budget
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {budgetAnalysis.slice(0, 5).map(b => {
                  const status = getBudgetStatus(b.percentageUsed);
                  return (
                    <div key={b.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-800)' }}>{b.categoryName}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>{formatCurrency(b.spent)} / {formatCurrency(b.amount)}</span>
                          <span className={`badge badge-${status === 'danger' ? 'danger' : status === 'warning' ? 'warning' : 'success'}`}>
                            {b.percentageUsed?.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <div className="progress-bar">
                        <div className={`progress-fill progress-${status}`} style={{ width: `${Math.min(b.percentageUsed, 100)}%` }} />
                      </div>
                      {b.percentageUsed >= 100 && (
                        <p style={{ fontSize: '0.75rem', color: 'var(--expense)', marginTop: 4, fontWeight: 600 }}>⚠ Over budget by {formatCurrency(Math.abs(b.remaining))}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="section-title">Recent Transactions</div>
              <div className="section-subtitle">Your latest activity</div>
            </div>
            <Link to="/transactions" className="btn btn-ghost btn-sm" style={{ gap: 4 }}>
              View all <ChevronRight size={14} />
            </Link>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {recentTxns.length === 0 ? (
              <div className="empty-state" style={{ padding: '32px 24px' }}>
                <div className="empty-icon">💳</div>
                <h3>No transactions yet</h3>
                <p>Add your first transaction to get started</p>
                <Link to="/transactions/new" className="btn btn-primary btn-sm" style={{ marginTop: 16 }}>
                  <Plus size={13} /> Add Transaction
                </Link>
              </div>
            ) : (
              <div>
                {recentTxns.map((t, i) => (
                  <div key={t.id} className="db-txn-row" style={{ borderBottom: i < recentTxns.length - 1 ? '1px solid var(--gray-50)' : 'none' }}>
                    <div className={`db-txn-icon ${t.type === 'INCOME' ? 'inc' : 'exp'}`}>
                      {t.type === 'INCOME' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-800)', marginBottom: 2 }}>
                        {t.categoryName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>
                        {t.description || formatDate(t.transactionDate)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: t.type === 'INCOME' ? 'var(--income)' : 'var(--expense)' }}>
                        {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)' }}>{formatDate(t.transactionDate)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inline styles for dashboard-specific elements */}
      <style>{`
        .dashboard { max-width: 100%; }

        .db-hero {
          display: flex; align-items: flex-start; justify-content: space-between;
          flex-wrap: wrap; gap: 16px; margin-bottom: 24px;
        }
        .db-greeting { font-size: 0.875rem; color: var(--gray-400); font-weight: 500; margin-bottom: 2px; }
        .db-name { font-size: 1.75rem; font-weight: 900; color: var(--gray-900); letter-spacing: -0.04em; margin-bottom: 4px; }
        .db-tagline { font-size: 0.875rem; color: var(--gray-400); }
        .db-hero-right { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
        .db-filter-tabs { display: flex; background: var(--gray-100); border-radius: var(--radius); padding: 3px; gap: 2px; }
        .db-filter-tab {
          padding: 6px 12px; border-radius: 8px; border: none; background: transparent;
          font-size: 0.8rem; font-weight: 500; color: var(--gray-500); cursor: pointer;
          transition: all var(--t-fast) var(--ease); white-space: nowrap; font-family: var(--font-sans);
        }
        .db-filter-tab:hover { color: var(--gray-800); }
        .db-filter-tab.active { background: white; color: var(--gray-900); font-weight: 600; box-shadow: var(--shadow-xs); }

        /* Hero Image Band */
        .db-hero-band { position: relative; height: 140px; border-radius: var(--radius-lg); overflow: hidden; margin-bottom: 28px; }
        .db-band-img { width: 100%; height: 100%; object-fit: cover; object-position: center 60%; }
        .db-band-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(15,31,61,0.82) 0%, rgba(15,31,61,0.65) 100%);
          display: flex; align-items: center; padding: 0 32px;
        }
        .db-band-stats { display: flex; align-items: center; gap: 32px; }
        .db-band-stat { display: flex; flex-direction: column; gap: 3px; }
        .db-band-label { font-size: 0.7rem; font-weight: 700; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.08em; }
        .db-band-val { font-size: 1.15rem; font-weight: 800; letter-spacing: -0.03em; }
        .db-band-val.pos { color: #34d399; }
        .db-band-val.neg { color: #fca5a5; }
        .db-band-divider { width: 1px; height: 36px; background: rgba(255,255,255,0.15); }

        /* Stat Grid */
        .db-stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; margin-bottom: 24px; }

        /* Charts */
        .db-charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
        .db-chart-card { min-height: 0; }

        /* Bottom Row */
        .db-bottom-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

        /* Transaction Row */
        .db-txn-row {
          display: flex; align-items: center; gap: 14px;
          padding: 14px 24px;
          transition: background var(--t-fast) var(--ease);
        }
        .db-txn-row:hover { background: var(--gray-25); }
        .db-txn-icon {
          width: 34px; height: 34px; border-radius: var(--radius-sm);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .db-txn-icon.inc { background: var(--income-bg); color: var(--income); }
        .db-txn-icon.exp { background: var(--expense-bg); color: var(--expense); }

        /* Responsive */
        @media (max-width: 1200px) {
          .db-stat-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 900px) {
          .db-charts-row { grid-template-columns: 1fr; }
          .db-bottom-row { grid-template-columns: 1fr; }
          .db-hero-band { height: 110px; }
          .db-band-overlay { padding: 0 20px; }
          .db-band-stats { gap: 20px; }
          .db-band-val { font-size: 0.95rem; }
        }
        @media (max-width: 600px) {
          .db-stat-grid { grid-template-columns: 1fr 1fr; }
          .db-hero { flex-direction: column; }
          .db-hero-right { width: 100%; }
          .db-filter-tabs { overflow-x: auto; }
          .db-band-stats { gap: 14px; }
          .db-band-divider { display: none; }
        }
      `}</style>
    </div>
  );
}
