import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Lock, CreditCard, Trash2, Save, Eye, EyeOff, AlertTriangle, Menu } from 'lucide-react';
import { api, authService } from '../lib/api';
import Footer from '../components/Footer';
import MobileMenu from '../components/MobileMenu';

function SettingsPage({ navigate, user, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [subscription, setSubscription] = useState(null);
  
  // Profile fields
  const [name, setName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [authProvider, setAuthProvider] = useState('');
  
  // Password change fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const [userData, subscriptionData] = await Promise.all([
        api.auth.me(),
        api.subscriptions.current().catch(() => null)
      ]);
      
      setName(userData.name || '');
      setFirstName(userData.first_name || '');
      setLastName(userData.last_name || '');
      setEmail(userData.email || '');
      setAuthProvider(userData.auth_provider || 'email');
      setSubscription(subscriptionData);
    } catch (err) {
      setError(err.message || 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      const updatedUser = await api.users.update({
        name: name.trim() || undefined,
        first_name: firstName.trim() || undefined,
        last_name: lastName.trim() || undefined
      });
      
      // Update local user state
      authService.setUser(updatedUser);
      
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      await api.users.changePassword({
        current_password: currentPassword,
        new_password: newPassword
      });
      
      setSuccess('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setError('Please type DELETE to confirm');
      return;
    }
    
    try {
      setDeleting(true);
      setError('');
      
      await api.users.delete();
      
      // Clear local storage and redirect
      authService.clearTokens();
      onLogout();
      navigate('home');
    } catch (err) {
      setError(err.message || 'Failed to delete account');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-secondary)' }}>
      {/* Header */}
      <header style={{ 
        padding: '1.25rem 0', 
        background: 'rgba(255, 255, 255, 0.98)', 
        position: 'sticky', 
        top: 0, 
        zIndex: 1000,
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => navigate('dashboard')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                color: '#4A5568',
                padding: '0.5rem'
              }}
            >
              <ArrowLeft size={20} />
            </button>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#001639', margin: 0 }}>Settings</h1>
          </div>
          <button
            className="mobile-menu-button"
            onClick={() => setMobileMenuOpen(true)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              color: '#2D3748'
            }}
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      <MobileMenu 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
        navigate={navigate} 
        user={user}
        onLogout={onLogout}
      />

      {/* Main Content */}
      <div style={{ flex: 1, padding: '2rem 0' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          {error && (
            <div className="error-message" style={{ marginBottom: '1.5rem' }}>
              {error}
            </div>
          )}
          
          {success && (
            <div style={{
              background: '#ECFDF5',
              color: '#10B981',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              border: '1px solid #10B981'
            }}>
              {success}
            </div>
          )}

          {/* Profile Section */}
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <User size={20} color="#001639" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#001639', margin: 0 }}>Profile Information</h2>
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={email}
                disabled
                style={{ background: '#F8FAFB', color: '#6B7A91' }}
              />
              <small style={{ color: '#6B7A91', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                Email cannot be changed
              </small>
            </div>

            <button
              className="btn btn-primary"
              onClick={handleSaveProfile}
              disabled={saving}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          {/* Password Section */}
          {authProvider === 'email' && (
            <div className="card" style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <Lock size={20} color="#001639" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#001639', margin: 0 }}>Change Password</h2>
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Current Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    className="form-input"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    style={{ paddingRight: '3rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#6B7A91',
                      padding: '0.25rem'
                    }}
                  >
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    className="form-input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min. 8 characters)"
                    style={{ paddingRight: '3rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#6B7A91',
                      padding: '0.25rem'
                    }}
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Confirm New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="form-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    style={{ paddingRight: '3rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#6B7A91',
                      padding: '0.25rem'
                    }}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                className="btn btn-primary"
                onClick={handleChangePassword}
                disabled={saving || !currentPassword || !newPassword || !confirmPassword}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Lock size={18} />
                {saving ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          )}

          {/* Subscription Section */}
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <CreditCard size={20} color="#001639" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#001639', margin: 0 }}>Subscription</h2>
            </div>

            {subscription ? (
              <div>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.875rem', color: '#6B7A91', marginBottom: '0.25rem' }}>Current Plan</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#001639', textTransform: 'capitalize' }}>
                    {subscription.tier || 'Free'}
                  </div>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.875rem', color: '#6B7A91', marginBottom: '0.25rem' }}>Status</div>
                  <div style={{ 
                    fontSize: '0.9375rem', 
                    fontWeight: '600', 
                    color: subscription.status === 'active' ? '#10B981' : '#6B7A91',
                    textTransform: 'capitalize'
                  }}>
                    {subscription.status || 'Active'}
                  </div>
                </div>
                <button
                  className="btn btn-secondary"
                  onClick={() => navigate('dashboard')}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <CreditCard size={18} />
                  Manage Subscription
                </button>
              </div>
            ) : (
              <div style={{ color: '#6B7A91' }}>Loading subscription information...</div>
            )}
          </div>

          {/* Delete Account Section */}
          <div className="card" style={{ 
            border: '2px solid #FEF2F2',
            background: '#FFFBFB'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <AlertTriangle size={20} color="#EF4444" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#EF4444', margin: 0 }}>Danger Zone</h2>
            </div>

            <p style={{ color: '#6B7A91', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              Once you delete your account, there is no going back. This will permanently delete your account, 
              all your business plans, companies, and all associated data. This action cannot be undone.
            </p>

            {!showDeleteConfirm ? (
              <button
                className="btn"
                onClick={() => setShowDeleteConfirm(true)}
                style={{
                  background: '#EF4444',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#DC2626'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#EF4444'}
              >
                <Trash2 size={18} />
                Delete My Account
              </button>
            ) : (
              <div>
                <div style={{ 
                  background: '#FEF2F2', 
                  border: '1px solid #FEE2E2',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{ fontWeight: '600', color: '#EF4444', marginBottom: '0.5rem' }}>
                    Are you absolutely sure?
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6B7A91', marginBottom: '0.75rem' }}>
                    This will permanently delete your account and all your data. Type <strong>DELETE</strong> to confirm.
                  </div>
                  <input
                    type="text"
                    className="form-input"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="Type DELETE to confirm"
                    style={{ marginBottom: '0.75rem' }}
                  />
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      className="btn"
                      onClick={handleDeleteAccount}
                      disabled={deleting || deleteConfirmText !== 'DELETE'}
                      style={{
                        background: '#EF4444',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        opacity: (deleting || deleteConfirmText !== 'DELETE') ? 0.6 : 1,
                        cursor: (deleting || deleteConfirmText !== 'DELETE') ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <Trash2 size={18} />
                      {deleting ? 'Deleting...' : 'Yes, Delete My Account'}
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteConfirmText('');
                        setError('');
                      }}
                      disabled={deleting}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer navigate={navigate} user={user} />
    </div>
  );
}

export default SettingsPage;
