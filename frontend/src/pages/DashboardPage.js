import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  FileText, 
  Trash2, 
  Download, 
  ExternalLink, 
  CreditCard, 
  Search, 
  MoreVertical,
  CheckCircle2,
  Clock,
  Loader2,
  LogOut,
  Building2,
  Menu,
  Settings,
  GitCompare,
  X,
  Bell,
  User,
  TrendingUp,
  Filter,
  Edit,
  HelpCircle,
  ArrowRight,
  Zap,
  Award,
  Trophy,
  Star,
  Users,
  Target,
  Briefcase,
  Sparkles,
  Shield
} from 'lucide-react';
import { api } from '../lib/api';
import Footer from '../components/Footer';
import MobileMenu from '../components/MobileMenu';
import PlanComparison from '../components/PlanComparison';

function DashboardPage({ navigate, user, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [plans, setPlans] = useState([]);
  const [allPlans, setAllPlans] = useState([]); // Store all plans for filtering
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subscription, setSubscription] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedPlans, setSelectedPlans] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [achievements, setAchievements] = useState([]);
  const [achievementProgress, setAchievementProgress] = useState(0);
  const [supportTickets, setSupportTickets] = useState([]);
  const [checkingAchievements, setCheckingAchievements] = useState(false);
  const [newAchievements, setNewAchievements] = useState([]);
  const [filterTimeRange, setFilterTimeRange] = useState('Last 6 Months');
  const [filterPlanType, setFilterPlanType] = useState('All Types');
  const [filterMetric, setFilterMetric] = useState('Total Generated');
  const menuRef = useRef(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [plansData, subscriptionData] = await Promise.all([
        api.plans.list(),
        api.subscriptions.current()
      ]);
      
      const plansList = plansData.plans || [];
      setAllPlans(plansList);
      setPlans(plansList);
      setSubscription(subscriptionData);
      
      // Load achievements
      try {
        const achievementsData = await api.achievements.get();
        if (achievementsData && achievementsData.achievements) {
          setAchievements(achievementsData.achievements);
          // Calculate progress based on all possible badges (8 total)
          const totalAchievements = 8;
          const earnedCount = achievementsData.achievements.length;
          setAchievementProgress(Math.round((earnedCount / totalAchievements) * 100));
        }
      } catch (err) {
        console.log('Failed to load achievements:', err);
        setAchievementProgress(0);
      }
      
      // Load support tickets
      try {
        const ticketsData = await api.tickets.list();
        if (ticketsData && ticketsData.tickets) {
          setSupportTickets(ticketsData.tickets.slice(0, 2)); // Show only 2 recent tickets
        }
      } catch (err) {
        console.log('Failed to load tickets:', err);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };


  const handleCreatePlan = () => {
    // Check limits
    if (subscription && subscription.plans_created_this_month >= subscription.plan_limit) {
      alert(`Plan limit reached (${subscription.plan_limit} plans per month on ${subscription.tier} tier). Please upgrade.`);
      return;
    }
    
    navigate('intake-wizard');
  };

  const handleViewPlan = (plan) => {
    navigate('plan-editor', { planId: plan.id });
  };

  const handleDeletePlan = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;
    
    try {
      await api.plans.delete(planId);
      const updatedPlans = allPlans.filter(p => p.id !== planId);
      setAllPlans(updatedPlans);
      setPlans(updatedPlans);
    } catch (err) {
      setError(err.message || 'Failed to delete plan');
    }
  };

  const handleDuplicatePlan = async (planId) => {
    try {
      const newPlan = await api.plans.duplicate(planId);
      const updatedPlans = [newPlan, ...allPlans];
      setAllPlans(updatedPlans);
      setPlans(updatedPlans);
      setOpenMenuId(null);
    } catch (err) {
      setError(err.message || 'Failed to duplicate plan');
    }
  };

  const handleExport = async (planId, format = 'pdf') => {
    // Check subscription tier first
    if (!subscription) {
      setError('Loading subscription info...');
      return;
    }

    // Free tier: Show upgrade modal
    if (subscription.tier === 'free') {
      setShowUpgradeModal(true);
      setOpenMenuId(null);
      return;
    }

    // Paid tiers: Proceed with export
    try {
      setError('');
      setOpenMenuId(null);
      const exportJob = await api.exports.create(planId, format);
      
      // Automatically trigger download
      if (exportJob && exportJob.id) {
        // Use the same base URL as the API client
        const API_BASE = process.env.REACT_APP_BACKEND_URL || 'https://strattio-backend.vercel.app';
        const downloadUrl = `${API_BASE}/api/exports/${exportJob.id}/download`;
        
        // Get auth token
        const token = localStorage.getItem('access_token');
        
        // Use fetch to download with auth header
        const response = await fetch(downloadUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          const extension = format === 'markdown' ? 'md' : format;
          link.download = exportJob.file_name || `business_plan.${extension}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } else {
          const errorText = await response.text();
          throw new Error(errorText || 'Failed to download export');
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to export plan');
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    if (openMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

  const handleUpgrade = async (packageId) => {
    setUpgrading(true);
    try {
      const originUrl = window.location.origin;
      const checkoutData = await api.stripe.createCheckout(packageId, originUrl);
      window.location.href = checkoutData.url;
    } catch (err) {
      setError(err.message || 'Failed to create checkout session');
      setUpgrading(false);
    }
  };

  // Calculate plan generation stats for last 6 months
  const getPlanGenerationData = () => {
    const now = new Date();
    const months = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Determine time range based on filter
    let monthsToShow = 6;
    let startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    
    if (filterTimeRange === 'Last Year') {
      monthsToShow = 12;
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    } else if (filterTimeRange === 'This Quarter') {
      monthsToShow = 3;
      const quarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), quarter * 3, 1);
    }
    
    // Get months based on filter
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const date = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
      months.push({
        monthIndex: date.getMonth(),
        year: date.getFullYear(),
        name: monthNames[date.getMonth()]
      });
    }
    
    // Filter plans based on current filters
    let filteredPlans = [...allPlans];
    if (filterPlanType !== 'All Types') {
      if (filterPlanType === 'Loan Plans') {
        filteredPlans = filteredPlans.filter(p => p.plan_purpose === 'loan');
      } else if (filterPlanType === 'Visa Plans') {
        filteredPlans = filteredPlans.filter(p => p.plan_purpose?.includes('visa'));
      } else if (filterPlanType === 'Generic') {
        filteredPlans = filteredPlans.filter(p => p.plan_purpose === 'generic' || !p.plan_purpose);
      }
    }
    
    const data = months.map((monthInfo) => {
      const count = filteredPlans.filter(plan => {
        if (!plan.created_at) return false;
        const planDate = new Date(plan.created_at);
        return planDate.getMonth() === monthInfo.monthIndex && planDate.getFullYear() === monthInfo.year;
      }).length;
      
      // Calculate percentage based on max count (for visualization)
      const counts = months.map(m => 
        filteredPlans.filter(p => {
          if (!p.created_at) return false;
          const pd = new Date(p.created_at);
          return pd.getMonth() === m.monthIndex && pd.getFullYear() === m.year;
        }).length
      );
      const maxCount = Math.max(...counts, 1);
      
      const percentage = maxCount > 0 ? Math.max(20, Math.min(95, (count / maxCount) * 100)) : 20;
      
      return { month: monthInfo.name, count, percentage };
    });
    
    // Calculate growth percentage (compare last month to first month)
    const firstMonthCount = data[0]?.count || 0;
    const lastMonthCount = data[data.length - 1]?.count || 0;
    const growthPercentage = firstMonthCount > 0 
      ? Math.round(((lastMonthCount - firstMonthCount) / firstMonthCount) * 100)
      : lastMonthCount > 0 ? 100 : 0;
    
    return { data, growthPercentage };
  };

  // Calculate portfolio mix
  const getPortfolioMix = () => {
    const total = allPlans.length || 1;
    const loanPlans = allPlans.filter(p => p.plan_purpose === 'loan').length;
    const genericPlans = allPlans.filter(p => p.plan_purpose === 'generic' || !p.plan_purpose).length;
    const visaPlans = allPlans.filter(p => p.plan_purpose?.includes('visa')).length;
    
    return {
      total,
      loan: { count: loanPlans, percentage: Math.round((loanPlans / total) * 100) },
      generic: { count: genericPlans, percentage: Math.round((genericPlans / total) * 100) },
      visa: { count: visaPlans, percentage: Math.round((visaPlans / total) * 100) }
    };
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.name) {
      const names = user.name.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return user.name.substring(0, 2).toUpperCase();
    }
    return 'PD';
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      complete: {
        bg: 'rgba(16, 185, 129, 0.1)',
        text: '#10B981',
        border: 'rgba(16, 185, 129, 0.2)',
        label: 'Complete',
        icon: <CheckCircle2 size={12} style={{ marginRight: '0.375rem' }} />
      },
      draft: {
        bg: '#F1F5F9',
        text: '#64748B',
        border: '#E2E8F0',
        label: 'Draft',
        icon: <Clock size={12} style={{ marginRight: '0.375rem' }} />
      },
      generating: {
        bg: 'rgba(0, 22, 57, 0.1)',
        text: '#001639',
        border: 'rgba(0, 22, 57, 0.2)',
        label: 'Generating...',
        icon: <Loader2 size={12} style={{ marginRight: '0.375rem', animation: 'spin 1s linear infinite' }} />
      }
    };

    const statusStyle = statusMap[status] || statusMap.draft;
    
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.25rem 0.625rem',
        borderRadius: '100px',
        fontSize: '0.75rem',
        fontWeight: '500',
        border: `1px solid ${statusStyle.border}`,
        background: statusStyle.bg,
        color: statusStyle.text
      }}>
        {statusStyle.icon}
        {statusStyle.label}
      </span>
    );
  };

  const getStatusDot = (status) => {
    if (status === 'complete') {
      return <span className="w-1.5 h-1.5 rounded-full bg-green-500" title="Complete"></span>;
    }
    return null;
  };

  // Handle achievement check
  const handleCheckAchievements = async () => {
    try {
      setCheckingAchievements(true);
      setError('');
      const result = await api.achievements.check();
      if (result.total_new > 0) {
        setNewAchievements(result.new_achievements || []);
        await loadDashboard(); // Reload to get updated achievements
        setTimeout(() => setNewAchievements([]), 5000);
      }
    } catch (err) {
      console.log('Failed to check achievements:', err);
    } finally {
      setCheckingAchievements(false);
    }
  };

  // All available badges
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
      name: 'Financials', 
      icon: Briefcase, 
      color: '#10B981',
      gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      description: 'Completed financial projections',
      category: 'Financials'
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
      id: 'plan_perfectionist', 
      name: 'Plan Master', 
      icon: Star, 
      color: '#F59E0B',
      gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      description: 'Achieved 100% completion',
      category: 'Quality'
    }
  ];

  // Get earned badge IDs
  const earnedBadgeIds = new Set(achievements.map(a => a.badge_id));
  
  // Get recent badges (earned ones first, then unearned)
  const getRecentBadges = () => {
    const earned = achievements
      .map(a => {
        const badge = allBadges.find(b => b.id === a.badge_id);
        return badge ? { ...badge, earned: true, earned_at: a.earned_at } : null;
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b.earned_at) - new Date(a.earned_at));
    
    const unearned = allBadges
      .filter(b => !earnedBadgeIds.has(b.id));
    
    // Return all badges: earned first (sorted by date), then unearned
    return [...earned, ...unearned];
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...allPlans];
    
    // Filter by plan type
    if (filterPlanType !== 'All Types') {
      if (filterPlanType === 'Loan Plans') {
        filtered = filtered.filter(p => p.plan_purpose === 'loan');
      } else if (filterPlanType === 'Visa Plans') {
        filtered = filtered.filter(p => p.plan_purpose?.includes('visa'));
      }
    }
    
    // Filter by time range
    if (filterTimeRange !== 'All Time') {
      const now = new Date();
      const cutoffDate = new Date();
      
      if (filterTimeRange === 'Last 6 Months') {
        cutoffDate.setMonth(now.getMonth() - 6);
      } else if (filterTimeRange === 'Last Year') {
        cutoffDate.setFullYear(now.getFullYear() - 1);
      } else if (filterTimeRange === 'This Quarter') {
        const quarter = Math.floor(now.getMonth() / 3);
        cutoffDate.setMonth(quarter * 3);
        cutoffDate.setDate(1);
      }
      
      filtered = filtered.filter(p => {
        if (!p.created_at) return false;
        return new Date(p.created_at) >= cutoffDate;
      });
    }
    
    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(plan => {
        const nameMatch = plan.name?.toLowerCase().includes(query);
        const purposeMatch = plan.plan_purpose?.toLowerCase().includes(query);
        const statusMatch = plan.status?.toLowerCase().includes(query);
        const businessNameMatch = plan.intake_data?.business_name?.toLowerCase().includes(query);
        return nameMatch || purposeMatch || statusMatch || businessNameMatch;
      });
    }
    
    setPlans(filtered);
  }, [filterTimeRange, filterPlanType, filterMetric, searchQuery, allPlans]);

  const planGenerationData = getPlanGenerationData();
  const portfolioMix = getPortfolioMix();
  const recentBadges = getRecentBadges();

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* New Dashboard Header */}
      <nav className="sticky top-0 z-50 bg-white/80 border-b border-slate-200 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('home')}>
              <img 
                src="/logo.png" 
                alt="Strattio" 
                className="h-8 w-auto" 
              />
            </div>

            {/* Navigation */}
            <div className="hidden md:flex space-x-8 items-center">
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); }}
                className="text-sm font-medium text-primary"
                style={{ color: '#0F172A' }}
              >
                Dashboard
              </a>
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); }}
                className="text-sm font-medium text-slate-500 hover:text-primary transition-colors"
                style={{ color: '#64748B' }}
                onMouseEnter={(e) => e.target.style.color = '#0F172A'}
                onMouseLeave={(e) => e.target.style.color = '#64748B'}
              >
                Plans
              </a>
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); }}
                className="text-sm font-medium text-slate-500 hover:text-primary transition-colors"
                style={{ color: '#64748B' }}
                onMouseEnter={(e) => e.target.style.color = '#0F172A'}
                onMouseLeave={(e) => e.target.style.color = '#64748B'}
              >
                Community
              </a>
              {user && user.role === 'admin' && (
                <button
                  onClick={() => navigate('admin-dashboard')}
                  className="text-sm font-medium text-slate-500 hover:text-primary transition-colors flex items-center gap-1.5"
                  style={{ 
                    color: '#64748B',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#0F172A'}
                  onMouseLeave={(e) => e.target.style.color = '#64748B'}
                >
                  <Shield size={16} />
                  Admin Dashboard
                </button>
              )}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              <button 
                className="text-slate-400 hover:text-primary transition-colors"
                onClick={() => navigate('settings')}
                title="Settings"
              >
                <Settings size={20} />
              </button>
              <button 
                className="text-slate-400 hover:text-primary transition-colors relative"
                title="Notifications"
              >
                <Bell size={20} />
              </button>
              <div 
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 p-0.5 cursor-pointer"
                onClick={() => navigate('settings')}
                title={user?.name || 'User'}
              >
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-xs font-bold text-primary" style={{ color: '#0F172A' }}>
                  {getUserInitials()}
            </div>
              </div>
            </div>
            
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem',
                color: '#64748B'
              }}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      <MobileMenu 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
        navigate={navigate} 
        user={user}
        onLogout={onLogout}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Overview Header */}
        <header className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-primary tracking-tight" style={{ color: '#0F172A' }}>Overview</h1>
              <p className="text-sm text-slate-500" style={{ color: '#64748B' }}>Welcome back, here's what's happening today.</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                style={{ borderColor: '#E2E8F0', color: '#475569' }}
              >
                <Filter size={18} />
                <span className="hidden sm:inline">Customize View</span>
              </button>
            </div>
          </div>
          
          {/* Filter Panel */}
          {showFilterPanel && (
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in-down" style={{ borderColor: '#E2E8F0' }}>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide" style={{ color: '#64748B' }}>Time Range</label>
                <select 
                  className="block w-full pl-3 pr-10 py-2 text-sm border-slate-200 rounded-lg bg-slate-50 focus:ring-primary focus:border-primary" 
                  style={{ borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' }}
                  value={filterTimeRange}
                  onChange={(e) => setFilterTimeRange(e.target.value)}
                >
                  <option value="All Time">All Time</option>
                  <option value="Last 6 Months">Last 6 Months</option>
                  <option value="Last Year">Last Year</option>
                  <option value="This Quarter">This Quarter</option>
                </select>
                </div>
                <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide" style={{ color: '#64748B' }}>Plan Type</label>
                <select 
                  className="block w-full pl-3 pr-10 py-2 text-sm border-slate-200 rounded-lg bg-slate-50 focus:ring-primary focus:border-primary" 
                  style={{ borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' }}
                  value={filterPlanType}
                  onChange={(e) => setFilterPlanType(e.target.value)}
                >
                  <option value="All Types">All Types</option>
                  <option value="Loan Plans">Loan Plans</option>
                  <option value="Visa Plans">Visa Plans</option>
                  <option value="Generic">Generic</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide" style={{ color: '#64748B' }}>Metric Focus</label>
                <select 
                  className="block w-full pl-3 pr-10 py-2 text-sm border-slate-200 rounded-lg bg-slate-50 focus:ring-primary focus:border-primary" 
                  style={{ borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' }}
                  value={filterMetric}
                  onChange={(e) => setFilterMetric(e.target.value)}
                >
                  <option value="Total Generated">Total Generated</option>
                  <option value="Completion Rate">Completion Rate</option>
                  <option value="Revenue">Revenue</option>
                </select>
              </div>
            </div>
          )}
        </header>

        {/* Charts Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Plan Generation Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-soft" style={{ borderColor: '#E2E8F0', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)' }}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-semibold text-lg text-primary" style={{ color: '#0F172A' }}>Plan Generation</h3>
                <p className="text-xs text-slate-500 mt-1" style={{ color: '#64748B' }}>Growth over the last 6 months</p>
              </div>
              <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded text-green-700 text-xs font-bold" style={{ backgroundColor: '#F0FDF4', color: '#15803D' }}>
                <TrendingUp size={14} />
                +{planGenerationData.growthPercentage}%
              </div>
            </div>
            <div className="h-64 w-full flex items-end justify-between gap-2 sm:gap-4 px-2">
              {planGenerationData.data.map((item, index) => {
                const isLastMonth = index === planGenerationData.data.length - 1;
                const barHeight = Math.max(15, item.percentage); // Minimum 15% height so bars are visible
                return (
                  <div key={index} className="w-full flex flex-col justify-end items-center group cursor-pointer">
                    <div className="w-full max-w-[40px] bg-slate-100 rounded-t-sm h-full relative overflow-hidden" style={{ backgroundColor: '#F1F5F9' }}>
                      <div 
                        className="absolute bottom-0 w-full rounded-t-sm group-hover:opacity-100 transition-all"
                        style={{ 
                          height: `${barHeight}%`,
                          backgroundColor: isLastMonth ? '#3B82F6' : '#3B82F6',
                          background: isLastMonth ? 'linear-gradient(to top, #3B82F6, #60A5FA)' : undefined,
                          boxShadow: isLastMonth ? '0 4px 12px rgba(59, 130, 246, 0.2)' : undefined,
                          opacity: isLastMonth ? 1 : 0.8
                        }}
                        title={`${item.count} plans in ${item.month}`}
                      ></div>
                    </div>
                    <span className={`text-[10px] font-medium mt-2 ${isLastMonth ? 'font-bold text-accent-blue' : 'text-slate-400'}`} style={{ color: isLastMonth ? '#3B82F6' : '#94A3B8' }}>
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Portfolio Mix Chart */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-soft flex flex-col" style={{ borderColor: '#E2E8F0', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)' }}>
            <div className="mb-4">
              <h3 className="font-semibold text-lg text-primary" style={{ color: '#0F172A' }}>Portfolio Mix</h3>
              <p className="text-xs text-slate-500 mt-1" style={{ color: '#64748B' }}>Active plan distribution</p>
                  </div>
            <div className="flex-grow flex items-center justify-center relative my-4">
              <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" fill="none" r="15.9155" stroke="#e2e8f0" strokeWidth="3.8"></circle>
                <circle 
                  className="drop-shadow-sm" 
                  cx="18" 
                  cy="18" 
                  fill="none" 
                  r="15.9155" 
                  stroke="#3B82F6" 
                  strokeDasharray={`${portfolioMix.loan.percentage * 1.59}, 100`} 
                  strokeWidth="3.8"
                ></circle>
                <circle 
                  cx="18" 
                  cy="18" 
                  fill="none" 
                  r="15.9155" 
                  stroke="#10B981" 
                  strokeDasharray={`${portfolioMix.generic.percentage * 1.59}, 100`} 
                  strokeDashoffset={`-${portfolioMix.loan.percentage * 1.59}`} 
                  strokeWidth="3.8"
                ></circle>
                <circle 
                  cx="18" 
                  cy="18" 
                  fill="none" 
                  r="15.9155" 
                  stroke="#F59E0B" 
                  strokeDasharray={`${portfolioMix.visa.percentage * 1.59}, 100`} 
                  strokeDashoffset={`-${(portfolioMix.loan.percentage + portfolioMix.generic.percentage) * 1.59}`} 
                  strokeWidth="3.8"
                ></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-primary" style={{ color: '#0F172A' }}>{portfolioMix.total}</span>
                <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider" style={{ color: '#94A3B8' }}>Plans</span>
                </div>
              </div>
            <div className="space-y-2 mt-auto">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  <span className="text-slate-600" style={{ color: '#475569' }}>Loan Plans</span>
                </div>
                <span className="font-medium text-primary" style={{ color: '#0F172A' }}>{portfolioMix.loan.percentage}%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                  <span className="text-slate-600" style={{ color: '#475569' }}>Generic</span>
                </div>
                <span className="font-medium text-primary" style={{ color: '#0F172A' }}>{portfolioMix.generic.percentage}%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className="text-slate-600" style={{ color: '#475569' }}>Visa Plans</span>
                </div>
                <span className="font-medium text-primary" style={{ color: '#0F172A' }}>{portfolioMix.visa.percentage}%</span>
              </div>
            </div>
          </div>
        </section>

        {/* Achievement Status Section */}
        <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-soft" style={{ borderColor: '#E2E8F0', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)' }}>
          {/* New Achievements Notification */}
          {newAchievements.length > 0 && (
            <div style={{
              padding: '1rem',
              background: 'linear-gradient(135deg, #F0FDF4 0%, #D1FAE5 100%)',
              border: '2px solid #27AC85',
              borderRadius: '12px',
              marginBottom: '1.5rem',
              animation: 'slideIn 0.3s ease-out',
              boxShadow: '0 4px 12px rgba(39, 172, 133, 0.2)'
            }}>
              <div style={{ 
                fontSize: '0.875rem', 
                fontWeight: '600', 
                color: '#1F8A6A', 
                marginBottom: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Sparkles size={18} />
                New Achievement Unlocked!
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {newAchievements.map((achievement, idx) => {
                  const badge = allBadges.find(b => b.id === achievement.badge_id);
                  return (
                    <div key={idx} style={{ 
                      fontSize: '0.8125rem', 
                      color: '#065F46',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      {badge && <badge.icon size={16} color={badge.color} />}
                      {achievement.badge_name}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex items-center gap-5 w-full md:w-auto md:pr-8 md:border-r border-slate-100" style={{ borderColor: '#F1F5F9' }}>
              <div className="relative w-16 h-16 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle 
                    cx="32" 
                    cy="32" 
                    fill="transparent" 
                    r="28" 
                    stroke="#F1F5F9" 
                    strokeWidth="4"
                  ></circle>
                  <circle 
                    cx="32" 
                    cy="32" 
                    fill="transparent" 
                    r="28" 
                    stroke="#6366F1" 
                    strokeDasharray={`${(achievementProgress / 100) * 175}`}
                    strokeDashoffset={175 - (achievementProgress / 100) * 175}
                    strokeLinecap="round" 
                    strokeWidth="4"
                    style={{ transition: 'stroke-dasharray 0.5s' }}
                  ></circle>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary" style={{ color: '#0F172A' }}>{achievementProgress}%</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-primary" style={{ color: '#0F172A' }}>Achievement Status</h3>
                  <button
                    onClick={handleCheckAchievements}
                    disabled={checkingAchievements}
                    className="text-xs text-accent-blue font-medium hover:underline flex items-center gap-1"
                    style={{ color: '#3B82F6' }}
                    title="Check for new achievements"
                  >
                    {checkingAchievements ? 'Checking...' : <><Sparkles size={12} /> Check</>}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1" style={{ color: '#64748B' }}>
                  {achievements.length} of {allBadges.length} badges earned
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-[150px]" style={{ color: '#64748B' }}>
                  {achievementProgress >= 75 ? 'You are crushing your goals this month!' : achievementProgress >= 50 ? 'Great progress! Keep it up!' : 'Keep building to unlock more achievements!'}
                </p>
              </div>
            </div>
            <div className="flex-grow w-full overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400" style={{ color: '#94A3B8' }}>Recent Badges</span>
              </div>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {recentBadges.map((badge, index) => {
                  const IconComponent = badge.icon;
                  const isEarned = badge.earned || false;
                  const achievement = achievements.find(a => a.badge_id === badge.id);
                  
                  return (
                    <div 
                      key={badge.id || index}
                      className="flex items-center gap-3 min-w-[180px] p-3 rounded-lg border"
                      style={{ 
                        backgroundColor: isEarned ? '#F8FAFC' : '#F8FAFC', 
                        borderColor: isEarned ? badge.color : '#E2E8F0',
                        borderWidth: isEarned ? '2px' : '1px',
                        borderStyle: isEarned ? 'solid' : 'dashed',
                        opacity: isEarned ? 1 : 0.6
                      }}
                    >
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: isEarned ? `${badge.color}20` : '#F1F5F9',
                          color: isEarned ? badge.color : '#94A3B8'
                        }}
                      >
                        <IconComponent size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-primary" style={{ color: '#0F172A' }}>{badge.name}</p>
                        <p className="text-[10px] text-slate-500" style={{ color: '#64748B' }}>
                          {isEarned && achievement?.earned_at 
                            ? new Date(achievement.earned_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                            : 'Next Goal'}
                        </p>
                      </div>
                      {isEarned && (
                        <CheckCircle2 size={16} style={{ color: badge.color }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {error && <div className="error-message bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg" style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA', color: '#B91C1C' }}>{error}</div>}

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
            <p style={{ marginTop: '1rem', color: '#64748B' }}>Loading plans...</p>
          </div>
        )}

        {/* Recent Plans Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <section className="lg:col-span-3 space-y-4">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-primary" style={{ color: '#0F172A' }}>Recent Plans</h2>
              <div className="flex flex-col sm:flex-row w-full xl:w-auto gap-2">
                <div className="relative flex-grow">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                    <Search size={18} className="text-slate-400" style={{ color: '#94A3B8' }} />
                  </span>
            <input 
                    className="pl-9 pr-3 py-1.5 text-sm border-slate-200 rounded-md bg-white focus:ring-primary w-full sm:w-64" 
                    placeholder="Search..." 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ borderColor: '#E2E8F0' }}
            />
          </div>
                <div className="flex gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <button
                    className="flex whitespace-nowrap items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-md text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
                    onClick={() => navigate('companies')}
                    style={{ borderColor: '#E2E8F0', color: '#475569' }}
                  >
                    <Building2 size={18} />
                    <span className="hidden lg:inline">Manage Companies</span>
                    <span className="lg:hidden">Companies</span>
                  </button>
                  <button 
                    className="flex whitespace-nowrap items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-md text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
              onClick={() => {
                if (selectedPlans.length >= 2) {
                  setShowComparison(true);
                } else {
                        alert('Please select at least 2 plans to compare.');
                      }
                    }}
                    style={{ borderColor: '#E2E8F0', color: '#475569' }}
            >
              <GitCompare size={18} />
                    <span className="hidden lg:inline">Compare Plans</span>
                    <span className="lg:hidden">Compare</span>
            </button>
            <button
                    className="flex whitespace-nowrap items-center gap-1 px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-md text-sm font-medium transition-colors"
              onClick={handleCreatePlan}
              data-testid="create-plan-btn"
                    style={{ backgroundColor: '#0F172A' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#1E293B'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#0F172A'}
            >
              <Plus size={18} />
                    <span className="hidden sm:inline">New</span>
            </button>
          </div>
        </div>
          </div>

            {/* Plans Table */}
        {!loading && plans.length === 0 && (
              <div className="bg-white rounded-xl border border-slate-200 text-center p-12" style={{ borderColor: '#E2E8F0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
                <h3 className="mb-2 text-xl font-bold text-primary" style={{ color: '#0F172A' }}>No Plans Yet</h3>
                <p className="text-slate-500 mb-6" style={{ color: '#64748B' }}>Create your first AI-powered business plan</p>
            <button 
              className="btn btn-primary" 
              onClick={handleCreatePlan}
              data-testid="create-first-plan-btn"
            >
              Create Your First Plan
            </button>
          </div>
        )}

        {!loading && plans.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm" style={{ borderColor: '#E2E8F0' }}>
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200" style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}>
                    <tr>
                      <th className="px-6 py-3 font-semibold text-slate-500 w-12" style={{ color: '#64748B' }}></th>
                      <th className="px-6 py-3 font-semibold text-slate-500" style={{ color: '#64748B' }}>Plan Name</th>
                      <th className="px-6 py-3 font-semibold text-slate-500 hidden sm:table-cell" style={{ color: '#64748B' }}>Type</th>
                      <th className="px-6 py-3 font-semibold text-slate-500 hidden md:table-cell" style={{ color: '#64748B' }}>Status</th>
                      <th className="px-6 py-3 font-semibold text-slate-500 text-right" style={{ color: '#64748B' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100" style={{ borderColor: '#F1F5F9' }}>
                    {plans.slice(0, 10).map((plan) => (
                      <tr 
                key={plan.id} 
                        className="hover:bg-slate-50 transition-colors group"
                        style={{ backgroundColor: 'transparent' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedPlans.includes(plan.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      if (e.target.checked) {
                        if (selectedPlans.length < 4) {
                          setSelectedPlans([...selectedPlans, plan.id]);
                        }
                      } else {
                        setSelectedPlans(selectedPlans.filter(id => id !== plan.id));
                      }
                    }}
                    style={{
                      width: '18px',
                      height: '18px',
                              cursor: 'pointer'
                            }}
                          />
                        </td>
                        <td 
                          className="px-6 py-4 cursor-pointer"
                          onClick={() => handleViewPlan(plan)}
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className="p-2 rounded"
                                style={{
                                backgroundColor: plan.plan_purpose === 'loan' ? '#DBEAFE' : plan.plan_purpose === 'generic' ? '#D1FAE5' : '#FEF3C7',
                                color: plan.plan_purpose === 'loan' ? '#2563EB' : plan.plan_purpose === 'generic' ? '#059669' : '#D97706'
                              }}
                            >
                              <FileText size={18} />
                            </div>
                            <div>
                              <p className="font-medium text-primary group-hover:text-accent-blue transition-colors" style={{ color: '#0F172A' }}>
                                {plan.name}
                              </p>
                              <p className="text-xs text-slate-500" style={{ color: '#64748B' }}>
                                Updated {new Date(plan.updated_at || plan.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td 
                          className="px-6 py-4 hidden sm:table-cell cursor-pointer"
                          onClick={() => handleViewPlan(plan)}
                        >
                          <span 
                            className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium uppercase tracking-wide"
                            style={{ backgroundColor: '#F1F5F9', color: '#475569' }}
                          >
                            {plan.plan_purpose === 'loan' ? 'Loan' : plan.plan_purpose === 'generic' ? 'Generic' : plan.plan_purpose?.toUpperCase() || 'Generic'}
                          </span>
                        </td>
                        <td 
                          className="px-6 py-4 hidden md:table-cell cursor-pointer"
                          onClick={() => handleViewPlan(plan)}
                        >
                          <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: plan.status === 'complete' ? '#059669' : plan.status === 'draft' ? '#64748B' : '#0F172A' }}>
                            {plan.status === 'complete' && <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>}
                            {plan.status === 'complete' ? 'Complete' : plan.status === 'draft' ? 'Draft' : 'Generating...'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div 
                            className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                              <button
                              className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-primary transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                handleViewPlan(plan);
                              }}
                              title="Edit"
                              style={{ color: '#94A3B8' }}
                            >
                              <Edit size={18} />
                              </button>
                          <button
                              className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-primary transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                                if (plan.status === 'complete') {
                                  handleExport(plan.id, 'pdf');
                                } else {
                                  setError('Plan must be complete before exporting');
                                }
                              }}
                              disabled={plan.status !== 'complete'}
                              title={plan.status === 'complete' ? 'Download' : 'Plan must be complete'}
                              style={{ color: plan.status === 'complete' ? '#94A3B8' : '#CBD5E1', cursor: plan.status === 'complete' ? 'pointer' : 'not-allowed' }}
                            >
                              <Download size={18} />
                          </button>
                          <button
                              className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-red-500 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePlan(plan.id);
                              }}
                              title="Delete"
                              style={{ color: '#94A3B8' }}
                            >
                              <Trash2 size={18} />
                          </button>
                        </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                    </div>
            )}
          </section>

          {/* Support Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-soft" style={{ borderColor: '#E2E8F0', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)' }}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-sm text-primary flex items-center gap-2" style={{ color: '#0F172A' }}>
                  <HelpCircle size={16} style={{ color: '#94A3B8' }} />
                  Support
                  </h3>
                  <button 
                  className="text-xs text-accent-blue font-medium hover:underline"
                  onClick={async () => {
                    try {
                      const subject = prompt('Enter ticket subject:');
                      if (subject && subject.trim()) {
                        const description = prompt('Enter ticket description:');
                        if (description && description.trim()) {
                          try {
                            const response = await api.tickets.create({
                              subject: subject.trim(),
                              description: description.trim(),
                              priority: 'medium',
                              category: 'general'
                            });
                            const result = await response.json();
                            if (response.ok) {
                              alert('Ticket created successfully!');
                              // Reload tickets
                              try {
                                const ticketsResponse = await api.tickets.list();
                                const ticketsData = await ticketsResponse.json();
                                if (ticketsData && ticketsData.tickets) {
                                  setSupportTickets(ticketsData.tickets.slice(0, 2));
                                }
                              } catch (err) {
                                console.log('Failed to reload tickets:', err);
                              }
                            } else {
                              alert('Failed to create ticket: ' + (result.message || 'Unknown error'));
                            }
                          } catch (err) {
                            alert('Failed to create ticket: ' + (err.message || 'Unknown error'));
                          }
                        }
                      }
                    } catch (err) {
                      console.error('Error creating ticket:', err);
                    }
                  }}
                  style={{ color: '#3B82F6', cursor: 'pointer' }}
                >
                  New Ticket
                  </button>
              </div>
              <div className="space-y-3">
                {supportTickets.length > 0 ? (
                  supportTickets.map((ticket, index) => (
                    <div 
                      key={ticket.id || index}
                      className="p-3 bg-slate-50 rounded-lg border border-slate-100 cursor-pointer hover:border-accent-blue/50 transition-colors"
                    style={{
                        backgroundColor: '#F8FAFC', 
                        borderColor: '#F1F5F9',
                        opacity: ticket.status === 'closed' ? 0.6 : 1
                      }}
                      onClick={async () => {
                        try {
                          if (ticket.id) {
                            try {
                              const response = await api.tickets.get(ticket.id);
                              const ticketDetails = await response.json();
                              if (response.ok && ticketDetails) {
                                alert(`Ticket: ${ticketDetails.subject || ticket.subject}\n\n${ticketDetails.description || ticket.description || 'No description'}\n\nStatus: ${ticketDetails.status || ticket.status || 'Unknown'}`);
                              } else {
                                alert(`Ticket: ${ticket.subject}\n\n${ticket.description || 'No description'}\n\nStatus: ${ticket.status || 'Unknown'}`);
                              }
                            } catch (err) {
                              alert(`Ticket: ${ticket.subject}\n\n${ticket.description || 'No description'}\n\nStatus: ${ticket.status || 'Unknown'}`);
                            }
                          } else {
                            alert(`Ticket: ${ticket.subject}\n\n${ticket.description || 'No description'}\n\nStatus: ${ticket.status || 'Unknown'}`);
                          }
                        } catch (err) {
                          console.error('Error viewing ticket:', err);
                          alert(`Ticket: ${ticket.subject}\n\n${ticket.description || 'No description'}`);
                        }
                      }}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-primary" style={{ color: '#0F172A' }}>{ticket.subject || 'Support Ticket'}</span>
                        <span 
                          className="w-1.5 h-1.5 rounded-full"
                    style={{
                            backgroundColor: ticket.status === 'closed' ? '#10B981' : '#F59E0B'
                          }}
                          title={ticket.status === 'closed' ? 'Resolved' : 'In Progress'}
                        ></span>
                </div>
                      <p className="text-xs text-slate-500 line-clamp-1 mb-2" style={{ color: '#64748B' }}>
                        {ticket.description || 'No description'}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400" style={{ color: '#94A3B8' }}>
                        <span>{ticket.created_at ? new Date(ticket.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recent'}</span>
                        <span>{ticket.status === 'closed' ? 'Closed' : '1 Reply'}</span>
              </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 text-center py-4" style={{ color: '#64748B' }}>No recent tickets</p>
                )}
              </div>
            <button 
                className="w-full mt-3 py-1.5 text-xs font-medium text-slate-500 hover:text-primary border border-dashed border-slate-200 rounded transition-colors"
                onClick={async () => {
                  try {
                    const response = await api.tickets.list();
                    const ticketsData = await response.json();
                    if (response.ok && ticketsData && ticketsData.tickets && ticketsData.tickets.length > 0) {
                      const ticketsList = ticketsData.tickets.map(t => 
                        `• ${t.subject || 'Untitled'} (${t.status || 'Unknown'})`
                      ).join('\n');
                      alert(`All Tickets (${ticketsData.tickets.length}):\n\n${ticketsList}`);
                    } else {
                      alert('No tickets found.');
                    }
                  } catch (err) {
                    console.error('Error loading tickets:', err);
                    alert('Failed to load tickets. Please try again later.');
                  }
                }}
                style={{ borderColor: '#E2E8F0', color: '#64748B', cursor: 'pointer' }}
              >
                View All Tickets
              </button>
            </div>
            <div className="bg-gradient-to-br from-primary to-slate-800 rounded-xl p-4 text-white shadow-soft relative overflow-hidden" style={{ background: 'linear-gradient(to bottom right, #0F172A, #1E293B)' }}>
              <div className="relative z-10">
                <h3 className="font-bold text-sm mb-1">Need Help?</h3>
                <p className="text-xs text-slate-300 mb-3" style={{ color: '#CBD5E1' }}>Check our knowledge base for quick answers.</p>
                <a 
                  className="inline-flex items-center gap-1 text-xs font-bold text-white hover:text-accent-blue transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('faq');
                  }}
                  style={{ color: 'white' }}
                >
                  Visit Help Center <ArrowRight size={14} />
                </a>
              </div>
              <HelpCircle 
                size={64} 
                className="absolute -bottom-4 -right-4 text-white opacity-5 pointer-events-none"
                style={{ opacity: 0.05 }}
              />
          </div>
          </aside>
        </div>

      </main>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 20, 25, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => !upgrading && setShowUpgradeModal(false)}
        >
          <div 
            className="card" 
            style={{ maxWidth: '1200px', width: '90%', padding: '2rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: '1rem', textAlign: 'center', fontSize: '1.75rem' }}>Choose Your Plan</h3>
            <p style={{ color: '#6B7A91', marginBottom: '2rem', textAlign: 'center', fontSize: '1rem' }}>
              {subscription?.tier === 'free' ? 'Unlock PDF exports and advanced features' : 'Upgrade to unlock more features'}
            </p>
            
            {/* Plans Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '1.5rem',
              marginBottom: '1.5rem'
            }}>
            {/* Free Plan */}
            <div className="card" style={{ 
              background: subscription?.tier === 'free' ? 'linear-gradient(135deg, #E6EBF0 0%, #E8F5F1 100%)' : 'var(--bg-secondary)', 
              borderLeft: subscription?.tier === 'free' ? '4px solid #001639' : '4px solid #E4E9EF',
              opacity: subscription?.tier === 'free' ? 1 : 0.8,
              display: 'flex',
              flexDirection: 'column',
              height: '100%'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div>
                  <h4 style={{ marginBottom: '0.5rem' }}>
                    Free Plan
                    {subscription?.tier === 'free' && <span style={{ fontSize: '0.75rem', background: '#001639', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', marginLeft: '0.5rem' }}>CURRENT</span>}
                  </h4>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#001639' }}>£0<span style={{ fontSize: '1rem', fontWeight: '400', color: '#6B7A91' }}>/month</span></div>
                </div>
              </div>
              <ul style={{ color: '#4A5568', marginLeft: '1.5rem', marginBottom: '1rem', flexGrow: 1 }}>
                <li style={{ marginBottom: '0.5rem' }}>1 plan per month</li>
                <li style={{ marginBottom: '0.5rem' }}>Basic AI generation</li>
                <li style={{ marginBottom: '0.5rem' }}>Preview only</li>
                <li style={{ marginBottom: '0.5rem' }}>No exports</li>
              </ul>
              {subscription?.tier === 'free' ? (
                <button 
                  className="btn btn-secondary" 
                  style={{ width: '100%', marginTop: 'auto' }}
                  disabled
                >
                  Current Plan
                </button>
              ) : (
                <button 
                  className="btn btn-ghost" 
                  style={{ width: '100%', marginTop: 'auto' }}
                  disabled
                  title="Downgrade not available"
                >
                  Downgrade (Contact Support)
                </button>
              )}
            </div>
            
            {/* Starter Plan */}
            <div className="card" style={{ 
              background: subscription?.tier === 'starter' ? 'linear-gradient(135deg, #E6EBF0 0%, #E8F5F1 100%)' : 'var(--bg-secondary)', 
              borderLeft: subscription?.tier === 'starter' ? '4px solid #001639' : '4px solid #001639',
              opacity: subscription?.tier === 'starter' ? 1 : 1,
              display: 'flex',
              flexDirection: 'column',
              height: '100%'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div>
                  <h4 style={{ marginBottom: '0.5rem' }}>
                    Starter Plan
                    {subscription?.tier === 'starter' && <span style={{ fontSize: '0.75rem', background: '#001639', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', marginLeft: '0.5rem' }}>CURRENT</span>}
                  </h4>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#001639' }}>£12<span style={{ fontSize: '1rem', fontWeight: '400', color: '#6B7A91' }}>/month</span></div>
                </div>
              </div>
              <ul style={{ color: '#4A5568', marginLeft: '1.5rem', marginBottom: '1rem', flexGrow: 1 }}>
                <li style={{ marginBottom: '0.5rem' }}>3 plans per month</li>
                <li style={{ marginBottom: '0.5rem' }}>Full AI generation</li>
                <li style={{ marginBottom: '0.5rem' }}>PDF export</li>
                <li style={{ marginBottom: '0.5rem' }}>SWOT & competitor analysis</li>
              </ul>
              {subscription?.tier === 'starter' ? (
                <button 
                  className="btn btn-secondary" 
                  style={{ width: '100%', marginTop: 'auto' }}
                  disabled
                >
                  Current Plan
                </button>
              ) : (
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', marginTop: 'auto' }}
                  onClick={() => handleUpgrade('starter')}
                  disabled={upgrading || subscription?.tier === 'professional'}
                  data-testid="upgrade-starter-btn"
                >
                  {upgrading ? 'Redirecting to checkout...' : subscription?.tier === 'professional' ? 'Downgrade (Contact Support)' : 'Choose Starter'}
                </button>
              )}
            </div>

            {/* Professional Plan */}
            <div className="card" style={{ 
              background: subscription?.tier === 'professional' ? 'linear-gradient(135deg, #E6EBF0 0%, #E8F5F1 100%)' : 'linear-gradient(135deg, #E6EBF0 0%, #E8F5F1 100%)', 
              borderLeft: '4px solid #27AC85',
              display: 'flex',
              flexDirection: 'column',
              height: '100%'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div>
                  <h4 style={{ marginBottom: '0.5rem' }}>
                    Professional Plan 
                    {subscription?.tier === 'professional' ? (
                      <span style={{ fontSize: '0.75rem', background: '#27AC85', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', marginLeft: '0.5rem' }}>CURRENT</span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', background: '#27AC85', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', marginLeft: '0.5rem' }}>POPULAR</span>
                    )}
                  </h4>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#27AC85' }}>£29<span style={{ fontSize: '1rem', fontWeight: '400', color: '#6B7A91' }}>/month</span></div>
                </div>
              </div>
              <ul style={{ color: '#4A5568', marginLeft: '1.5rem', marginBottom: '1rem', flexGrow: 1 }}>
                <li style={{ marginBottom: '0.5rem' }}><strong>Unlimited plans</strong></li>
                <li style={{ marginBottom: '0.5rem' }}>All export formats (PDF, DOCX)</li>
                <li style={{ marginBottom: '0.5rem' }}>Financial projections & charts</li>
                <li style={{ marginBottom: '0.5rem' }}>Compliance checking</li>
                <li style={{ marginBottom: '0.5rem' }}>Pitch deck generator</li>
              </ul>
              {subscription?.tier === 'professional' ? (
                <button 
                  className="btn btn-secondary" 
                  style={{ width: '100%', background: '#27AC85', marginTop: 'auto' }}
                  disabled
                >
                  Current Plan
                </button>
              ) : (
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', background: '#27AC85', marginTop: 'auto' }}
                  onClick={() => handleUpgrade('professional')}
                  disabled={upgrading}
                  data-testid="upgrade-professional-btn"
                >
                  {upgrading ? 'Redirecting to checkout...' : 'Choose Professional'}
                </button>
              )}
            </div>
            </div>

            {/* Cancel Button */}
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <button 
                className="btn btn-ghost" 
                onClick={() => setShowUpgradeModal(false)}
                disabled={upgrading}
                data-testid="close-modal-btn"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-8" style={{ borderColor: '#E2E8F0' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500" style={{ color: '#64748B' }}>© 2025 Strattio. All rights reserved.</p>
          <div className="flex gap-6 text-xs text-slate-500" style={{ color: '#64748B' }}>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); navigate('privacy'); }}
              className="hover:text-primary transition-colors"
              style={{ color: '#64748B' }}
              onMouseEnter={(e) => e.target.style.color = '#0F172A'}
              onMouseLeave={(e) => e.target.style.color = '#64748B'}
            >
              Privacy
            </a>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); navigate('terms'); }}
              className="hover:text-primary transition-colors"
              style={{ color: '#64748B' }}
              onMouseEnter={(e) => e.target.style.color = '#0F172A'}
              onMouseLeave={(e) => e.target.style.color = '#64748B'}
            >
              Terms
            </a>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); navigate('contact'); }}
              className="hover:text-primary transition-colors"
              style={{ color: '#64748B' }}
              onMouseEnter={(e) => e.target.style.color = '#0F172A'}
              onMouseLeave={(e) => e.target.style.color = '#64748B'}
            >
              Contact
            </a>
      </div>
      </div>
      </footer>

      {/* Plan Comparison Modal */}
      {showComparison && selectedPlans.length >= 2 && (
        <PlanComparison
          planIds={selectedPlans}
          onClose={() => {
            setShowComparison(false);
            setSelectedPlans([]);
          }}
        />
      )}
    </div>
  );
}

export default DashboardPage;
