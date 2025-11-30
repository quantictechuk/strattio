import React, { useState, useEffect } from 'react';
import './App.css';
import { authService } from './lib/api';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import IntakeWizardPage from './pages/IntakeWizardPage';
import PlanEditorPage from './pages/PlanEditorPage';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const [planId, setPlanId] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = authService.getUser();
    if (storedUser) {
      setUser(storedUser);
      setCurrentPage('dashboard');
    }
  }, []);

  const navigate = (page, data = {}) => {
    setCurrentPage(page);
    if (data.planId) setPlanId(data.planId);
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
        return <LoginPage navigate={navigate} onLogin={handleLogin} />;
      case 'register':
        return <RegisterPage navigate={navigate} onLogin={handleLogin} />;
      case 'dashboard':
        return <DashboardPage navigate={navigate} user={user} onLogout={handleLogout} />;
      case 'intake-wizard':
        return <IntakeWizardPage navigate={navigate} user={user} planId={planId} />;
      case 'plan-editor':
        return <PlanEditorPage navigate={navigate} user={user} planId={planId} />;
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
