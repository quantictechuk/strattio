import React, { useState, useEffect } from 'react';
import { api, authService } from '../lib/api';
import RichTextEditor from '../components/RichTextEditor';

function PlanEditorPage({ navigate, user, planId }) {
  const [plan, setPlan] = useState(null);
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [financials, setFinancials] = useState(null);
  const [compliance, setCompliance] = useState(null);
  const [activeTab, setActiveTab] = useState('sections');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [polling, setPolling] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    if (planId) {
      loadPlan();
      loadSubscription();
    }
  }, [planId]);

  const loadSubscription = async () => {
    try {
      const subData = await api.subscriptions.current();
      setSubscription(subData);
    } catch (err) {
      console.error('Error loading subscription:', err);
    }
  };

  const handleUpgrade = async (packageId) => {
    setUpgrading(true);
    try {
      // Get current origin
      const originUrl = window.location.origin;
      
      // Create Stripe checkout session
      const checkoutData = await api.stripe.createCheckout(packageId, originUrl);
      
      // Redirect to Stripe
      window.location.href = checkoutData.url;
    } catch (err) {
      setError(err.message || 'Failed to create checkout session');
      setUpgrading(false);
    }
  };

  const loadPlan = async () => {
    setLoading(true);
    try {
      const planData = await api.plans.get(planId);
      setPlan(planData);

      // If plan is generating, start polling
      if (planData.status === 'generating') {
        setPolling(true);
        pollPlanStatus();
      } else if (planData.status === 'complete') {
        await loadPlanContent();
      }
    } catch (err) {
      setError(err.message || 'Failed to load plan');
    } finally {
      setLoading(false);
    }
  };

  const pollPlanStatus = async () => {
    const maxAttempts = 60; // 60 * 2s = 2 minutes
    let attempts = 0;

    const interval = setInterval(async () => {
      try {
        const statusData = await api.plans.status(planId);
        
        if (statusData.status === 'complete') {
          clearInterval(interval);
          setPolling(false);
          await loadPlan();
        } else if (statusData.status === 'failed') {
          clearInterval(interval);
          setPolling(false);
          setError('Plan generation failed. Please try again.');
        }

        attempts++;
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setPolling(false);
          setError('Plan generation timed out. Please refresh the page.');
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 2000);
  };

  const loadPlanContent = async () => {
    try {
      const [sectionsData, financialsData, complianceData] = await Promise.all([
        api.sections.list(planId),
        api.financials.get(planId).catch(() => null),
        api.compliance.get(planId).catch(() => null)
      ]);

      setSections(sectionsData.sections || []);
      if (financialsData) setFinancials(financialsData);
      if (complianceData) setCompliance(complianceData);

      // Select first section by default
      if (sectionsData.sections && sectionsData.sections.length > 0) {
        setSelectedSection(sectionsData.sections[0]);
      }
    } catch (err) {
      console.error('Error loading plan content:', err);
    }
  };

  const handleSectionClick = (section) => {
    setSelectedSection(section);
  };

  const handleUpdateSection = async (sectionId, newContent) => {
    try {
      const updated = await api.sections.update(planId, sectionId, { content: newContent });
      setSections(sections.map(s => s.id === sectionId ? updated : s));
      setSelectedSection(updated);
    } catch (err) {
      setError(err.message || 'Failed to update section');
    }
  };

  const handleSaveSection = async (content) => {
    if (!editingSection) return;
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/${planId}/sections/${editingSection.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ content })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to save section');
      }
      
      const updated = await response.json();
      setSections(sections.map(s => s.id === editingSection.id ? updated : s));
      setSelectedSection(updated);
      setEditingSection(null);
    } catch (err) {
      console.error('Save error:', err);
      setError(err.message || 'Failed to save section');
    }
  };

  const handleRegenerateSection = async (options) => {
    if (!editingSection) return;
    
    setIsRegenerating(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/plans/${planId}/sections/${editingSection.id}/regenerate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(options)
      });

      if (!response.ok) throw new Error('Failed to regenerate section');
      
      const result = await response.json();
      
      if (result.success && result.section) {
        setSections(sections.map(s => s.id === editingSection.id ? result.section : s));
        setSelectedSection(result.section);
        setEditingSection(result.section);
      }
    } catch (err) {
      setError(err.message || 'Failed to regenerate section');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingSection(null);
  };

  const handleEditSection = (section) => {
    setEditingSection(section);
    setSelectedSection(section);
  };

  const handleExportPDF = async () => {
    // Check subscription tier first
    if (!subscription) {
      setError('Loading subscription info...');
      return;
    }

    // Free tier: Show upgrade modal
    if (subscription.tier === 'free') {
      setShowUpgradeModal(true);
      return;
    }

    // Paid tiers: Proceed with export
    try {
      setError('');
      const exportJob = await api.exports.create(planId, 'pdf');
      
      // Automatically trigger download
      if (exportJob && exportJob.id) {
        const downloadUrl = `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001'}/api/exports/${exportJob.id}/download`;
        
        // Create hidden link and click it
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = exportJob.file_name || 'business_plan.pdf';
        
        // Add auth header by opening in new window with fetch
        const token = authService.getToken();
        const response = await fetch(downloadUrl, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          link.href = url;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          
          alert('PDF downloaded successfully!');
        } else {
          throw new Error('Failed to download PDF');
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to create export');
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>
          <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
          <p style={{ marginTop: '1rem', color: '#6B7A91' }}>Loading plan...</p>
        </div>
      </div>
    );
  }

  if (polling) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
        <h2 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Generating Your Business Plan</h2>
        <p style={{ color: '#6B7A91', marginBottom: '1rem' }}>Running multi-agent pipeline...</p>
        <div style={{ maxWidth: '500px', textAlign: 'left' }}>
          <div style={{ padding: '0.5rem', background: '#EBF5FF', borderRadius: '4px', marginBottom: '0.5rem' }}>✓ Research Agent - Fetching market data</div>
          <div style={{ padding: '0.5rem', background: '#EBF5FF', borderRadius: '4px', marginBottom: '0.5rem' }}>✓ Validation Agent - Checking data quality</div>
          <div style={{ padding: '0.5rem', background: '#EBF5FF', borderRadius: '4px', marginBottom: '0.5rem' }}>✓ Financial Engine - Calculating projections</div>
          <div style={{ padding: '0.5rem', background: '#F1F4F7', borderRadius: '4px', marginBottom: '0.5rem' }}>⏳ Plan Writer - Generating sections...</div>
          <div style={{ padding: '0.5rem', background: '#F1F4F7', borderRadius: '4px' }}>⏳ Compliance Agent - Validating requirements</div>
        </div>
        <p style={{ fontSize: '0.875rem', color: '#9BA9BC', marginTop: '1rem' }}>Estimated time: 60-90 seconds</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <h2>Plan Not Found</h2>
          <button className="btn btn-primary" onClick={() => navigate('dashboard')} style={{ marginTop: '1rem' }}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)' }}>
      {/* Header */}
      <header style={{ padding: '1.5rem 0', borderBottom: '1px solid #E4E9EF', background: 'white' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1A85FF', fontFamily: 'IBM Plex Sans' }}>
              STRATTIO
            </div>
            <div style={{ fontSize: '1.125rem', color: '#2D3748', marginTop: '0.25rem' }}>{plan.name}</div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('financials', { planId })}
              data-testid="view-financials-btn"
            >
              📊 View Financials
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={handleExportPDF}
              data-testid="export-pdf-btn"
            >
              📄 Export PDF
            </button>
            <button 
              className="btn btn-ghost" 
              onClick={() => navigate('dashboard')}
              data-testid="close-plan-btn"
            >
              Close
            </button>
          </div>
        </div>
      </header>

      {error && (
        <div className="container" style={{ marginTop: '1rem' }}>
          <div className="error-message">{error}</div>
        </div>
      )}

      {/* Main Content */}
      <div className="container" style={{ padding: '2rem 0' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #E4E9EF' }}>
          <button
            style={{
              padding: '1rem 1.5rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'sections' ? '2px solid #1A85FF' : '2px solid transparent',
              color: activeTab === 'sections' ? '#1A85FF' : '#6B7A91',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '-2px'
            }}
            onClick={() => setActiveTab('sections')}
            data-testid="tab-sections"
          >
            Plan Sections
          </button>
          <button
            style={{
              padding: '1rem 1.5rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'financials' ? '2px solid #1A85FF' : '2px solid transparent',
              color: activeTab === 'financials' ? '#1A85FF' : '#6B7A91',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '-2px'
            }}
            onClick={() => setActiveTab('financials')}
            data-testid="tab-financials"
          >
            Financials
          </button>
          <button
            style={{
              padding: '1rem 1.5rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'compliance' ? '2px solid #1A85FF' : '2px solid transparent',
              color: activeTab === 'compliance' ? '#1A85FF' : '#6B7A91',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '-2px'
            }}
            onClick={() => setActiveTab('compliance')}
            data-testid="tab-compliance"
          >
            Compliance
          </button>
        </div>

        {/* Sections Tab */}
        {activeTab === 'sections' && (
          <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
            {/* Sections List */}
            <div className="card" style={{ height: 'fit-content' }}>
              <h4 style={{ marginBottom: '1rem' }}>Sections</h4>
              {sections.map((section, idx) => (
                <div
                  key={section.id}
                  onClick={() => handleSectionClick(section)}
                  data-testid={`section-item-${section.section_type}`}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: selectedSection?.id === section.id ? '#EBF5FF' : 'transparent',
                    border: selectedSection?.id === section.id ? '1px solid #1A85FF' : '1px solid transparent',
                    marginBottom: '0.5rem'
                  }}
                >
                  <div style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                    {idx + 1}. {section.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7A91' }}>
                    {section.word_count} words
                  </div>
                </div>
              ))}
            </div>

            {/* Section Content */}
            {selectedSection && !editingSection && (
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3>{selectedSection.title}</h3>
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleEditSection(selectedSection)}
                    data-testid="edit-section-btn"
                  >
                    ✏️ Edit Section
                  </button>
                </div>
                
                <div 
                  style={{
                    padding: '1.5rem',
                    background: '#F9FAFB',
                    borderRadius: '8px',
                    lineHeight: '1.7'
                  }}
                  dangerouslySetInnerHTML={{ __html: selectedSection.content }}
                  data-testid="section-content-display"
                />
              </div>
            )}

            {/* Rich Text Editor */}
            {editingSection && (
              <div className="card">
                <RichTextEditor
                  initialContent={editingSection.content}
                  sectionTitle={editingSection.title}
                  onSave={handleSaveSection}
                  onCancel={handleCancelEdit}
                  onRegenerate={handleRegenerateSection}
                  isRegenerating={isRegenerating}
                />
              </div>
            )}
          </div>
        )}

        {/* Financials Tab */}
        {activeTab === 'financials' && (
          <div className="card">
            <h3 style={{ marginBottom: '1.5rem' }}>Financial Projections</h3>
            
            {!financials && (
              <p style={{ color: '#6B7A91' }}>Financial data not available. Generate plan first.</p>
            )}

            {financials && financials.data && (
              <div>
                {/* KPIs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                  <div className="card" style={{ background: 'var(--bg-secondary)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.875rem', color: '#6B7A91', marginBottom: '0.5rem' }}>Gross Margin</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1A85FF' }}>
                      {financials.data.kpis?.gross_margin_percent?.toFixed(1)}%
                    </div>
                  </div>
                  <div className="card" style={{ background: 'var(--bg-secondary)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.875rem', color: '#6B7A91', marginBottom: '0.5rem' }}>Net Margin (Y1)</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: '700', color: financials.data.kpis?.net_margin_percent >= 0 ? '#27AC85' : '#EF4444' }}>
                      {financials.data.kpis?.net_margin_percent?.toFixed(1)}%
                    </div>
                  </div>
                  <div className="card" style={{ background: 'var(--bg-secondary)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.875rem', color: '#6B7A91', marginBottom: '0.5rem' }}>ROI Year 1</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: '700', color: financials.data.kpis?.roi_year1_percent >= 0 ? '#27AC85' : '#EF4444' }}>
                      {financials.data.kpis?.roi_year1_percent?.toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* P&L Table */}
                <h4 style={{ marginBottom: '1rem' }}>Profit & Loss (5-Year Projection)</h4>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid #E4E9EF' }}>
                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Metric</th>
                        {financials.data.pnl_annual?.map(year => (
                          <th key={year.year} style={{ padding: '0.75rem', textAlign: 'right' }}>Year {year.year}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ padding: '0.75rem', fontWeight: '600' }}>Revenue</td>
                        {financials.data.pnl_annual?.map(year => (
                          <td key={year.year} style={{ padding: '0.75rem', textAlign: 'right' }}>
                            £{year.revenue?.toLocaleString()}
                          </td>
                        ))}
                      </tr>
                      <tr style={{ background: 'var(--bg-secondary)' }}>
                        <td style={{ padding: '0.75rem' }}>COGS</td>
                        {financials.data.pnl_annual?.map(year => (
                          <td key={year.year} style={{ padding: '0.75rem', textAlign: 'right' }}>
                            £{year.cogs?.toLocaleString()}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td style={{ padding: '0.75rem', fontWeight: '600' }}>Gross Profit</td>
                        {financials.data.pnl_annual?.map(year => (
                          <td key={year.year} style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>
                            £{year.gross_profit?.toLocaleString()}
                          </td>
                        ))}
                      </tr>
                      <tr style={{ background: 'var(--bg-secondary)' }}>
                        <td style={{ padding: '0.75rem' }}>Operating Expenses</td>
                        {financials.data.pnl_annual?.map(year => (
                          <td key={year.year} style={{ padding: '0.75rem', textAlign: 'right' }}>
                            £{year.total_opex?.toLocaleString()}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td style={{ padding: '0.75rem', fontWeight: '700' }}>Net Profit</td>
                        {financials.data.pnl_annual?.map(year => (
                          <td 
                            key={year.year} 
                            style={{ 
                              padding: '0.75rem', 
                              textAlign: 'right', 
                              fontWeight: '700',
                              color: year.net_profit >= 0 ? '#27AC85' : '#EF4444'
                            }}
                          >
                            £{year.net_profit?.toLocaleString()}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Break-Even */}
                <div style={{ marginTop: '2rem' }}>
                  <h4 style={{ marginBottom: '1rem' }}>Break-Even Analysis</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                    <div className="card" style={{ background: 'var(--bg-secondary)' }}>
                      <div style={{ fontSize: '0.875rem', color: '#6B7A91', marginBottom: '0.5rem' }}>Monthly Units Needed</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                        {financials.data.break_even?.break_even_units_monthly?.toLocaleString()}
                      </div>
                    </div>
                    <div className="card" style={{ background: 'var(--bg-secondary)' }}>
                      <div style={{ fontSize: '0.875rem', color: '#6B7A91', marginBottom: '0.5rem' }}>Monthly Revenue Needed</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                        £{financials.data.break_even?.break_even_revenue_monthly?.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Compliance Tab */}
        {activeTab === 'compliance' && (
          <div className="card">
            <h3 style={{ marginBottom: '1.5rem' }}>Compliance Report</h3>
            
            {!compliance && (
              <p style={{ color: '#6B7A91' }}>Compliance data not available. Generate plan first.</p>
            )}

            {compliance && compliance.data && (
              <div>
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ fontSize: '0.875rem', color: '#6B7A91', marginBottom: '0.5rem' }}>Overall Status</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: compliance.data.overall_status === 'compliant' ? '#27AC85' : '#F59E0B' }}>
                    {compliance.data.overall_status?.toUpperCase()}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6B7A91', marginTop: '0.5rem' }}>
                    Score: {compliance.data.score}/100
                  </div>
                </div>

                <h4 style={{ marginBottom: '1rem' }}>Compliance Checks</h4>
                {compliance.data.checks?.map((check, idx) => (
                  <div 
                    key={idx}
                    className="card" 
                    style={{ 
                      marginBottom: '1rem', 
                      background: check.status === 'pass' ? '#D1FAE5' : '#FEE2E2',
                      borderLeft: `4px solid ${check.status === 'pass' ? '#10B981' : '#EF4444'}`
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div>
                        <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                          {check.status === 'pass' ? '✅' : '❌'} {check.name}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#4A5568' }}>{check.message}</div>
                        {check.suggestion && (
                          <div style={{ fontSize: '0.875rem', color: '#6B7A91', marginTop: '0.5rem', fontStyle: 'italic' }}>
                            💡 {check.suggestion}
                          </div>
                        )}
                      </div>
                      <span className={`status-badge ${check.status === 'pass' ? 'status-complete' : 'status-failed'}`}>
                        {check.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

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
            style={{ maxWidth: '600px', padding: '2rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>Choose Your Plan</h3>
            <p style={{ color: '#6B7A91', marginBottom: '2rem', textAlign: 'center' }}>
              Unlock PDF exports and advanced features
            </p>
            
            {/* Starter Plan */}
            <div className="card" style={{ background: 'var(--bg-secondary)', marginBottom: '1rem', borderLeft: '4px solid #1A85FF' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div>
                  <h4 style={{ marginBottom: '0.5rem' }}>Starter Plan</h4>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1A85FF' }}>£12<span style={{ fontSize: '1rem', fontWeight: '400', color: '#6B7A91' }}>/month</span></div>
                </div>
              </div>
              <ul style={{ color: '#4A5568', marginLeft: '1.5rem', marginBottom: '1rem' }}>
                <li>3 plans per month</li>
                <li>Full AI generation</li>
                <li>PDF export</li>
                <li>SWOT & competitor analysis</li>
              </ul>
              <button 
                className="btn btn-primary" 
                style={{ width: '100%' }}
                onClick={() => handleUpgrade('starter')}
                disabled={upgrading}
                data-testid="upgrade-starter-btn"
              >
                {upgrading ? 'Redirecting to checkout...' : 'Choose Starter'}
              </button>
            </div>

            {/* Professional Plan */}
            <div className="card" style={{ background: 'linear-gradient(135deg, #EBF5FF 0%, #E8F5F1 100%)', marginBottom: '1rem', borderLeft: '4px solid #27AC85' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div>
                  <h4 style={{ marginBottom: '0.5rem' }}>Professional Plan <span style={{ fontSize: '0.75rem', background: '#27AC85', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', marginLeft: '0.5rem' }}>POPULAR</span></h4>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#27AC85' }}>£29<span style={{ fontSize: '1rem', fontWeight: '400', color: '#6B7A91' }}>/month</span></div>
                </div>
              </div>
              <ul style={{ color: '#4A5568', marginLeft: '1.5rem', marginBottom: '1rem' }}>
                <li><strong>Unlimited plans</strong></li>
                <li>All export formats (PDF, DOCX)</li>
                <li>Financial projections & charts</li>
                <li>Compliance checking</li>
                <li>Pitch deck generator</li>
              </ul>
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', background: '#27AC85' }}
                onClick={() => handleUpgrade('professional')}
                disabled={upgrading}
                data-testid="upgrade-professional-btn"
              >
                {upgrading ? 'Redirecting to checkout...' : 'Choose Professional'}
              </button>
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
    </div>
  );
}

export default PlanEditorPage;
