import React, { useState } from 'react';
import { api, authService } from '../lib/api';

function RegisterPage({ navigate, onLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await api.auth.register({ name, email, password });
      
      // Save tokens and user
      authService.setTokens(response.access_token, response.refresh_token);
      authService.setUser(response.user);
      
      onLogin(response.user);
      
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)' }}>
      <div className="card" style={{ maxWidth: '450px', width: '100%' }}>
        <h2 style={{ marginBottom: '0.5rem', textAlign: 'center' }}>Create Your Account</h2>
        <p style={{ textAlign: 'center', color: '#6B7A91', marginBottom: '2rem' }}>Start generating professional business plans</p>
        
        {error && (
          <div className="error-message" data-testid="register-error">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              data-testid="name-input"
              placeholder="John Doe"
            />
          </div>
          
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
              autoComplete="new-password"
              data-testid="password-input"
              placeholder="Min. 8 characters"
            />
            <small style={{ color: '#6B7A91', display: 'block', marginTop: '0.25rem' }}>Must be at least 8 characters</small>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            data-testid="register-submit-btn"
            style={{ width: '100%', marginBottom: '1rem' }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <span style={{ color: '#6B7A91' }}>Already have an account? </span>
            <button
              type="button"
              onClick={() => navigate('login')}
              data-testid="goto-login-link"
              style={{ color: '#1A85FF', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}
            >
              Log in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
