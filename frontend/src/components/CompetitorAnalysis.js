import React, { useState } from 'react';
import { RefreshCw, TrendingUp, Shield, Target, AlertTriangle } from 'lucide-react';

function CompetitorAnalysis({ competitorData, onRegenerate, isRegenerating }) {
  if (!competitorData || !competitorData.competitors) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center', 
        color: '#64748B',
        background: 'white',
        borderRadius: '8px',
        border: '1px solid #E2E8F0'
      }}>
        <p>Competitor analysis not available. Please regenerate the plan.</p>
      </div>
    );
  }

  const competitors = competitorData.competitors || [];
  const advantages = competitorData.competitive_advantages || [];
  const threats = competitorData.competitive_threats || [];
  const positioning = competitorData.market_positioning || "";

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0F172A', marginBottom: '0.25rem' }}>
            Competitor Analysis
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.875rem' }}>
            Analysis of your competitive landscape and market positioning
          </p>
        </div>
        {onRegenerate && (
          <button
            className="btn btn-secondary"
            onClick={onRegenerate}
            disabled={isRegenerating}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              whiteSpace: 'nowrap'
            }}
          >
            <RefreshCw size={18} style={{ animation: isRegenerating ? 'spin 1s linear infinite' : 'none' }} />
            {isRegenerating ? 'Regenerating...' : 'Regenerate Analysis'}
          </button>
        )}
      </div>

      {/* Competitors List */}
      <div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0F172A', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Target size={20} style={{ color: '#001639' }} />
          Main Competitors
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {competitors.map((competitor, index) => (
            <div
              key={index}
              style={{
                background: 'white',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '1.5rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.borderColor = '#CBD5E1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#E2E8F0';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div>
                  <h4 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#0F172A', marginBottom: '0.5rem' }}>
                    {competitor.name}
                  </h4>
                  <span style={{
                    display: 'inline-block',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    background: '#EFF6FF',
                    color: '#3B82F6'
                  }}>
                    {competitor.market_position || 'Competitor'}
                  </span>
                </div>
                {competitor.market_share && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.875rem', color: '#64748B' }}>Market Share</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0F172A' }}>
                      {competitor.market_share}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                {competitor.strengths && competitor.strengths.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#10B981', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <TrendingUp size={14} />
                      Strengths
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem', color: '#374151' }}>
                      {competitor.strengths.map((strength, i) => (
                        <li key={i} style={{ marginBottom: '0.25rem' }}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {competitor.weaknesses && competitor.weaknesses.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#F59E0B', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <AlertTriangle size={14} />
                      Weaknesses
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem', color: '#374151' }}>
                      {competitor.weaknesses.map((weakness, i) => (
                        <li key={i} style={{ marginBottom: '0.25rem' }}>{weakness}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {competitor.pricing_strategy && (
                <div style={{
                  padding: '0.75rem',
                  background: '#F8FAFC',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  color: '#374151'
                }}>
                  <strong>Pricing Strategy:</strong> {competitor.pricing_strategy}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Competitive Advantages */}
      {advantages.length > 0 && (
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0F172A', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={20} style={{ color: '#001639' }} />
            Our Competitive Advantages
          </h3>
          <div style={{
            background: '#ECFDF5',
            border: '1px solid #A7F3D0',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9375rem', color: '#374151' }}>
              {advantages.map((advantage, i) => (
                <li key={i} style={{ marginBottom: '0.75rem', lineHeight: '1.6' }}>
                  <strong style={{ color: '#10B981' }}>{i + 1}.</strong> {advantage}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Market Positioning */}
      {positioning && (
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0F172A', marginBottom: '1rem' }}>
            Market Positioning
          </h3>
          <div style={{
            background: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: '12px',
            padding: '1.5rem',
            fontSize: '0.9375rem',
            color: '#374151',
            lineHeight: '1.6'
          }}>
            {positioning}
          </div>
        </div>
      )}

      {/* Competitive Threats */}
      {threats.length > 0 && (
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0F172A', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={20} style={{ color: '#EF4444' }} />
            Competitive Threats
          </h3>
          <div style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9375rem', color: '#374151' }}>
              {threats.map((threat, i) => (
                <li key={i} style={{ marginBottom: '0.75rem', lineHeight: '1.6' }}>
                  <strong style={{ color: '#EF4444' }}>{i + 1}.</strong> {threat}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Info Note */}
      <div style={{
        background: '#F0F9FF',
        border: '1px solid #BAE6FD',
        borderRadius: '8px',
        padding: '1rem',
        fontSize: '0.875rem',
        color: '#0C4A6E'
      }}>
        <strong>Note:</strong> This competitor analysis is automatically generated based on your business information 
        and market data. Review and refine the analysis to ensure it accurately reflects your competitive landscape.
      </div>
    </div>
  );
}

export default CompetitorAnalysis;
