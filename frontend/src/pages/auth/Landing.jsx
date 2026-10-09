import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  TrendingUp, ArrowRight, CheckCircle2, ChevronRight,
  ShieldCheck, BarChart3, Target, FileText, ArrowLeftRight,
  Wallet, PiggyBank, Bell, Download, Menu, X
} from 'lucide-react';
import { useState } from 'react';

export default function Landing() {
  const { isAuthenticated, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  // Only redirect to /dashboard once auth is fully confirmed.
  // While loading or unauthenticated, this page stays fully visible.
  // This page NEVER redirects to /login.
  if (!loading && isAuthenticated) return <Navigate to="/dashboard" replace />;

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
            <a href="#how-it-works" className="ln-nav-link">How it Works</a>
            <a href="#benefits" className="ln-nav-link">Benefits</a>
            <Link to="/login" className="ln-nav-btn-secondary">Sign in</Link>
            <Link to="/register" className="ln-nav-btn-primary">Get Started</Link>
          </div>
          <button className="ln-hamburger" onClick={() => setMobileOpen(v => !v)} aria-label="Toggle menu">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {/* Mobile menu */}
        {mobileOpen && (
          <div className="ln-mobile-menu">
            <a href="#features" className="ln-mobile-link" onClick={() => setMobileOpen(false)}>Features</a>
            <a href="#how-it-works" className="ln-mobile-link" onClick={() => setMobileOpen(false)}>How it Works</a>
            <a href="#benefits" className="ln-mobile-link" onClick={() => setMobileOpen(false)}>Benefits</a>
            <div className="ln-mobile-actions">
              <Link to="/login" className="ln-nav-btn-secondary" style={{ flex: 1, textAlign: 'center' }} onClick={() => setMobileOpen(false)}>Sign in</Link>
              <Link to="/register" className="ln-nav-btn-primary" style={{ flex: 1, textAlign: 'center' }} onClick={() => setMobileOpen(false)}>Get Started</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="ln-hero">
        <div className="ln-hero-content">
          <div className="ln-hero-badge">
            <ShieldCheck size={13} />
            <span>Secure · Personal · Smart</span>
          </div>
          <h1 className="ln-hero-title">
            Take Control of<br />
            <span className="ln-hero-accent">Your Money</span>
          </h1>
          <p className="ln-hero-desc">
            Track income and expenses, manage monthly budgets, understand your spending habits,
            and make smarter financial decisions with FinanceTrack.
          </p>
          <div className="ln-hero-actions">
            <Link to="/register" className="ln-btn-hero-primary">
              Get Started Free <ArrowRight size={16} />
            </Link>
            <a href="#features" className="ln-btn-hero-secondary">Explore Features</a>
          </div>
          <div className="ln-hero-checks">
            {['No credit card required', 'Free to use', 'Secure & private'].map(t => (
              <div key={t} className="ln-hero-check"><CheckCircle2 size={14} color="var(--primary)" />{t}</div>
            ))}
          </div>
        </div>
        <div className="ln-hero-visual">
          <div className="ln-hero-img-wrap">
            <img
              src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=700&q=80&auto=format&fit=crop"
              alt="Personal finance planning"
              className="ln-hero-img"
              loading="lazy"
              onError={e => { e.target.src = 'https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=700&q=80'; }}
            />
            <div className="ln-float-card ln-float-1">
              <div className="ln-float-label">This Month</div>
              <div style={{ display: 'flex', gap: 20, marginTop: 6 }}>
                <div>
                  <div className="ln-float-type income">Income</div>
                  <div className="ln-float-amount">₹85,000</div>
                </div>
                <div>
                  <div className="ln-float-type expense">Expenses</div>
                  <div className="ln-float-amount">₹42,300</div>
                </div>
              </div>
            </div>
            <div className="ln-float-card ln-float-2">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="ln-float-icon">
                  <TrendingUp size={15} color="var(--primary)" />
                </div>
                <div>
                  <div className="ln-float-label">Net Savings</div>
                  <div className="ln-float-amount savings">+₹42,700</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="ln-stats">
        <div className="ln-stats-inner">
          {[
            { val: '₹2Cr+', label: 'Tracked monthly' },
            { val: '10K+',  label: 'Active users'    },
            { val: '99.9%', label: 'Uptime'          },
            { val: 'Free',  label: 'Forever'         },
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
                icon: <ArrowLeftRight size={20} color="var(--primary)" />,
                iconBg: 'var(--primary-light)',
                title: 'Income & Expense Tracking',
                desc: 'Record every transaction with categories, dates, and descriptions. Full edit and delete support with smart search.',
                img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=75&auto=format&fit=crop',
              },
              {
                icon: <Target size={20} color="var(--terracotta)" />,
                iconBg: 'var(--terracotta-bg)',
                title: 'Smart Budget Management',
                desc: "Set monthly spending limits per category. Get real-time visual alerts when you're approaching your limit.",
                img: 'https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=400&q=75&auto=format&fit=crop',
              },
              {
                icon: <BarChart3 size={20} color="var(--primary)" />,
                iconBg: 'var(--primary-light)',
                title: 'Visual Analytics Dashboard',
                desc: 'Beautiful charts showing monthly trends, category breakdowns, and budget vs actual spending.',
                img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=75&auto=format&fit=crop',
              },
              {
                icon: <FileText size={20} color="var(--terracotta)" />,
                iconBg: 'var(--terracotta-bg)',
                title: 'Reports & CSV Export',
                desc: 'Generate detailed reports for any time period and export your transaction data as a spreadsheet.',
                img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=75&auto=format&fit=crop',
              },
              {
                icon: <ShieldCheck size={20} color="var(--primary)" />,
                iconBg: 'var(--primary-light)',
                title: 'Bank-Level Security',
                desc: 'JWT authentication and BCrypt password hashing. Your financial data is always private and secure.',
                img: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&q=75&auto=format&fit=crop',
              },
              {
                icon: <Bell size={20} color="var(--terracotta)" />,
                iconBg: 'var(--terracotta-bg)',
                title: 'Budget Alert Notifications',
                desc: 'Instant visual warnings when categories approach or exceed their monthly spending limits.',
                img: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=75&auto=format&fit=crop',
              },
            ].map(f => (
              <div key={f.title} className="ln-feat-card">
                <div className="ln-feat-img-wrap">
                  <img src={f.img} alt={f.title} className="ln-feat-img" loading="lazy"
                    onError={e => { e.target.parentElement.style.background = 'var(--cream-100)'; e.target.style.display = 'none'; }} />
                </div>
                <div className="ln-feat-body">
                  <div className="ln-feat-icon" style={{ background: f.iconBg }}>{f.icon}</div>
                  <h3 className="ln-feat-title">{f.title}</h3>
                  <p className="ln-feat-desc">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="ln-how" id="how-it-works">
        <div className="ln-section-inner">
          <div className="ln-section-head">
            <p className="ln-section-eyebrow">Simple process</p>
            <h2 className="ln-section-title">Up and running in minutes</h2>
            <p className="ln-section-sub">Five simple steps to take full control of your personal finances.</p>
          </div>
          <div className="ln-steps">
            {[
              { n: '01', icon: <ShieldCheck size={22} color="white" />, title: 'Create your account', desc: 'Sign up in under a minute. No credit card required, free forever.' },
              { n: '02', icon: <ArrowLeftRight size={22} color="white" />, title: 'Record transactions', desc: 'Log income and expenses with categories, dates, and descriptions.' },
              { n: '03', icon: <Target size={22} color="white" />, title: 'Set monthly budgets', desc: 'Create spending limits per category to keep your finances on track.' },
              { n: '04', icon: <BarChart3 size={22} color="white" />, title: 'Monitor your dashboard', desc: 'Watch your charts and stats update in real-time as you add data.' },
              { n: '05', icon: <FileText size={22} color="white" />, title: 'Review and decide', desc: 'Generate reports, export CSV data, and improve your financial habits.' },
            ].map((step, i) => (
              <div key={step.n} className="ln-step">
                <div className="ln-step-icon">{step.icon}</div>
                <div className="ln-step-num">{step.n}</div>
                <h3 className="ln-step-title">{step.title}</h3>
                <p className="ln-step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits ── */}
      <section className="ln-benefits" id="benefits">
        <div className="ln-section-inner">
          <div className="ln-benefits-grid">
            <div className="ln-benefits-text">
              <p className="ln-section-eyebrow">Why FinanceTrack</p>
              <h2 className="ln-benefits-title">Built for real financial management</h2>
              <p className="ln-benefits-desc">
                Unlike generic spreadsheets or expensive apps, FinanceTrack is purpose-built for personal
                finance — with the right features, nothing more, nothing less.
              </p>
              <div className="ln-benefit-list">
                {[
                  'Complete transaction history with search and filters',
                  'Category-wise spending breakdown with visual charts',
                  'Monthly budget tracking with overspend alerts',
                  'CSV export for offline analysis',
                  'Role-based access with admin controls',
                  'Fully responsive — works on any device',
                ].map(b => (
                  <div key={b} className="ln-benefit-item">
                    <CheckCircle2 size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
              <Link to="/register" className="ln-btn-hero-primary" style={{ marginTop: 36, display: 'inline-flex', gap: 8 }}>
                Start for Free <ArrowRight size={16} />
              </Link>
            </div>
            <div className="ln-benefits-img-wrap">
              <img
                src="https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=680&q=80&auto=format&fit=crop"
                alt="Financial growth"
                className="ln-benefits-img"
                loading="lazy"
                onError={e => e.target.style.display = 'none'}
              />
              {/* Floating stat overlay */}
              <div className="ln-benefits-stat-card">
                <div className="ln-benefits-stat-row">
                  <div className="ln-benefits-stat-item">
                    <Wallet size={16} color="var(--primary)" />
                    <div>
                      <div className="ln-bs-label">Savings Rate</div>
                      <div className="ln-bs-val">+34%</div>
                    </div>
                  </div>
                  <div className="ln-benefits-stat-divider" />
                  <div className="ln-benefits-stat-item">
                    <PiggyBank size={16} color="var(--terracotta)" />
                    <div>
                      <div className="ln-bs-label">Budget kept</div>
                      <div className="ln-bs-val">8/10</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="ln-cta">
        <div className="ln-cta-inner">
          <div className="ln-cta-content">
            <div className="ln-cta-badge">
              <TrendingUp size={13} />
              <span>Join thousands of users</span>
            </div>
            <h2 className="ln-cta-title">Ready to take control<br />of your money?</h2>
            <p className="ln-cta-desc">
              FinanceTrack is free, secure, and easy to use. Start tracking your
              finances today and build better money habits — one transaction at a time.
            </p>
            <div className="ln-cta-actions">
              <Link to="/register" className="ln-btn-cta-primary">
                Create Free Account <ArrowRight size={16} />
              </Link>
              <Link to="/login" className="ln-btn-cta-secondary">
                Sign in <ChevronRight size={15} />
              </Link>
            </div>
          </div>
          <div className="ln-cta-visual">
            <img
              src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=560&q=80&auto=format&fit=crop"
              alt="Financial analytics"
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
          <div className="ln-footer-brand">
            <div className="ln-logo ln-logo-light">
              <div className="ln-logo-icon-light"><TrendingUp size={16} strokeWidth={2.5} /></div>
              <span>FinanceTrack</span>
            </div>
            <p className="ln-footer-tagline">Your personal finance companion</p>
          </div>
          <div className="ln-footer-links-group">
            <div className="ln-footer-col">
              <div className="ln-footer-col-title">Product</div>
              <a href="#features">Features</a>
              <a href="#how-it-works">How it Works</a>
              <a href="#benefits">Benefits</a>
            </div>
            <div className="ln-footer-col">
              <div className="ln-footer-col-title">Account</div>
              <Link to="/login">Sign In</Link>
              <Link to="/register">Register</Link>
            </div>
          </div>
        </div>
        <div className="ln-footer-bottom">
          <p>© 2024 FinanceTrack · Final Year College Project · Built with React + Spring Boot</p>
        </div>
      </footer>

      <style>{`
        /* ── Base ── */
        .landing { min-height: 100vh; background: var(--white); overflow-x: hidden; font-family: var(--font-sans); }

        /* ── Nav ── */
        .ln-nav {
          position: sticky; top: 0; z-index: 500;
          background: rgba(255,255,255,0.96);
          backdrop-filter: blur(14px);
          border-bottom: 1px solid var(--cream-150);
        }
        .ln-nav-inner {
          max-width: 1200px; margin: 0 auto; padding: 0 32px;
          height: 68px; display: flex; align-items: center; justify-content: space-between; gap: 20px;
        }
        .ln-logo { display: flex; align-items: center; gap: 10px; font-size: 1.1rem; font-weight: 800; color: var(--charcoal); letter-spacing: -0.03em; text-decoration: none; }
        .ln-logo-icon { width: 34px; height: 34px; border-radius: 9px; background: var(--primary); display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 4px 12px rgba(36,92,69,0.30); }
        .ln-nav-links { display: flex; align-items: center; gap: 8px; }
        .ln-nav-link { font-size: 0.875rem; font-weight: 500; color: var(--cream-600); padding: 6px 14px; border-radius: 8px; transition: all 150ms; text-decoration: none; }
        .ln-nav-link:hover { color: var(--charcoal); background: var(--cream-100); }
        .ln-nav-btn-secondary {
          display: inline-flex; align-items: center; justify-content: center;
          padding: 8px 18px; border-radius: var(--radius); font-size: 0.875rem; font-weight: 600;
          background: var(--white); color: var(--charcoal); border: 1.5px solid var(--cream-200);
          text-decoration: none; transition: all 150ms; white-space: nowrap;
        }
        .ln-nav-btn-secondary:hover { border-color: var(--cream-300); background: var(--cream-50); }
        .ln-nav-btn-primary {
          display: inline-flex; align-items: center; justify-content: center;
          padding: 8px 18px; border-radius: var(--radius); font-size: 0.875rem; font-weight: 600;
          background: var(--primary); color: white; border: none;
          text-decoration: none; transition: all 150ms; white-space: nowrap;
          box-shadow: 0 4px 12px rgba(36,92,69,0.28);
        }
        .ln-nav-btn-primary:hover { background: var(--primary-dark); transform: translateY(-1px); }
        .ln-hamburger { display: none; background: none; border: none; color: var(--charcoal); padding: 6px; cursor: pointer; border-radius: 8px; transition: background 150ms; }
        .ln-hamburger:hover { background: var(--cream-100); }
        .ln-mobile-menu {
          border-top: 1px solid var(--cream-150); padding: 16px 24px 20px;
          display: flex; flex-direction: column; gap: 4px;
          background: white;
        }
        .ln-mobile-link { padding: 10px 8px; font-size: 0.95rem; font-weight: 500; color: var(--charcoal); text-decoration: none; border-radius: 8px; transition: background 150ms; }
        .ln-mobile-link:hover { background: var(--cream-50); }
        .ln-mobile-actions { display: flex; gap: 10px; margin-top: 10px; }

        /* ── Hero ── */
        .ln-hero {
          max-width: 1200px; margin: 0 auto; padding: 88px 32px 72px;
          display: grid; grid-template-columns: 1fr 1fr; gap: 72px; align-items: center;
        }
        .ln-hero-badge {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 5px 14px; border-radius: 999px;
          background: var(--primary-light); color: var(--primary);
          font-size: 0.78rem; font-weight: 700; margin-bottom: 20px;
          border: 1px solid var(--income-border);
        }
        .ln-hero-title { font-size: clamp(2.1rem,4.5vw,3.2rem); font-weight: 900; color: var(--charcoal); line-height: 1.12; letter-spacing: -0.04em; margin-bottom: 22px; }
        .ln-hero-accent { color: var(--primary); }
        .ln-hero-desc { font-size: 1.05rem; color: var(--cream-600); line-height: 1.75; margin-bottom: 34px; max-width: 480px; }
        .ln-hero-actions { display: flex; gap: 12px; align-items: center; margin-bottom: 26px; flex-wrap: wrap; }
        .ln-hero-checks { display: flex; gap: 20px; flex-wrap: wrap; }
        .ln-hero-check { display: flex; align-items: center; gap: 6px; font-size: 0.82rem; color: var(--cream-600); font-weight: 500; }

        /* Hero CTA buttons */
        .ln-btn-hero-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 28px; border-radius: var(--radius-md);
          background: var(--primary); color: white; font-size: 1rem; font-weight: 700;
          text-decoration: none; border: none; cursor: pointer;
          box-shadow: 0 6px 20px rgba(36,92,69,0.32); transition: all 220ms var(--ease);
          letter-spacing: -0.01em;
        }
        .ln-btn-hero-primary:hover { background: var(--primary-dark); transform: translateY(-2px); box-shadow: 0 10px 28px rgba(36,92,69,0.40); }
        .ln-btn-hero-secondary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 13px 26px; border-radius: var(--radius-md);
          background: white; color: var(--charcoal); font-size: 1rem; font-weight: 600;
          text-decoration: none; border: 1.5px solid var(--cream-200);
          box-shadow: var(--shadow-sm); transition: all 220ms;
        }
        .ln-btn-hero-secondary:hover { border-color: var(--cream-300); background: var(--cream-50); }

        /* Hero visual */
        .ln-hero-visual { position: relative; }
        .ln-hero-img-wrap { position: relative; }
        .ln-hero-img { width: 100%; height: 460px; object-fit: cover; border-radius: 24px; box-shadow: var(--shadow-lg); }
        .ln-float-card {
          position: absolute; background: white; border-radius: 14px;
          padding: 14px 18px; box-shadow: 0 12px 32px rgba(36,41,35,0.14);
          border: 1px solid var(--cream-150); animation: lnFloat 3.5s ease-in-out infinite;
        }
        .ln-float-1 { bottom: 28px; left: -28px; min-width: 180px; }
        .ln-float-2 { top: 28px; right: -24px; min-width: 160px; }
        .ln-float-label { font-size: 0.65rem; color: var(--cream-500); font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 2px; }
        .ln-float-type { font-size: 0.7rem; font-weight: 600; margin-bottom: 2px; }
        .ln-float-type.income { color: var(--income); }
        .ln-float-type.expense { color: var(--expense); }
        .ln-float-amount { font-size: 1.05rem; font-weight: 900; color: var(--charcoal); letter-spacing: -0.03em; }
        .ln-float-amount.savings { color: var(--income); }
        .ln-float-icon { width: 32px; height: 32px; border-radius: 8px; background: var(--primary-light); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        @keyframes lnFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }

        /* ── Stats strip ── */
        .ln-stats { background: var(--charcoal); padding: 52px 32px; }
        .ln-stats-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(4,1fr); gap: 32px; }
        .ln-stat-item { text-align: center; }
        .ln-stat-val { font-size: 2.2rem; font-weight: 900; color: #8ECFAD; letter-spacing: -0.04em; }
        .ln-stat-lbl { font-size: 0.84rem; color: rgba(255,255,255,0.45); margin-top: 5px; font-weight: 500; }

        /* ── Features ── */
        .ln-features { padding: 112px 32px; background: var(--cream-50); }
        .ln-section-inner { max-width: 1200px; margin: 0 auto; }
        .ln-section-head { text-align: center; margin-bottom: 60px; }
        .ln-section-eyebrow { font-size: 0.78rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--primary); margin-bottom: 14px; }
        .ln-section-title { font-size: clamp(1.7rem,3.5vw,2.5rem); font-weight: 900; color: var(--charcoal); letter-spacing: -0.04em; margin-bottom: 16px; }
        .ln-section-sub { font-size: 1rem; color: var(--cream-600); max-width: 540px; margin: 0 auto; line-height: 1.75; }

        .ln-features-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 26px; }
        .ln-feat-card {
          background: white; border-radius: 20px; overflow: hidden;
          border: 1px solid var(--cream-150); box-shadow: var(--shadow-sm);
          transition: all 320ms var(--ease);
        }
        .ln-feat-card:hover { box-shadow: var(--shadow-md); transform: translateY(-5px); }
        .ln-feat-img-wrap { height: 168px; overflow: hidden; background: var(--cream-100); }
        .ln-feat-img { width: 100%; height: 100%; object-fit: cover; transition: transform 400ms var(--ease); }
        .ln-feat-card:hover .ln-feat-img { transform: scale(1.06); }
        .ln-feat-body { padding: 22px 24px; }
        .ln-feat-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
        .ln-feat-title { font-size: 0.95rem; font-weight: 800; color: var(--charcoal); margin-bottom: 8px; letter-spacing: -0.02em; }
        .ln-feat-desc { font-size: 0.855rem; color: var(--cream-600); line-height: 1.65; }

        /* ── How it works ── */
        .ln-how { padding: 112px 32px; background: white; }
        .ln-steps { display: grid; grid-template-columns: repeat(5,1fr); gap: 28px; position: relative; }
        .ln-steps::before {
          content: ''; position: absolute; top: 26px; left: calc(10% + 26px); right: calc(10% + 26px);
          height: 2px; background: linear-gradient(90deg, var(--primary-light), var(--primary-light));
          background: repeating-linear-gradient(90deg, var(--cream-200) 0, var(--cream-200) 8px, transparent 8px, transparent 18px);
          z-index: 0;
        }
        .ln-step { text-align: center; position: relative; z-index: 1; }
        .ln-step-icon {
          width: 52px; height: 52px; border-radius: 14px;
          background: var(--primary); color: white;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 14px; box-shadow: 0 6px 16px rgba(36,92,69,0.28);
          transition: transform 220ms;
        }
        .ln-step:hover .ln-step-icon { transform: translateY(-3px) scale(1.05); }
        .ln-step-num { font-size: 0.68rem; font-weight: 700; color: var(--cream-400); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 8px; }
        .ln-step-title { font-size: 0.9rem; font-weight: 800; color: var(--charcoal); margin-bottom: 8px; letter-spacing: -0.02em; }
        .ln-step-desc { font-size: 0.82rem; color: var(--cream-600); line-height: 1.65; }

        /* ── Benefits ── */
        .ln-benefits { padding: 112px 32px; background: var(--cream-50); }
        .ln-benefits-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 72px; align-items: center; }
        .ln-benefits-title { font-size: clamp(1.7rem,3.5vw,2.3rem); font-weight: 900; color: var(--charcoal); letter-spacing: -0.04em; margin-bottom: 18px; line-height: 1.2; }
        .ln-benefits-desc { color: var(--cream-600); line-height: 1.75; margin-bottom: 30px; font-size: 0.975rem; }
        .ln-benefit-list { display: flex; flex-direction: column; gap: 13px; }
        .ln-benefit-item { display: flex; align-items: flex-start; gap: 10px; font-size: 0.9rem; color: var(--charcoal-700); line-height: 1.55; }
        .ln-benefits-img-wrap { border-radius: 24px; overflow: hidden; box-shadow: var(--shadow-lg); position: relative; }
        .ln-benefits-img { width: 100%; height: 500px; object-fit: cover; }
        .ln-benefits-stat-card {
          position: absolute; bottom: 24px; left: 24px; right: 24px;
          background: rgba(255,255,255,0.95); backdrop-filter: blur(10px);
          border-radius: 14px; padding: 16px 20px;
          border: 1px solid var(--cream-150); box-shadow: var(--shadow-md);
        }
        .ln-benefits-stat-row { display: flex; align-items: center; gap: 0; }
        .ln-benefits-stat-item { flex: 1; display: flex; align-items: center; gap: 10px; }
        .ln-benefits-stat-divider { width: 1px; height: 36px; background: var(--cream-150); margin: 0 12px; }
        .ln-bs-label { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--cream-500); }
        .ln-bs-val { font-size: 1.05rem; font-weight: 900; color: var(--charcoal); letter-spacing: -0.03em; }

        /* ── CTA ── */
        .ln-cta {
          background: var(--charcoal);
          padding: 96px 32px; overflow: hidden; position: relative;
        }
        .ln-cta::before {
          content: ''; position: absolute; top: -80px; right: -80px;
          width: 420px; height: 420px; border-radius: 50%;
          background: radial-gradient(circle, rgba(36,92,69,0.18) 0%, transparent 70%);
          pointer-events: none;
        }
        .ln-cta-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 72px; align-items: center; position: relative; z-index: 1; }
        .ln-cta-badge {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 4px 14px; border-radius: 999px;
          background: rgba(36,92,69,0.3); color: #8ECFAD;
          font-size: 0.75rem; font-weight: 700; margin-bottom: 18px;
          border: 1px solid rgba(142,207,173,0.2);
        }
        .ln-cta-title { font-size: clamp(1.8rem,3.5vw,2.4rem); font-weight: 900; color: white; line-height: 1.18; letter-spacing: -0.04em; margin-bottom: 18px; }
        .ln-cta-desc { font-size: 1rem; color: rgba(255,255,255,0.62); line-height: 1.75; margin-bottom: 36px; }
        .ln-cta-actions { display: flex; gap: 14px; flex-wrap: wrap; }
        .ln-btn-cta-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 28px; border-radius: var(--radius-md);
          background: white; color: var(--primary); font-size: 0.975rem; font-weight: 800;
          text-decoration: none; border: none; cursor: pointer;
          box-shadow: 0 6px 20px rgba(0,0,0,0.20); transition: all 220ms;
        }
        .ln-btn-cta-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(0,0,0,0.28); }
        .ln-btn-cta-secondary {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 13px 24px; border-radius: var(--radius-md);
          background: transparent; color: rgba(255,255,255,0.75); font-size: 0.975rem; font-weight: 600;
          text-decoration: none; border: 1.5px solid rgba(255,255,255,0.22); transition: all 220ms;
        }
        .ln-btn-cta-secondary:hover { color: white; border-color: rgba(255,255,255,0.45); background: rgba(255,255,255,0.06); }
        .ln-cta-img { width: 100%; height: 340px; object-fit: cover; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.30); opacity: 0.82; }

        /* ── Footer ── */
        .ln-footer { background: var(--charcoal); border-top: 1px solid rgba(255,255,255,0.07); padding: 48px 32px 0; }
        .ln-footer-inner { max-width: 1200px; margin: 0 auto; display: flex; gap: 64px; align-items: flex-start; padding-bottom: 40px; }
        .ln-footer-brand { flex: 1; }
        .ln-logo-light { color: white; text-decoration: none; }
        .ln-logo-icon-light { width: 34px; height: 34px; border-radius: 9px; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; color: white; }
        .ln-footer-tagline { font-size: 0.85rem; color: rgba(255,255,255,0.35); margin-top: 10px; }
        .ln-footer-links-group { display: flex; gap: 48px; }
        .ln-footer-col { display: flex; flex-direction: column; gap: 10px; }
        .ln-footer-col-title { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(255,255,255,0.35); margin-bottom: 4px; }
        .ln-footer-col a { font-size: 0.875rem; color: rgba(255,255,255,0.55); text-decoration: none; transition: color 150ms; }
        .ln-footer-col a:hover { color: rgba(255,255,255,0.9); }
        .ln-footer-bottom { max-width: 1200px; margin: 0 auto; padding: 18px 0; border-top: 1px solid rgba(255,255,255,0.07); }
        .ln-footer-bottom p { font-size: 0.78rem; color: rgba(255,255,255,0.25); }

        /* ── Responsive ── */
        @media (max-width: 1100px) {
          .ln-features-grid { grid-template-columns: repeat(2,1fr); }
          .ln-steps { grid-template-columns: repeat(3,1fr); }
          .ln-steps::before { display: none; }
        }
        @media (max-width: 900px) {
          .ln-hero { grid-template-columns: 1fr; gap: 44px; padding: 56px 24px 48px; text-align: center; }
          .ln-hero-desc { margin: 0 auto 28px; }
          .ln-hero-actions { justify-content: center; }
          .ln-hero-checks { justify-content: center; }
          .ln-hero-visual { display: none; }
          .ln-stats-inner { grid-template-columns: repeat(2,1fr); gap: 24px; }
          .ln-features-grid { grid-template-columns: 1fr; max-width: 520px; margin: 0 auto; }
          .ln-steps { grid-template-columns: 1fr 1fr; }
          .ln-benefits-grid { grid-template-columns: 1fr; gap: 40px; }
          .ln-benefits-img-wrap { display: none; }
          .ln-cta-inner { grid-template-columns: 1fr; gap: 36px; }
          .ln-cta-visual { display: none; }
          .ln-features,.ln-how,.ln-benefits,.ln-cta { padding: 72px 24px; }
          .ln-nav-links { display: none; }
          .ln-hamburger { display: flex; }
          .ln-footer-inner { flex-direction: column; gap: 36px; }
          .ln-nav-inner { padding: 0 20px; }
        }
        @media (max-width: 600px) {
          .ln-steps { grid-template-columns: 1fr; max-width: 320px; margin: 0 auto; }
          .ln-stats-inner { grid-template-columns: repeat(2,1fr); gap: 16px; }
          .ln-cta-actions { flex-direction: column; }
          .ln-footer-links-group { flex-direction: column; gap: 28px; }
          .ln-stat-val { font-size: 1.75rem; }
          .ln-hero-title { font-size: 1.9rem; }
          .ln-benefits-title { font-size: 1.6rem; }
        }
        @media (max-width: 400px) {
          .ln-mobile-actions { flex-direction: column; }
        }
      `}</style>
    </div>
  );
}
