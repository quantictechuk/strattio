import React, { useState } from 'react';
import { ArrowLeft, Menu } from 'lucide-react';
import { api, authService } from '../lib/api';
import Footer from '../components/Footer';
import MobileMenu from '../components/MobileMenu';

function LoginPage({ navigate, onLogin, user }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.auth.login({ email, password });
      
      // Save tokens and user
      authService.setTokens(response.access_token, response.refresh_token);
      authService.setUser(response.user);
      
      onLogin(response.user);
      
    } catch (err) {
      console.error('Login error:', err);
      // Provide more helpful error messages
      if (err.message && err.message.includes('connect to server')) {
        setError('Unable to connect to the server. Please make sure the backend is running.');
      } else if (err.message && err.message.includes('401')) {
        setError('Invalid email or password. Please check your credentials.');
      } else {
        setError(err.message || 'Login failed. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ 
        padding: '1.25rem 0', 
        background: 'rgba(255, 255, 255, 0.98)', 
        position: 'sticky', 
        top: 0, 
        zIndex: 1000,
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('home')}>
            <img 
              src="/logo.png" 
              alt="Strattio" 
              style={{ height: '36px', width: 'auto' }}
            />
          </div>
          <nav className="desktop-nav" style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); navigate('home'); }}
              style={{ 
                color: '#2D3748', 
                textDecoration: 'none', 
                fontSize: '0.9375rem', 
                fontWeight: '500',
                letterSpacing: '-0.01em',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = '#001639'}
              onMouseLeave={(e) => e.target.style.color = '#2D3748'}
            >
              Home
            </a>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); navigate('features'); }}
              style={{ 
                color: '#2D3748', 
                textDecoration: 'none', 
                fontSize: '0.9375rem', 
                fontWeight: '500',
                letterSpacing: '-0.01em',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = '#001639'}
              onMouseLeave={(e) => e.target.style.color = '#2D3748'}
            >
              Features
            </a>
            <a 
              href="#pricing-section" 
              onClick={(e) => { 
                e.preventDefault(); 
                navigate('home');
                setTimeout(() => {
                  const pricingSection = document.getElementById('pricing-section');
                  if (pricingSection) {
                    pricingSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }, 100);
              }}
              style={{ 
                color: '#2D3748', 
                textDecoration: 'none', 
                fontSize: '0.9375rem', 
                fontWeight: '500',
                letterSpacing: '-0.01em',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = '#001639'}
              onMouseLeave={(e) => e.target.style.color = '#2D3748'}
            >
              Pricing
            </a>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); navigate('faq'); }}
              style={{ 
                color: '#2D3748', 
                textDecoration: 'none', 
                fontSize: '0.9375rem', 
                fontWeight: '500',
                letterSpacing: '-0.01em',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = '#001639'}
              onMouseLeave={(e) => e.target.style.color = '#2D3748'}
            >
              FAQ
            </a>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); navigate('contact'); }}
              style={{ 
                color: '#2D3748', 
                textDecoration: 'none', 
                fontSize: '0.9375rem', 
                fontWeight: '500',
                letterSpacing: '-0.01em',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = '#001639'}
              onMouseLeave={(e) => e.target.style.color = '#2D3748'}
            >
              Contact
            </a>
          </nav>
          <div className="desktop-nav" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {user ? (
              <button 
                className="btn btn-primary" 
                onClick={() => navigate('dashboard')}
                style={{ padding: '0.625rem 1.5rem', fontSize: '0.9375rem' }}
              >
                Dashboard
              </button>
            ) : (
              <>
                <button 
                  className="btn btn-ghost" 
                  onClick={() => navigate('login')}
                  style={{ 
                    padding: '0.625rem 1.25rem', 
                    fontSize: '0.9375rem',
                    color: '#4A5568',
                    background: 'transparent'
                  }}
                >
                  Sign In
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={() => navigate('register')}
                  style={{ padding: '0.625rem 1.5rem', fontSize: '0.9375rem' }}
                >
                  Get Started for Free
                </button>
              </>
            )}
          </div>
          <button
            className="mobile-menu-button"
            onClick={() => setMobileMenuOpen(true)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              color: '#2D3748'
            }}
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      <MobileMenu 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
        navigate={navigate} 
        user={user} 
      />

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', padding: '2rem 0' }}>
        <div className="card" style={{ maxWidth: '450px', width: '100%', position: 'relative', margin: '0 1rem' }}>
          {/* Go Back Button */}
          <button
            type="button"
            onClick={() => navigate('home')}
            style={{
              position: 'absolute',
              top: '-3rem',
              left: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'none',
              border: 'none',
              color: '#4A5568',
              cursor: 'pointer',
              fontSize: '0.9375rem',
              fontWeight: '500',
              padding: '0.5rem 0',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.color = '#001639'}
            onMouseLeave={(e) => e.target.style.color = '#4A5568'}
          >
            <ArrowLeft size={18} />
            Back to Home
          </button>

          <h2 style={{ marginBottom: '0.5rem', textAlign: 'center' }}>Welcome Back</h2>
          <p style={{ textAlign: 'center', color: '#6B7A91', marginBottom: '2rem' }}>Log in to continue to Strattio</p>
          
          {error && (
            <div className="error-message" data-testid="login-error">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                data-testid="email-input"
                placeholder="you@example.com"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                data-testid="password-input"
                placeholder="••••••••"
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
              data-testid="login-submit-btn"
              style={{ width: '100%', marginBottom: '1rem' }}
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>

            {/* Divider */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              margin: '1.5rem 0',
              gap: '1rem'
            }}>
              <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }}></div>
              <span style={{ fontSize: '0.875rem', color: '#64748B' }}>OR</span>
              <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }}></div>
            </div>

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={() => {
                const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://strattio-backend.vercel.app';
                window.location.href = `${backendUrl}/api/auth/google`;
              }}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: 'white',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                fontSize: '0.9375rem',
                fontWeight: '500',
                color: '#374151',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#9CA3AF';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#D1D5DB';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <g fill="none" fillRule="evenodd">
                  <path d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7955 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.4673-.806 5.9564-2.1805l-2.9087-2.2581c-.8059.54-1.8368.859-3.0477.859-2.344 0-4.3282-1.5831-5.0366-3.7104H.9573v2.3318C2.4382 15.9832 5.4818 18 9 18z" fill="#34A853"/>
                  <path d="M3.9636 10.71c-.18-.54-.2822-1.1168-.2822-1.71s.1023-1.17.2823-1.71V4.9582H.9573C.3482 6.1751 0 7.55 0 9c0 1.4529.3482 2.8273.9573 4.0418l3.0063-2.3318z" fill="#FBBC05"/>
                  <path d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.8918 11.4268 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582L3.9636 7.29C4.6719 5.1627 6.6559 3.5795 9 3.5795z" fill="#EA4335"/>
                </g>
              </svg>
              Continue with Google
            </button>
            
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <span style={{ color: '#6B7A91' }}>Don't have an account? </span>
              <button
                type="button"
                onClick={() => navigate('register')}
                data-testid="goto-register-link"
                style={{ color: '#001639', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}
              >
                Sign up
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <Footer navigate={navigate} user={user} />
    </div>
  );
}

export default LoginPage;
