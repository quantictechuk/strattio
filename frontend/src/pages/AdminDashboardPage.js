import React, { useState, useEffect } from 'react';
import { 
  Users, FileText, DollarSign, TrendingUp, Shield, LogOut, 
  Search, Eye, Key, Save, AlertCircle, CheckCircle2, X,
  BarChart3, PieChart, Calendar, CreditCard, UserPlus, Mail,
  MessageSquare, Filter, Send, Clock, LayoutDashboard
} from 'lucide-react';
import { api, authService } from '../lib/api';

function AdminDashboardPage({ navigate, user, onLogout }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Analytics data
  const [overview, setOverview] = useState(null);
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [revenueAnalytics, setRevenueAnalytics] = useState(null);
  
  // User management
  const [users, setUsers] = useState([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersPage, setUsersPage] = useState(0);
  const [usersSearch, setUsersSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  
  // Admin password change
  const [showAdminPasswordModal, setShowAdminPasswordModal] = useState(false);
  const [adminNewPassword, setAdminNewPassword] = useState('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('');
  const [changingAdminPassword, setChangingAdminPassword] = useState(false);
  
  // Admin management
  const [admins, setAdmins] = useState([]);
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  
  // Ticket management
  const [tickets, setTickets] = useState([]);
  const [ticketsTotal, setTicketsTotal] = useState(0);
  const [ticketsPage, setTicketsPage] = useState(0);
  const [ticketStatusFilter, setTicketStatusFilter] = useState('');
  const [ticketPriorityFilter, setTicketPriorityFilter] = useState('');
  const [ticketAssignedFilter, setTicketAssignedFilter] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketResponse, setTicketResponse] = useState('');
  const [ticketResponseInternal, setTicketResponseInternal] = useState(false);
  const [respondingToTicket, setRespondingToTicket] = useState(false);
  const [updatingTicket, setUpdatingTicket] = useState(false);

  useEffect(() => {
    const checkAdminAccess = async () => {
      // Wait a bit for user state to be restored from parent component
      // If user is not loaded after a short delay, try to get from storage or fetch from API
      if (!user) {
        // Give parent component time to restore user state
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const storedUser = authService.getUser();
        const token = authService.getToken();
        
        if (!token) {
          navigate('admin-login');
          return;
        }
        
        if (storedUser) {
          // Verify user is still admin by fetching fresh data
          try {
            const userData = await api.auth.me();
            if (userData.role === 'admin') {
              authService.setUser(userData);
              // User will be set by parent App.js, but we can proceed
              loadData();
            } else {
              navigate('admin-login');
            }
          } catch (e) {
            console.error('Error verifying admin access:', e);
            navigate('admin-login');
          }
        } else {
          // No stored user, fetch from API
          try {
            const userData = await api.auth.me();
            if (userData.role === 'admin') {
              authService.setUser(userData);
              loadData();
            } else {
              navigate('admin-login');
            }
          } catch (e) {
            console.error('Error fetching user data:', e);
            navigate('admin-login');
          }
        }
        return;
      }
      
      // User is loaded, check role
      if (user.role !== 'admin') {
        navigate('admin-login');
        return;
      }
      
      loadData();
    };
    
    checkAdminAccess();
  }, [activeTab, usersPage, usersSearch, ticketsPage, ticketStatusFilter, ticketPriorityFilter, ticketAssignedFilter, user]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (activeTab === 'overview') {
        const [overviewData, userData, revenueData] = await Promise.all([
          api.admin.analytics.overview().catch(e => {
            console.error('Overview error:', e);
            throw new Error(`Failed to load overview: ${e.message}`);
          }),
          api.admin.analytics.users().catch(e => {
            console.error('User analytics error:', e);
            return null; // Don't fail entire load if this fails
          }),
          api.admin.analytics.revenue(30).catch(e => {
            console.error('Revenue analytics error:', e);
            return null; // Don't fail entire load if this fails
          })
        ]);
        setOverview(overviewData);
        setUserAnalytics(userData);
        setRevenueAnalytics(revenueData);
      } else if (activeTab === 'users') {
        const usersData = await api.admin.users.list(usersPage * 50, 50, usersSearch).catch(e => {
          console.error('Users list error:', e);
          throw new Error(`Failed to load users: ${e.message}`);
        });
        setUsers(usersData.users || []);
        setUsersTotal(usersData.total || 0);
      } else if (activeTab === 'admins') {
        const adminsData = await api.admin.admins.list().catch(e => {
          console.error('Admins list error:', e);
          throw new Error(`Failed to load admins: ${e.message}`);
        });
        setAdmins(adminsData.admins || []);
      } else if (activeTab === 'tickets') {
        const ticketsData = await api.admin.tickets.list(
          ticketStatusFilter || undefined,
          ticketPriorityFilter || undefined,
          ticketAssignedFilter || undefined,
          ticketsPage * 50,
          50
        ).catch(e => {
          console.error('Tickets list error:', e);
          throw new Error(`Failed to load tickets: ${e.message}`);
        });
        setTickets(ticketsData.tickets || []);
        setTicketsTotal(ticketsData.total || 0);
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      const errorMsg = err.message || 'Failed to load data';
      setError(errorMsg);
      if (errorMsg.includes('403') || errorMsg.includes('Admin access required')) {
        setTimeout(() => {
          onLogout();
          navigate('admin-login');
        }, 2000);
      } else if (errorMsg.includes('404') || errorMsg.includes('Not Found')) {
        setError('Admin endpoints not found. Please ensure the backend is deployed with the latest changes.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChangeUserPassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    try {
      setChangingPassword(true);
      setError('');
      await api.admin.users.changePassword(selectedUser.id, newPassword);
      setShowPasswordModal(false);
      setNewPassword('');
      setSelectedUser(null);
      alert('Password changed successfully');
    } catch (err) {
      setError(err.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleChangeAdminPassword = async () => {
    if (!adminNewPassword || adminNewPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    if (adminNewPassword !== adminConfirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      setChangingAdminPassword(true);
      setError('');
      await api.admin.changePassword(adminNewPassword);
      setShowAdminPasswordModal(false);
      setAdminNewPassword('');
      setAdminConfirmPassword('');
      alert('Password changed successfully');
    } catch (err) {
      setError(err.message || 'Failed to change password');
    } finally {
      setChangingAdminPassword(false);
    }
  };

  const handleCreateAdmin = async () => {
    if (!newAdminEmail || !newAdminPassword) {
      setError('Email and password are required');
      return;
    }
    
    if (newAdminPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    try {
      setCreatingAdmin(true);
      setError('');
      await api.admin.admins.create({
        email: newAdminEmail,
        password: newAdminPassword,
        name: newAdminName || undefined
      });
      
      // Reset form
      setNewAdminEmail('');
      setNewAdminPassword('');
      setNewAdminName('');
      setShowCreateAdminModal(false);
      
      // Reload admins list
      if (activeTab === 'admins') {
        const adminsData = await api.admin.admins.list();
        setAdmins(adminsData.admins || []);
      }
      
      alert('Admin user created successfully');
    } catch (err) {
      setError(err.message || 'Failed to create admin user');
    } finally {
      setCreatingAdmin(false);
    }
  };

  const handleViewTicket = async (ticketId) => {
    try {
      const ticket = await api.admin.tickets.get(ticketId);
      setSelectedTicket(ticket);
      setTicketResponse('');
      setTicketResponseInternal(false);
    } catch (err) {
      setError(err.message || 'Failed to load ticket');
    }
  };

  const handleUpdateTicket = async (ticketId, updates) => {
    try {
      setUpdatingTicket(true);
      setError('');
      await api.admin.tickets.update(ticketId, updates);
      await loadData(); // Reload tickets
      if (selectedTicket && selectedTicket.id === ticketId) {
        const updated = await api.admin.tickets.get(ticketId);
        setSelectedTicket(updated);
      }
    } catch (err) {
      setError(err.message || 'Failed to update ticket');
    } finally {
      setUpdatingTicket(false);
    }
  };

  const handleRespondToTicket = async (e) => {
    e.preventDefault();
    if (!ticketResponse.trim()) {
      setError('Message is required');
      return;
    }
    
    try {
      setRespondingToTicket(true);
      setError('');
      await api.admin.tickets.respond(selectedTicket.id, ticketResponse.trim(), ticketResponseInternal);
      setTicketResponse('');
      setTicketResponseInternal(false);
      
      // Reload ticket
      const updated = await api.admin.tickets.get(selectedTicket.id);
      setSelectedTicket(updated);
      
      // Reload tickets list
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to send response');
    } finally {
      setRespondingToTicket(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  if (loading && !overview) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ 
        background: 'white', 
        borderBottom: '1px solid #E2E8F0', 
        position: 'sticky', 
        top: 0, 
        zIndex: 30 
      }}>
        <div className="container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Shield size={24} color="#001639" />
              <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#001639', margin: 0 }}>
                Admin Backoffice
              </h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '0.875rem', color: '#64748B' }}>{user?.email}</span>
              <button
                onClick={() => setShowAdminPasswordModal(true)}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#F1F5F9',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Key size={16} />
                Change Password
              </button>
              <button
                onClick={onLogout}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'none',
                  border: '1px solid #FEE2E2',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  color: '#EF4444',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ background: 'white', borderBottom: '1px solid #E2E8F0' }}>
        <div className="container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '2rem' }}>
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'users', label: 'Users', icon: Users },
                { id: 'admins', label: 'Admins', icon: Shield },
                { id: 'tickets', label: 'Tickets', icon: MessageSquare }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '1rem 0',
                    background: 'none',
                    border: 'none',
                    borderBottom: activeTab === tab.id ? '2px solid #001639' : '2px solid transparent',
                    cursor: 'pointer',
                    fontSize: '0.9375rem',
                    fontWeight: activeTab === tab.id ? '600' : '500',
                    color: activeTab === tab.id ? '#001639' : '#64748B',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => navigate('dashboard')}
              style={{
                padding: '0.5rem 1rem',
                background: '#001639',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9375rem',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = '#002855'}
              onMouseLeave={(e) => e.target.style.background = '#001639'}
            >
              <LayoutDashboard size={18} />
              View User Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '2rem 0' }}>
        <div className="container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1rem' }}>
          {error && (
            <div style={{
              background: '#FEF2F2',
              border: '1px solid #FEE2E2',
              color: '#DC2626',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {activeTab === 'overview' && overview && (
            <div>
              {/* Metrics Cards */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '1.5rem',
                marginBottom: '2rem'
              }}>
                <MetricCard
                  icon={Users}
                  label="Total Users"
                  value={overview.users.total}
                  change={`+${overview.users.this_month} this month`}
                  color="#3B82F6"
                />
                <MetricCard
                  icon={FileText}
                  label="Total Plans"
                  value={overview.plans.total}
                  change={`${overview.plans.completed} completed`}
                  color="#10B981"
                />
                <MetricCard
                  icon={DollarSign}
                  label="Total Revenue"
                  value={formatCurrency(overview.revenue.total)}
                  change={`${formatCurrency(overview.revenue.monthly)} this month`}
                  color="#F59E0B"
                />
                <MetricCard
                  icon={TrendingUp}
                  label="Conversion Rate"
                  value={`${overview.conversion_rate}%`}
                  change={`${overview.subscriptions.paid_count} paid users`}
                  color="#8B5CF6"
                />
              </div>

              {/* Detailed Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                <StatsCard title="Plan Statistics">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <StatRow label="Completed" value={overview.plans.completed} />
                    <StatRow label="Failed" value={overview.plans.failed} />
                    <StatRow label="Generating" value={overview.plans.generating} />
                    <StatRow label="This Month" value={overview.plans.this_month} />
                  </div>
                </StatsCard>

                <StatsCard title="Subscription Breakdown">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <StatRow label="Free" value={overview.subscriptions.by_tier.free || 0} />
                    <StatRow label="Starter" value={overview.subscriptions.by_tier.starter || 0} />
                    <StatRow label="Professional" value={overview.subscriptions.by_tier.professional || 0} />
                    <StatRow label="Enterprise" value={overview.subscriptions.by_tier.enterprise || 0} />
                  </div>
                </StatsCard>
              </div>

              {/* Revenue Chart Placeholder */}
              {revenueAnalytics && (
                <StatsCard title="Revenue (Last 30 Days)">
                  <div style={{ padding: '1rem 0' }}>
                    {revenueAnalytics.daily_revenue.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {revenueAnalytics.daily_revenue.slice(-7).map((day, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.875rem', color: '#64748B' }}>{day._id}</span>
                            <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#001639' }}>
                              {formatCurrency(day.revenue)} ({day.count} transactions)
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: '#94A3B8', textAlign: 'center' }}>No revenue data available</p>
                    )}
                  </div>
                </StatsCard>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              {/* Search */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ position: 'relative', maxWidth: '400px' }}>
                  <Search size={20} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input
                    type="text"
                    placeholder="Search users by email or name..."
                    value={usersSearch}
                    onChange={(e) => {
                      setUsersSearch(e.target.value);
                      setUsersPage(0);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      fontSize: '0.9375rem'
                    }}
                  />
                </div>
              </div>

              {/* Users Table */}
              <div className="card" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#475569' }}>Email</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#475569' }}>Name</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#475569' }}>Tier</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#475569' }}>Plans</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#475569' }}>Joined</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#475569' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#1E293B' }}>{u.email}</td>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#1E293B' }}>{u.name || 'N/A'}</td>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#1E293B', textTransform: 'capitalize' }}>
                          {u.subscription?.tier || u.subscription_tier || 'free'}
                        </td>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#1E293B' }}>{u.plan_count || 0}</td>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#64748B' }}>
                          {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setShowPasswordModal(true);
                              setNewPassword('');
                            }}
                            style={{
                              padding: '0.375rem 0.75rem',
                              background: '#F1F5F9',
                              border: '1px solid #E2E8F0',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.875rem',
                              color: '#475569',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.375rem'
                            }}
                          >
                            <Key size={14} />
                            Change Password
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {users.length === 0 && (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8' }}>
                    No users found
                  </div>
                )}
              </div>

              {/* Pagination */}
              {usersTotal > 50 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
                  <span style={{ fontSize: '0.875rem', color: '#64748B' }}>
                    Showing {usersPage * 50 + 1} - {Math.min((usersPage + 1) * 50, usersTotal)} of {usersTotal}
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => setUsersPage(p => Math.max(0, p - 1))}
                      disabled={usersPage === 0}
                      style={{
                        padding: '0.5rem 1rem',
                        background: usersPage === 0 ? '#F1F5F9' : 'white',
                        border: '1px solid #E2E8F0',
                        borderRadius: '6px',
                        cursor: usersPage === 0 ? 'not-allowed' : 'pointer',
                        fontSize: '0.875rem'
                      }}
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setUsersPage(p => p + 1)}
                      disabled={(usersPage + 1) * 50 >= usersTotal}
                      style={{
                        padding: '0.5rem 1rem',
                        background: (usersPage + 1) * 50 >= usersTotal ? '#F1F5F9' : 'white',
                        border: '1px solid #E2E8F0',
                        borderRadius: '6px',
                        cursor: (usersPage + 1) * 50 >= usersTotal ? 'not-allowed' : 'pointer',
                        fontSize: '0.875rem'
                      }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'admins' && (
            <div>
              {/* Header with Create Button */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#001639', margin: 0 }}>
                  Admin Users
                </h2>
                <button
                  onClick={() => {
                    setShowCreateAdminModal(true);
                    setNewAdminEmail('');
                    setNewAdminPassword('');
                    setNewAdminName('');
                    setError('');
                  }}
                  style={{
                    padding: '0.625rem 1.25rem',
                    background: '#001639',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9375rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <UserPlus size={18} />
                  Add Admin User
                </button>
              </div>

              {/* Admins Table */}
              <div className="card" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#475569' }}>Email</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#475569' }}>Name</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#475569' }}>Created</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#475569' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.map((admin) => (
                      <tr key={admin.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Mail size={16} color="#64748B" />
                          {admin.email}
                        </td>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#1E293B' }}>{admin.name || 'N/A'}</td>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#64748B' }}>
                          {admin.created_at ? new Date(admin.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            background: '#E6F7F0',
                            color: '#27AC85',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            textTransform: 'uppercase'
                          }}>
                            Admin
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {admins.length === 0 && (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8' }}>
                    No admin users found. Click "Add Admin User" to create one.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'tickets' && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#001639', marginBottom: '1.5rem' }}>
                Support Tickets
              </h2>

              {/* Filters */}
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Filter size={18} color="#64748B" />
                  <select
                    value={ticketStatusFilter}
                    onChange={(e) => { setTicketStatusFilter(e.target.value); setTicketsPage(0); }}
                    style={{
                      padding: '0.5rem 1rem',
                      border: '1px solid #E2E8F0',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      background: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">All Status</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <select
                  value={ticketPriorityFilter}
                  onChange={(e) => { setTicketPriorityFilter(e.target.value); setTicketsPage(0); }}
                  style={{
                    padding: '0.5rem 1rem',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    background: 'white',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
                <select
                  value={ticketAssignedFilter}
                  onChange={(e) => { setTicketAssignedFilter(e.target.value); setTicketsPage(0); }}
                  style={{
                    padding: '0.5rem 1rem',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    background: 'white',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">All Assignments</option>
                  <option value="unassigned">Unassigned</option>
                  {admins.map(admin => (
                    <option key={admin.id} value={admin.id}>{admin.name || admin.email}</option>
                  ))}
                </select>
              </div>

              {/* Tickets Table */}
              <div className="card" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#475569' }}>ID</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#475569' }}>Subject</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#475569' }}>User</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#475569' }}>Priority</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#475569' }}>Status</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#475569' }}>Assigned</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#475569' }}>Created</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#475569' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((ticket) => (
                      <tr key={ticket.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#64748B' }}>#{ticket.id.substring(0, 8)}</td>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#1E293B', fontWeight: '500' }}>{ticket.subject}</td>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#1E293B' }}>{ticket.user?.email || 'N/A'}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            background: ticket.priority === 'urgent' ? '#FEF2F2' : ticket.priority === 'high' ? '#FFFBEB' : ticket.priority === 'medium' ? '#EFF6FF' : '#F1F5F9',
                            color: ticket.priority === 'urgent' ? '#DC2626' : ticket.priority === 'high' ? '#D97706' : ticket.priority === 'medium' ? '#2563EB' : '#64748B',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            textTransform: 'capitalize'
                          }}>
                            {ticket.priority}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            background: ticket.status === 'open' ? '#EFF6FF' : ticket.status === 'in_progress' ? '#FFFBEB' : ticket.status === 'resolved' ? '#E6F7F0' : '#F1F5F9',
                            color: ticket.status === 'open' ? '#2563EB' : ticket.status === 'in_progress' ? '#D97706' : ticket.status === 'resolved' ? '#27AC85' : '#64748B',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            textTransform: 'capitalize'
                          }}>
                            {ticket.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#1E293B' }}>
                          {ticket.assigned_admin ? ticket.assigned_admin.name : <span style={{ color: '#94A3B8' }}>Unassigned</span>}
                        </td>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#64748B' }}>
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <button
                            onClick={() => handleViewTicket(ticket.id)}
                            style={{
                              padding: '0.375rem 0.75rem',
                              background: '#F1F5F9',
                              border: '1px solid #E2E8F0',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.875rem',
                              color: '#475569'
                            }}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {tickets.length === 0 && (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8' }}>
                    No tickets found
                  </div>
                )}
              </div>

              {/* Pagination */}
              {ticketsTotal > 50 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
                  <span style={{ fontSize: '0.875rem', color: '#64748B' }}>
                    Showing {ticketsPage * 50 + 1} - {Math.min((ticketsPage + 1) * 50, ticketsTotal)} of {ticketsTotal}
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => setTicketsPage(p => Math.max(0, p - 1))}
                      disabled={ticketsPage === 0}
                      className="btn btn-secondary"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setTicketsPage(p => p + 1)}
                      disabled={(ticketsPage + 1) * 50 >= ticketsTotal}
                      className="btn btn-secondary"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <Modal
          title={`Ticket #${selectedTicket.id.substring(0, 8)} - ${selectedTicket.subject}`}
          onClose={() => {
            setSelectedTicket(null);
            setTicketResponse('');
            setTicketResponseInternal(false);
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Ticket Info */}
            <div>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase' }}>Status</label>
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleUpdateTicket(selectedTicket.id, { status: e.target.value })}
                    disabled={updatingTicket}
                    style={{
                      padding: '0.5rem',
                      border: '1px solid #E2E8F0',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      background: 'white',
                      cursor: 'pointer',
                      marginTop: '0.25rem'
                    }}
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase' }}>Priority</label>
                  <select
                    value={selectedTicket.priority}
                    onChange={(e) => handleUpdateTicket(selectedTicket.id, { priority: e.target.value })}
                    disabled={updatingTicket}
                    style={{
                      padding: '0.5rem',
                      border: '1px solid #E2E8F0',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      background: 'white',
                      cursor: 'pointer',
                      marginTop: '0.25rem'
                    }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase' }}>Assign To</label>
                  <select
                    value={selectedTicket.assigned_to || ''}
                    onChange={(e) => handleUpdateTicket(selectedTicket.id, { assigned_to: e.target.value || null })}
                    disabled={updatingTicket}
                    style={{
                      padding: '0.5rem',
                      border: '1px solid #E2E8F0',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      background: 'white',
                      cursor: 'pointer',
                      marginTop: '0.25rem'
                    }}
                  >
                    <option value="">Unassigned</option>
                    {admins.map(admin => (
                      <option key={admin.id} value={admin.id}>{admin.name || admin.email}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div style={{ padding: '1rem', background: '#F8FAFC', borderRadius: '8px', marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#475569', margin: 0, whiteSpace: 'pre-wrap' }}>
                  {selectedTicket.description}
                </p>
              </div>
              
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                <div>User: {selectedTicket.user?.email}</div>
                <div>Created: {new Date(selectedTicket.created_at).toLocaleString()}</div>
                {selectedTicket.assigned_admin && <div>Assigned to: {selectedTicket.assigned_admin.name}</div>}
              </div>
            </div>

            {/* Responses */}
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#001639', marginBottom: '1rem' }}>
                Responses ({selectedTicket.responses?.length || 0})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
                {selectedTicket.responses?.map((response, idx) => (
                  <div key={idx} style={{
                    padding: '1rem',
                    background: response.is_admin ? '#EBF5FF' : '#F8FAFC',
                    borderRadius: '8px',
                    borderLeft: response.is_admin ? '3px solid #3B82F6' : '3px solid #E2E8F0'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div style={{ fontWeight: '600', color: '#001639' }}>
                        {response.user_name} {response.is_admin && <span style={{ fontSize: '0.75rem', color: '#3B82F6' }}>(Admin)</span>}
                        {response.is_internal && <span style={{ fontSize: '0.75rem', color: '#F59E0B', marginLeft: '0.5rem' }}>(Internal Note)</span>}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                        {new Date(response.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: '#475569', margin: 0, whiteSpace: 'pre-wrap' }}>
                      {response.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Response Form */}
            {selectedTicket.status !== 'closed' && (
              <form onSubmit={handleRespondToTicket}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#475569' }}>
                    Add Response
                  </label>
                  <textarea
                    value={ticketResponse}
                    onChange={(e) => setTicketResponse(e.target.value)}
                    required
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #E2E8F0',
                      borderRadius: '6px',
                      fontSize: '0.9375rem',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                    placeholder="Type your response here..."
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <input
                    type="checkbox"
                    id="internalNote"
                    checked={ticketResponseInternal}
                    onChange={(e) => setTicketResponseInternal(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <label htmlFor="internalNote" style={{ fontSize: '0.875rem', color: '#475569', cursor: 'pointer' }}>
                    Internal note (visible only to admins)
                  </label>
                </div>
                <button type="submit" className="btn btn-primary" disabled={respondingToTicket} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Send size={16} />
                  {respondingToTicket ? 'Sending...' : 'Send Response'}
                </button>
              </form>
            )}
          </div>
        </Modal>
      )}

      {/* Create Admin Modal */}
      {showCreateAdminModal && (
        <Modal
          title="Create New Admin User"
          onClose={() => {
            setShowCreateAdminModal(false);
            setNewAdminEmail('');
            setNewAdminPassword('');
            setNewAdminName('');
            setError('');
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {error && (
              <div style={{
                padding: '0.75rem',
                background: '#FEF2F2',
                border: '1px solid #EF4444',
                borderRadius: '6px',
                color: '#DC2626',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <AlertCircle size={16} />
                {error}
              </div>
            )}
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#475569' }}>
                Email Address <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  fontSize: '0.9375rem'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#475569' }}>
                Password <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="password"
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  fontSize: '0.9375rem'
                }}
              />
              <p style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#64748B' }}>
                Password must be at least 8 characters long
              </p>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#475569' }}>
                Name (Optional)
              </label>
              <input
                type="text"
                value={newAdminName}
                onChange={(e) => setNewAdminName(e.target.value)}
                placeholder="Admin Name"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  fontSize: '0.9375rem'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                onClick={handleCreateAdmin}
                disabled={creatingAdmin || !newAdminEmail || !newAdminPassword}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: creatingAdmin || !newAdminEmail || !newAdminPassword ? '#F1F5F9' : '#001639',
                  color: creatingAdmin || !newAdminEmail || !newAdminPassword ? '#94A3B8' : 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: creatingAdmin || !newAdminEmail || !newAdminPassword ? 'not-allowed' : 'pointer',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {creatingAdmin ? (
                  <>
                    <div className="loading-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus size={18} />
                    Create Admin
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowCreateAdminModal(false);
                  setNewAdminEmail('');
                  setNewAdminPassword('');
                  setNewAdminName('');
                  setError('');
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#F1F5F9',
                  color: '#475569',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9375rem',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Change User Password Modal */}
      {showPasswordModal && selectedUser && (
        <Modal
          title={`Change Password for ${selectedUser.email}`}
          onClose={() => {
            setShowPasswordModal(false);
            setSelectedUser(null);
            setNewPassword('');
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#475569' }}>
                New Password (min. 8 characters)
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  fontSize: '0.9375rem'
                }}
                placeholder="Enter new password"
              />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setSelectedUser(null);
                  setNewPassword('');
                }}
                style={{
                  padding: '0.625rem 1.25rem',
                  background: '#F1F5F9',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleChangeUserPassword}
                disabled={changingPassword || !newPassword || newPassword.length < 8}
                style={{
                  padding: '0.625rem 1.25rem',
                  background: changingPassword || !newPassword || newPassword.length < 8 ? '#F1F5F9' : '#001639',
                  color: changingPassword || !newPassword || newPassword.length < 8 ? '#94A3B8' : 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: changingPassword || !newPassword || newPassword.length < 8 ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {changingPassword ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Change Admin Password Modal */}
      {showAdminPasswordModal && (
        <Modal
          title="Change Admin Password"
          onClose={() => {
            setShowAdminPasswordModal(false);
            setAdminNewPassword('');
            setAdminConfirmPassword('');
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#475569' }}>
                New Password (min. 8 characters)
              </label>
              <input
                type="password"
                value={adminNewPassword}
                onChange={(e) => setAdminNewPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  fontSize: '0.9375rem'
                }}
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#475569' }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={adminConfirmPassword}
                onChange={(e) => setAdminConfirmPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  fontSize: '0.9375rem'
                }}
                placeholder="Confirm new password"
              />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowAdminPasswordModal(false);
                  setAdminNewPassword('');
                  setAdminConfirmPassword('');
                }}
                style={{
                  padding: '0.625rem 1.25rem',
                  background: '#F1F5F9',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleChangeAdminPassword}
                disabled={changingAdminPassword || !adminNewPassword || adminNewPassword.length < 8 || adminNewPassword !== adminConfirmPassword}
                style={{
                  padding: '0.625rem 1.25rem',
                  background: changingAdminPassword || !adminNewPassword || adminNewPassword.length < 8 || adminNewPassword !== adminConfirmPassword ? '#F1F5F9' : '#001639',
                  color: changingAdminPassword || !adminNewPassword || adminNewPassword.length < 8 || adminNewPassword !== adminConfirmPassword ? '#94A3B8' : 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: changingAdminPassword || !adminNewPassword || adminNewPassword.length < 8 || adminNewPassword !== adminConfirmPassword ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {changingAdminPassword ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// Helper Components
function MetricCard({ icon: Icon, label, value, change, color }) {
  return (
    <div className="card" style={{ borderLeft: `4px solid ${color}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
        <div style={{ 
          width: '48px', 
          height: '48px', 
          borderRadius: '8px', 
          background: `${color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon size={24} color={color} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '0.25rem' }}>{label}</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#001639' }}>{value}</div>
        </div>
      </div>
      <div style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>{change}</div>
    </div>
  );
}

function StatsCard({ title, children }) {
  return (
    <div className="card">
      <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#001639', marginBottom: '1rem' }}>{title}</h3>
      {children}
    </div>
  );
}

function StatRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '0.875rem', color: '#64748B' }}>{label}</span>
      <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#001639' }}>{value}</span>
    </div>
  );
}

function Modal({ title, children, onClose }) {
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
      <div className="card" style={{
        maxWidth: '500px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto'
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#001639', margin: 0 }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} color="#94A3B8" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default AdminDashboardPage;
