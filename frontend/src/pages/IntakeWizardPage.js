import React, { useState } from 'react';
import { api } from '../lib/api';

const INDUSTRIES = [
  { value: 'food_beverage_cafe', label: 'Café / Coffee Shop' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'saas', label: 'SaaS / Software' },
  { value: 'ecommerce', label: 'E-commerce / Online Retail' },
  { value: 'consulting', label: 'Consulting Services' },
  { value: 'healthcare', label: 'Healthcare Services' },
  { value: 'education', label: 'Education / Training' },
  { value: 'construction', label: 'Construction' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'marketing', label: 'Marketing Agency' },
  { value: 'other', label: 'Other' }
];

const PLAN_PURPOSES = [
  { value: 'generic', label: 'General Business Plan' },
  { value: 'loan', label: 'UK Start-Up Loan Application' },
  { value: 'visa_startup', label: 'UK Start-Up Visa' },
  { value: 'visa_innovator', label: 'UK Innovator Founder Visa' },
  { value: 'investor', label: 'Investor Pitch / Fundraising' }
];

function IntakeWizardPage({ navigate, user, planId }) {
  const [currentStep, setCurrentStep] = useState(0);
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
    plan_purpose: 'generic',
    // User-defined operating expenses (monthly)
    operating_expenses: {
      salaries: 6000,
      software_tools: 200,
      hosting_domain: 50,
      marketing: 1000,
      workspace_utilities: 1500,
      miscellaneous: 500,
      custom: []  // Array of {name: string, amount: number}
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const steps = [
    { id: 'purpose', title: 'Plan Purpose', fields: ['plan_purpose'] },
    { id: 'basics', title: 'Business Basics', fields: ['business_name', 'industry', 'location_city'] },
    { id: 'description', title: 'Business Description', fields: ['business_description', 'unique_value_proposition'] },
    { id: 'market', title: 'Target Market', fields: ['target_customers'] },
    { id: 'financials', title: 'Revenue Details', fields: ['starting_capital', 'monthly_revenue_estimate', 'price_per_unit', 'team_size'] },
    { id: 'operating_expenses', title: 'Operating Expenses', fields: ['operating_expenses'] },
    { id: 'review', title: 'Review & Generate', fields: [] }
  ];

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

  const addCustomExpense = () => {
    setFormData(prev => ({
      ...prev,
      operating_expenses: {
        ...prev.operating_expenses,
        custom: [...prev.operating_expenses.custom, { name: '', amount: 0 }]
      }
    }));
  };

  const updateCustomExpense = (index, field, value) => {
    const updated = [...formData.operating_expenses.custom];
    updated[index][field] = field === 'amount' ? (parseFloat(value) || 0) : value;
    setFormData(prev => ({
      ...prev,
      operating_expenses: {
        ...prev.operating_expenses,
        custom: updated
      }
    }));
  };

  const removeCustomExpense = (index) => {
    setFormData(prev => ({
      ...prev,
      operating_expenses: {
        ...prev.operating_expenses,
        custom: prev.operating_expenses.custom.filter((_, i) => i !== index)
      }
    }));
  };

  const calculateTotalOpex = () => {
    const opex = formData.operating_expenses;
    const standard = opex.salaries + opex.software_tools + opex.hosting_domain + 
                     opex.marketing + opex.workspace_utilities + opex.miscellaneous;
    const custom = opex.custom.reduce((sum, item) => sum + (item.amount || 0), 0);
    return standard + custom;
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // Create plan with intake data
      const plan = await api.plans.create({
        name: `${formData.business_name} Business Plan`,
        intake_data: formData,
        plan_purpose: formData.plan_purpose
      });

      // Trigger generation
      await api.plans.generate(plan.id);

      // Navigate to plan editor
      navigate('plan-editor', { planId: plan.id });

    } catch (err) {
      setError(err.message || 'Failed to create plan');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    const step = steps[currentStep];

    if (step.id === 'purpose') {
      return (
        <div>
          <h3 style={{ marginBottom: '1rem' }}>What type of business plan do you need?</h3>
          <div className="form-group">
            {PLAN_PURPOSES.map(purpose => (
              <div 
                key={purpose.value}
                style={{
                  padding: '1rem',
                  border: formData.plan_purpose === purpose.value ? '2px solid #1A85FF' : '1px solid #E4E9EF',
                  borderRadius: '8px',
                  marginBottom: '0.75rem',
                  cursor: 'pointer',
                  background: formData.plan_purpose === purpose.value ? '#EBF5FF' : 'white'
                }}
                onClick={() => handleChange('plan_purpose', purpose.value)}
                data-testid={`purpose-${purpose.value}`}
              >
                <strong>{purpose.label}</strong>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (step.id === 'basics') {
      return (
        <div>
          <h3 style={{ marginBottom: '1.5rem' }}>Tell us about your business</h3>
          
          <div className="form-group">
            <label className="form-label">Business Name *</label>
            <input
              type="text"
              className="form-input"
              value={formData.business_name}
              onChange={(e) => handleChange('business_name', e.target.value)}
              data-testid="business-name-input"
              placeholder="e.g., Sarah's Coffee House"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Industry *</label>
            <select
              className="form-select"
              value={formData.industry}
              onChange={(e) => handleChange('industry', e.target.value)}
              data-testid="industry-select"
              required
            >
              <option value="">Select an industry</option>
              {INDUSTRIES.map(ind => (
                <option key={ind.value} value={ind.value}>{ind.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">City/Location *</label>
            <input
              type="text"
              className="form-input"
              value={formData.location_city}
              onChange={(e) => handleChange('location_city', e.target.value)}
              data-testid="location-input"
              placeholder="e.g., London"
              required
            />
          </div>
        </div>
      );
    }

    if (step.id === 'description') {
      return (
        <div>
          <h3 style={{ marginBottom: '1.5rem' }}>Describe your business</h3>
          
          <div className="form-group">
            <label className="form-label">Business Description *</label>
            <textarea
              className="form-input"
              value={formData.business_description}
              onChange={(e) => handleChange('business_description', e.target.value)}
              data-testid="business-description-input"
              placeholder="What does your business do? What products or services do you offer?"
              rows="4"
              required
            />
            <small style={{ color: '#6B7A91' }}>50-500 characters</small>
          </div>

          <div className="form-group">
            <label className="form-label">Unique Value Proposition *</label>
            <textarea
              className="form-input"
              value={formData.unique_value_proposition}
              onChange={(e) => handleChange('unique_value_proposition', e.target.value)}
              data-testid="uvp-input"
              placeholder="What makes your business different from competitors?"
              rows="3"
              required
            />
          </div>
        </div>
      );
    }

    if (step.id === 'market') {
      return (
        <div>
          <h3 style={{ marginBottom: '1.5rem' }}>Who are your customers?</h3>
          
          <div className="form-group">
            <label className="form-label">Target Customers *</label>
            <textarea
              className="form-input"
              value={formData.target_customers}
              onChange={(e) => handleChange('target_customers', e.target.value)}
              data-testid="target-customers-input"
              placeholder="Describe your ideal customers (age, location, income, preferences, etc.)"
              rows="4"
              required
            />
          </div>
        </div>
      );
    }

    if (step.id === 'financials') {
      return (
        <div>
          <h3 style={{ marginBottom: '1.5rem' }}>Revenue Details</h3>
          
          <div className="form-group">
            <label className="form-label">Starting Capital (£) *</label>
            <input
              type="number"
              className="form-input"
              value={formData.starting_capital}
              onChange={(e) => handleChange('starting_capital', parseInt(e.target.value) || 0)}
              data-testid="starting-capital-input"
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Estimated Monthly Revenue (£) *</label>
            <input
              type="number"
              className="form-input"
              value={formData.monthly_revenue_estimate}
              onChange={(e) => handleChange('monthly_revenue_estimate', parseInt(e.target.value) || 0)}
              data-testid="monthly-revenue-input"
              min="0"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Price Per Unit (£)</label>
              <input
                type="number"
                className="form-input"
                value={formData.price_per_unit}
                onChange={(e) => handleChange('price_per_unit', parseFloat(e.target.value) || 0)}
                data-testid="price-per-unit-input"
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Team Size</label>
              <input
                type="number"
                className="form-input"
                value={formData.team_size}
                onChange={(e) => handleChange('team_size', parseInt(e.target.value) || 1)}
                data-testid="team-size-input"
                min="1"
              />
            </div>
          </div>
        </div>
      );
    }

    if (step.id === 'operating_expenses') {
      const totalMonthly = calculateTotalOpex();
      
      return (
        <div>
          <h3 style={{ marginBottom: '0.5rem' }}>Monthly Operating Expenses</h3>
          <p style={{ color: '#6B7A91', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            Enter your expected monthly costs. This will be used for accurate financial projections.
          </p>
          
          <div className="form-group">
            <label className="form-label">Salaries & Wages (£/month)</label>
            <input
              type="number"
              className="form-input"
              value={formData.operating_expenses.salaries}
              onChange={(e) => handleOpexChange('salaries', e.target.value)}
              data-testid="opex-salaries-input"
              min="0"
              step="100"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Software & Tools (£/month)</label>
            <input
              type="number"
              className="form-input"
              value={formData.operating_expenses.software_tools}
              onChange={(e) => handleOpexChange('software_tools', e.target.value)}
              data-testid="opex-software-input"
              min="0"
              step="10"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Hosting, Domain & Server (£/month)</label>
            <input
              type="number"
              className="form-input"
              value={formData.operating_expenses.hosting_domain}
              onChange={(e) => handleOpexChange('hosting_domain', e.target.value)}
              data-testid="opex-hosting-input"
              min="0"
              step="10"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Marketing & Advertising (£/month)</label>
            <input
              type="number"
              className="form-input"
              value={formData.operating_expenses.marketing}
              onChange={(e) => handleOpexChange('marketing', e.target.value)}
              data-testid="opex-marketing-input"
              min="0"
              step="50"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Workspace & Utilities (£/month)</label>
            <input
              type="number"
              className="form-input"
              value={formData.operating_expenses.workspace_utilities}
              onChange={(e) => handleOpexChange('workspace_utilities', e.target.value)}
              data-testid="opex-workspace-input"
              min="0"
              step="50"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Miscellaneous (£/month)</label>
            <input
              type="number"
              className="form-input"
              value={formData.operating_expenses.miscellaneous}
              onChange={(e) => handleOpexChange('miscellaneous', e.target.value)}
              data-testid="opex-misc-input"
              min="0"
              step="10"
            />
          </div>

          {/* Custom Expenses */}
          {formData.operating_expenses.custom.map((expense, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '0.5rem', marginBottom: '1rem' }}>
              <input
                type="text"
                className="form-input"
                value={expense.name}
                onChange={(e) => updateCustomExpense(idx, 'name', e.target.value)}
                placeholder="Expense name"
                data-testid={`custom-expense-name-${idx}`}
              />
              <input
                type="number"
                className="form-input"
                value={expense.amount}
                onChange={(e) => updateCustomExpense(idx, 'amount', e.target.value)}
                placeholder="Amount"
                data-testid={`custom-expense-amount-${idx}`}
                min="0"
              />
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => removeCustomExpense(idx)}
                style={{ padding: '0.75rem', color: '#EF4444' }}
              >
                ✕
              </button>
            </div>
          ))}

          <button
            type="button"
            className="btn btn-ghost"
            onClick={addCustomExpense}
            data-testid="add-custom-expense-btn"
            style={{ width: '100%', marginBottom: '1rem' }}
          >
            + Add Custom Expense
          </button>

          {/* Total Summary */}
          <div className="card" style={{ background: '#EBF5FF', border: '2px solid #1A85FF', marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>Total Monthly Operating Expenses:</strong>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1A85FF' }}>
                £{totalMonthly.toLocaleString()}
              </div>
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6B7A91', marginTop: '0.5rem' }}>
              Annual: £{(totalMonthly * 12).toLocaleString()}
            </div>
          </div>
        </div>
      );
    }

    if (step.id === 'review') {
      const totalMonthlyOpex = calculateTotalOpex();
      
      return (
        <div>
          <h3 style={{ marginBottom: '1.5rem' }}>Review Your Information</h3>
          
          <div className="card" style={{ background: 'var(--bg-secondary)' }}>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Business Name:</strong> {formData.business_name}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Industry:</strong> {INDUSTRIES.find(i => i.value === formData.industry)?.label || formData.industry}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Location:</strong> {formData.location_city}, {formData.location_country}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Plan Purpose:</strong> {PLAN_PURPOSES.find(p => p.value === formData.plan_purpose)?.label}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Starting Capital:</strong> £{formData.starting_capital.toLocaleString()}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Monthly Revenue Estimate:</strong> £{formData.monthly_revenue_estimate.toLocaleString()}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Monthly Operating Expenses:</strong> £{totalMonthlyOpex.toLocaleString()}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Team Size:</strong> {formData.team_size}
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#DBEAFE', borderRadius: '8px' }}>
            <p style={{ fontSize: '0.875rem', color: '#1E40AF' }}>
              ℹ️ Your business plan will be generated using our multi-agent AI pipeline.
              This typically takes 60-90 seconds. All market data will be sourced from verified sources (ONS, Eurostat).
              Financial projections will use your actual operating expenses for accuracy.
            </p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)' }}>
      {/* Header */}
      <header style={{ padding: '1.5rem 0', borderBottom: '1px solid #E4E9EF', background: 'white' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1A85FF', fontFamily: 'IBM Plex Sans' }}>
            STRATTIO
          </div>
          <button 
            className="btn btn-ghost" 
            onClick={() => navigate('dashboard')}
            data-testid="back-to-dashboard-btn"
          >
            ← Back to Dashboard
          </button>
        </div>
      </header>

      <div className="container" style={{ padding: '3rem 0', maxWidth: '800px' }}>
        {/* Progress Bar */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            {steps.map((step, idx) => (
              <div 
                key={step.id}
                style={{
                  flex: 1,
                  height: '4px',
                  background: idx <= currentStep ? '#1A85FF' : '#E4E9EF',
                  marginRight: idx < steps.length - 1 ? '4px' : '0',
                  borderRadius: '2px'
                }}
              ></div>
            ))}
          </div>
          <p style={{ color: '#6B7A91', fontSize: '0.875rem' }}>
            Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Step Content */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button 
            className="btn btn-secondary" 
            onClick={handleBack}
            disabled={currentStep === 0}
            data-testid="wizard-back-btn"
          >
            ← Back
          </button>
          
          {currentStep < steps.length - 1 ? (
            <button 
              className="btn btn-primary" 
              onClick={handleNext}
              data-testid="wizard-next-btn"
            >
              Next →
            </button>
          ) : (
            <button 
              className="btn btn-primary" 
              onClick={handleSubmit}
              disabled={loading}
              data-testid="wizard-generate-btn"
              style={{ minWidth: '200px' }}
            >
              {loading ? 'Generating Plan...' : '✨ Generate Business Plan'}
            </button>
          )}
        </div>

        {loading && (
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
            <p style={{ marginTop: '1rem', color: '#6B7A91' }}>Running multi-agent pipeline...</p>
            <p style={{ fontSize: '0.875rem', color: '#9BA9BC' }}>This may take 60-90 seconds</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default IntakeWizardPage;
