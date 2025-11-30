import React from 'react';

function HomePage({ navigate, user }) {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #EBF5FF 0%, #F8FAFB 100%)' }}>
      {/* Hero Section */}
      <header style={{ padding: '1.5rem 0', borderBottom: '1px solid #E4E9EF', background: 'white' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1A85FF', fontFamily: 'IBM Plex Sans' }}>
            STRATTIO
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {user ? (
              <button 
                className="btn btn-primary" 
                onClick={() => navigate('dashboard')}
                data-testid="goto-dashboard-btn"
              >
                Dashboard
              </button>
            ) : (
              <>
                <button 
                  className="btn btn-ghost" 
                  onClick={() => navigate('login')}
                  data-testid="goto-login-btn"
                >
                  Log In
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={() => navigate('register')}
                  data-testid="goto-register-btn"
                >
                  Get Started Free
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Content */}
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', color: '#1A202C' }}>
          AI-Powered Business Plans<br />
          <span style={{ color: '#1A85FF' }}>Verified, Compliant, Professional</span>
        </h1>
        
        <p style={{ fontSize: '1.25rem', color: '#4A5568', maxWidth: '700px', margin: '0 auto 2.5rem' }}>
          Generate investor-ready, loan-ready, and visa-ready business plans in minutes.
          Zero hallucination. Verified market data. Deterministic financials.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '3rem' }}>
          <button 
            className="btn btn-primary" 
            onClick={() => navigate(user ? 'dashboard' : 'register')}
            data-testid="hero-cta-btn"
            style={{ fontSize: '1.125rem', padding: '1rem 2rem' }}
          >
            Create Your Plan Free
          </button>
          <button 
            className="btn btn-secondary"
            style={{ fontSize: '1.125rem', padding: '1rem 2rem' }}
          >
            View Demo
          </button>
        </div>
        
        {/* Features */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginTop: '4rem' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎯</div>
            <h3 style={{ marginBottom: '0.5rem' }}>Zero Hallucination</h3>
            <p style={{ color: '#6B7A91' }}>All statistics from verified sources: ONS, Eurostat, Companies House</p>
          </div>
          
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📊</div>
            <h3 style={{ marginBottom: '0.5rem' }}>Deterministic Financials</h3>
            <p style={{ color: '#6B7A91' }}>Formula-based P&L, cashflow, and break-even analysis</p>
          </div>
          
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✅</div>
            <h3 style={{ marginBottom: '0.5rem' }}>Compliance Ready</h3>
            <p style={{ color: '#6B7A91' }}>UK visa, loan, and investor templates built-in</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
