import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, Target, DollarSign, RefreshCw, Loader2 } from 'lucide-react';
import { api } from '../lib/api';

function AIInsights({ planId }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (planId) {
      loadInsights();
    }
  }, [planId]);

  const loadInsights = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.insights.get(planId);
      setInsights(data);
    } catch (err) {
      setError(err.message || 'Failed to load insights');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError('');
      const data = await api.insights.get(planId);
      setInsights(data);
    } catch (err) {
      setError(err.message || 'Failed to refresh insights');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ padding: '1rem', background: '#FEF2F2', border: '1px solid #EF4444' }}>
        <p style={{ color: '#DC2626', margin: 0 }}>{error}</p>
      </div>
    );
  }

  if (!insights) {
    return null;
  }

  const marketOpportunity = insights.market_opportunity || {};
  const riskAssessment = insights.risk_assessment || {};
  const fundingRecommendation = insights.funding_recommendation || {};
  const growthStrategies = insights.growth_strategies || [];
  const competitiveIntelligence = insights.competitive_intelligence || {};

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'low': return '#27AC85';
      case 'medium': return '#F59E0B';
      case 'high': return '#EF4444';
      default: return '#64748B';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#3B82F6';
      default: return '#64748B';
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#001639', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={24} /> AI-Powered Insights
        </h3>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn btn-secondary"
          style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          {refreshing ? <Loader2 size={16} className="spin-animation" /> : <RefreshCw size={16} />}
          Refresh
        </button>
      </div>

      {/* Market Opportunity */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#001639', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={18} /> Market Opportunity
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '0.25rem' }}>Market Size</div>
            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#001639' }}>
              {marketOpportunity.size || 'N/A'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '0.25rem' }}>Growth Rate</div>
            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#27AC85' }}>
              {marketOpportunity.growth_rate ? `${marketOpportunity.growth_rate}%` : 'N/A'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '0.25rem' }}>Opportunity Score</div>
            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#001639' }}>
              {marketOpportunity.score || 0}/100
            </div>
          </div>
        </div>
        {marketOpportunity.trends && marketOpportunity.trends.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#001639', marginBottom: '0.5rem' }}>Key Trends</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {marketOpportunity.trends.map((trend, idx) => (
                <span key={idx} style={{
                  padding: '0.375rem 0.75rem',
                  background: '#EBF5FF',
                  border: '1px solid #3B82F6',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  color: '#3B82F6'
                }}>
                  {trend}
                </span>
              ))}
            </div>
          </div>
        )}
        {marketOpportunity.analysis && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.875rem', color: '#475569', lineHeight: '1.6' }}>
              {marketOpportunity.analysis}
            </div>
          </div>
        )}
      </div>

      {/* Risk Assessment */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#001639', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={18} /> Risk Assessment
        </h4>
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#001639' }}>Overall Risk Level:</div>
            <span style={{
              padding: '0.375rem 0.75rem',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              background: `${getRiskColor(riskAssessment.overall_risk)}20`,
              color: getRiskColor(riskAssessment.overall_risk),
              border: `1px solid ${getRiskColor(riskAssessment.overall_risk)}`
            }}>
              {riskAssessment.overall_risk || 'Unknown'}
            </span>
          </div>
        </div>
        {riskAssessment.risks && riskAssessment.risks.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {riskAssessment.risks.map((risk, idx) => (
              <div key={idx} style={{
                padding: '1rem',
                background: '#F8FAFC',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                borderLeft: `4px solid ${getRiskColor(risk.severity)}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#001639', textTransform: 'capitalize' }}>
                    {risk.category} Risk
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: getRiskColor(risk.severity),
                    padding: '0.25rem 0.5rem',
                    background: `${getRiskColor(risk.severity)}20`,
                    borderRadius: '4px',
                    textTransform: 'uppercase'
                  }}>
                    {risk.severity}
                  </span>
                </div>
                <div style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '0.5rem' }}>
                  {risk.description}
                </div>
                {risk.mitigation && (
                  <div style={{ fontSize: '0.875rem', color: '#64748B', fontStyle: 'italic' }}>
                    <strong>Mitigation:</strong> {risk.mitigation}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Funding Recommendation */}
      {fundingRecommendation.best_type && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#001639', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <DollarSign size={18} /> Funding Recommendation
          </h4>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#001639', marginBottom: '0.5rem' }}>
              Recommended: <span style={{ textTransform: 'capitalize', fontWeight: '600' }}>{fundingRecommendation.best_type.replace('_', ' ')}</span>
            </div>
            {fundingRecommendation.reasoning && (
              <div style={{ fontSize: '0.875rem', color: '#475569', lineHeight: '1.6', marginBottom: '0.75rem' }}>
                {fundingRecommendation.reasoning}
              </div>
            )}
            {fundingRecommendation.amount_suggestion && (
              <div style={{ fontSize: '0.875rem', color: '#64748B', fontStyle: 'italic' }}>
                Suggested Amount: {fundingRecommendation.amount_suggestion}
              </div>
            )}
          </div>
          {fundingRecommendation.alternatives && fundingRecommendation.alternatives.length > 0 && (
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#001639', marginBottom: '0.5rem' }}>Alternatives:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {fundingRecommendation.alternatives.map((alt, idx) => (
                  <span key={idx} style={{
                    padding: '0.375rem 0.75rem',
                    background: '#F1F5F9',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    color: '#475569',
                    textTransform: 'capitalize'
                  }}>
                    {alt.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Growth Strategies */}
      {growthStrategies.length > 0 && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#001639', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lightbulb size={18} /> Growth Strategies
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {growthStrategies.map((strategy, idx) => (
              <div key={idx} style={{
                padding: '1rem',
                background: '#F8FAFC',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                borderLeft: `4px solid ${getPriorityColor(strategy.priority)}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#001639' }}>
                    {strategy.strategy}
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: getPriorityColor(strategy.priority),
                    padding: '0.25rem 0.5rem',
                    background: `${getPriorityColor(strategy.priority)}20`,
                    borderRadius: '4px',
                    textTransform: 'uppercase'
                  }}>
                    {strategy.priority}
                  </span>
                </div>
                <div style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '0.5rem', lineHeight: '1.6' }}>
                  {strategy.description}
                </div>
                {strategy.expected_impact && (
                  <div style={{ fontSize: '0.75rem', color: '#64748B', fontStyle: 'italic' }}>
                    Expected Impact: {strategy.expected_impact}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Competitive Intelligence */}
      {competitiveIntelligence.market_position && (
        <div className="card">
          <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#001639', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Target size={18} /> Competitive Intelligence
          </h4>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#001639', marginBottom: '0.5rem' }}>
              Market Position: <span style={{ textTransform: 'capitalize', fontWeight: '600' }}>{competitiveIntelligence.market_position}</span>
            </div>
            {competitiveIntelligence.competitive_advantages && competitiveIntelligence.competitive_advantages.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#001639', marginBottom: '0.5rem' }}>Competitive Advantages:</div>
                <ul style={{ fontSize: '0.875rem', color: '#475569', paddingLeft: '1.25rem', margin: 0 }}>
                  {competitiveIntelligence.competitive_advantages.map((adv, idx) => (
                    <li key={idx} style={{ marginBottom: '0.25rem' }}>{adv}</li>
                  ))}
                </ul>
              </div>
            )}
            {competitiveIntelligence.threats && competitiveIntelligence.threats.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#001639', marginBottom: '0.5rem' }}>Threats:</div>
                <ul style={{ fontSize: '0.875rem', color: '#475569', paddingLeft: '1.25rem', margin: 0 }}>
                  {competitiveIntelligence.threats.map((threat, idx) => (
                    <li key={idx} style={{ marginBottom: '0.25rem' }}>{threat}</li>
                  ))}
                </ul>
              </div>
            )}
            {competitiveIntelligence.recommendations && (
              <div style={{ padding: '1rem', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#001639', marginBottom: '0.5rem' }}>Recommendations:</div>
                <div style={{ fontSize: '0.875rem', color: '#475569', lineHeight: '1.6' }}>
                  {competitiveIntelligence.recommendations}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AIInsights;
