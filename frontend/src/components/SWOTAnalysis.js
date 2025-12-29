import React, { useState } from 'react';
import { RefreshCw, CheckCircle2, AlertCircle, TrendingUp, AlertTriangle } from 'lucide-react';

function SWOTAnalysis({ swotData, onRegenerate, isRegenerating }) {
  const [expandedCategory, setExpandedCategory] = useState(null);

  if (!swotData || !swotData.strengths) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center', 
        color: '#64748B',
        background: 'white',
        borderRadius: '8px',
        border: '1px solid #E2E8F0'
      }}>
        <p>SWOT analysis not available. Please regenerate the plan.</p>
      </div>
    );
  }

  const categories = [
    {
      key: 'strengths',
      title: 'Strengths',
      icon: CheckCircle2,
      color: '#10B981',
      bgColor: '#ECFDF5',
      borderColor: '#A7F3D0'
    },
    {
      key: 'weaknesses',
      title: 'Weaknesses',
      icon: AlertCircle,
      color: '#F59E0B',
      bgColor: '#FFFBEB',
      borderColor: '#FDE68A'
    },
    {
      key: 'opportunities',
      title: 'Opportunities',
      icon: TrendingUp,
      color: '#3B82F6',
      bgColor: '#EFF6FF',
      borderColor: '#BFDBFE'
    },
    {
      key: 'threats',
      title: 'Threats',
      icon: AlertTriangle,
      color: '#EF4444',
      bgColor: '#FEF2F2',
      borderColor: '#FECACA'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0F172A', marginBottom: '0.25rem' }}>
            SWOT Analysis
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.875rem' }}>
            Comprehensive analysis of your business's internal and external factors
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
            {isRegenerating ? 'Regenerating...' : 'Regenerate SWOT'}
          </button>
        )}
      </div>

      {/* SWOT Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '1.5rem'
      }}>
        {categories.map((category) => {
          const Icon = category.icon;
          const items = swotData[category.key] || [];
          
          return (
            <div
              key={category.key}
              style={{
                background: category.bgColor,
                border: `2px solid ${category.borderColor}`,
                borderRadius: '12px',
                padding: '1.5rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Category Header */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: category.color,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon size={20} />
                </div>
                <h3 style={{ 
                  fontSize: '1.125rem', 
                  fontWeight: '700', 
                  color: '#0F172A',
                  margin: 0
                }}>
                  {category.title}
                </h3>
              </div>

              {/* Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {items.length > 0 ? (
                  items.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        background: 'white',
                        borderRadius: '6px',
                        padding: '0.875rem',
                        border: `1px solid ${category.borderColor}`,
                        fontSize: '0.9375rem',
                        color: '#374151',
                        lineHeight: '1.5'
                      }}
                    >
                      <span style={{ fontWeight: '600', color: category.color, marginRight: '0.5rem' }}>
                        {index + 1}.
                      </span>
                      {item}
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#94A3B8', fontStyle: 'italic' }}>
                    No {category.title.toLowerCase()} identified
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Note */}
      <div style={{
        background: '#F0F9FF',
        border: '1px solid #BAE6FD',
        borderRadius: '8px',
        padding: '1rem',
        fontSize: '0.875rem',
        color: '#0C4A6E'
      }}>
        <strong>Note:</strong> This SWOT analysis is automatically generated based on your business information, 
        market data, and financial projections. Review and refine the analysis to ensure it accurately 
        reflects your business situation.
      </div>
    </div>
  );
}

export default SWOTAnalysis;
