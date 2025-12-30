import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Lock, Eye, MessageSquare, Edit } from 'lucide-react';

function SharedPlanPage({ navigate, shareToken }) {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [submittingPassword, setSubmittingPassword] = useState(false);

  useEffect(() => {
    if (shareToken) {
      loadSharedPlan();
    }
  }, [shareToken]);

  const loadSharedPlan = async (providedPassword = null) => {
    try {
      setLoading(true);
      setError('');
      const data = await api.sharing.getSharedPlan(shareToken, providedPassword || password);
      setPlan(data);
      setPasswordRequired(false);
    } catch (err) {
      if (err.message && err.message.includes('Password required')) {
        setPasswordRequired(true);
      } else if (err.message && err.message.includes('Invalid password')) {
        setError('Invalid password. Please try again.');
        setPassword('');
      } else {
        setError(err.message || 'Failed to load shared plan');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter a password');
      return;
    }
    setSubmittingPassword(true);
    setError('');
    await loadSharedPlan(password);
    setSubmittingPassword(false);
  };

  const getAccessLevelIcon = (level) => {
    switch (level) {
      case 'edit': return <Edit size={16} />;
      case 'comment': return <MessageSquare size={16} />;
      default: return <Eye size={16} />;
    }
  };

  const getAccessLevelLabel = (level) => {
    switch (level) {
      case 'edit': return 'Can Edit';
      case 'comment': return 'Can Comment';
      default: return 'Read Only';
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
          <p style={{ marginTop: '1rem', color: '#64748B' }}>Loading shared plan...</p>
        </div>
      </div>
    );
  }

  if (passwordRequired) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
        <div className="card" style={{ maxWidth: '400px', width: '90%', padding: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <Lock size={48} color="#64748B" style={{ marginBottom: '1rem' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#001639', marginBottom: '0.5rem' }}>
              Password Required
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.875rem' }}>
              This shared plan is password protected. Please enter the password to view it.
            </p>
          </div>
          
          {error && (
            <div style={{
              padding: '0.75rem',
              background: '#FEF2F2',
              border: '1px solid #EF4444',
              borderRadius: '8px',
              color: '#DC2626',
              fontSize: '0.875rem',
              marginBottom: '1rem'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#475569' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#001639'}
                onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submittingPassword || !password.trim()}
              style={{ width: '100%' }}
            >
              {submittingPassword ? 'Verifying...' : 'Access Plan'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (error && !passwordRequired) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
        <div className="card" style={{ maxWidth: '500px', width: '90%', padding: '2rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#001639', marginBottom: '0.5rem' }}>
            Unable to Load Plan
          </h2>
          <p style={{ color: '#DC2626', marginBottom: '1.5rem' }}>{error}</p>
          <button className="btn btn-primary" onClick={() => navigate('home')}>
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (!plan) {
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      {/* Header */}
      <header style={{ 
        background: 'white', 
        borderBottom: '1px solid #E2E8F0', 
        padding: '1rem 0'
      }}>
        <div className="container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#001639', margin: 0 }}>
                {plan.name || 'Shared Business Plan'}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                {getAccessLevelIcon(plan.access_level)}
                <span style={{ fontSize: '0.875rem', color: '#64748B' }}>
                  {getAccessLevelLabel(plan.access_level)}
                </span>
              </div>
            </div>
            <button className="btn btn-secondary" onClick={() => navigate('home')}>
              Go to Home
            </button>
          </div>
        </div>
      </header>

      {/* Plan Content */}
      <main className="container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1rem' }}>
        {plan.intake_data && (
          <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#001639', marginBottom: '1rem' }}>
              Business Overview
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              {plan.intake_data.business_name && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '0.25rem' }}>Business Name</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#001639' }}>
                    {plan.intake_data.business_name}
                  </div>
                </div>
              )}
              {plan.intake_data.industry && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '0.25rem' }}>Industry</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#001639' }}>
                    {plan.intake_data.industry}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sections */}
        {plan.sections && plan.sections.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {plan.sections.map((section, idx) => (
              <div key={section.id || idx} className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#001639', marginBottom: '1rem' }}>
                  {section.title || `Section ${idx + 1}`}
                </h3>
                <div
                  style={{
                    padding: '1rem',
                    background: '#F9FAFB',
                    borderRadius: '8px',
                    lineHeight: '1.7',
                    color: '#475569'
                  }}
                  dangerouslySetInnerHTML={{ 
                    __html: section.content && section.content.includes('<') 
                      ? section.content 
                      : section.content.replace(/\n/g, '<br/>')
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
            <p style={{ color: '#64748B' }}>No sections available in this shared plan.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default SharedPlanPage;
