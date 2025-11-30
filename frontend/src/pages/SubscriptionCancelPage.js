import React from 'react';

function SubscriptionCancelPage({ navigate }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)' }}>
      <div className="card" style={{ maxWidth: '500px', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❌</div>
        <h2 style={{ marginBottom: '1rem' }}>Upgrade Cancelled</h2>
        <p style={{ color: '#6B7A91', marginBottom: '1.5rem' }}>
          You cancelled the upgrade process. No charges were made.
        </p>
        <button 
          className="btn btn-primary" 
          onClick={() => navigate('dashboard')}
          data-testid="back-to-dashboard-btn"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default SubscriptionCancelPage;
