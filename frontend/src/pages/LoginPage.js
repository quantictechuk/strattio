import React, { useState } from 'react';
import { api, authService } from '../lib/api';

function LoginPage({ navigate, onLogin }) {
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
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)' }}>
      <div className="card" style={{ maxWidth: '450px', width: '100%' }}>
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
          
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <span style={{ color: '#6B7A91' }}>Don't have an account? </span>
            <button
              type="button"
              onClick={() => navigate('register')}
              data-testid="goto-register-link"
              style={{ color: '#1A85FF', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}
            >
              Sign up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
