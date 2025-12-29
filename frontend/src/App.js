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

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const [planId, setPlanId] = useState(null);

  const handleRouteChange = () => {
    const path = window.location.pathname;
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
      '/subscription/success': 'subscription-success',
      '/subscription/cancel': 'subscription-cancel'
    };
    
    // Check URL path first
    if (pathToPage[path]) {
      setCurrentPage(pathToPage[path]);
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
          setCurrentPage('dashboard');
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
    
    // Handle initial route
    handleRouteChange();
    
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
    navigate('dashboard');
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
      default:
        return <HomePage navigate={navigate} user={user} />;
    }
  };

  return (
    <div className="App">
      {renderPage()}
    </div>
  );
}

export default App;
