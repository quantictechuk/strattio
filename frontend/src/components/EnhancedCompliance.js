import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, TrendingUp, Shield, FileText, DollarSign, Users, Target, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

function EnhancedCompliance({ complianceData, onRegenerate, isRegenerating }) {
  const [expandedChecks, setExpandedChecks] = useState({});
  const [filter, setFilter] = useState('all'); // 'all', 'pass', 'fail', 'warning'

  if (!complianceData || !complianceData.data) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center', 
        color: '#64748B',
        background: 'white',
        borderRadius: '8px',
        border: '1px solid #E2E8F0'
      }}>
        <p>Compliance data not available. Please generate plan first.</p>
      </div>
    );
  }

  const data = complianceData.data;
  const checks = data.checks || [];
  const overallStatus = data.overall_status || 'unknown';
  const score = data.score || 0;
  const templateId = data.template_id || 'GENERIC';

  // Filter checks
  const filteredChecks = checks.filter(check => {
    if (filter === 'all') return true;
    if (filter === 'pass') return check.status === 'pass';
    if (filter === 'fail') return check.status === 'fail';
    if (filter === 'warning') return check.status === 'warning';
    return true;
  });

  // Get status color and icon
  const getStatusConfig = (status) => {
    switch (status) {
      case 'compliant':
        return { color: '#10B981', bgColor: '#ECFDF5', icon: CheckCircle2, label: 'Compliant' };
      case 'needs_attention':
        return { color: '#F59E0B', bgColor: '#FFFBEB', icon: AlertCircle, label: 'Needs Attention' };
      case 'non_compliant':
        return { color: '#EF4444', bgColor: '#FEF2F2', icon: XCircle, label: 'Non-Compliant' };
      default:
        return { color: '#6B7280', bgColor: '#F3F4F6', icon: AlertCircle, label: 'Unknown' };
    }
  };

  const statusConfig = getStatusConfig(overallStatus);
  const StatusIcon = statusConfig.icon;

  // Get check icon based on check type
  const getCheckIcon = (check) => {
    const checkId = check.id || '';
    const checkName = check.name || '';
    
    if (checkId.includes('financial') || checkId.includes('repayment') || checkId.includes('cashflow') || checkId.includes('breakeven')) {
      return DollarSign;
    }
    if (checkId.includes('team') || checkId.includes('capability')) {
      return Users;
    }
    if (checkId.includes('market') || checkId.includes('tam') || checkId.includes('sam')) {
      return TrendingUp;
    }
    if (checkId.includes('innovation') || checkId.includes('viability')) {
      return Target;
    }
    return FileText;
  };

  const toggleCheck = (index) => {
    setExpandedChecks(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Calculate progress percentage
  const progressPercentage = score;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0F172A', marginBottom: '0.25rem' }}>
            Compliance Dashboard
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.875rem' }}>
            Template: <strong>{templateId.replace(/_/g, ' ')}</strong>
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
            {isRegenerating ? 'Rechecking...' : 'Recheck Compliance'}
          </button>
        )}
      </div>

      {/* Overall Status Card */}
      <div style={{
        background: `linear-gradient(135deg, ${statusConfig.bgColor} 0%, ${statusConfig.bgColor}dd 100%)`,
        border: `2px solid ${statusConfig.color}`,
        borderRadius: '16px',
        padding: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '2rem'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '16px',
          background: statusConfig.color,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <StatusIcon size={40} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Overall Status
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: statusConfig.color, marginBottom: '0.5rem' }}>
            {statusConfig.label}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#64748B' }}>
            {data.passed_count || 0} of {checks.length} checks passed
          </div>
        </div>
        <div style={{ textAlign: 'right', minWidth: '120px' }}>
          <div style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '0.5rem' }}>Compliance Score</div>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: statusConfig.color }}>
            {score}%
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Compliance Progress</span>
          <span style={{ fontSize: '0.875rem', color: '#64748B' }}>{progressPercentage}% Complete</span>
        </div>
        <div style={{
          width: '100%',
          height: '12px',
          background: '#E5E7EB',
          borderRadius: '6px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progressPercentage}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${statusConfig.color} 0%, ${statusConfig.color}dd 100%)`,
            borderRadius: '6px',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid #E5E7EB' }}>
        {[
          { key: 'all', label: 'All Checks', count: checks.length },
          { key: 'pass', label: 'Passed', count: checks.filter(c => c.status === 'pass').length },
          { key: 'fail', label: 'Failed', count: checks.filter(c => c.status === 'fail').length },
          { key: 'warning', label: 'Warnings', count: checks.filter(c => c.status === 'warning').length }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              background: 'none',
              borderBottom: filter === tab.key ? `3px solid ${statusConfig.color}` : '3px solid transparent',
              color: filter === tab.key ? statusConfig.color : '#6B7280',
              fontWeight: filter === tab.key ? '600' : '500',
              cursor: 'pointer',
              marginBottom: '-2px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem'
            }}
          >
            {tab.label}
            <span style={{
              padding: '0.125rem 0.5rem',
              borderRadius: '12px',
              background: filter === tab.key ? `${statusConfig.color}20` : '#F3F4F6',
              color: filter === tab.key ? statusConfig.color : '#6B7280',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Compliance Checks List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredChecks.length === 0 ? (
          <div style={{
            padding: '3rem',
            textAlign: 'center',
            color: '#9CA3AF',
            background: '#F9FAFB',
            borderRadius: '12px',
            border: '1px dashed #D1D5DB'
          }}>
            No checks match the selected filter.
          </div>
        ) : (
          filteredChecks.map((check, index) => {
            const isPass = check.status === 'pass';
            const isExpanded = expandedChecks[index];
            const CheckIcon = getCheckIcon(check);

            return (
              <div
                key={index}
                style={{
                  background: 'white',
                  border: `2px solid ${isPass ? '#D1FAE5' : '#FEE2E2'}`,
                  borderRadius: '12px',
                  overflow: 'hidden',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Check Header */}
                <div
                  style={{
                    padding: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    cursor: 'pointer',
                    background: isPass ? '#ECFDF5' : '#FEF2F2'
                  }}
                  onClick={() => toggleCheck(index)}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '10px',
                    background: isPass ? '#10B981' : '#EF4444',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {isPass ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                      <CheckIcon size={18} style={{ color: '#64748B' }} />
                      <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#0F172A', margin: 0 }}>
                        {check.name}
                      </h4>
                    </div>
                    {check.message && (
                      <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0 }}>
                        {check.message}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{
                      padding: '0.375rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      background: isPass ? '#10B981' : '#EF4444',
                      color: 'white'
                    }}>
                      {check.status}
                    </span>
                    {isExpanded ? <ChevronUp size={20} color="#64748B" /> : <ChevronDown size={20} color="#64748B" />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div style={{
                    padding: '1.25rem',
                    borderTop: '1px solid #E5E7EB',
                    background: '#F9FAFB'
                  }}>
                    {check.details && (
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                          Details
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#64748B', lineHeight: '1.6' }}>
                          {check.details}
                        </div>
                      </div>
                    )}
                    {check.suggestion && (
                      <div style={{
                        padding: '1rem',
                        background: '#FEF3C7',
                        border: '1px solid #FCD34D',
                        borderRadius: '8px',
                        marginTop: '1rem'
                      }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#92400E', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <AlertCircle size={16} />
                          Recommendation
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#78350F', lineHeight: '1.6' }}>
                          {check.suggestion}
                        </div>
                      </div>
                    )}
                    {check.required !== undefined && (
                      <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#64748B' }}>
                        <strong>Required:</strong> {check.required ? 'Yes' : 'No'}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Summary Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1rem',
        marginTop: '1rem'
      }}>
        <div style={{
          background: '#ECFDF5',
          border: '1px solid #A7F3D0',
          borderRadius: '12px',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10B981', marginBottom: '0.5rem' }}>
            {data.passed_count || 0}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#065F46', fontWeight: '600' }}>
            Passed Checks
          </div>
        </div>
        <div style={{
          background: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: '12px',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#EF4444', marginBottom: '0.5rem' }}>
            {data.failed_count || 0}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#991B1B', fontWeight: '600' }}>
            Failed Checks
          </div>
        </div>
        <div style={{
          background: '#EFF6FF',
          border: '1px solid #BFDBFE',
          borderRadius: '12px',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3B82F6', marginBottom: '0.5rem' }}>
            {checks.length}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#1E40AF', fontWeight: '600' }}>
            Total Checks
          </div>
        </div>
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
        <strong>Note:</strong> This compliance check is based on the {templateId.replace(/_/g, ' ')} template requirements. 
        Review failed checks and follow the recommendations to improve your plan's compliance score.
      </div>
    </div>
  );
}

export default EnhancedCompliance;
