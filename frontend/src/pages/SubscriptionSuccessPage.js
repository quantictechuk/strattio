import React, { useState, useEffect } from 'react';
import { api, authService } from '../lib/api';

function SubscriptionSuccessPage({ navigate, user }) {
  const [status, setStatus] = useState('checking');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    checkPaymentStatus();
  }, []);

  const checkPaymentStatus = async () => {
    // Get session_id from URL
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    if (!sessionId) {
      setError('No session ID found in URL. Please check the URL contains ?session_id=...');
      setStatus('error');
      return;
    }

    console.log('Checking payment status for session:', sessionId);
    console.log('Current URL:', window.location.href);
    console.log('Backend URL:', process.env.REACT_APP_BACKEND_URL || 'https://strattio-backend.vercel.app');

    // Start polling
    pollStatus(sessionId, 0);
  };

  const pollStatus = async (sessionId, attemptNumber) => {
    const maxAttempts = 5;
    const pollInterval = 2000; // 2 seconds

    if (attemptNumber >= maxAttempts) {
      console.error('Max polling attempts reached');
      setStatus('timeout');
      return;
    }

    setAttempts(attemptNumber + 1);

    try {
      console.log(`Polling attempt ${attemptNumber + 1}/${maxAttempts} for session: ${sessionId}`);
      
      // Use the API helper for consistent error handling and URL construction
      const data = await api.stripe.getCheckoutStatus(sessionId);
      console.log('Payment status response:', data);

      // Check if payment is complete
      if (data.payment_status === 'paid' || data.status === 'paid') {
        console.log('Payment successful!');
        setStatus('success');
        
        // Refresh user subscription data
        setTimeout(() => {
          // Reload subscription to get updated tier
          window.location.href = '/';  // Force full reload to refresh subscription
        }, 3000);
        return;
      }

      if (data.status === 'expired') {
        console.log('Session expired');
        setStatus('expired');
        return;
      }

      // Continue polling if still pending
      console.log('Payment still pending, continuing to poll...');
      setTimeout(() => pollStatus(sessionId, attemptNumber + 1), pollInterval);

    } catch (err) {
      console.error('Error checking payment status:', err);
      const errorMessage = err.message || 'Failed to verify payment';
      setError(errorMessage);
      
      // Check if it's a network error (Load failed)
      if (errorMessage.includes('Load failed') || errorMessage.includes('Failed to fetch') || errorMessage.includes('network')) {
        console.error('Network error detected - this might be a CORS or connection issue');
        // For network errors, still retry but with longer delay
        if (attemptNumber < maxAttempts - 1) {
          console.log(`Retrying after network error (attempt ${attemptNumber + 1}/${maxAttempts})`);
          setTimeout(() => pollStatus(sessionId, attemptNumber + 1), pollInterval * 2); // Longer delay for network errors
        } else {
          setStatus('error');
        }
      } else {
        // For other errors, retry normally
        if (attemptNumber < maxAttempts - 1) {
          setTimeout(() => pollStatus(sessionId, attemptNumber + 1), pollInterval);
        } else {
          setStatus('error');
        }
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)' }}>
      <div className="card" style={{ maxWidth: '500px', textAlign: 'center' }}>
        {status === 'checking' && (
          <div>
            <div className="loading-spinner" style={{ margin: '0 auto 1.5rem' }}></div>
            <h2>Verifying Payment...</h2>
            <p style={{ color: '#6B7A91', marginBottom: '1rem' }}>Please wait while we confirm your subscription</p>
            <p style={{ fontSize: '0.875rem', color: '#9BA9BC' }}>Attempt {attempts} of 5</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ color: '#27AC85', marginBottom: '1rem' }}>Payment Successful!</h2>
            <p style={{ color: '#6B7A91', marginBottom: '1.5rem' }}>Your subscription has been activated</p>
            <div className="success-message">
              You now have access to PDF exports and all premium features!
            </div>
            <p style={{ fontSize: '0.875rem', color: '#9BA9BC', marginTop: '1rem' }}>Redirecting to dashboard...</p>
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
            <h2 style={{ color: '#F59E0B', marginBottom: '1rem' }}>Processing...</h2>
            <p style={{ color: '#6B7A91', marginBottom: '1.5rem' }}>
              Your payment is still being processed. This may take a few moments.
            </p>
            <div style={{ background: '#DBEAFE', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.875rem', color: '#1E40AF', margin: 0 }}>
                ℹ️ Your subscription will be activated shortly. You can check your email for confirmation or return to the dashboard.
              </p>
            </div>
            <button className="btn btn-primary" onClick={() => window.location.href = '/'}>
              Go to Dashboard
            </button>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❌</div>
            <h2 style={{ color: '#EF4444', marginBottom: '1rem' }}>Error</h2>
            <p style={{ color: '#6B7A91', marginBottom: '1.5rem' }}>{error || 'Failed to verify payment'}</p>
            <div style={{ background: '#FEE2E2', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.875rem', color: '#991B1B', margin: 0 }}>
                If you completed the payment, your subscription will be activated shortly. Please check your email or contact support.
              </p>
            </div>
            <div style={{ background: '#F3F4F6', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.75rem', color: '#6B7280' }}>
              <p style={{ margin: '0 0 0.25rem 0', fontWeight: '600' }}>Debug Info:</p>
              <p style={{ margin: '0.25rem 0', wordBreak: 'break-all' }}>Session ID: {new URLSearchParams(window.location.search).get('session_id') || 'Not found'}</p>
              <p style={{ margin: '0.25rem 0' }}>Backend: {process.env.REACT_APP_BACKEND_URL || 'https://strattio-backend.vercel.app'}</p>
            </div>
            <button className="btn btn-primary" onClick={() => window.location.href = '/'}>
              Back to Dashboard
            </button>
          </div>
        )}

        {error && status === 'checking' && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: '#FEF3C7', borderRadius: '8px' }}>
            <p style={{ fontSize: '0.875rem', color: '#92400E', margin: 0 }}>
              {error}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SubscriptionSuccessPage;
