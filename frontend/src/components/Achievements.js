import React, { useState, useEffect } from 'react';
import { Award, Trophy, Star, Zap, Users, FileText, Target, Briefcase } from 'lucide-react';
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
        // Show notification
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
      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
      </div>
    );
  }

  const totalBadges = achievements.length;
  const allBadges = [
    { id: 'first_plan', name: 'First Steps', icon: '🎯', description: 'Created your first business plan' },
    { id: 'financial_master', name: 'Financial Master', icon: '💰', description: 'Completed financial projections' },
    { id: 'plan_perfectionist', name: 'Plan Perfectionist', icon: '⭐', description: 'Achieved 100% completion' },
    { id: 'speed_runner', name: 'Speed Runner', icon: '⚡', description: 'Completed a plan in <24 hours' },
    { id: 'collaborator', name: 'Team Player', icon: '👥', description: 'Invited a collaborator' },
    { id: 'export_expert', name: 'Export Expert', icon: '📄', description: 'Exported 5+ plans' },
    { id: 'quality_champion', name: 'Quality Champion', icon: '🏆', description: 'Achieved quality score 80+' },
    { id: 'readiness_expert', name: 'Investment Ready', icon: '💼', description: 'Achieved readiness score 80+' }
  ];

  const earnedBadgeIds = new Set(achievements.map(a => a.badge_id));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#001639', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Trophy size={24} /> Achievements
        </h3>
        <button
          onClick={handleCheck}
          disabled={checking}
          className="btn btn-secondary"
          style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          {checking ? 'Checking...' : 'Check for New'}
        </button>
      </div>

      {/* New Achievements Notification */}
      {newAchievements.length > 0 && (
        <div style={{
          padding: '1rem',
          background: 'linear-gradient(135deg, #F0FDF4 0%, #D1FAE5 100%)',
          border: '2px solid #27AC85',
          borderRadius: '12px',
          marginBottom: '1.5rem',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <div style={{ fontSize: '1rem', fontWeight: '600', color: '#1F8A6A', marginBottom: '0.5rem' }}>
            🎉 New Achievement Unlocked!
          </div>
          {newAchievements.map((achievement, idx) => (
            <div key={idx} style={{ fontSize: '0.875rem', color: '#065F46' }}>
              {achievement.icon} {achievement.badge_name}
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      <div className="card" style={{ marginBottom: '2rem', textAlign: 'center', padding: '1.5rem' }}>
        <div style={{ fontSize: '3rem', fontWeight: '700', color: '#001639', marginBottom: '0.5rem' }}>
          {totalBadges} / {allBadges.length}
        </div>
        <div style={{ fontSize: '0.875rem', color: '#64748B' }}>Badges Earned</div>
        <div style={{ marginTop: '1rem', width: '100%', height: '8px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{
            width: `${(totalBadges / allBadges.length) * 100}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #27AC85 0%, #1F8A6A 100%)',
            transition: 'width 0.3s ease'
          }}></div>
        </div>
      </div>

      {/* Achievement Gallery */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        {allBadges.map((badge) => {
          const earned = earnedBadgeIds.has(badge.id);
          const achievement = achievements.find(a => a.badge_id === badge.id);
          
          return (
            <div
              key={badge.id}
              style={{
                padding: '1.5rem',
                background: earned ? 'linear-gradient(135deg, #F0FDF4 0%, #D1FAE5 100%)' : '#F8FAFC',
                border: earned ? '2px solid #27AC85' : '2px solid #E2E8F0',
                borderRadius: '12px',
                textAlign: 'center',
                opacity: earned ? 1 : 0.6,
                transition: 'all 0.3s ease',
                position: 'relative'
              }}
            >
              {earned && (
                <div style={{
                  position: 'absolute',
                  top: '0.5rem',
                  right: '0.5rem',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: '#27AC85',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '0.75rem',
                  fontWeight: '700'
                }}>
                  ✓
                </div>
              )}
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
                {badge.icon}
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#001639', marginBottom: '0.25rem' }}>
                {badge.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                {badge.description}
              </div>
              {achievement && (
                <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '0.5rem' }}>
                  Earned {new Date(achievement.earned_at).toLocaleDateString()}
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
