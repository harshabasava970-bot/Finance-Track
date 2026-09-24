import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function Landing() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="nav-brand">
          <span>💰</span> FinanceTrack
        </div>
        <div className="nav-links">
          <Link to="/login" className="btn btn-secondary">Login</Link>
          <Link to="/register" className="btn btn-primary">Get Started</Link>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <span className="hero-badge">🎓 College Project Demo</span>
          <h1>Take Control of Your <span className="gradient-text">Personal Finances</span></h1>
          <p>Track income, manage expenses, set budgets, and get powerful analytics — all in one beautiful dashboard.</p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-lg">Start for Free</Link>
            <Link to="/login" className="btn btn-outline-primary btn-lg">Sign In</Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-card">
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', marginBottom: 16 }}>This Month</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div style={{ background: '#d1fae5', borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ fontSize: '0.75rem', color: '#065f46', marginBottom: 4 }}>Income</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#065f46' }}>₹85,000</div>
              </div>
              <div style={{ background: '#fee2e2', borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ fontSize: '0.75rem', color: '#991b1b', marginBottom: 4 }}>Expenses</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#991b1b' }}>₹42,300</div>
              </div>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginBottom: 8 }}>Budget Usage — Food</div>
            <div className="progress-bar" style={{ marginBottom: 16 }}>
              <div className="progress-fill progress-warning" style={{ width: '72%' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--gray-500)' }}>
              <span>₹7,200 spent</span><span>₹2,800 left</span>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <h2>Everything you need to manage your money</h2>
        <div className="features-grid">
          {[
            { icon: '💳', title: 'Income & Expense Tracking', desc: 'Record every transaction with categories, descriptions, and dates.' },
            { icon: '🎯', title: 'Smart Budgeting', desc: 'Set monthly budgets per category and track spending against them in real time.' },
            { icon: '📊', title: 'Visual Analytics', desc: 'Beautiful charts showing monthly trends, category breakdowns, and budget analysis.' },
            { icon: '📈', title: 'Reports & Export', desc: 'Generate detailed reports and export your transaction history as CSV.' },
            { icon: '🔒', title: 'Secure & Private', desc: 'JWT authentication, BCrypt password hashing, and data isolation per user.' },
            { icon: '📱', title: 'Responsive Design', desc: 'Works perfectly on desktop, tablet, and mobile devices.' },
          ].map(f => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta">
        <h2>Ready to take control?</h2>
        <p>Create your free account and start tracking your finances today.</p>
        <Link to="/register" className="btn btn-primary btn-lg">Create Free Account</Link>
      </section>

      <footer className="landing-footer">
        <p>© 2024 FinanceTrack • Built with React + Spring Boot • College Final Year Project</p>
      </footer>

      <style>{`
        .landing { min-height: 100vh; background: var(--white); }
        .landing-nav {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 48px; border-bottom: 1px solid var(--gray-100);
          position: sticky; top: 0; background: rgba(255,255,255,0.95);
          backdrop-filter: blur(8px); z-index: 100;
        }
        .nav-brand { display: flex; align-items: center; gap: 8px; font-size: 1.2rem; font-weight: 700; color: var(--gray-900); }
        .nav-links { display: flex; gap: 12px; align-items: center; }
        .hero {
          display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;
          padding: 80px 48px; max-width: 1200px; margin: 0 auto;
        }
        .hero-badge { display: inline-block; background: var(--primary-light); color: var(--primary); padding: 6px 14px; border-radius: 100px; font-size: 0.8rem; font-weight: 600; margin-bottom: 20px; }
        .hero h1 { font-size: 2.8rem; font-weight: 800; line-height: 1.2; color: var(--gray-900); margin-bottom: 20px; }
        .gradient-text { background: linear-gradient(135deg, var(--primary), var(--secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .hero p { font-size: 1.1rem; color: var(--gray-600); margin-bottom: 32px; line-height: 1.7; }
        .hero-actions { display: flex; gap: 16px; flex-wrap: wrap; }
        .hero-visual { display: flex; justify-content: center; }
        .hero-card { background: var(--white); border-radius: 20px; padding: 24px; width: 100%; max-width: 340px; box-shadow: var(--shadow-lg); border: 1px solid var(--gray-100); }
        .features { padding: 80px 48px; background: var(--gray-50); }
        .features h2 { text-align: center; font-size: 2rem; font-weight: 700; color: var(--gray-900); margin-bottom: 48px; }
        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; max-width: 1100px; margin: 0 auto; }
        .feature-card { background: var(--white); border-radius: var(--border-radius); padding: 28px 24px; box-shadow: var(--shadow-sm); border: 1px solid var(--gray-100); }
        .feature-icon { font-size: 2rem; margin-bottom: 16px; }
        .feature-card h3 { font-size: 1rem; font-weight: 600; color: var(--gray-900); margin-bottom: 8px; }
        .feature-card p { font-size: 0.875rem; color: var(--gray-600); line-height: 1.6; }
        .cta { text-align: center; padding: 80px 48px; background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; }
        .cta h2 { font-size: 2rem; font-weight: 700; margin-bottom: 16px; }
        .cta p { font-size: 1.1rem; margin-bottom: 32px; opacity: 0.9; }
        .cta .btn-primary { background: white; color: var(--primary); }
        .cta .btn-primary:hover { background: var(--gray-100); transform: translateY(-2px); }
        .landing-footer { text-align: center; padding: 24px; color: var(--gray-500); font-size: 0.875rem; border-top: 1px solid var(--gray-100); }
        @media (max-width: 900px) {
          .hero { grid-template-columns: 1fr; gap: 40px; padding: 48px 24px; text-align: center; }
          .hero h1 { font-size: 2rem; }
          .hero-actions { justify-content: center; }
          .hero-visual { display: none; }
          .features-grid { grid-template-columns: repeat(2, 1fr); }
          .features, .cta { padding: 48px 24px; }
          .landing-nav { padding: 16px 24px; }
        }
        @media (max-width: 600px) {
          .features-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
