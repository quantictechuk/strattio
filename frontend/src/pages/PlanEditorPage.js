import React, { useState, useEffect, useRef } from 'react';
import { api, authService } from '../lib/api';
import RichTextEditor from '../components/RichTextEditor';
import SWOTAnalysis from '../components/SWOTAnalysis';
import CompetitorAnalysis from '../components/CompetitorAnalysis';
import EnhancedCompliance from '../components/EnhancedCompliance';
import BusinessModelCanvas from '../components/BusinessModelCanvas';
import PlanAnalytics from '../components/PlanAnalytics';
import PlanChat from '../components/PlanChat';
import PlanSharing from '../components/PlanSharing';
import ReadinessScore from '../components/ReadinessScore';
import PitchDeckGenerator from '../components/PitchDeckGenerator';
import ScenarioPlanning from '../components/ScenarioPlanning';
import AIInsights from '../components/AIInsights';
import { Share2 } from 'lucide-react';

function PlanEditorPage({ navigate, user, planId }) {
  const [plan, setPlan] = useState(null);
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [financials, setFinancials] = useState(null);
  const [compliance, setCompliance] = useState(null);
  const [swotData, setSwotData] = useState(null);
  const [competitorData, setCompetitorData] = useState(null);
  const [activeTab, setActiveTab] = useState('sections');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [polling, setPolling] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isRegeneratingSwot, setIsRegeneratingSwot] = useState(false);
  const [isRegeneratingCompetitor, setIsRegeneratingCompetitor] = useState(false);
  const [isRegeneratingCanvas, setIsRegeneratingCanvas] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showSharing, setShowSharing] = useState(false);
  const exportMenuRef = useRef(null);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
    };

    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportMenu]);

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
      const [sectionsData, financialsData, complianceData, swotResponse, competitorResponse] = await Promise.all([
        api.sections.list(planId),
        api.financials.get(planId).catch(() => null),
        api.compliance.get(planId).catch(() => null),
        api.swot.get(planId).catch(() => null),
        api.competitors.get(planId).catch(() => null)
      ]);

      setSections(sectionsData.sections || []);
      if (financialsData) setFinancials(financialsData);
      if (complianceData) setCompliance(complianceData);
      if (swotResponse && swotResponse.swot_data) setSwotData(swotResponse.swot_data);
      if (competitorResponse && competitorResponse.competitor_data) setCompetitorData(competitorResponse.competitor_data);

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
      const updated = await api.sections.update(planId, editingSection.id, { content });
      setSections(sections.map(s => s.id === editingSection.id ? updated : s));
      setSelectedSection(updated);
      setEditingSection(null);
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Save error:', err);
      setError(err.message || 'Failed to save section');
    }
  };

  const handleRegenerateSection = async (options) => {
    if (!editingSection) return;
    
    setIsRegenerating(true);
    try {
      const result = await api.sections.regenerate(planId, editingSection.id, options);
      
      if (result.success && result.section) {
        setSections(sections.map(s => s.id === editingSection.id ? result.section : s));
        setSelectedSection(result.section);
        setEditingSection(result.section);
        setError(''); // Clear any previous errors
      }
    } catch (err) {
      console.error('Regenerate error:', err);
      setError(err.message || 'Failed to regenerate section');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingSection(null);
  };

  const handleRegenerateSwot = async () => {
    setIsRegeneratingSwot(true);
    setError('');
    
    try {
      const response = await api.swot.regenerate(planId);
      setSwotData(response.swot_data);
    } catch (err) {
      setError(err.message || 'Failed to regenerate SWOT analysis');
    } finally {
      setIsRegeneratingSwot(false);
    }
  };

  const handleRegenerateCompetitor = async () => {
    setIsRegeneratingCompetitor(true);
    setError('');
    
    try {
      const response = await api.competitors.regenerate(planId);
      setCompetitorData(response.competitor_data);
    } catch (err) {
      setError(err.message || 'Failed to regenerate competitor analysis');
    } finally {
      setIsRegeneratingCompetitor(false);
    }
  };

  const handleRegenerateCanvas = async () => {
    setIsRegeneratingCanvas(true);
    setError('');
    
    try {
      await api.canvas.generate(planId);
    } catch (err) {
      setError(err.message || 'Failed to generate canvas');
    } finally {
      setIsRegeneratingCanvas(false);
    }
  };

  const handleEditSection = (section) => {
    setEditingSection(section);
    setSelectedSection(section);
  };

  const handleExport = async (format = 'pdf') => {
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
      setShowExportMenu(false);
      const exportJob = await api.exports.create(planId, format);
      
      // Automatically trigger download
      if (exportJob && exportJob.id) {
        const downloadUrl = `${process.env.REACT_APP_BACKEND_URL || 'https://strattio-backend.vercel.app'}/api/exports/${exportJob.id}/download`;
        
        // Create hidden link and click it
        const link = document.createElement('a');
        link.href = downloadUrl;
        const extension = format === 'markdown' ? 'md' : format;
        link.download = exportJob.file_name || `business_plan.${extension}`;
        
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
        } else {
          throw new Error(`Failed to download ${format.toUpperCase()}`);
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
    const steps = [
      { id: 'research', label: 'Research Agent', description: 'Fetching market data', completed: true },
      { id: 'validation', label: 'Validation Agent', description: 'Checking data quality', completed: true },
      { id: 'financial', label: 'Financial Engine', description: 'Calculating projections', completed: true },
      { id: 'writer', label: 'Plan Writer', description: 'Generating sections...', completed: false, active: true },
      { id: 'compliance', label: 'Compliance Agent', description: 'Validating requirements', completed: false }
    ];

    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #F8FAFB 0%, #E6EBF0 100%)',
        padding: '2rem 1rem'
      }}>
        {/* Logo and Branding */}
        <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <img 
            src="/logo.png" 
            alt="Strattio" 
            style={{ 
              height: '48px', 
              marginBottom: '1rem',
              filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
            }} 
          />
        </div>

        {/* Main Content Card */}
        <div className="generation-card" style={{
          background: 'white',
          borderRadius: '16px',
          padding: '3rem 2.5rem',
          maxWidth: '600px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(0, 22, 57, 0.15)',
          border: '1px solid rgba(0, 22, 57, 0.08)'
        }}>
          {/* Animated Spinner */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div className="plan-generation-spinner" style={{ margin: '0 auto' }}></div>
          </div>

          {/* Title */}
          <h2 style={{ 
            marginTop: '0',
            marginBottom: '0.5rem',
            fontSize: '1.75rem',
            fontWeight: '700',
            color: '#001639',
            textAlign: 'center'
          }}>
            Generating Your Business Plan
          </h2>
          
          <p style={{ 
            color: '#6B7A91', 
            marginBottom: '2rem',
            textAlign: 'center',
            fontSize: '1rem'
          }}>
            Our AI agents are working together to create your comprehensive business plan
          </p>

          {/* Progress Steps */}
          <div style={{ marginBottom: '2rem' }}>
            {steps.map((step, index) => (
              <div 
                key={step.id}
                className={`generation-step ${step.completed ? 'completed' : ''} ${step.active ? 'active' : ''}`}
                style={{
                  padding: '1rem 1.25rem',
                  background: step.completed 
                    ? 'linear-gradient(135deg, #E6F7F0 0%, #D1F2E5 100%)'
                    : step.active
                    ? 'linear-gradient(135deg, #EBF5FF 0%, #D6EAFF 100%)'
                    : '#F8FAFB',
                  borderRadius: '12px',
                  marginBottom: '0.75rem',
                  border: step.completed 
                    ? '2px solid #27AC85'
                    : step.active
                    ? '2px solid #3B82F6'
                    : '2px solid #E4E9EF',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Step Icon */}
                <div 
                  className={step.active ? 'rotating-icon' : ''}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: step.completed 
                      ? '#27AC85'
                      : step.active
                      ? '#3B82F6'
                      : '#CBD4E0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: 'white',
                    boxShadow: step.active ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none'
                  }}
                >
                  {step.completed ? '✓' : step.active ? '⟳' : index + 1}
                </div>

                {/* Step Content */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontWeight: '600',
                    color: step.completed ? '#1F8A6A' : step.active ? '#001639' : '#6B7A91',
                    fontSize: '0.9375rem',
                    marginBottom: '0.25rem'
                  }}>
                    {step.label}
                  </div>
                  <div style={{
                    fontSize: '0.875rem',
                    color: step.completed ? '#27AC85' : step.active ? '#6B7A91' : '#9BA9BC'
                  }}>
                    {step.description}
                  </div>
                </div>

                {/* Active Pulse Animation */}
                {step.active && (
                  <div className="pulse-dot" style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#3B82F6',
                    animation: 'pulse 2s infinite'
                  }}></div>
                )}
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
              height: '6px',
              background: '#E4E9EF',
              borderRadius: '3px',
              overflow: 'hidden',
              marginBottom: '0.5rem'
            }}>
              <div 
                className="progress-bar-fill"
                style={{
                  height: '100%',
                  width: '60%',
                  background: 'linear-gradient(90deg, #27AC85 0%, #3B82F6 100%)',
                  borderRadius: '3px',
                  animation: 'progressPulse 2s ease-in-out infinite',
                  transition: 'width 0.3s ease'
                }}
              ></div>
            </div>
            <p style={{ 
              fontSize: '0.875rem', 
              color: '#9BA9BC',
              textAlign: 'center',
              margin: 0
            }}>
              Estimated time: 60-90 seconds
            </p>
          </div>

          {/* Fun Fact / Tip */}
          <div style={{
            padding: '1rem',
            background: '#F8FAFB',
            borderRadius: '8px',
            border: '1px solid #E4E9EF',
            textAlign: 'center'
          }}>
            <p style={{
              fontSize: '0.875rem',
              color: '#6B7A91',
              margin: 0,
              fontStyle: 'italic'
            }}>
              💡 Did you know? Our AI analyzes thousands of data points to create your personalized plan
            </p>
          </div>
        </div>
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
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img 
                src="/logo.png" 
                alt="Strattio" 
                style={{ height: '40px', width: 'auto' }}
              />
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
            <div style={{ position: 'relative' }} ref={exportMenuRef}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowExportMenu(!showExportMenu)}
                data-testid="export-btn"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                Export Plan
                <span style={{ fontSize: '0.75rem' }}>▼</span>
              </button>
              {showExportMenu && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '0.5rem',
                  background: 'white',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  minWidth: '180px',
                  zIndex: 1000
                }}>
                  <button
                    onClick={() => handleExport('pdf')}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: 'none',
                      background: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      color: '#374151'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F3F4F6'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                  >
                    📄 Export as PDF
                  </button>
                  <button
                    onClick={() => handleExport('docx')}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: 'none',
                      background: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      color: '#374151',
                      borderTop: '1px solid #E2E8F0'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F3F4F6'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                  >
                    📝 Export as DOCX
                  </button>
                  <button
                    onClick={() => handleExport('markdown')}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: 'none',
                      background: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      color: '#374151',
                      borderTop: '1px solid #E2E8F0'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F3F4F6'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                  >
                    📋 Export as Markdown
                  </button>
                </div>
              )}
            </div>
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
              borderBottom: activeTab === 'sections' ? '2px solid #001639' : '2px solid transparent',
              color: activeTab === 'sections' ? '#001639' : '#6B7A91',
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
              borderBottom: activeTab === 'financials' ? '2px solid #001639' : '2px solid transparent',
              color: activeTab === 'financials' ? '#001639' : '#6B7A91',
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
              borderBottom: activeTab === 'compliance' ? '2px solid #001639' : '2px solid transparent',
              color: activeTab === 'compliance' ? '#001639' : '#6B7A91',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '-2px'
            }}
            onClick={() => setActiveTab('compliance')}
            data-testid="tab-compliance"
          >
            Compliance
          </button>
          <button
            style={{
              padding: '1rem 1.5rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'analytics' ? '2px solid #001639' : '2px solid transparent',
              color: activeTab === 'analytics' ? '#001639' : '#6B7A91',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '-2px'
            }}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
          <button
            style={{
              padding: '1rem 1.5rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'readiness' ? '2px solid #001639' : '2px solid transparent',
              color: activeTab === 'readiness' ? '#001639' : '#6B7A91',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '-2px'
            }}
            onClick={() => setActiveTab('readiness')}
          >
            Investment Readiness
          </button>
          <button
            style={{
              padding: '1rem 1.5rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'pitch-deck' ? '2px solid #001639' : '2px solid transparent',
              color: activeTab === 'pitch-deck' ? '#001639' : '#6B7A91',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '-2px'
            }}
            onClick={() => setActiveTab('pitch-deck')}
          >
            Pitch Deck
          </button>
          <button
            style={{
              padding: '1rem 1.5rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'insights' ? '2px solid #001639' : '2px solid transparent',
              color: activeTab === 'insights' ? '#001639' : '#6B7A91',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '-2px'
            }}
            onClick={() => setActiveTab('insights')}
          >
            AI Insights
          </button>
          <button
            style={{
              padding: '1rem 1.5rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'chat' ? '2px solid #001639' : '2px solid transparent',
              color: activeTab === 'chat' ? '#001639' : '#6B7A91',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '-2px'
            }}
            onClick={() => setActiveTab('chat')}
          >
            AI Chat
          </button>
          <button
            style={{
              padding: '1rem 1.5rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'sharing' ? '2px solid #001639' : '2px solid transparent',
              color: activeTab === 'sharing' ? '#001639' : '#6B7A91',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '-2px'
            }}
            onClick={() => setActiveTab('sharing')}
          >
            Share & Collaborate
          </button>
        </div>

        {/* Sections Tab */}
        {activeTab === 'analytics' && (
          <div>
            <PlanAnalytics planId={planId} />
          </div>
        )}

        {activeTab === 'readiness' && (
          <div>
            <ReadinessScore planId={planId} />
          </div>
        )}

        {activeTab === 'pitch-deck' && (
          <div>
            <PitchDeckGenerator planId={planId} />
          </div>
        )}

        {activeTab === 'insights' && (
          <div>
            <AIInsights planId={planId} />
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="card" style={{ minHeight: '600px', padding: 0, overflow: 'hidden' }}>
            <PlanChat planId={planId} isOpen={true} onClose={() => {}} isInTab={true} />
          </div>
        )}

        {activeTab === 'sharing' && (
          <div className="card" style={{ minHeight: '600px', padding: 0, overflow: 'hidden' }}>
            <PlanSharing planId={planId} user={user} isOpen={true} onClose={() => {}} isInTab={true} />
          </div>
        )}

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
                    background: selectedSection?.id === section.id ? '#E6EBF0' : 'transparent',
                    border: selectedSection?.id === section.id ? '1px solid #001639' : '1px solid transparent',
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
                  dangerouslySetInnerHTML={{ 
                    __html: selectedSection.content && selectedSection.content.includes('<') 
                      ? selectedSection.content 
                      : selectedSection.content.replace(/\n/g, '<br/>')
                  }}
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
                    <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#001639' }}>
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
            
            {/* Scenario Planning */}
            {financials && financials.data && (
              <div style={{ marginTop: '2rem' }}>
                <ScenarioPlanning planId={planId} />
              </div>
            )}
          </div>
        )}

        {/* Compliance Tab */}
        {activeTab === 'compliance' && (
          <div className="card">
            <EnhancedCompliance
              complianceData={compliance}
              onRegenerate={async () => {
                try {
                  setError('');
                  const complianceData = await api.compliance.get(planId);
                  setCompliance(complianceData);
                } catch (err) {
                  setError(err.message || 'Failed to recheck compliance');
                }
              }}
              isRegenerating={false}
            />
          </div>
        )}

        {/* SWOT Analysis Tab */}
        {activeTab === 'swot' && (
          <div className="card">
            <SWOTAnalysis
              swotData={swotData}
              onRegenerate={handleRegenerateSwot}
              isRegenerating={isRegeneratingSwot}
            />
          </div>
        )}

        {/* Competitor Analysis Tab */}
        {activeTab === 'competitors' && (
          <div className="card">
            <CompetitorAnalysis
              competitorData={competitorData}
              onRegenerate={handleRegenerateCompetitor}
              isRegenerating={isRegeneratingCompetitor}
            />
          </div>
        )}

        {/* Business Model Canvas Tab */}
        {activeTab === 'canvas' && (
          <div className="card">
            <BusinessModelCanvas
              planId={planId}
              onRegenerate={handleRegenerateCanvas}
              isRegenerating={isRegeneratingCanvas}
            />
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
    </div>
  );
}

export default PlanEditorPage;
