import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';

function DashboardPage({ navigate, user, onLogout }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subscription, setSubscription] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [plansData, subscriptionData] = await Promise.all([
        api.plans.list(),
        api.subscriptions.current()
      ]);
      
      setPlans(plansData.plans || []);
      setSubscription(subscriptionData);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = () => {
    // Check limits
    if (subscription && subscription.plans_created_this_month >= subscription.plan_limit) {
      alert(`Plan limit reached (${subscription.plan_limit} plans per month on ${subscription.tier} tier). Please upgrade.`);
      return;
    }
    
    navigate('intake-wizard');
  };

  const handleViewPlan = (plan) => {
    navigate('plan-editor', { planId: plan.id });
  };

  const handleDeletePlan = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;
    
    try {
      await api.plans.delete(planId);
      setPlans(plans.filter(p => p.id !== planId));
    } catch (err) {
      setError(err.message || 'Failed to delete plan');
    }
  };

  const handleDuplicatePlan = async (planId) => {
    try {
      const newPlan = await api.plans.duplicate(planId);
      setPlans([newPlan, ...plans]);
    } catch (err) {
      setError(err.message || 'Failed to duplicate plan');
    }
  };

  const handleUpgrade = async (packageId) => {
    setUpgrading(true);
    try {
      const originUrl = window.location.origin;
      const checkoutData = await api.stripe.createCheckout(packageId, originUrl);
      window.location.href = checkoutData.url;
    } catch (err) {
      setError(err.message || 'Failed to create checkout session');
      setUpgrading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)' }}>
      {/* Header */}
      <header style={{ padding: '1.5rem 0', borderBottom: '1px solid #E4E9EF', background: 'white' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1A85FF', fontFamily: 'IBM Plex Sans' }}>
            STRATTIO
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ color: '#6B7A91' }}>Welcome, {user?.name}</span>
            <button 
              className="btn btn-ghost" 
              onClick={onLogout}
              data-testid="logout-btn"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      <div className="container" style={{ padding: '3rem 0' }}>
        {/* Usage Bar */}
        {subscription && (
          <div className="card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, #EBF5FF 0%, #E8F5F1 100%)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ marginBottom: '0.5rem' }}>{subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1)} Plan</h4>
                <p style={{ color: '#6B7A91', fontSize: '0.875rem' }}>
                  {subscription.plans_created_this_month} of {subscription.plan_limit === 999999 ? 'unlimited' : subscription.plan_limit} plans used this month
                </p>
              </div>
              {subscription.tier === 'free' && (
                <button className="btn btn-primary" data-testid="upgrade-btn">
                  Upgrade Plan
                </button>
              )}
            </div>
          </div>
        )}

        {/* Header with Create Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1>My Business Plans</h1>
          <button 
            className="btn btn-primary" 
            onClick={handleCreatePlan}
            data-testid="create-plan-btn"
          >
            + Create New Plan
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
            <p style={{ marginTop: '1rem', color: '#6B7A91' }}>Loading plans...</p>
          </div>
        )}

        {/* Plans Grid */}
        {!loading && plans.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
            <h3 style={{ marginBottom: '0.5rem' }}>No Plans Yet</h3>
            <p style={{ color: '#6B7A91', marginBottom: '1.5rem' }}>Create your first AI-powered business plan</p>
            <button 
              className="btn btn-primary" 
              onClick={handleCreatePlan}
              data-testid="create-first-plan-btn"
            >
              Create Your First Plan
            </button>
          </div>
        )}

        {!loading && plans.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {plans.map((plan) => (
              <div key={plan.id} className="card" style={{ position: 'relative' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>{plan.name}</h3>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span className={`status-badge status-${plan.status}`} data-testid={`plan-status-${plan.status}`}>
                      {plan.status}
                    </span>
                    <span style={{ fontSize: '0.875rem', color: '#6B7A91' }}>
                      {new Date(plan.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: '#6B7A91' }}>
                    Purpose: <span style={{ fontWeight: '500', color: '#4A5568' }}>{plan.plan_purpose || 'Generic'}</span>
                  </p>
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => handleViewPlan(plan)}
                    data-testid={`view-plan-${plan.id}`}
                    style={{ flex: 1, minWidth: '120px' }}
                  >
                    {plan.status === 'complete' ? 'View Plan' : 'Continue'}
                  </button>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => handleDuplicatePlan(plan.id)}
                    data-testid={`duplicate-plan-${plan.id}`}
                    style={{ padding: '0.75rem 1rem' }}
                    title="Duplicate plan"
                  >
                    📋
                  </button>
                  <button 
                    className="btn btn-ghost" 
                    onClick={() => handleDeletePlan(plan.id)}
                    data-testid={`delete-plan-${plan.id}`}
                    style={{ padding: '0.75rem 1rem', color: '#EF4444' }}
                    title="Delete plan"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
