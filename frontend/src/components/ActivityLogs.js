import React, { useState, useEffect } from 'react';
import { Clock, FileText, Edit, Download, RefreshCw, TrendingUp, Shield, CheckCircle2, XCircle } from 'lucide-react';
import { api } from '../lib/api';

function ActivityLogs({ entityType, entityId, limit = 20 }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadActivities();
  }, [entityType, entityId]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let data;
      if (entityType && entityId) {
        data = await api.auditLogs.getEntity(entityType, entityId, { limit });
      } else {
        data = await api.auditLogs.list({ limit });
      }
      
      setActivities(data.activities || []);
    } catch (err) {
      setError(err.message || 'Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (activityType) => {
    const iconMap = {
      'plan_created': FileText,
      'plan_updated': Edit,
      'plan_generated': RefreshCw,
      'section_updated': Edit,
      'section_regenerated': RefreshCw,
      'export_created': Download,
      'export_downloaded': Download,
      'swot_regenerated': TrendingUp,
      'competitor_regenerated': TrendingUp,
      'compliance_checked': Shield,
      'subscription_upgraded': CheckCircle2
    };
    return iconMap[activityType] || Clock;
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    });
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>
        Loading activity logs...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#EF4444' }}>
        {error}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>
        No activity logs found.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {activities.map((activity, index) => {
        const Icon = getActivityIcon(activity.activity_type);
        
        return (
          <div
            key={activity._id || index}
            style={{
              display: 'flex',
              alignItems: 'start',
              gap: '1rem',
              padding: '1rem',
              background: 'white',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#CBD5E1';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E2E8F0';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: '#EFF6FF',
              color: '#3B82F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Icon size={20} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ 
                fontSize: '0.9375rem', 
                fontWeight: '600', 
                color: '#0F172A',
                marginBottom: '0.25rem'
              }}>
                {activity.activity_name || activity.activity_type}
              </div>
              {activity.details && Object.keys(activity.details).length > 0 && (
                <div style={{ 
                  fontSize: '0.875rem', 
                  color: '#64748B',
                  marginBottom: '0.25rem'
                }}>
                  {Object.entries(activity.details).map(([key, value]) => {
                    if (typeof value === 'object') return null;
                    return `${key}: ${value}`;
                  }).filter(Boolean).join(' • ')}
                </div>
              )}
              <div style={{ 
                fontSize: '0.75rem', 
                color: '#94A3B8',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Clock size={12} />
                {formatTimestamp(activity.timestamp)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ActivityLogs;
