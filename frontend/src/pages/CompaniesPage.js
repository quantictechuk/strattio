import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Building2, Plus, Edit2, Trash2, Check, X, MapPin, Briefcase, ArrowLeft } from 'lucide-react';
import Footer from '../components/Footer';

function CompaniesPage({ navigate, user }) {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [formData, setFormData] = useState({
    business_name: '',
    industry: '',
    location_country: 'GB',
    location_city: '',
    business_description: '',
    unique_value_proposition: '',
    target_customers: '',
    revenue_model: ['product_sales'],
    starting_capital: 50000,
    currency: 'GBP',
    monthly_revenue_estimate: 15000,
    price_per_unit: 10,
    units_per_month: 1500,
    team_size: 3,
    operating_expenses: {
      salaries: 6000,
      software_tools: 200,
      hosting_domain: 50,
      marketing: 1000,
      workspace_utilities: 1500,
      miscellaneous: 500,
      custom: []
    }
  });

  const INDUSTRIES = [
    { value: 'food_beverage_cafe', label: 'Café / Coffee Shop' },
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'saas', label: 'SaaS / Software' },
    { value: 'information_technology', label: 'Information Technology' },
    { value: 'ecommerce', label: 'E-commerce / Online Retail' },
    { value: 'consulting', label: 'Consulting Services' },
    { value: 'healthcare', label: 'Healthcare Services' },
    { value: 'education', label: 'Education / Training' },
    { value: 'construction', label: 'Construction' },
    { value: 'real_estate', label: 'Real Estate' },
    { value: 'marketing', label: 'Marketing Agency' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const response = await api.companies.list();
      setCompanies(response.companies || []);
    } catch (err) {
      setError(err.message || 'Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCompany(null);
    setFormData({
      business_name: '',
      industry: '',
      location_country: 'GB',
      location_city: '',
      business_description: '',
      unique_value_proposition: '',
      target_customers: '',
      revenue_model: ['product_sales'],
      starting_capital: 50000,
      currency: 'GBP',
      monthly_revenue_estimate: 15000,
      price_per_unit: 10,
      units_per_month: 1500,
      team_size: 3,
      operating_expenses: {
        salaries: 6000,
        software_tools: 200,
        hosting_domain: 50,
        marketing: 1000,
        workspace_utilities: 1500,
        miscellaneous: 500,
        custom: []
      }
    });
    setShowForm(true);
  };

  const handleEdit = (company) => {
    setEditingCompany(company);
    setFormData({
      business_name: company.business_name || '',
      industry: company.industry || '',
      location_country: company.location_country || 'GB',
      location_city: company.location_city || '',
      business_description: company.business_description || '',
      unique_value_proposition: company.unique_value_proposition || '',
      target_customers: company.target_customers || '',
      revenue_model: company.revenue_model || ['product_sales'],
      starting_capital: company.starting_capital || 50000,
      currency: company.currency || 'GBP',
      monthly_revenue_estimate: company.monthly_revenue_estimate || 15000,
      price_per_unit: company.price_per_unit || 10,
      units_per_month: company.units_per_month || 1500,
      team_size: company.team_size || 3,
      operating_expenses: company.operating_expenses || {
        salaries: 6000,
        software_tools: 200,
        hosting_domain: 50,
        marketing: 1000,
        workspace_utilities: 1500,
        miscellaneous: 500,
        custom: []
      }
    });
    setShowForm(true);
  };

  const handleDelete = async (companyId) => {
    if (!window.confirm('Are you sure you want to delete this company? This will not affect existing plans.')) {
      return;
    }

    try {
      await api.companies.delete(companyId);
      setCompanies(companies.filter(c => c.id !== companyId));
    } catch (err) {
      setError(err.message || 'Failed to delete company');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingCompany) {
        await api.companies.update(editingCompany.id, formData);
      } else {
        await api.companies.create(formData);
      }
      setShowForm(false);
      setEditingCompany(null);
      loadCompanies();
    } catch (err) {
      console.error('Error saving company:', err);
      // Provide more detailed error message
      const errorMessage = err.message || 'Failed to save company';
      if (errorMessage.includes('not found') || errorMessage.includes('404')) {
        setError('Company endpoint not found. Please ensure the backend server is running and has been restarted after adding the companies feature.');
      } else {
        setError(errorMessage);
      }
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleOpexChange = (category, value) => {
    setFormData(prev => ({
      ...prev,
      operating_expenses: {
        ...prev.operating_expenses,
        [category]: parseFloat(value) || 0
      }
    }));
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>
      {/* Navigation Header */}
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
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('home')}>
            <img 
              src="/logo.png" 
              alt="Strattio" 
              style={{ height: '36px', width: 'auto' }}
            />
          </div>
          <nav style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); navigate('home'); }}
              style={{ 
                color: '#2D3748', 
                textDecoration: 'none', 
                fontSize: '0.9375rem', 
                fontWeight: '500',
                letterSpacing: '-0.01em',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = '#001639'}
              onMouseLeave={(e) => e.target.style.color = '#2D3748'}
            >
              Home
            </a>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); navigate('features'); }}
              style={{ 
                color: '#2D3748', 
                textDecoration: 'none', 
                fontSize: '0.9375rem', 
                fontWeight: '500',
                letterSpacing: '-0.01em',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = '#001639'}
              onMouseLeave={(e) => e.target.style.color = '#2D3748'}
            >
              Features
            </a>
            <a 
              href="#" 
              onClick={(e) => { 
                e.preventDefault(); 
                navigate('home');
                setTimeout(() => {
                  const pricingSection = document.getElementById('pricing');
                  if (pricingSection) {
                    pricingSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }, 100);
              }}
              style={{ 
                color: '#2D3748', 
                textDecoration: 'none', 
                fontSize: '0.9375rem', 
                fontWeight: '500',
                letterSpacing: '-0.01em',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = '#001639'}
              onMouseLeave={(e) => e.target.style.color = '#2D3748'}
            >
              Pricing
            </a>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); navigate('faq'); }}
              style={{ 
                color: '#2D3748', 
                textDecoration: 'none', 
                fontSize: '0.9375rem', 
                fontWeight: '500',
                letterSpacing: '-0.01em',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = '#001639'}
              onMouseLeave={(e) => e.target.style.color = '#2D3748'}
            >
              FAQ
            </a>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); navigate('contact'); }}
              style={{ 
                color: '#2D3748', 
                textDecoration: 'none', 
                fontSize: '0.9375rem', 
                fontWeight: '500',
                letterSpacing: '-0.01em',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = '#001639'}
              onMouseLeave={(e) => e.target.style.color = '#2D3748'}
            >
              Contact
            </a>
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {user ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginRight: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0F172A' }}>
                    Welcome, {user.name || user.email?.split('@')[0] || 'User'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    {user.email}
                  </span>
                </div>
                <button
                  className="btn btn-secondary"
                  onClick={() => navigate('dashboard')}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  Dashboard
                </button>
              </>
            ) : (
              <>
                <button
                  className="btn btn-ghost"
                  onClick={() => navigate('login')}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  Sign In
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate('register')}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  Get Started for Free
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Page Header */}
      <div style={{ 
        background: 'white',
        borderBottom: '1px solid #E2E8F0',
        padding: '2rem 0'
      }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <button
              onClick={() => navigate('dashboard')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'none',
                border: 'none',
                color: '#64748B',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                padding: '0.5rem 0',
                marginBottom: '1rem',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = '#001639'}
              onMouseLeave={(e) => e.target.style.color = '#64748B'}
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#0F172A', marginBottom: '0.5rem' }}>
                My Companies
              </h1>
              <p style={{ color: '#64748B', fontSize: '1rem' }}>
                Manage your company profiles and reuse them when creating business plans
              </p>
            </div>
            <button
              className="btn btn-primary"
              onClick={handleCreate}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
            >
              <Plus size={18} />
              Add Company
            </button>
          </div>
        </div>
      </div>

      <main style={{ flex: 1, padding: '2rem 0' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
          {error && (
            <div style={{
              background: '#FEE2E2',
              border: '1px solid #EF4444',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem',
              color: '#DC2626'
            }}>
              {error}
            </div>
          )}

          {showForm ? (
            <div className="card" style={{ marginBottom: '2rem', maxWidth: '800px', margin: '0 auto 2rem auto' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start', 
                marginBottom: '1.5rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid #E2E8F0'
              }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0F172A', marginBottom: '0.25rem' }}>
                    {editingCompany ? 'Edit Company' : 'Add New Company'}
                  </h2>
                  <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
                    {editingCompany ? 'Update your company information' : 'Fill in the details to create a new company profile'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingCompany(null);
                    setError('');
                  }}
                  style={{
                    background: '#F1F5F9',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748B',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#E2E8F0';
                    e.target.style.color = '#475569';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#F1F5F9';
                    e.target.style.color = '#64748B';
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Business Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.business_name}
                      onChange={(e) => handleChange('business_name', e.target.value)}
                      required
                      placeholder="e.g., Sarah's Coffee House"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Industry *</label>
                    <select
                      className="form-select"
                      value={formData.industry}
                      onChange={(e) => handleChange('industry', e.target.value)}
                      required
                    >
                      <option value="">Select an industry</option>
                      {INDUSTRIES.map(ind => (
                        <option key={ind.value} value={ind.value}>{ind.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Location Country</label>
                    <select
                      className="form-select"
                      value={formData.location_country}
                      onChange={(e) => handleChange('location_country', e.target.value)}
                    >
                      <option value="GB">United Kingdom</option>
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="AU">Australia</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">City/Location *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.location_city}
                      onChange={(e) => handleChange('location_city', e.target.value)}
                      required
                      placeholder="e.g., London"
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Business Description *</label>
                  <textarea
                    className="form-input"
                    value={formData.business_description}
                    onChange={(e) => handleChange('business_description', e.target.value)}
                    required
                    rows="3"
                    placeholder="What does your business do?"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Unique Value Proposition</label>
                  <textarea
                    className="form-input"
                    value={formData.unique_value_proposition}
                    onChange={(e) => handleChange('unique_value_proposition', e.target.value)}
                    rows="2"
                    placeholder="What makes your business different?"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Target Customers</label>
                  <textarea
                    className="form-input"
                    value={formData.target_customers}
                    onChange={(e) => handleChange('target_customers', e.target.value)}
                    rows="2"
                    placeholder="Describe your ideal customers"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Starting Capital (£)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.starting_capital}
                      onChange={(e) => handleChange('starting_capital', parseFloat(e.target.value) || 0)}
                      min="0"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Monthly Revenue Estimate (£)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.monthly_revenue_estimate}
                      onChange={(e) => handleChange('monthly_revenue_estimate', parseFloat(e.target.value) || 0)}
                      min="0"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Team Size</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.team_size}
                      onChange={(e) => handleChange('team_size', parseInt(e.target.value) || 1)}
                      min="1"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowForm(false);
                      setEditingCompany(null);
                      setError('');
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <Check size={18} />
                    {editingCompany ? 'Update Company' : 'Save Company'}
                  </button>
                </div>
              </form>
            </div>
          ) : null}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
              <p style={{ marginTop: '1rem', color: '#64748B' }}>Loading companies...</p>
            </div>
          ) : companies.length === 0 ? (
            <div style={{
              background: 'white',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              textAlign: 'center',
              padding: '3rem'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏢</div>
              <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: '700', color: '#0F172A' }}>
                No Companies Yet
              </h3>
              <p style={{ color: '#64748B', marginBottom: '1.5rem' }}>
                Create a company profile to reuse business information when creating plans
              </p>
              <button 
                className="btn btn-primary" 
                onClick={handleCreate}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Plus size={18} />
                Add Your First Company
              </button>
            </div>
          ) : (
            <div className="companies-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1.5rem'
            }}>
              {companies.map((company) => (
                <div
                  key={company.id}
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.borderColor = '#CBD5E1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = '#E2E8F0';
                  }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '8px',
                    background: 'rgba(0, 22, 57, 0.06)',
                    color: '#001639',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem'
                  }}>
                    <Building2 size={24} />
                  </div>

                  <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: '700',
                    color: '#0F172A',
                    marginBottom: '0.5rem'
                  }}>
                    {company.business_name}
                  </h3>

                  <div style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {company.industry && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Briefcase size={14} style={{ color: '#94A3B8' }} />
                        <span>{INDUSTRIES.find(i => i.value === company.industry)?.label}</span>
                      </div>
                    )}
                    {company.location_city && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MapPin size={14} style={{ color: '#94A3B8' }} />
                        <span>{company.location_city}</span>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleEdit(company)}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(company.id)}
                      style={{
                        padding: '0.5rem',
                        background: '#FEE2E2',
                        border: '1px solid #EF4444',
                        borderRadius: '8px',
                        color: '#DC2626',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#FECACA';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = '#FEE2E2';
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer navigate={navigate} user={user} />
    </div>
  );
}

export default CompaniesPage;
