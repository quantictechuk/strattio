import React, { useState, useEffect } from 'react';
import './App.css';
import { authService, api } from './lib/api';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import IntakeWizardPage from './pages/IntakeWizardPage';
import PlanEditorPage from './pages/PlanEditorPage';
import FinancialsPage from './pages/FinancialsPage';
import FeaturesPage from './pages/FeaturesPage';
import FAQPage from './pages/FAQPage';
import ContactPage from './pages/ContactPage';
import CompaniesPage from './pages/CompaniesPage';
import SubscriptionSuccessPage from './pages/SubscriptionSuccessPage';
import SubscriptionCancelPage from './pages/SubscriptionCancelPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import AboutUsPage from './pages/AboutUsPage';
import SettingsPage from './pages/SettingsPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import SharedPlanPage from './pages/SharedPlanPage';
import BackToTop from './components/BackToTop';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  // Initialize user from localStorage on mount
  const [user, setUser] = useState(() => {
    const storedUser = authService.getUser();
    return storedUser || null;
  });
  const [planId, setPlanId] = useState(null);

  const handleRouteChange = async () => {
    const path = window.location.pathname;
    // Check for shared plan route first
    const sharedMatch = path.match(/^\/shared\/([^/]+)$/);
    if (sharedMatch) {
      const shareToken = sharedMatch[1];
      setCurrentPage('shared-plan');
      setPlanId(shareToken);
      return;
    }
    
    const pathToPage = {
      '/faq': 'faq',
      '/privacy': 'privacy',
      '/terms': 'terms',
      '/about': 'about',
      '/contact': 'contact',
      '/features': 'features',
      '/login': 'login',
      '/register': 'register',
      '/dashboard': 'dashboard',
      '/settings': 'settings',
      '/backoffice/login': 'admin-login',
      '/backoffice': 'admin-dashboard',
      '/backoffice/dashboard': 'admin-dashboard',
      '/subscription/success': 'subscription-success',
      '/subscription/cancel': 'subscription-cancel'
    };
    
    // Check URL path first
    if (pathToPage[path]) {
      const page = pathToPage[path];
      setCurrentPage(page);
      
      // For protected routes, restore user state from storage or fetch from API
      if (page === 'admin-dashboard' || page === 'dashboard' || page === 'settings') {
        const token = authService.getToken();
        const storedUser = authService.getUser();
        
        if (token) {
          // If we have a token but no user in state, try to restore
          if (!user && storedUser) {
            setUser(storedUser);
          } else if (!user && !storedUser) {
            // Fetch user from API
            try {
              const userData = await api.auth.me();
              authService.setUser(userData);
              setUser(userData);
              
              // For admin dashboard, verify admin role
              if (page === 'admin-dashboard' && userData.role !== 'admin') {
                setUser(null);
                setCurrentPage('admin-login');
              }
            } catch (e) {
              console.error('Error fetching user data:', e);
              if (page === 'admin-dashboard') {
                setCurrentPage('admin-login');
              } else {
                setCurrentPage('login');
              }
            }
          } else if (user && page === 'admin-dashboard' && user.role !== 'admin') {
            // User exists but not admin, verify with API
            try {
              const userData = await api.auth.me();
              if (userData.role === 'admin') {
                authService.setUser(userData);
                setUser(userData);
              } else {
                setUser(null);
                setCurrentPage('admin-login');
              }
            } catch (e) {
              console.error('Error verifying admin access:', e);
              setUser(null);
              setCurrentPage('admin-login');
            }
          }
        } else {
          // No token, redirect to login
          if (page === 'admin-dashboard') {
            setCurrentPage('admin-login');
          } else {
            setCurrentPage('login');
          }
        }
      }
    } else if (path.includes('/subscription/success')) {
      setCurrentPage('subscription-success');
    } else if (path.includes('/subscription/cancel')) {
      setCurrentPage('subscription-cancel');
    } else if (path === '/' || path === '') {
      // Check if user is logged in
      const storedUser = authService.getUser();
      if (storedUser) {
        setUser(storedUser);
        setCurrentPage('dashboard');
      } else {
        setCurrentPage('home');
      }
    }
  };

  useEffect(() => {
    // Handle Google OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const refresh = urlParams.get('refresh');
    
    if (token && refresh) {
      // Store tokens
      authService.setTokens(token, refresh);
      
      // Fetch full user data from backend (includes name, email, etc.)
      const fetchUserData = async () => {
        try {
          const userData = await api.auth.me();
          authService.setUser(userData);
          setUser(userData);
          
          // Clear URL params
          window.history.replaceState({}, '', window.location.pathname);
          
          // Navigate to dashboard
          if (userData.role === 'admin') {
            setCurrentPage('admin-dashboard');
          } else {
            setCurrentPage('dashboard');
          }
        } catch (e) {
          console.error('Error fetching user data:', e);
          // Fallback: use token payload if API call fails
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const userData = { id: payload.sub, email: payload.email || '' };
            authService.setUser(userData);
            setUser(userData);
            setCurrentPage('dashboard');
          } catch (parseError) {
            console.error('Error parsing token:', parseError);
          }
        }
      };
      
      fetchUserData();
      return;
    }
    
    // Handle initial route - restore user state first if needed
    const restoreUserAndRoute = async () => {
      const path = window.location.pathname;
      const isAdminRoute = path === '/backoffice' || path === '/backoffice/dashboard';
      const isProtectedRoute = isAdminRoute || path === '/dashboard' || path === '/settings';
      
      if (isProtectedRoute) {
        const token = authService.getToken();
        if (token) {
          const storedUser = authService.getUser();
          if (storedUser) {
            setUser(storedUser);
            // For admin routes, verify user is still admin
            if (isAdminRoute && storedUser.role !== 'admin') {
              try {
                const userData = await api.auth.me();
                if (userData.role === 'admin') {
                  authService.setUser(userData);
                  setUser(userData);
                } else {
                  setUser(null);
                  setCurrentPage('admin-login');
                  return;
                }
              } catch (e) {
                console.error('Error verifying admin access:', e);
                setUser(null);
                setCurrentPage('admin-login');
                return;
              }
            }
          } else {
            // No stored user, fetch from API
            try {
              const userData = await api.auth.me();
              authService.setUser(userData);
              setUser(userData);
              if (isAdminRoute && userData.role !== 'admin') {
                setUser(null);
                setCurrentPage('admin-login');
                return;
              }
            } catch (e) {
              console.error('Error fetching user data:', e);
              if (isAdminRoute) {
                setCurrentPage('admin-login');
              } else {
                setCurrentPage('login');
              }
              return;
            }
          }
        } else {
          // No token, redirect to login
          if (isAdminRoute) {
            setCurrentPage('admin-login');
            return;
          } else {
            setCurrentPage('login');
            return;
          }
        }
      }
      
      // Now handle the route change
      await handleRouteChange();
    };
    
    restoreUserAndRoute();
    
    // Handle browser back/forward buttons
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  const navigate = (page, data = {}) => {
    setCurrentPage(page);
    if (data.planId) setPlanId(data.planId);
    
    // Update URL based on page
    const pageToPath = {
      'home': '/',
      'faq': '/faq',
      'privacy': '/privacy',
      'terms': '/terms',
      'about': '/about',
      'contact': '/contact',
      'features': '/features',
      'login': '/login',
      'register': '/register',
      'dashboard': '/dashboard',
      'settings': '/settings',
      'admin-login': '/backoffice/login',
      'admin-dashboard': '/backoffice/dashboard',
      'subscription-success': '/subscription/success',
      'subscription-cancel': '/subscription/cancel'
    };
    
    const path = pageToPath[page];
    if (path) {
      if (page === 'subscription-success') {
        window.history.pushState({}, '', path + window.location.search);
      } else {
        window.history.pushState({}, '', path);
      }
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    authService.setUser(userData);
    // Navigate to appropriate dashboard based on user role
    if (userData.role === 'admin') {
      navigate('admin-dashboard');
    } else {
      navigate('dashboard');
    }
  };

  const handleLogout = () => {
    authService.clearTokens();
    setUser(null);
    navigate('home');
  };

  // Simple routing
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage navigate={navigate} user={user} />;
      case 'login':
        return <LoginPage navigate={navigate} onLogin={handleLogin} user={user} />;
      case 'register':
        return <RegisterPage navigate={navigate} onLogin={handleLogin} user={user} />;
      case 'dashboard':
        return <DashboardPage navigate={navigate} user={user} onLogout={handleLogout} />;
      case 'intake-wizard':
        return <IntakeWizardPage navigate={navigate} user={user} planId={planId} />;
      case 'plan-editor':
        return <PlanEditorPage navigate={navigate} user={user} planId={planId} />;
      case 'financials':
        return <FinancialsPage navigate={navigate} user={user} planId={planId} />;
      case 'features':
        return <FeaturesPage navigate={navigate} user={user} />;
      case 'faq':
        return <FAQPage navigate={navigate} user={user} />;
      case 'contact':
        return <ContactPage navigate={navigate} user={user} />;
      case 'companies':
        return <CompaniesPage navigate={navigate} user={user} />;
      case 'subscription-success':
        return <SubscriptionSuccessPage navigate={navigate} user={user} />;
      case 'subscription-cancel':
        return <SubscriptionCancelPage navigate={navigate} />;
      case 'privacy':
        return <PrivacyPolicyPage navigate={navigate} user={user} />;
      case 'terms':
        return <TermsOfServicePage navigate={navigate} user={user} />;
      case 'about':
        return <AboutUsPage navigate={navigate} user={user} />;
      case 'settings':
        return <SettingsPage navigate={navigate} user={user} onLogout={handleLogout} />;
      case 'admin-login':
        return <AdminLoginPage navigate={navigate} onLogin={handleLogin} />;
      case 'admin-dashboard':
        return <AdminDashboardPage navigate={navigate} user={user} onLogout={handleLogout} />;
      case 'shared-plan':
        return <SharedPlanPage navigate={navigate} shareToken={planId} />;
      default:
        return <HomePage navigate={navigate} user={user} />;
    }
  };

  return (
    <div className="App">
      {renderPage()}
      <BackToTop />
    </div>
  );
}

export default App;
// Auto-deploy test Tue Dec 30 00:14:19 GMT 2025
