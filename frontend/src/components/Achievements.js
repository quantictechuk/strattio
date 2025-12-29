import React, { useState, useEffect } from 'react';
import { Award, Trophy, Star, Zap, Users, FileText, Target, Briefcase, CheckCircle2, Sparkles } from 'lucide-react';
import { api } from '../lib/api';

function Achievements({ userId }) {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const [newAchievements, setNewAchievements] = useState([]);

  useEffect(() => {
    loadAchievements();
  }, [userId]);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.achievements.get();
      setAchievements(data.achievements || []);
    } catch (err) {
      setError(err.message || 'Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  const handleCheck = async () => {
    try {
      setChecking(true);
      setError('');
      const result = await api.achievements.check();
      if (result.total_new > 0) {
        setNewAchievements(result.new_achievements || []);
        await loadAchievements();
        setTimeout(() => setNewAchievements([]), 5000);
      }
    } catch (err) {
      setError(err.message || 'Failed to check achievements');
    } finally {
      setChecking(false);
    }
  };

  if (loading) {
    return (
      <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
        <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
      </div>
    );
  }

  const totalBadges = achievements.length;
  const allBadges = [
    { 
      id: 'first_plan', 
      name: 'First Steps', 
      icon: Target, 
      color: '#3B82F6',
      gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
      description: 'Created your first business plan',
      category: 'Getting Started'
    },
    { 
      id: 'financial_master', 
      name: 'Financial Master', 
      icon: Briefcase, 
      color: '#27AC85',
      gradient: 'linear-gradient(135deg, #27AC85 0%, #1F8A6A 100%)',
      description: 'Completed financial projections',
      category: 'Financials'
    },
    { 
      id: 'plan_perfectionist', 
      name: 'Plan Perfectionist', 
      icon: Star, 
      color: '#F59E0B',
      gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      description: 'Achieved 100% completion',
      category: 'Quality'
    },
    { 
      id: 'speed_runner', 
      name: 'Speed Runner', 
      icon: Zap, 
      color: '#8B5CF6',
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
      description: 'Completed a plan in <24 hours',
      category: 'Efficiency'
    },
    { 
      id: 'collaborator', 
      name: 'Team Player', 
      icon: Users, 
      color: '#EC4899',
      gradient: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
      description: 'Invited a collaborator',
      category: 'Collaboration'
    },
    { 
      id: 'export_expert', 
      name: 'Export Expert', 
      icon: FileText, 
      color: '#10B981',
      gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      description: 'Exported 5+ plans',
      category: 'Productivity'
    },
    { 
      id: 'quality_champion', 
      name: 'Quality Champion', 
      icon: Trophy, 
      color: '#F97316',
      gradient: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
      description: 'Achieved quality score 80+',
      category: 'Quality'
    },
    { 
      id: 'readiness_expert', 
      name: 'Investment Ready', 
      icon: Award, 
      color: '#6366F1',
      gradient: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
      description: 'Achieved readiness score 80+',
      category: 'Investment'
    }
  ];

  const earnedBadgeIds = new Set(achievements.map(a => a.badge_id));
  const completionPercentage = Math.round((totalBadges / allBadges.length) * 100);

  return (
    <div style={{ marginTop: '2rem' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem',
        paddingBottom: '1.5rem',
        borderBottom: '2px solid #E2E8F0'
      }}>
        <div>
          <h3 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '700', 
            color: '#001639', 
            margin: 0, 
            marginBottom: '0.5rem',
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem' 
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #001639 0%, #003366 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Trophy size={20} color="white" />
            </div>
            Achievements
          </h3>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748B' }}>
            Track your progress and unlock badges as you build your business plans
          </p>
        </div>
        <button
          onClick={handleCheck}
          disabled={checking}
          className="btn btn-secondary"
          style={{ 
            fontSize: '0.875rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            borderRadius: '8px',
            border: '1px solid #E2E8F0',
            background: 'white',
            color: '#001639',
            fontWeight: '600',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#F8FAFC';
            e.currentTarget.style.borderColor = '#001639';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'white';
            e.currentTarget.style.borderColor = '#E2E8F0';
          }}
        >
          {checking ? 'Checking...' : <><Sparkles size={16} /> Check for New</>}
        </button>
      </div>

      {/* New Achievements Notification */}
      {newAchievements.length > 0 && (
        <div style={{
          padding: '1.25rem',
          background: 'linear-gradient(135deg, #F0FDF4 0%, #D1FAE5 100%)',
          border: '2px solid #27AC85',
          borderRadius: '12px',
          marginBottom: '2rem',
          animation: 'slideIn 0.3s ease-out',
          boxShadow: '0 4px 12px rgba(39, 172, 133, 0.2)'
        }}>
          <div style={{ 
            fontSize: '1rem', 
            fontWeight: '600', 
            color: '#1F8A6A', 
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Sparkles size={20} />
            New Achievement Unlocked!
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {newAchievements.map((achievement, idx) => {
              const badge = allBadges.find(b => b.id === achievement.badge_id);
              return (
                <div key={idx} style={{ 
                  fontSize: '0.875rem', 
                  color: '#065F46',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  {badge && <badge.icon size={18} color={badge.color} />}
                  {achievement.badge_name}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Progress Summary */}
      <div className="card" style={{ 
        marginBottom: '2rem', 
        padding: '2rem',
        background: 'linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 100%)',
        border: '1px solid #E2E8F0',
        borderRadius: '16px'
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '2rem',
          alignItems: 'center'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '3.5rem', 
              fontWeight: '700', 
              background: 'linear-gradient(135deg, #001639 0%, #003366 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '0.5rem'
            }}>
              {totalBadges}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#64748B', fontWeight: '600' }}>
              Badges Earned
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '0.75rem'
            }}>
              <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#001639' }}>
                Progress
              </span>
              <span style={{ fontSize: '0.875rem', fontWeight: '700', color: '#001639' }}>
                {completionPercentage}%
              </span>
            </div>
            <div style={{ 
              width: '100%', 
              height: '12px', 
              background: '#F1F5F9', 
              borderRadius: '8px', 
              overflow: 'hidden',
              position: 'relative'
            }}>
              <div style={{
                width: `${completionPercentage}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #001639 0%, #003366 100%)',
                transition: 'width 0.5s ease',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 22, 57, 0.2)'
              }}></div>
            </div>
            <div style={{ 
              fontSize: '0.75rem', 
              color: '#94A3B8', 
              marginTop: '0.5rem',
              textAlign: 'right'
            }}>
              {totalBadges} of {allBadges.length} unlocked
            </div>
          </div>
        </div>
      </div>

      {/* Achievement Gallery */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', 
        gap: '1.5rem' 
      }}>
        {allBadges.map((badge) => {
          const earned = earnedBadgeIds.has(badge.id);
          const achievement = achievements.find(a => a.badge_id === badge.id);
          const IconComponent = badge.icon;
          
          return (
            <div
              key={badge.id}
              style={{
                padding: '1.75rem',
                background: earned 
                  ? 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)' 
                  : '#F8FAFC',
                border: earned 
                  ? `2px solid ${badge.color}` 
                  : '2px solid #E2E8F0',
                borderRadius: '16px',
                textAlign: 'center',
                opacity: earned ? 1 : 0.7,
                transition: 'all 0.3s ease',
                position: 'relative',
                cursor: earned ? 'default' : 'not-allowed',
                boxShadow: earned 
                  ? `0 4px 12px rgba(${parseInt(badge.color.slice(1, 3), 16)}, ${parseInt(badge.color.slice(3, 5), 16)}, ${parseInt(badge.color.slice(5, 7), 16)}, 0.15)` 
                  : 'none'
              }}
              onMouseEnter={(e) => {
                if (earned) {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `0 8px 24px rgba(${parseInt(badge.color.slice(1, 3), 16)}, ${parseInt(badge.color.slice(3, 5), 16)}, ${parseInt(badge.color.slice(5, 7), 16)}, 0.25)`;
                }
              }}
              onMouseLeave={(e) => {
                if (earned) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 4px 12px rgba(${parseInt(badge.color.slice(1, 3), 16)}, ${parseInt(badge.color.slice(3, 5), 16)}, ${parseInt(badge.color.slice(5, 7), 16)}, 0.15)`;
                }
              }}
            >
              {earned && (
                <div style={{
                  position: 'absolute',
                  top: '0.75rem',
                  right: '0.75rem',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: badge.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                }}>
                  <CheckCircle2 size={16} color="white" />
                </div>
              )}
              <div style={{ 
                width: '64px', 
                height: '64px', 
                margin: '0 auto 1rem',
                borderRadius: '16px',
                background: earned ? badge.gradient : 'linear-gradient(135deg, #E2E8F0 0%, #CBD4E0 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: earned ? `0 4px 12px rgba(${parseInt(badge.color.slice(1, 3), 16)}, ${parseInt(badge.color.slice(3, 5), 16)}, ${parseInt(badge.color.slice(5, 7), 16)}, 0.3)` : 'none'
              }}>
                <IconComponent size={32} color={earned ? "white" : "#94A3B8"} />
              </div>
              <div style={{ 
                fontSize: '1rem', 
                fontWeight: '700', 
                color: earned ? '#001639' : '#94A3B8', 
                marginBottom: '0.5rem' 
              }}>
                {badge.name}
              </div>
              <div style={{ 
                fontSize: '0.75rem', 
                color: '#64748B',
                marginBottom: '0.5rem',
                fontWeight: '500'
              }}>
                {badge.category}
              </div>
              <div style={{ 
                fontSize: '0.8125rem', 
                color: earned ? '#475569' : '#94A3B8',
                lineHeight: '1.5'
              }}>
                {badge.description}
              </div>
              {achievement && (
                <div style={{ 
                  fontSize: '0.7rem', 
                  color: '#94A3B8', 
                  marginTop: '0.75rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid #E2E8F0'
                }}>
                  Earned {new Date(achievement.earned_at).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Achievements;
