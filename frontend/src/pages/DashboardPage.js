import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  FileText, 
  Trash2, 
  Download, 
  ExternalLink, 
  CreditCard, 
  Search, 
  MoreVertical,
  CheckCircle2,
  Clock,
  Loader2,
  LogOut,
  Building2,
  Menu,
  Settings,
  GitCompare,
  X
} from 'lucide-react';
import { api } from '../lib/api';
import Footer from '../components/Footer';
import MobileMenu from '../components/MobileMenu';
import SupportTickets from '../components/SupportTickets';
import Achievements from '../components/Achievements';
import PlanComparison from '../components/PlanComparison';

function DashboardPage({ navigate, user, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [plans, setPlans] = useState([]);
  const [allPlans, setAllPlans] = useState([]); // Store all plans for filtering
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subscription, setSubscription] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedPlans, setSelectedPlans] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const menuRef = useRef(null);

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
      
      const plansList = plansData.plans || [];
      setAllPlans(plansList);
      setPlans(plansList);
      setSubscription(subscriptionData);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Filter plans based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setPlans(allPlans);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = allPlans.filter(plan => {
      const nameMatch = plan.name?.toLowerCase().includes(query);
      const purposeMatch = plan.plan_purpose?.toLowerCase().includes(query);
      const statusMatch = plan.status?.toLowerCase().includes(query);
      const businessNameMatch = plan.intake_data?.business_name?.toLowerCase().includes(query);
      
      return nameMatch || purposeMatch || statusMatch || businessNameMatch;
    });
    
    setPlans(filtered);
  }, [searchQuery, allPlans]);

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
      const updatedPlans = allPlans.filter(p => p.id !== planId);
      setAllPlans(updatedPlans);
      setPlans(updatedPlans);
    } catch (err) {
      setError(err.message || 'Failed to delete plan');
    }
  };

  const handleDuplicatePlan = async (planId) => {
    try {
      const newPlan = await api.plans.duplicate(planId);
      const updatedPlans = [newPlan, ...allPlans];
      setAllPlans(updatedPlans);
      setPlans(updatedPlans);
      setOpenMenuId(null);
    } catch (err) {
      setError(err.message || 'Failed to duplicate plan');
    }
  };

  const handleExport = async (planId, format = 'pdf') => {
    // Check subscription tier first
    if (!subscription) {
      setError('Loading subscription info...');
      return;
    }

    // Free tier: Show upgrade modal
    if (subscription.tier === 'free') {
      setShowUpgradeModal(true);
      setOpenMenuId(null);
      return;
    }

    // Paid tiers: Proceed with export
    try {
      setError('');
      setOpenMenuId(null);
      const exportJob = await api.exports.create(planId, format);
      
      // Automatically trigger download
      if (exportJob && exportJob.id) {
        // Use the same base URL as the API client
        const API_BASE = process.env.REACT_APP_BACKEND_URL || 'https://strattio-backend.vercel.app';
        const downloadUrl = `${API_BASE}/api/exports/${exportJob.id}/download`;
        
        // Get auth token
        const token = localStorage.getItem('access_token');
        
        // Use fetch to download with auth header
        const response = await fetch(downloadUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          const extension = format === 'markdown' ? 'md' : format;
          link.download = exportJob.file_name || `business_plan.${extension}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } else {
          const errorText = await response.text();
          throw new Error(errorText || 'Failed to download export');
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to export plan');
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    if (openMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

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

  const getStatusBadge = (status) => {
    const statusMap = {
      complete: {
        bg: 'rgba(16, 185, 129, 0.1)',
        text: '#10B981',
        border: 'rgba(16, 185, 129, 0.2)',
        label: 'Complete',
        icon: <CheckCircle2 size={12} style={{ marginRight: '0.375rem' }} />
      },
      draft: {
        bg: '#F1F5F9',
        text: '#64748B',
        border: '#E2E8F0',
        label: 'Draft',
        icon: <Clock size={12} style={{ marginRight: '0.375rem' }} />
      },
      generating: {
        bg: 'rgba(0, 22, 57, 0.1)',
        text: '#001639',
        border: 'rgba(0, 22, 57, 0.2)',
        label: 'Generating...',
        icon: <Loader2 size={12} style={{ marginRight: '0.375rem', animation: 'spin 1s linear infinite' }} />
      }
    };

    const statusStyle = statusMap[status] || statusMap.draft;
    
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.25rem 0.625rem',
        borderRadius: '100px',
        fontSize: '0.75rem',
        fontWeight: '500',
        border: `1px solid ${statusStyle.border}`,
        background: statusStyle.bg,
        color: statusStyle.text
      }}>
        {statusStyle.icon}
        {statusStyle.label}
      </span>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
      {/* Dashboard Header */}
      <header style={{ 
        background: 'white', 
        borderBottom: '1px solid #E2E8F0', 
        position: 'sticky', 
        top: 0, 
        zIndex: 30 
      }}>
        <div className="container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px', flexWrap: 'wrap' }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', cursor: 'pointer' }} onClick={() => navigate('home')}>
              <img 
                src="/logo.png" 
                alt="Strattio" 
                style={{ height: '36px', width: 'auto' }} 
              />
            </div>

            {/* Navigation */}
            <nav className="desktop-nav" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); navigate('home'); }}
                style={{ 
                  color: '#64748B', 
                  textDecoration: 'none', 
                  fontSize: '0.875rem', 
                  fontWeight: '500',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.color = '#001639'}
                onMouseLeave={(e) => e.target.style.color = '#64748B'}
              >
                Home
              </a>
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); navigate('features'); }}
                style={{ 
                  color: '#64748B', 
                  textDecoration: 'none', 
                  fontSize: '0.875rem', 
                  fontWeight: '500',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.color = '#001639'}
                onMouseLeave={(e) => e.target.style.color = '#64748B'}
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
                  color: '#64748B', 
                  textDecoration: 'none', 
                  fontSize: '0.875rem', 
                  fontWeight: '500',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.color = '#001639'}
                onMouseLeave={(e) => e.target.style.color = '#64748B'}
              >
                Pricing
              </a>
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); navigate('faq'); }}
                style={{ 
                  color: '#64748B', 
                  textDecoration: 'none', 
                  fontSize: '0.875rem', 
                  fontWeight: '500',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.color = '#001639'}
                onMouseLeave={(e) => e.target.style.color = '#64748B'}
              >
                FAQ
              </a>
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); }}
                style={{ 
                  color: '#64748B', 
                  textDecoration: 'none', 
                  fontSize: '0.875rem', 
                  fontWeight: '500',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.color = '#001639'}
                onMouseLeave={(e) => e.target.style.color = '#64748B'}
              >
                Contact
              </a>
            </nav>

            {/* Right Actions */}
            <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div className="dashboard-user-info" style={{ display: 'none', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0F172A' }}>Welcome, {user?.name || 'User'}</span>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{user?.email || ''}</span>
              </div>
              <div className="dashboard-divider" style={{ height: '32px', width: '1px', background: '#E2E8F0', display: 'none' }}></div>
              <button 
                onClick={() => navigate('settings')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#64748B',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.color = '#001639'}
                onMouseLeave={(e) => e.target.style.color = '#64748B'}
              >
                <Settings size={18} style={{ marginRight: '0.5rem' }} />
                Settings
              </button>
              <button 
                onClick={onLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#64748B',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.color = '#EF4444'}
                onMouseLeave={(e) => e.target.style.color = '#64748B'}
                data-testid="logout-btn"
              >
                <LogOut size={18} style={{ marginRight: '0.5rem' }} />
                Log Out
              </button>
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
                color: '#64748B'
              }}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
        navigate={navigate} 
        user={user}
        onLogout={onLogout}
      />

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 1rem', width: '100%' }}>
        {/* Usage Banner */}
        {subscription && (
          <div style={{
            marginBottom: '3rem',
            background: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              padding: '8rem',
              background: 'rgba(0, 22, 57, 0.06)',
              borderRadius: '50%',
              filter: 'blur(48px)',
              opacity: 0.5,
              marginRight: '-4rem',
              marginTop: '-4rem',
              pointerEvents: 'none',
              transition: 'opacity 0.5s'
            }}></div>
            
            <div className="dashboard-usage-content" style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: '#0F172A',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  flexShrink: 0
                }}>
                  <CreditCard size={24} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#0F172A' }}>
                      {subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1)} Plan
                    </h2>
                    <span style={{
                      background: '#F1F5F9',
                      color: '#64748B',
                      fontSize: '0.625rem',
                      fontWeight: '700',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '100px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      border: '1px solid #E2E8F0'
                    }}>
                      Active
                    </span>
                  </div>
                  <p style={{ color: '#64748B', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                    You have used <span style={{ fontWeight: '600', color: '#0F172A' }}>{subscription.plans_created_this_month}</span> of{' '}
                    <span style={{ fontWeight: '600', color: '#0F172A' }}>
                      {subscription.plan_limit === 999999 ? 'unlimited' : subscription.plan_limit}
                    </span> plans this month.
                  </p>
                  
                  {/* Progress Bar */}
                  <div style={{
                    width: '100%',
                    maxWidth: '200px',
                    height: '6px',
                    background: '#F1F5F9',
                    borderRadius: '100px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      background: '#001639',
                      borderRadius: '100px',
                      width: subscription.plan_limit === 999999 ? '0%' : `${(subscription.plans_created_this_month / subscription.plan_limit) * 100}%`
                    }}></div>
                  </div>
                </div>
              </div>

              <button 
                className="btn btn-secondary"
                onClick={() => setShowUpgradeModal(true)}
                data-testid="upgrade-btn"
                style={{
                  alignSelf: 'flex-start'
                }}
              >
                Manage Subscription
              </button>
            </div>
          </div>
        )}

        {/* Action Header */}
        <div className="dashboard-action-header" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          marginBottom: '2rem',
          flexWrap: 'wrap'
        }}>
          {/* Title Section */}
          <div style={{ flex: '0 0 auto' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0F172A', marginBottom: '0.25rem' }}>My Business Plans</h1>
            <p style={{ color: '#64748B', fontSize: '0.875rem' }}>Manage and edit your generated documents.</p>
          </div>

          {/* Search Bar */}
          <div className="dashboard-search-input" style={{ 
            position: 'relative', 
            flex: '1 1 auto',
            minWidth: '200px',
            maxWidth: '400px'
          }}>
            <Search size={18} style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94A3B8',
              pointerEvents: 'none'
            }} />
            <input 
              type="text" 
              placeholder="Search plans..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                paddingLeft: '2.5rem',
                paddingRight: '1rem',
                paddingTop: '0.625rem',
                paddingBottom: '0.625rem',
                background: 'white',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '0.875rem',
                width: '100%',
                outline: 'none',
                transition: 'box-shadow 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.boxShadow = '0 0 0 2px rgba(15, 23, 42, 0.1)';
                e.target.style.borderColor = '#0F172A';
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = 'none';
                e.target.style.borderColor = '#E2E8F0';
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', flex: '0 0 auto' }}>
            <button
              className="btn btn-secondary"
              onClick={() => {
                if (selectedPlans.length >= 2) {
                  setShowComparison(true);
                } else {
                  alert('Please select at least 2 plans to compare. Use the checkboxes on plan cards.');
                }
              }}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                whiteSpace: 'nowrap',
                padding: '0.625rem 1rem',
                opacity: selectedPlans.length >= 2 ? 1 : 0.6,
                cursor: selectedPlans.length >= 2 ? 'pointer' : 'not-allowed'
              }}
              title={selectedPlans.length >= 2 ? `Compare ${selectedPlans.length} plans` : 'Select 2 or more plans to compare'}
            >
              <GitCompare size={18} />
              {selectedPlans.length >= 2 ? `Compare (${selectedPlans.length})` : 'Compare Plans'}
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => navigate('companies')}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                whiteSpace: 'nowrap',
                padding: '0.625rem 1rem'
              }}
            >
              <Building2 size={18} />
              Manage Companies
            </button>
            <button 
              className="btn btn-primary" 
              onClick={handleCreatePlan}
              data-testid="create-plan-btn"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                whiteSpace: 'nowrap',
                padding: '0.625rem 1rem'
              }}
            >
              <Plus size={18} />
              Create New Plan
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
            <p style={{ marginTop: '1rem', color: '#64748B' }}>Loading plans...</p>
          </div>
        )}

        {/* Plans Grid */}
        {!loading && plans.length === 0 && (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            textAlign: 'center',
            padding: '3rem'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: '700', color: '#0F172A' }}>No Plans Yet</h3>
            <p style={{ color: '#64748B', marginBottom: '1.5rem' }}>Create your first AI-powered business plan</p>
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
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.5rem'
          }} className="dashboard-plans-grid">
            {plans.map((plan) => (
              <div 
                key={plan.id} 
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.borderColor = '#CBD5E1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                  e.currentTarget.style.borderColor = '#E2E8F0';
                }}
              >
                {/* Card Header */}
                <div style={{
                  padding: '1.25rem',
                  borderBottom: '1px solid #F1F5F9',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '0.75rem'
                }}>
                  <input
                    type="checkbox"
                    checked={selectedPlans.includes(plan.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      if (e.target.checked) {
                        if (selectedPlans.length < 4) {
                          setSelectedPlans([...selectedPlans, plan.id]);
                        }
                      } else {
                        setSelectedPlans(selectedPlans.filter(id => id !== plan.id));
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                      marginTop: '0.25rem',
                      flexShrink: 0
                    }}
                  />
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: 'rgba(0, 22, 57, 0.06)',
                    color: '#001639',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '0.75rem'
                  }}>
                    <FileText size={20} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative' }}>
                    {getStatusBadge(plan.status)}
                    <div style={{ position: 'relative' }} ref={openMenuId === plan.id ? menuRef : null}>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === plan.id ? null : plan.id);
                        }}
                        style={{
                          color: '#CBD5E1',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0.25rem',
                          borderRadius: '4px',
                          transition: 'color 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.color = '#64748B'}
                        onMouseLeave={(e) => e.target.style.color = '#CBD5E1'}
                      >
                        <MoreVertical size={16} />
                      </button>
                      {openMenuId === plan.id && (
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          right: 0,
                          marginTop: '0.5rem',
                          background: 'white',
                          border: '1px solid #E2E8F0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                          zIndex: 100,
                          minWidth: '160px',
                          padding: '0.5rem'
                        }}>
                          {plan.status === 'complete' && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleExport(plan.id, 'pdf');
                                }}
                                style={{
                                  width: '100%',
                                  textAlign: 'left',
                                  padding: '0.5rem 0.75rem',
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  fontSize: '0.875rem',
                                  color: '#2D3748',
                                  borderRadius: '4px',
                                  transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.target.style.background = '#F8FAFC'}
                                onMouseLeave={(e) => e.target.style.background = 'none'}
                              >
                                Export as PDF
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleExport(plan.id, 'docx');
                                }}
                                style={{
                                  width: '100%',
                                  textAlign: 'left',
                                  padding: '0.5rem 0.75rem',
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  fontSize: '0.875rem',
                                  color: '#2D3748',
                                  borderRadius: '4px',
                                  transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.target.style.background = '#F8FAFC'}
                                onMouseLeave={(e) => e.target.style.background = 'none'}
                              >
                                Export as DOCX
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleExport(plan.id, 'markdown');
                                }}
                                style={{
                                  width: '100%',
                                  textAlign: 'left',
                                  padding: '0.5rem 0.75rem',
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  fontSize: '0.875rem',
                                  color: '#2D3748',
                                  borderRadius: '4px',
                                  transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.target.style.background = '#F8FAFC'}
                                onMouseLeave={(e) => e.target.style.background = 'none'}
                              >
                                Export as Markdown
                              </button>
                              <div style={{
                                height: '1px',
                                background: '#E2E8F0',
                                margin: '0.5rem 0'
                              }}></div>
                            </>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicatePlan(plan.id);
                            }}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              padding: '0.5rem 0.75rem',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '0.875rem',
                              color: '#2D3748',
                              borderRadius: '4px',
                              transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.background = '#F8FAFC'}
                            onMouseLeave={(e) => e.target.style.background = 'none'}
                          >
                            Duplicate Plan
                          </button>
                          <div style={{
                            height: '1px',
                            background: '#E2E8F0',
                            margin: '0.5rem 0'
                          }}></div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePlan(plan.id);
                              setOpenMenuId(null);
                            }}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              padding: '0.5rem 0.75rem',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '0.875rem',
                              color: '#EF4444',
                              borderRadius: '4px',
                              transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.background = '#FEF2F2'}
                            onMouseLeave={(e) => e.target.style.background = 'none'}
                          >
                            Delete Plan
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: '1.25rem', flex: 1 }}>
                  <h3 
                    style={{
                      fontSize: '1rem',
                      fontWeight: '700',
                      color: '#0F172A',
                      marginBottom: '0.25rem',
                      cursor: 'pointer',
                      transition: 'color 0.2s'
                    }}
                    onClick={() => handleViewPlan(plan)}
                    onMouseEnter={(e) => e.target.style.color = '#001639'}
                    onMouseLeave={(e) => e.target.style.color = '#0F172A'}
                  >
                    {plan.name}
                  </h3>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    fontSize: '0.75rem',
                    color: '#64748B',
                    marginTop: '0.75rem'
                  }}>
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Updated</span>
                      <span style={{ fontWeight: '500', color: '#334155' }}>
                        {new Date(plan.updated_at || plan.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Purpose</span>
                      <span style={{ fontWeight: '500', color: '#334155' }}>{plan.plan_purpose || 'Generic'}</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div style={{
                  padding: '1rem',
                  background: '#F8FAFC',
                  borderRadius: '0 0 12px 12px',
                  borderTop: '1px solid #F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => handleViewPlan(plan)}
                    data-testid={`view-plan-${plan.id}`}
                    style={{
                      flex: 1,
                      background: '#0F172A',
                      color: 'white',
                      border: 'none',
                      fontSize: '0.875rem',
                      padding: '0.5rem 1rem'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#1E293B'}
                    onMouseLeave={(e) => e.target.style.background = '#0F172A'}
                  >
                    {plan.status === 'complete' ? 'View Plan' : 'Continue'}
                  </button>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (plan.status === 'complete') {
                        handleExport(plan.id, 'pdf');
                      } else {
                        setError('Plan must be complete before exporting');
                      }
                    }}
                    disabled={plan.status !== 'complete'}
                    style={{
                      padding: '0.5rem',
                      color: plan.status === 'complete' ? '#64748B' : '#CBD5E1',
                      background: 'none',
                      border: '1px solid transparent',
                      borderRadius: '8px',
                      cursor: plan.status === 'complete' ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s',
                      opacity: plan.status === 'complete' ? 1 : 0.5
                    }}
                    onMouseEnter={(e) => {
                      if (plan.status === 'complete') {
                        e.target.style.color = '#0F172A';
                        e.target.style.background = 'white';
                        e.target.style.borderColor = '#E2E8F0';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (plan.status === 'complete') {
                        e.target.style.color = '#64748B';
                        e.target.style.background = 'none';
                        e.target.style.borderColor = 'transparent';
                      }
                    }}
                    title={plan.status === 'complete' ? 'Export as PDF' : 'Plan must be complete'}
                  >
                    <Download size={18} />
                  </button>
                  
                  <button 
                    onClick={() => handleDeletePlan(plan.id)}
                    data-testid={`delete-plan-${plan.id}`}
                    style={{
                      padding: '0.5rem',
                      color: '#94A3B8',
                      background: 'none',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = '#EF4444';
                      e.target.style.background = '#FEF2F2';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = '#94A3B8';
                      e.target.style.background = 'none';
                    }}
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}

            {/* New Plan Ghost Card */}
            <button 
              onClick={handleCreatePlan}
              style={{
                border: '2px dashed #E2E8F0',
                borderRadius: '12px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                background: 'white',
                cursor: 'pointer',
                minHeight: '250px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0, 22, 57, 0.3)';
                e.currentTarget.style.background = 'rgba(0, 22, 57, 0.03)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E2E8F0';
                e.currentTarget.style.background = 'white';
              }}
              data-testid="create-plan-ghost-btn"
            >
              <div style={{
                width: '48px',
                height: '48px',
                background: 'white',
                border: '1px solid #E2E8F0',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94A3B8',
                marginBottom: '0.75rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                const card = e.currentTarget.closest('button');
                if (card) {
                  e.currentTarget.style.transform = 'scale(1.1)';
                  e.currentTarget.style.borderColor = 'rgba(0, 22, 57, 0.2)';
                  e.currentTarget.style.color = '#001639';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.borderColor = '#E2E8F0';
                e.currentTarget.style.color = '#94A3B8';
              }}
              >
                <Plus size={24} />
              </div>
              <h3 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#0F172A', marginBottom: '0.25rem' }}>Create New Plan</h3>
              <p style={{ fontSize: '0.75rem', color: '#64748B', maxWidth: '150px' }}>Start a new business plan from scratch</p>
            </button>
          </div>
        )}
      </main>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 20, 25, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => !upgrading && setShowUpgradeModal(false)}
        >
          <div 
            className="card" 
            style={{ maxWidth: '1200px', width: '90%', padding: '2rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: '1rem', textAlign: 'center', fontSize: '1.75rem' }}>Choose Your Plan</h3>
            <p style={{ color: '#6B7A91', marginBottom: '2rem', textAlign: 'center', fontSize: '1rem' }}>
              {subscription?.tier === 'free' ? 'Unlock PDF exports and advanced features' : 'Upgrade to unlock more features'}
            </p>
            
            {/* Plans Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '1.5rem',
              marginBottom: '1.5rem'
            }}>
            {/* Free Plan */}
            <div className="card" style={{ 
              background: subscription?.tier === 'free' ? 'linear-gradient(135deg, #E6EBF0 0%, #E8F5F1 100%)' : 'var(--bg-secondary)', 
              borderLeft: subscription?.tier === 'free' ? '4px solid #001639' : '4px solid #E4E9EF',
              opacity: subscription?.tier === 'free' ? 1 : 0.8,
              display: 'flex',
              flexDirection: 'column',
              height: '100%'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div>
                  <h4 style={{ marginBottom: '0.5rem' }}>
                    Free Plan
                    {subscription?.tier === 'free' && <span style={{ fontSize: '0.75rem', background: '#001639', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', marginLeft: '0.5rem' }}>CURRENT</span>}
                  </h4>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#001639' }}>£0<span style={{ fontSize: '1rem', fontWeight: '400', color: '#6B7A91' }}>/month</span></div>
                </div>
              </div>
              <ul style={{ color: '#4A5568', marginLeft: '1.5rem', marginBottom: '1rem', flexGrow: 1 }}>
                <li style={{ marginBottom: '0.5rem' }}>1 plan per month</li>
                <li style={{ marginBottom: '0.5rem' }}>Basic AI generation</li>
                <li style={{ marginBottom: '0.5rem' }}>Preview only</li>
                <li style={{ marginBottom: '0.5rem' }}>No exports</li>
              </ul>
              {subscription?.tier === 'free' ? (
                <button 
                  className="btn btn-secondary" 
                  style={{ width: '100%', marginTop: 'auto' }}
                  disabled
                >
                  Current Plan
                </button>
              ) : (
                <button 
                  className="btn btn-ghost" 
                  style={{ width: '100%', marginTop: 'auto' }}
                  disabled
                  title="Downgrade not available"
                >
                  Downgrade (Contact Support)
                </button>
              )}
            </div>
            
            {/* Starter Plan */}
            <div className="card" style={{ 
              background: subscription?.tier === 'starter' ? 'linear-gradient(135deg, #E6EBF0 0%, #E8F5F1 100%)' : 'var(--bg-secondary)', 
              borderLeft: subscription?.tier === 'starter' ? '4px solid #001639' : '4px solid #001639',
              opacity: subscription?.tier === 'starter' ? 1 : 1,
              display: 'flex',
              flexDirection: 'column',
              height: '100%'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div>
                  <h4 style={{ marginBottom: '0.5rem' }}>
                    Starter Plan
                    {subscription?.tier === 'starter' && <span style={{ fontSize: '0.75rem', background: '#001639', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', marginLeft: '0.5rem' }}>CURRENT</span>}
                  </h4>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#001639' }}>£12<span style={{ fontSize: '1rem', fontWeight: '400', color: '#6B7A91' }}>/month</span></div>
                </div>
              </div>
              <ul style={{ color: '#4A5568', marginLeft: '1.5rem', marginBottom: '1rem', flexGrow: 1 }}>
                <li style={{ marginBottom: '0.5rem' }}>3 plans per month</li>
                <li style={{ marginBottom: '0.5rem' }}>Full AI generation</li>
                <li style={{ marginBottom: '0.5rem' }}>PDF export</li>
                <li style={{ marginBottom: '0.5rem' }}>SWOT & competitor analysis</li>
              </ul>
              {subscription?.tier === 'starter' ? (
                <button 
                  className="btn btn-secondary" 
                  style={{ width: '100%', marginTop: 'auto' }}
                  disabled
                >
                  Current Plan
                </button>
              ) : (
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', marginTop: 'auto' }}
                  onClick={() => handleUpgrade('starter')}
                  disabled={upgrading || subscription?.tier === 'professional'}
                  data-testid="upgrade-starter-btn"
                >
                  {upgrading ? 'Redirecting to checkout...' : subscription?.tier === 'professional' ? 'Downgrade (Contact Support)' : 'Choose Starter'}
                </button>
              )}
            </div>

            {/* Professional Plan */}
            <div className="card" style={{ 
              background: subscription?.tier === 'professional' ? 'linear-gradient(135deg, #E6EBF0 0%, #E8F5F1 100%)' : 'linear-gradient(135deg, #E6EBF0 0%, #E8F5F1 100%)', 
              borderLeft: '4px solid #27AC85',
              display: 'flex',
              flexDirection: 'column',
              height: '100%'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div>
                  <h4 style={{ marginBottom: '0.5rem' }}>
                    Professional Plan 
                    {subscription?.tier === 'professional' ? (
                      <span style={{ fontSize: '0.75rem', background: '#27AC85', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', marginLeft: '0.5rem' }}>CURRENT</span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', background: '#27AC85', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', marginLeft: '0.5rem' }}>POPULAR</span>
                    )}
                  </h4>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#27AC85' }}>£29<span style={{ fontSize: '1rem', fontWeight: '400', color: '#6B7A91' }}>/month</span></div>
                </div>
              </div>
              <ul style={{ color: '#4A5568', marginLeft: '1.5rem', marginBottom: '1rem', flexGrow: 1 }}>
                <li style={{ marginBottom: '0.5rem' }}><strong>Unlimited plans</strong></li>
                <li style={{ marginBottom: '0.5rem' }}>All export formats (PDF, DOCX)</li>
                <li style={{ marginBottom: '0.5rem' }}>Financial projections & charts</li>
                <li style={{ marginBottom: '0.5rem' }}>Compliance checking</li>
                <li style={{ marginBottom: '0.5rem' }}>Pitch deck generator</li>
              </ul>
              {subscription?.tier === 'professional' ? (
                <button 
                  className="btn btn-secondary" 
                  style={{ width: '100%', background: '#27AC85', marginTop: 'auto' }}
                  disabled
                >
                  Current Plan
                </button>
              ) : (
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', background: '#27AC85', marginTop: 'auto' }}
                  onClick={() => handleUpgrade('professional')}
                  disabled={upgrading}
                  data-testid="upgrade-professional-btn"
                >
                  {upgrading ? 'Redirecting to checkout...' : 'Choose Professional'}
                </button>
              )}
            </div>
            </div>

            {/* Cancel Button */}
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <button 
                className="btn btn-ghost" 
                onClick={() => setShowUpgradeModal(false)}
                disabled={upgrading}
                data-testid="close-modal-btn"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plan Comparison Section */}
      {plans.length >= 2 && (
        <div className="container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem 3rem' }}>
          <div className="card" style={{ 
            padding: '2rem',
            background: 'linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 100%)',
            border: '1px solid #E2E8F0',
            borderRadius: '16px'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <div>
                <h3 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '700', 
                  color: '#001639', 
                  margin: 0, 
                  marginBottom: '0.5rem',
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem' 
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #001639 0%, #003366 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <GitCompare size={20} color="white" />
                  </div>
                  Plan Comparison
                </h3>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748B' }}>
                  Select 2-4 plans to compare side-by-side and identify differences
                </p>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (selectedPlans.length >= 2) {
                    setShowComparison(true);
                  } else {
                    alert('Please select at least 2 plans using the checkboxes on plan cards above.');
                  }
                }}
                disabled={selectedPlans.length < 2}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  opacity: selectedPlans.length >= 2 ? 1 : 0.5,
                  cursor: selectedPlans.length >= 2 ? 'pointer' : 'not-allowed'
                }}
              >
                <GitCompare size={18} />
                {selectedPlans.length >= 2 ? `Compare ${selectedPlans.length} Plans` : 'Select Plans to Compare'}
              </button>
            </div>
            {selectedPlans.length > 0 && (
              <div style={{
                padding: '1rem',
                background: '#F1F5F9',
                borderRadius: '8px',
                border: '1px solid #E2E8F0'
              }}>
                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#001639', marginBottom: '0.5rem' }}>
                  Selected Plans ({selectedPlans.length} of 4)
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {selectedPlans.map(planId => {
                    const plan = plans.find(p => p.id === planId);
                    return plan ? (
                      <div key={planId} style={{
                        padding: '0.5rem 0.75rem',
                        background: 'white',
                        borderRadius: '6px',
                        border: '1px solid #E2E8F0',
                        fontSize: '0.8125rem',
                        color: '#001639',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        {plan.name || 'Untitled Plan'}
                        <button
                          onClick={() => setSelectedPlans(selectedPlans.filter(id => id !== planId))}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <X size={14} color="#64748B" />
                        </button>
                      </div>
                    ) : null;
                  })}
                </div>
                {selectedPlans.length < 2 && (
                  <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.5rem' }}>
                    Select {2 - selectedPlans.length} more plan{2 - selectedPlans.length > 1 ? 's' : ''} to compare
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Achievements Section */}
      <div className="container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem 3rem' }}>
        <Achievements userId={user?.id} />
      </div>

      {/* Support Tickets Section */}
      <div className="container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem 3rem' }}>
        <SupportTickets user={user} />
      </div>

      {/* Footer */}
      <Footer navigate={navigate} user={user} />

      {/* Plan Comparison Modal */}
      {showComparison && selectedPlans.length >= 2 && (
        <PlanComparison
          planIds={selectedPlans}
          onClose={() => {
            setShowComparison(false);
            setSelectedPlans([]);
          }}
        />
      )}
    </div>
  );
}

export default DashboardPage;
