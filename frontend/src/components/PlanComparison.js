import React, { useState, useEffect } from 'react';
import { GitCompare, TrendingUp, Award, DollarSign, BarChart3, X } from 'lucide-react';
import { api } from '../lib/api';

function PlanComparison({ planIds, onClose }) {
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (planIds && planIds.length >= 2) {
      loadComparison();
    }
  }, [planIds]);

  const loadComparison = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.comparison.compare(planIds);
      setComparison(data);
    } catch (err) {
      setError(err.message || 'Failed to load comparison');
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

  if (!comparison) {
    return null;
  }

  const plans = comparison.plans || [];
  const differences = comparison.differences || {};
  const summary = comparison.summary || {};

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }} onClick={onClose}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '1200px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#001639', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <GitCompare size={24} /> Plan Comparison
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={24} color="#64748B" />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {/* Summary */}
          {summary && (
            <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#001639', marginBottom: '1rem' }}>Comparison Summary</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {summary.best_completion && (
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '0.25rem' }}>Best Completion</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#001639' }}>{summary.best_completion.plan_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#27AC85' }}>{summary.best_completion.score}%</div>
                  </div>
                )}
                {summary.best_quality && (
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '0.25rem' }}>Best Quality</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#001639' }}>{summary.best_quality.plan_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#27AC85' }}>{summary.best_quality.score}/100</div>
                  </div>
                )}
                {summary.best_readiness && (
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '0.25rem' }}>Best Readiness</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#001639' }}>{summary.best_readiness.plan_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#27AC85' }}>{summary.best_readiness.score}/100</div>
                  </div>
                )}
                {summary.best_revenue && (
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '0.25rem' }}>Highest Revenue</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#001639' }}>{summary.best_revenue.plan_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#27AC85' }}>${(summary.best_revenue.revenue / 1000).toFixed(1)}K</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Comparison Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#001639' }}>Metric</th>
                  {plans.map((plan, idx) => (
                    <th key={plan.plan_id} style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600', color: '#001639', minWidth: '200px' }}>
                      {plan.plan_name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Completion Score */}
                <tr>
                  <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#475569', fontWeight: '500' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <BarChart3 size={16} color="#64748B" />
                      Completion Score
                    </div>
                  </td>
                  {plans.map((plan) => (
                    <td key={plan.plan_id} style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '1rem', fontWeight: '600', color: '#001639' }}>
                        {plan.analytics.completion_score}%
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Quality Score */}
                <tr style={{ background: '#F8FAFC' }}>
                  <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#475569', fontWeight: '500' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Award size={16} color="#64748B" />
                      Quality Score
                    </div>
                  </td>
                  {plans.map((plan) => (
                    <td key={plan.plan_id} style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '1rem', fontWeight: '600', color: '#001639' }}>
                        {plan.analytics.quality_score}/100
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Readiness Score */}
                <tr>
                  <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#475569', fontWeight: '500' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <TrendingUp size={16} color="#64748B" />
                      Investment Readiness
                    </div>
                  </td>
                  {plans.map((plan) => (
                    <td key={plan.plan_id} style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '1rem', fontWeight: '600', color: '#001639' }}>
                        {plan.readiness_score}/100
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Year 1 Revenue */}
                <tr style={{ background: '#F8FAFC' }}>
                  <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#475569', fontWeight: '500' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <DollarSign size={16} color="#64748B" />
                      Year 1 Revenue
                    </div>
                  </td>
                  {plans.map((plan) => (
                    <td key={plan.plan_id} style={{ padding: '0.75rem', textAlign: 'center' }}>
                      {plan.financials.has_financials ? (
                        <div style={{ fontSize: '1rem', fontWeight: '600', color: '#27AC85' }}>
                          ${(plan.financials.year1_revenue / 1000).toFixed(1)}K
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.875rem', color: '#94A3B8' }}>N/A</div>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Year 1 Profit */}
                <tr>
                  <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#475569', fontWeight: '500' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <TrendingUp size={16} color="#64748B" />
                      Year 1 Profit
                    </div>
                  </td>
                  {plans.map((plan) => (
                    <td key={plan.plan_id} style={{ padding: '0.75rem', textAlign: 'center' }}>
                      {plan.financials.has_financials ? (
                        <div style={{ fontSize: '1rem', fontWeight: '600', color: plan.financials.year1_profit >= 0 ? '#27AC85' : '#EF4444' }}>
                          ${(plan.financials.year1_profit / 1000).toFixed(1)}K
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.875rem', color: '#94A3B8' }}>N/A</div>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Completion Rate */}
                <tr style={{ background: '#F8FAFC' }}>
                  <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#475569', fontWeight: '500' }}>
                    Sections Completed
                  </td>
                  {plans.map((plan) => (
                    <td key={plan.plan_id} style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.875rem', color: '#001639' }}>
                        {plan.completion.completed_sections} / {plan.completion.total_sections}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                        {plan.completion.completion_rate.toFixed(1)}%
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Industry */}
                <tr>
                  <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#475569', fontWeight: '500' }}>
                    Industry
                  </td>
                  {plans.map((plan) => (
                    <td key={plan.plan_id} style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.875rem', color: '#001639' }}>
                        {plan.industry}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Status */}
                <tr style={{ background: '#F8FAFC' }}>
                  <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#475569', fontWeight: '500' }}>
                    Status
                  </td>
                  {plans.map((plan) => (
                    <td key={plan.plan_id} style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        background: plan.status === 'complete' ? '#E6F7F0' : plan.status === 'generating' ? '#EBF5FF' : '#F1F5F9',
                        color: plan.status === 'complete' ? '#1F8A6A' : plan.status === 'generating' ? '#3B82F6' : '#64748B'
                      }}>
                        {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                      </span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Differences */}
          {Object.keys(differences).length > 0 && (
            <div className="card" style={{ marginTop: '2rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#001639', marginBottom: '1rem' }}>Key Differences</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {differences.completion && (
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#001639', marginBottom: '0.25rem' }}>
                      Completion Score Range
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                      {differences.completion.min}% - {differences.completion.max}% (Range: {differences.completion.range.toFixed(1)}%)
                    </div>
                  </div>
                )}
                {differences.quality && (
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#001639', marginBottom: '0.25rem' }}>
                      Quality Score Range
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                      {differences.quality.min} - {differences.quality.max} (Range: {differences.quality.range.toFixed(1)})
                    </div>
                  </div>
                )}
                {differences.revenue && (
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#001639', marginBottom: '0.25rem' }}>
                      Revenue Range
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                      ${(differences.revenue.min / 1000).toFixed(1)}K - ${(differences.revenue.max / 1000).toFixed(1)}K
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlanComparison;
