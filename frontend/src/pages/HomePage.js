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

      {/* Pricing Section */}
      <div style={{ background: 'white', padding: '5rem 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '1rem' }}>Simple, Transparent Pricing</h2>
          <p style={{ textAlign: 'center', color: '#6B7A91', marginBottom: '3rem', fontSize: '1.125rem' }}>
            Choose the plan that fits your needs. Upgrade or downgrade anytime.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Free Plan */}
            <div className="card" style={{ border: '2px solid #E4E9EF' }}>
              <h3 style={{ marginBottom: '0.5rem' }}>Free</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                £0<span style={{ fontSize: '1rem', fontWeight: '400', color: '#6B7A91' }}>/month</span>
              </div>
              <p style={{ color: '#6B7A91', marginBottom: '1.5rem', fontSize: '0.875rem' }}>Perfect for trying out Strattio</p>
              
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.5rem' }}>
                <li style={{ padding: '0.5rem 0', color: '#4A5568' }}>✓ 1 plan per month</li>
                <li style={{ padding: '0.5rem 0', color: '#4A5568' }}>✓ Basic AI generation</li>
                <li style={{ padding: '0.5rem 0', color: '#4A5568' }}>✓ Preview only</li>
                <li style={{ padding: '0.5rem 0', color: '#9BA9BC' }}>✗ No exports</li>
              </ul>
              
              <button 
                className="btn btn-secondary" 
                style={{ width: '100%' }}
                onClick={() => navigate(user ? 'dashboard' : 'register')}
                data-testid="pricing-free-btn"
              >
                Get Started Free
              </button>
            </div>

            {/* Starter Plan */}
            <div className="card" style={{ border: '2px solid #1A85FF', position: 'relative' }}>
              <h3 style={{ marginBottom: '0.5rem' }}>Starter</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem', color: '#1A85FF' }}>
                £12<span style={{ fontSize: '1rem', fontWeight: '400', color: '#6B7A91' }}>/month</span>
              </div>
              <p style={{ color: '#6B7A91', marginBottom: '1.5rem', fontSize: '0.875rem' }}>For entrepreneurs and small businesses</p>
              
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.5rem' }}>
                <li style={{ padding: '0.5rem 0', color: '#4A5568' }}>✓ <strong>3 plans per month</strong></li>
                <li style={{ padding: '0.5rem 0', color: '#4A5568' }}>✓ Full AI generation</li>
                <li style={{ padding: '0.5rem 0', color: '#4A5568' }}>✓ <strong>PDF export</strong></li>
                <li style={{ padding: '0.5rem 0', color: '#4A5568' }}>✓ SWOT analysis</li>
                <li style={{ padding: '0.5rem 0', color: '#4A5568' }}>✓ Competitor analysis</li>
              </ul>
              
              <button 
                className="btn btn-primary" 
                style={{ width: '100%' }}
                onClick={() => navigate(user ? 'dashboard' : 'register')}
                data-testid="pricing-starter-btn"
              >
                Choose Starter
              </button>
            </div>

            {/* Professional Plan */}
            <div className="card" style={{ border: '2px solid #27AC85', background: 'linear-gradient(135deg, #FFFFFF 0%, #E8F5F1 100%)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-12px', right: '20px', background: '#27AC85', color: 'white', padding: '0.25rem 1rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600' }}>
                POPULAR
              </div>
              <h3 style={{ marginBottom: '0.5rem' }}>Professional</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem', color: '#27AC85' }}>
                £29<span style={{ fontSize: '1rem', fontWeight: '400', color: '#6B7A91' }}>/month</span>
              </div>
              <p style={{ color: '#6B7A91', marginBottom: '1.5rem', fontSize: '0.875rem' }}>For growing businesses and consultants</p>
              
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.5rem' }}>
                <li style={{ padding: '0.5rem 0', color: '#4A5568' }}>✓ <strong>Unlimited plans</strong></li>
                <li style={{ padding: '0.5rem 0', color: '#4A5568' }}>✓ All export formats (PDF, DOCX)</li>
                <li style={{ padding: '0.5rem 0', color: '#4A5568' }}>✓ <strong>Financial projections & charts</strong></li>
                <li style={{ padding: '0.5rem 0', color: '#4A5568' }}>✓ <strong>Compliance checking</strong></li>
                <li style={{ padding: '0.5rem 0', color: '#4A5568' }}>✓ Pitch deck generator</li>
                <li style={{ padding: '0.5rem 0', color: '#4A5568' }}>✓ Priority support</li>
              </ul>
              
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', background: '#27AC85' }}
                onClick={() => navigate(user ? 'dashboard' : 'register')}
                data-testid="pricing-professional-btn"
              >
                Choose Professional
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="card" style={{ border: '2px solid #2D3748' }}>
              <h3 style={{ marginBottom: '0.5rem' }}>Enterprise</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem', color: '#2D3748' }}>
                £99<span style={{ fontSize: '1rem', fontWeight: '400', color: '#6B7A91' }}>/month</span>
              </div>
              <p style={{ color: '#6B7A91', marginBottom: '1.5rem', fontSize: '0.875rem' }}>For teams and organizations</p>
              
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.5rem' }}>
                <li style={{ padding: '0.5rem 0', color: '#4A5568' }}>✓ Everything in Professional</li>
                <li style={{ padding: '0.5rem 0', color: '#4A5568' }}>✓ <strong>Team seats (5 included)</strong></li>
                <li style={{ padding: '0.5rem 0', color: '#4A5568' }}>✓ <strong>API access</strong></li>
                <li style={{ padding: '0.5rem 0', color: '#4A5568' }}>✓ White-label exports</li>
                <li style={{ padding: '0.5rem 0', color: '#4A5568' }}>✓ Consultant workspace</li>
                <li style={{ padding: '0.5rem 0', color: '#4A5568' }}>✓ Dedicated support</li>
              </ul>
              
              <button 
                className="btn btn-secondary" 
                style={{ width: '100%' }}
                onClick={() => navigate(user ? 'dashboard' : 'register')}
                data-testid="pricing-enterprise-btn"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
