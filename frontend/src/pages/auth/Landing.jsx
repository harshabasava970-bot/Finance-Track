import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { TrendingUp, ShieldCheck, BarChart3, Target, ArrowRight, ChevronRight, Star } from 'lucide-react';

export default function Landing() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div className="landing">
      {/* ── Navbar ── */}
      <nav className="ln-nav">
        <div className="ln-nav-inner">
          <div className="ln-logo">
            <div className="ln-logo-icon"><TrendingUp size={18} strokeWidth={2.5} /></div>
            <span>FinanceTrack</span>
          </div>
          <div className="ln-nav-links">
            <a href="#features" className="ln-nav-link">Features</a>
            <a href="#how" className="ln-nav-link">How it works</a>
            <Link to="/login" className="btn btn-secondary btn-sm">Sign in</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Get started</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="ln-hero">
        <div className="ln-hero-content">
          <div className="ln-hero-badge">
            <Star size={12} fill="currentColor" />
            <span>Personal Finance Made Simple</span>
          </div>
          <h1 className="ln-hero-title">
            Take control of your<br />
            <span className="ln-hero-accent">financial future</span>
          </h1>
          <p className="ln-hero-desc">
            Track income, manage expenses, set budgets, and get powerful analytics — all in one beautifully designed dashboard.
          </p>
          <div className="ln-hero-actions">
            <Link to="/register" className="btn btn-primary btn-xl">
              Start for free <ArrowRight size={16} />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">Sign in</Link>
          </div>
          <div className="ln-hero-social">
            <div className="ln-avatars">
              {['#3b82f6','#8b5cf6','#ec4899','#f59e0b'].map((c,i) => (
                <div key={i} className="ln-av" style={{ background: c, marginLeft: i > 0 ? -10 : 0 }}>{String.fromCharCode(65+i)}</div>
              ))}
            </div>
            <span>Join <strong>10,000+</strong> users managing their finances</span>
          </div>
        </div>

        <div className="ln-hero-visual">
          {/* Finance image */}
          <div className="ln-hero-img-wrap">
            <img
              src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80&auto=format&fit=crop"
              alt="Personal finance planning"
              className="ln-hero-img"
              loading="lazy"
              onError={e => { e.target.src = 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&q=80'; }}
            />
            {/* Floating card */}
            <div className="ln-float-card ln-float-1">
              <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, marginBottom: 4 }}>THIS MONTH</div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#059669' }}>Income</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>₹85,000</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#dc2626' }}>Expenses</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>₹42,300</div>
                </div>
              </div>
            </div>
            <div className="ln-float-card ln-float-2">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>💰</div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>Savings this month</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#059669' }}>+₹42,700</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="ln-stats">
        <div className="ln-stats-inner">
          {[
            { val: '₹2Cr+', label: 'Tracked monthly' },
            { val: '10K+', label: 'Active users' },
            { val: '99.9%', label: 'Uptime' },
            { val: '4.9★', label: 'User rating' },
          ].map(s => (
            <div key={s.label} className="ln-stat-item">
              <div className="ln-stat-val">{s.val}</div>
              <div className="ln-stat-lbl">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="ln-features" id="features">
        <div className="ln-section-inner">
          <div className="ln-section-head">
            <p className="ln-section-eyebrow">Everything you need</p>
            <h2 className="ln-section-title">Powerful tools for your finances</h2>
            <p className="ln-section-sub">A complete toolkit to understand and manage your money, built for everyday use.</p>
          </div>
          <div className="ln-features-grid">
            {[
              {
                icon: '💳', title: 'Income & Expense Tracking',
                desc: 'Record every transaction with categories, dates, and descriptions. Full edit and delete support.',
                img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=75&auto=format&fit=crop',
                badge: 'Core',
              },
              {
                icon: '🎯', title: 'Smart Budget Management',
                desc: 'Set monthly spending limits per category. Get real-time alerts when you\'re approaching your budget.',
                img: 'https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=400&q=75&auto=format&fit=crop',
                badge: 'Popular',
              },
              {
                icon: '📊', title: 'Visual Analytics',
                desc: 'Beautiful charts showing monthly trends, category breakdowns, and budget vs actual spending.',
                img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=75&auto=format&fit=crop',
                badge: 'Analytics',
              },
              {
                icon: '📈', title: 'Reports & CSV Export',
                desc: 'Generate detailed reports for any time period and export your data as a spreadsheet.',
                img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=75&auto=format&fit=crop',
                badge: 'Reports',
              },
              {
                icon: '🔒', title: 'Bank-Level Security',
                desc: 'JWT authentication and BCrypt password hashing. Your data is always private and secure.',
                img: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&q=75&auto=format&fit=crop',
                badge: 'Security',
              },
              {
                icon: '📱', title: 'Fully Responsive',
                desc: 'Works perfectly on desktop, tablet, and mobile. Manage finances on the go.',
                img: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&q=75&auto=format&fit=crop',
                badge: 'Design',
              },
            ].map(f => (
              <div key={f.title} className="ln-feat-card">
                <div className="ln-feat-img-wrap">
                  <img src={f.img} alt={f.title} className="ln-feat-img" loading="lazy"
                    onError={e => e.target.style.display = 'none'} />
                  <div className="ln-feat-badge">{f.badge}</div>
                </div>
                <div className="ln-feat-body">
                  <div className="ln-feat-icon">{f.icon}</div>
                  <h3 className="ln-feat-title">{f.title}</h3>
                  <p className="ln-feat-desc">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="ln-how" id="how">
        <div className="ln-section-inner">
          <div className="ln-section-head">
            <p className="ln-section-eyebrow">Simple process</p>
            <h2 className="ln-section-title">Up and running in minutes</h2>
          </div>
          <div className="ln-steps">
            {[
              { n: '01', title: 'Create your account', desc: 'Sign up in 30 seconds. No credit card required.' },
              { n: '02', title: 'Add your transactions', desc: 'Log income and expenses with categories and descriptions.' },
              { n: '03', title: 'Set your budgets', desc: 'Create monthly spending limits for each category.' },
              { n: '04', title: 'Track your progress', desc: 'Watch your dashboard update in real-time as you log transactions.' },
            ].map((step, i) => (
              <div key={step.n} className="ln-step">
                <div className="ln-step-num">{step.n}</div>
                {i < 3 && <div className="ln-step-line" />}
                <h3 className="ln-step-title">{step.title}</h3>
                <p className="ln-step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="ln-cta">
        <div className="ln-cta-inner">
          <div className="ln-cta-content">
            <h2 className="ln-cta-title">Ready to take control of your money?</h2>
            <p className="ln-cta-desc">Join thousands of users who have transformed their financial habits with FinanceTrack.</p>
            <div className="ln-cta-actions">
              <Link to="/register" className="btn btn-primary btn-xl" style={{ background: 'white', color: 'var(--navy)' }}>
                Get started free <ArrowRight size={16} />
              </Link>
              <Link to="/login" className="btn btn-ghost btn-lg" style={{ color: 'rgba(255,255,255,0.8)' }}>
                Sign in <ChevronRight size={16} />
              </Link>
            </div>
          </div>
          <div className="ln-cta-visual">
            <img
              src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=500&q=80&auto=format&fit=crop"
              alt="Financial growth"
              className="ln-cta-img"
              loading="lazy"
              onError={e => e.target.style.display = 'none'}
            />
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="ln-footer">
        <div className="ln-footer-inner">
          <div className="ln-logo">
            <div className="ln-logo-icon"><TrendingUp size={16} strokeWidth={2.5} /></div>
            <span>FinanceTrack</span>
          </div>
          <p className="ln-footer-copy">© 2024 FinanceTrack · Final Year College Project · Built with React + Spring Boot</p>
        </div>
      </footer>

      <style>{`
        .landing { min-height: 100vh; background: var(--white); overflow-x: hidden; }

        /* Nav */
        .ln-nav {
          position: sticky; top: 0; z-index: 500;
          background: rgba(255,255,255,0.92); backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--gray-100);
        }
        .ln-nav-inner {
          max-width: 1200px; margin: 0 auto; padding: 0 32px;
          height: 64px; display: flex; align-items: center; justify-content: space-between; gap: 24px;
        }
        .ln-logo { display: flex; align-items: center; gap: 9px; font-size: 1.05rem; font-weight: 800; color: var(--gray-900); letter-spacing: -0.03em; }
        .ln-logo-icon {
          width: 32px; height: 32px; border-radius: 8px;
          background: linear-gradient(135deg, var(--blue), #06b6d4);
          display: flex; align-items: center; justify-content: center; color: white;
        }
        .ln-nav-links { display: flex; align-items: center; gap: 8px; }
        .ln-nav-link { font-size: 0.875rem; font-weight: 500; color: var(--gray-600); padding: 6px 14px; border-radius: 8px; transition: all var(--t-fast); }
        .ln-nav-link:hover { color: var(--gray-900); background: var(--gray-100); }

        /* Hero */
        .ln-hero {
          max-width: 1200px; margin: 0 auto; padding: 80px 32px 60px;
          display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center;
        }
        .ln-hero-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 5px 12px; border-radius: var(--radius-full);
          background: #eff6ff; color: var(--blue); font-size: 0.78rem; font-weight: 600;
          margin-bottom: 20px; border: 1px solid #bfdbfe;
        }
        .ln-hero-title {
          font-size: clamp(2rem, 4vw, 3rem); font-weight: 900; color: var(--gray-900);
          line-height: 1.15; letter-spacing: -0.04em; margin-bottom: 20px;
        }
        .ln-hero-accent {
          background: linear-gradient(135deg, var(--blue) 0%, var(--teal) 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .ln-hero-desc { font-size: 1.05rem; color: var(--gray-500); line-height: 1.7; margin-bottom: 32px; max-width: 480px; }
        .ln-hero-actions { display: flex; gap: 12px; align-items: center; margin-bottom: 28px; flex-wrap: wrap; }
        .ln-hero-social { display: flex; align-items: center; gap: 10px; font-size: 0.82rem; color: var(--gray-500); }
        .ln-hero-social strong { color: var(--gray-700); }
        .ln-avatars { display: flex; }
        .ln-av { width: 26px; height: 26px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 700; color: white; }

        /* Hero visual */
        .ln-hero-visual { position: relative; }
        .ln-hero-img-wrap { position: relative; }
        .ln-hero-img { width: 100%; height: 440px; object-fit: cover; border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); }
        .ln-float-card {
          position: absolute; background: white; border-radius: var(--radius-md);
          padding: 14px 18px; box-shadow: var(--shadow-md); border: 1px solid var(--gray-100);
          animation: float 3s ease-in-out infinite;
        }
        .ln-float-1 { bottom: 32px; left: -24px; }
        .ln-float-2 { top: 28px; right: -20px; }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }

        /* Stats */
        .ln-stats { background: var(--navy); padding: 48px 32px; }
        .ln-stats-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px; }
        .ln-stat-item { text-align: center; }
        .ln-stat-val { font-size: 2rem; font-weight: 900; color: white; letter-spacing: -0.04em; }
        .ln-stat-lbl { font-size: 0.82rem; color: rgba(255,255,255,0.45); margin-top: 4px; font-weight: 500; }

        /* Features */
        .ln-features { padding: 100px 32px; background: var(--gray-25); }
        .ln-section-inner { max-width: 1200px; margin: 0 auto; }
        .ln-section-head { text-align: center; margin-bottom: 56px; }
        .ln-section-eyebrow { font-size: 0.78rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--blue); margin-bottom: 12px; }
        .ln-section-title { font-size: clamp(1.6rem, 3vw, 2.4rem); font-weight: 800; color: var(--gray-900); letter-spacing: -0.03em; margin-bottom: 14px; }
        .ln-section-sub { font-size: 1rem; color: var(--gray-500); max-width: 520px; margin: 0 auto; line-height: 1.7; }
        .ln-features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .ln-feat-card { background: white; border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--gray-150); box-shadow: var(--shadow-sm); transition: all var(--t-slow) var(--ease); }
        .ln-feat-card:hover { box-shadow: var(--shadow-md); transform: translateY(-4px); }
        .ln-feat-img-wrap { position: relative; height: 160px; overflow: hidden; }
        .ln-feat-img { width: 100%; height: 100%; object-fit: cover; transition: transform var(--t-slow) var(--ease); }
        .ln-feat-card:hover .ln-feat-img { transform: scale(1.05); }
        .ln-feat-badge { position: absolute; top: 12px; left: 12px; background: rgba(15,31,61,0.75); color: white; font-size: 0.68rem; font-weight: 700; padding: 3px 9px; border-radius: 6px; letter-spacing: 0.04em; backdrop-filter: blur(8px); }
        .ln-feat-body { padding: 20px 22px; }
        .ln-feat-icon { font-size: 1.5rem; margin-bottom: 10px; }
        .ln-feat-title { font-size: 0.95rem; font-weight: 700; color: var(--gray-900); margin-bottom: 7px; letter-spacing: -0.01em; }
        .ln-feat-desc { font-size: 0.845rem; color: var(--gray-500); line-height: 1.6; }

        /* How */
        .ln-how { padding: 100px 32px; background: white; }
        .ln-steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px; position: relative; }
        .ln-step { text-align: center; position: relative; }
        .ln-step-num { width: 52px; height: 52px; border-radius: 16px; background: linear-gradient(135deg, var(--blue), var(--teal)); color: white; font-size: 1rem; font-weight: 900; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; box-shadow: 0 4px 16px rgba(29,78,216,0.25); letter-spacing: -0.02em; }
        .ln-step-line { display: none; }
        .ln-step-title { font-size: 0.95rem; font-weight: 700; color: var(--gray-900); margin-bottom: 8px; letter-spacing: -0.01em; }
        .ln-step-desc { font-size: 0.845rem; color: var(--gray-500); line-height: 1.6; }

        /* CTA */
        .ln-cta { background: linear-gradient(135deg, var(--navy) 0%, var(--navy-700) 100%); padding: 80px 32px; overflow: hidden; }
        .ln-cta-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
        .ln-cta-title { font-size: clamp(1.6rem, 3vw, 2.2rem); font-weight: 900; color: white; line-height: 1.2; letter-spacing: -0.03em; margin-bottom: 16px; }
        .ln-cta-desc { font-size: 1rem; color: rgba(255,255,255,0.6); line-height: 1.7; margin-bottom: 32px; }
        .ln-cta-actions { display: flex; gap: 14px; flex-wrap: wrap; }
        .ln-cta-img { width: 100%; height: 320px; object-fit: cover; border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); opacity: 0.9; }

        /* Footer */
        .ln-footer { background: var(--gray-900); padding: 32px; }
        .ln-footer-inner { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; }
        .ln-footer .ln-logo { color: white; }
        .ln-footer .ln-logo-icon { background: rgba(255,255,255,0.1); }
        .ln-footer-copy { font-size: 0.8rem; color: rgba(255,255,255,0.35); }

        /* Responsive */
        @media (max-width: 1024px) {
          .ln-features-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
          .ln-hero { grid-template-columns: 1fr; gap: 40px; padding: 48px 20px 40px; text-align: center; }
          .ln-hero-desc { margin: 0 auto 28px; }
          .ln-hero-actions { justify-content: center; }
          .ln-hero-social { justify-content: center; }
          .ln-hero-visual { display: none; }
          .ln-stats-inner { grid-template-columns: repeat(2, 1fr); gap: 24px; }
          .ln-features { padding: 60px 20px; }
          .ln-features-grid { grid-template-columns: 1fr; }
          .ln-how { padding: 60px 20px; }
          .ln-steps { grid-template-columns: 1fr; gap: 24px; text-align: left; }
          .ln-step-num { margin: 0 0 12px; }
          .ln-cta { padding: 60px 20px; }
          .ln-cta-inner { grid-template-columns: 1fr; gap: 32px; }
          .ln-cta-visual { display: none; }
          .ln-nav-inner { padding: 0 20px; }
          .ln-nav-link { display: none; }
        }
      `}</style>
    </div>
  );
}
