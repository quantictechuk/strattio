import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Clock, Target, Award, TrendingDown } from 'lucide-react';
import { api } from '../lib/api';

function PlanAnalytics({ planId }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (planId) {
      loadAnalytics();
    }
  }, [planId]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.analytics.getPlanAnalytics(planId);
      setAnalytics(data);
    } catch (err) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
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

  if (!analytics) {
    return null;
  }

  const getScoreColor = (score) => {
    if (score >= 80) return '#27AC85';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const getComparisonIcon = (comparison) => {
    if (comparison === 'higher' || comparison === 'faster') {
      return <TrendingUp size={16} color="#27AC85" />;
    }
    if (comparison === 'lower' || comparison === 'slower') {
      return <TrendingDown size={16} color="#EF4444" />;
    }
    return null;
  };

  return (
    <div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#001639', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <BarChart3 size={24} /> Plan Analytics
      </h3>

      {/* Main Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {/* Completion Score */}
        <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: getScoreColor(analytics.completion_score), marginBottom: '0.5rem' }}>
            {analytics.completion_score}%
          </div>
          <div style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '0.5rem' }}>Completion</div>
          <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
            {analytics.sections_completed} of {analytics.total_sections} sections
          </div>
          <div style={{ marginTop: '0.75rem', width: '100%', height: '8px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
              width: `${analytics.completion_score}%`,
              height: '100%',
              background: getScoreColor(analytics.completion_score),
              transition: 'width 0.3s ease'
            }}></div>
          </div>
        </div>

        {/* Quality Score */}
        <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: getScoreColor(analytics.quality_score), marginBottom: '0.5rem' }}>
            {analytics.quality_score}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '0.5rem' }}>Quality Score</div>
          <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Out of 100</div>
          <div style={{ marginTop: '0.75rem', width: '100%', height: '8px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
              width: `${analytics.quality_score}%`,
              height: '100%',
              background: getScoreColor(analytics.quality_score),
              transition: 'width 0.3s ease'
            }}></div>
          </div>
        </div>

        {/* Time to Complete */}
        {analytics.time_to_complete_hours && (
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <Clock size={32} color="#3B82F6" style={{ marginBottom: '0.5rem' }} />
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#001639', marginBottom: '0.25rem' }}>
              {Math.round(analytics.time_to_complete_hours)}h
            </div>
            <div style={{ fontSize: '0.875rem', color: '#64748B' }}>Time to Complete</div>
          </div>
        )}
      </div>

      {/* Quality Breakdown */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#001639', marginBottom: '1rem' }}>Quality Breakdown</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {Object.entries(analytics.quality_breakdown || {}).map(([factor, score]) => (
            <div key={factor}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.875rem', color: '#475569', textTransform: 'capitalize' }}>
                  {factor.replace('_', ' ')}
                </span>
                <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#001639' }}>{score}/25</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{
                  width: `${(score / 25) * 100}%`,
                  height: '100%',
                  background: '#3B82F6',
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Industry Comparison */}
      {analytics.vs_industry && (
        <div className="card">
          <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#001639', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Target size={18} /> Industry Comparison
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Object.entries(analytics.vs_industry).map(([metric, data]) => (
              <div key={metric} style={{
                padding: '1rem',
                background: '#F8FAFC',
                borderRadius: '8px',
                border: '1px solid #E2E8F0'
              }}>
                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#001639', marginBottom: '0.5rem', textTransform: 'capitalize' }}>
                  {metric.replace('_', ' ')}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Your Plan</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#001639' }}>
                      {data.user !== null && data.user !== undefined ? (typeof data.user === 'number' ? data.user.toFixed(1) : data.user) : 'N/A'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Industry Avg</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#64748B' }}>
                      {data.industry_avg !== null && data.industry_avg !== undefined ? (typeof data.industry_avg === 'number' ? data.industry_avg.toFixed(1) : data.industry_avg) : 'N/A'}
                    </div>
                  </div>
                </div>
                {data.comparison && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: data.comparison === 'higher' || data.comparison === 'faster' ? '#27AC85' : '#EF4444' }}>
                    {getComparisonIcon(data.comparison)}
                    <span style={{ textTransform: 'capitalize' }}>{data.comparison} than average</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PlanAnalytics;
