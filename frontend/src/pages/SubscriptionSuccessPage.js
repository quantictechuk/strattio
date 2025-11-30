import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';

function SubscriptionSuccessPage({ navigate, user }) {
  const [status, setStatus] = useState('checking');
  const [error, setError] = useState('');

  useEffect(() => {
    checkPaymentStatus();
  }, []);

  const checkPaymentStatus = async () => {
    // Get session_id from URL
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    if (!sessionId) {
      setError('No session ID found');
      setStatus('error');
      return;
    }

    // Poll payment status (max 5 attempts)
    let attempts = 0;
    const maxAttempts = 5;
    const pollInterval = 2000; // 2 seconds

    const poll = async () => {
      try {
        const statusData = await api.stripe.getCheckoutStatus(sessionId);

        if (statusData.payment_status === 'paid') {
          setStatus('success');
          // Redirect to dashboard after 3 seconds
          setTimeout(() => navigate('dashboard'), 3000);
          return;
        }

        if (statusData.status === 'expired') {
          setStatus('expired');
          return;
        }

        // Continue polling
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, pollInterval);
        } else {
          setStatus('timeout');
        }
      } catch (err) {
        setError(err.message || 'Failed to check payment status');
        setStatus('error');
      }
    };

    poll();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)' }}>
      <div className="card" style={{ maxWidth: '500px', textAlign: 'center' }}>
        {status === 'checking' && (
          <div>
            <div className="loading-spinner" style={{ margin: '0 auto 1.5rem' }}></div>
            <h2>Verifying Payment...</h2>
            <p style={{ color: '#6B7A91' }}>Please wait while we confirm your subscription</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ color: '#27AC85', marginBottom: '1rem' }}>Payment Successful!</h2>
            <p style={{ color: '#6B7A91', marginBottom: '1.5rem' }}>Your subscription has been activated</p>
            <p style={{ fontSize: '0.875rem', color: '#9BA9BC' }}>Redirecting to dashboard...</p>
          </div>
        )}

        {status === 'expired' && (
          <div>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⏱️</div>
            <h2 style={{ color: '#F59E0B', marginBottom: '1rem' }}>Session Expired</h2>
            <p style={{ color: '#6B7A91', marginBottom: '1.5rem' }}>Your checkout session has expired</p>
            <button className="btn btn-primary" onClick={() => navigate('dashboard')}>
              Back to Dashboard
            </button>
          </div>
        )}

        {status === 'timeout' && (
          <div>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⏳</div>
            <h2 style={{ color: '#F59E0B', marginBottom: '1rem' }}>Payment Processing</h2>
            <p style={{ color: '#6B7A91', marginBottom: '1.5rem' }}>Your payment is still being processed. Please check your email for confirmation.</p>
            <button className="btn btn-primary" onClick={() => navigate('dashboard')}>
              Back to Dashboard
            </button>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❌</div>
            <h2 style={{ color: '#EF4444', marginBottom: '1rem' }}>Error</h2>
            <p style={{ color: '#6B7A91', marginBottom: '1.5rem' }}>{error}</p>
            <button className="btn btn-primary" onClick={() => navigate('dashboard')}>
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SubscriptionSuccessPage;
