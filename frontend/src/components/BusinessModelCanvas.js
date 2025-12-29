import React, { useState, useEffect } from 'react';
import { RefreshCw, Users, Activity, Package, Target, Heart, Radio, DollarSign, TrendingUp } from 'lucide-react';
import { api } from '../lib/api';

function BusinessModelCanvas({ planId, onRegenerate, isRegenerating }) {
  const [canvasData, setCanvasData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (planId) {
      loadCanvas();
    }
  }, [planId]);

  const loadCanvas = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.canvas.get(planId);
      setCanvasData(response.canvas_data);
    } catch (err) {
      if (err.message && err.message.includes('not found')) {
        setError('Canvas not generated yet');
      } else {
        setError(err.message || 'Failed to load canvas');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (onRegenerate) {
      await onRegenerate();
      await loadCanvas();
    }
  };

  const blocks = [
    {
      id: 'key_partners',
      title: 'Key Partners',
      icon: Users,
      color: '#3B82F6',
      bgColor: '#EFF6FF',
      position: { gridColumn: '1', gridRow: '1 / 3' }
    },
    {
      id: 'key_activities',
      title: 'Key Activities',
      icon: Activity,
      color: '#3B82F6',
      bgColor: '#EFF6FF',
      position: { gridColumn: '2', gridRow: '1' }
    },
    {
      id: 'key_resources',
      title: 'Key Resources',
      icon: Package,
      color: '#3B82F6',
      bgColor: '#EFF6FF',
      position: { gridColumn: '2', gridRow: '2' }
    },
    {
      id: 'value_propositions',
      title: 'Value Propositions',
      icon: Target,
      color: '#10B981',
      bgColor: '#ECFDF5',
      position: { gridColumn: '3', gridRow: '1 / 3' }
    },
    {
      id: 'customer_relationships',
      title: 'Customer Relationships',
      icon: Heart,
      color: '#8B5CF6',
      bgColor: '#F5F3FF',
      position: { gridColumn: '4', gridRow: '1' }
    },
    {
      id: 'channels',
      title: 'Channels',
      icon: Radio,
      color: '#8B5CF6',
      bgColor: '#F5F3FF',
      position: { gridColumn: '4', gridRow: '2' }
    },
    {
      id: 'customer_segments',
      title: 'Customer Segments',
      icon: Users,
      color: '#8B5CF6',
      bgColor: '#F5F3FF',
      position: { gridColumn: '5', gridRow: '1 / 3' }
    },
    {
      id: 'cost_structure',
      title: 'Cost Structure',
      icon: DollarSign,
      color: '#F59E0B',
      bgColor: '#FFFBEB',
      position: { gridColumn: '1 / 3', gridRow: '3' }
    },
    {
      id: 'revenue_streams',
      title: 'Revenue Streams',
      icon: TrendingUp,
      color: '#10B981',
      bgColor: '#ECFDF5',
      position: { gridColumn: '3 / 6', gridRow: '3' }
    }
  ];

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>
        Loading Business Model Canvas...
      </div>
    );
  }

  if (error && !canvasData) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#64748B', marginBottom: '1rem' }}>{error}</p>
        {onRegenerate && (
          <button
            className="btn btn-primary"
            onClick={handleGenerate}
            disabled={isRegenerating}
          >
            <RefreshCw size={18} style={{ animation: isRegenerating ? 'spin 1s linear infinite' : 'none' }} />
            {isRegenerating ? 'Generating...' : 'Generate Canvas'}
          </button>
        )}
      </div>
    );
  }

  if (!canvasData) {
    return null;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0F172A', marginBottom: '0.25rem' }}>
            Business Model Canvas
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.875rem' }}>
            Visual representation of your business model
          </p>
        </div>
        {onRegenerate && (
          <button
            className="btn btn-secondary"
            onClick={handleGenerate}
            disabled={isRegenerating}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              whiteSpace: 'nowrap'
            }}
          >
            <RefreshCw size={18} style={{ animation: isRegenerating ? 'spin 1s linear infinite' : 'none' }} />
            {isRegenerating ? 'Regenerating...' : 'Regenerate Canvas'}
          </button>
        )}
      </div>

      {/* Canvas Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gridTemplateRows: 'repeat(3, auto)',
        gap: '1rem',
        background: '#F8FAFC',
        padding: '1.5rem',
        borderRadius: '12px',
        border: '2px solid #E2E8F0'
      }}>
        {blocks.map((block) => {
          const Icon = block.icon;
          const items = canvasData[block.id] || [];
          
          return (
            <div
              key={block.id}
              style={{
                background: block.bgColor,
                border: `2px solid ${block.color}`,
                borderRadius: '8px',
                padding: '1rem',
                ...block.position,
                display: 'flex',
                flexDirection: 'column',
                minHeight: '120px'
              }}
            >
              {/* Block Header */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                marginBottom: '0.75rem'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  background: block.color,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Icon size={18} />
                </div>
                <h3 style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: '700', 
                  color: '#0F172A',
                  margin: 0
                }}>
                  {block.title}
                </h3>
              </div>

              {/* Block Items */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '0.5rem',
                flex: 1
              }}>
                {items.length > 0 ? (
                  items.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        background: 'white',
                        borderRadius: '4px',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.8125rem',
                        color: '#374151',
                        lineHeight: '1.4',
                        border: `1px solid ${block.color}40`
                      }}
                    >
                      {item}
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#94A3B8', fontStyle: 'italic', fontSize: '0.75rem' }}>
                    No items
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
        <strong>Note:</strong> The Business Model Canvas is automatically generated based on your business information, 
        market data, and financial projections. Review and refine each building block to ensure it accurately 
        reflects your business model.
      </div>
    </div>
  );
}

export default BusinessModelCanvas;
