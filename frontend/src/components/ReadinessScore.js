import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, AlertCircle, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { api } from '../lib/api';

function ReadinessScore({ planId }) {
  const [scoreData, setScoreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    if (planId) {
      loadScore();
    }
  }, [planId]);

  const loadScore = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.readinessScore.get(planId);
      setScoreData(data);
    } catch (err) {
      setError(err.message || 'Failed to load readiness score');
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async () => {
    try {
      setCalculating(true);
      setError('');
      const data = await api.readinessScore.get(planId);
      setScoreData(data);
    } catch (err) {
      setError(err.message || 'Failed to calculate score');
    } finally {
      setCalculating(false);
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

  if (!scoreData) {
    return null;
  }

  const overallScore = scoreData.overall_score || 0;
  const breakdown = scoreData.breakdown || {};
  const recommendations = scoreData.recommendations || [];

  const getScoreColor = (score) => {
    if (score >= 80) return '#27AC85';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Work';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#3B82F6';
      default: return '#64748B';
    }
  };

  const categories = [
    { key: 'executive_summary', label: 'Executive Summary', weight: 20 },
    { key: 'market_analysis', label: 'Market Analysis', weight: 15 },
    { key: 'financial_projections', label: 'Financial Projections', weight: 25 },
    { key: 'team_management', label: 'Team/Management', weight: 10 },
    { key: 'competitive_analysis', label: 'Competitive Analysis', weight: 10 },
    { key: 'risk_assessment', label: 'Risk Assessment', weight: 10 },
    { key: 'presentation', label: 'Presentation Quality', weight: 10 }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#001639', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Target size={24} /> Investment Readiness Score
        </h3>
        <button
          onClick={handleRecalculate}
          disabled={calculating}
          className="btn btn-secondary"
          style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          {calculating ? <Loader2 size={16} className="spin-animation" /> : <RefreshCw size={16} />}
          Recalculate
        </button>
      </div>

      {/* Overall Score */}
      <div className="card" style={{ marginBottom: '2rem', textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '4rem', fontWeight: '700', color: getScoreColor(overallScore), marginBottom: '0.5rem' }}>
          {overallScore}
        </div>
        <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#001639', marginBottom: '0.25rem' }}>
          {getScoreLabel(overallScore)}
        </div>
        <div style={{ fontSize: '0.875rem', color: '#64748B' }}>Out of 100</div>
        <div style={{ marginTop: '1.5rem', width: '100%', height: '12px', background: '#F1F5F9', borderRadius: '6px', overflow: 'hidden' }}>
          <div style={{
            width: `${overallScore}%`,
            height: '100%',
            background: getScoreColor(overallScore),
            transition: 'width 0.3s ease'
          }}></div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#001639', marginBottom: '1rem' }}>Score Breakdown</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {categories.map((category) => {
            const score = breakdown[category.key] || 0;
            return (
              <div key={category.key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#475569' }}>
                      {category.label}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>({category.weight}%)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: '600', color: getScoreColor(score) }}>
                      {score}/100
                    </span>
                    {score >= 70 ? (
                      <CheckCircle2 size={16} color="#27AC85" />
                    ) : (
                      <AlertCircle size={16} color="#EF4444" />
                    )}
                  </div>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${score}%`,
                    height: '100%',
                    background: getScoreColor(score),
                    transition: 'width 0.3s ease'
                  }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="card">
          <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#001639', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} /> Recommendations
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                style={{
                  padding: '1rem',
                  background: '#F8FAFC',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  borderLeft: `4px solid ${getPriorityColor(rec.priority)}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#001639', textTransform: 'capitalize' }}>
                    {rec.category.replace('_', ' ')}
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: getPriorityColor(rec.priority),
                    padding: '0.25rem 0.5rem',
                    background: `${getPriorityColor(rec.priority)}20`,
                    borderRadius: '4px',
                    textTransform: 'uppercase'
                  }}>
                    {rec.priority}
                  </span>
                </div>
                <div style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '0.5rem', fontWeight: '500' }}>
                  {rec.issue}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#64748B' }}>
                  {rec.suggestion}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ReadinessScore;
