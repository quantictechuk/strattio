import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, BarChart3, Calculator, Loader2, RefreshCw } from 'lucide-react';
import { api } from '../lib/api';

function ScenarioPlanning({ planId }) {
  const [scenarios, setScenarios] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeScenario, setActiveScenario] = useState('realistic');
  const [customRevenue, setCustomRevenue] = useState(1.0);
  const [customCost, setCustomCost] = useState(1.0);
  const [analyzing, setAnalyzing] = useState(false);
  const [customResult, setCustomResult] = useState(null);

  useEffect(() => {
    if (planId) {
      loadScenarios();
    }
  }, [planId]);

  const loadScenarios = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.scenarios.get(planId);
      console.log('Scenarios API response:', response);
      
      // Handle different response structures
      if (response && typeof response === 'object') {
        setScenarios(response);
      } else {
        setError('Invalid response format from server');
      }
    } catch (err) {
      console.error('Error loading scenarios:', err);
      setError(err.message || 'Failed to load scenarios');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    try {
      setAnalyzing(true);
      setError('');
      const result = await api.scenarios.analyze(planId, customRevenue, customCost);
      setCustomResult(result);
    } catch (err) {
      setError(err.message || 'Failed to analyze scenario');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ padding: '1rem', background: '#FEF2F2', border: '1px solid #EF4444' }}>
        <p style={{ color: '#DC2626', margin: 0 }}>{error}</p>
      </div>
    );
  }

  if (!scenarios) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#64748B' }}>No scenario data available. Please generate scenarios first.</p>
      </div>
    );
  }

  // The API returns: { plan_id, scenarios: { best_case, worst_case, realistic }, sensitivity_analysis }
  // Extract scenarios object - handle various response structures
  let scenarioData = null;
  let bestCase = null;
  let worstCase = null;
  let realistic = null;
  let sensitivity = [];
  
  try {
    // Log the structure for debugging
    console.log('Scenarios response structure:', {
      hasScenarios: !!scenarios.scenarios,
      hasData: !!scenarios.data,
      hasBestCase: !!scenarios.best_case,
      keys: Object.keys(scenarios || {})
    });
    
    if (scenarios.scenarios && typeof scenarios.scenarios === 'object') {
      // Standard structure: { scenarios: { best_case, worst_case, realistic } }
      scenarioData = scenarios.scenarios;
    } else if (scenarios.data && scenarios.data.scenarios) {
      // Nested in data: { data: { scenarios: { ... } } }
      scenarioData = scenarios.data.scenarios;
    } else if (scenarios.best_case || scenarios.worst_case || scenarios.realistic) {
      // Scenarios at root level: { best_case, worst_case, realistic }
      scenarioData = scenarios;
    }
    
    if (!scenarioData || typeof scenarioData !== 'object') {
      throw new Error(`Invalid scenario data structure. Expected scenarios object, got: ${typeof scenarioData}`);
    }
    
    // Extract individual scenarios - they should be the data objects directly
    bestCase = scenarioData.best_case || null;
    worstCase = scenarioData.worst_case || null;
    realistic = scenarioData.realistic || null;
    sensitivity = scenarios.sensitivity_analysis || [];
    
    // Validate that we have at least one scenario
    if (!bestCase && !worstCase && !realistic) {
      throw new Error('No scenario data found (best_case, worst_case, or realistic)');
    }
  } catch (parseError) {
    console.error('Error parsing scenario data:', parseError);
    console.error('Full scenarios object:', scenarios);
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#DC2626', marginBottom: '1rem', fontWeight: '600' }}>
          Error loading scenario data
        </p>
        <p style={{ color: '#64748B', marginBottom: '1rem', fontSize: '0.875rem' }}>
          {parseError.message || 'Unknown error'}
        </p>
        <button 
          onClick={loadScenarios}
          className="btn btn-primary"
          style={{ marginTop: '1rem' }}
        >
          Retry
        </button>
        <details style={{ marginTop: '1.5rem', textAlign: 'left' }}>
          <summary style={{ cursor: 'pointer', color: '#64748B', fontSize: '0.875rem' }}>
            Show Debug Info
          </summary>
          <pre style={{ fontSize: '0.75rem', marginTop: '0.5rem', background: '#F8FAFC', padding: '1rem', borderRadius: '8px', overflow: 'auto', maxHeight: '300px', textAlign: 'left' }}>
            {JSON.stringify(scenarios, null, 2)}
          </pre>
        </details>
      </div>
    );
  }

  const getScenarioData = () => {
    if (customResult) return customResult.scenario;
    switch (activeScenario) {
      case 'best_case': return bestCase;
      case 'worst_case': return worstCase;
      case 'realistic': return realistic;
      default: return realistic;
    }
  };

  const currentData = getScenarioData();
  if (!currentData) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#64748B' }}>Unable to load scenario data. Please try refreshing.</p>
        <button 
          onClick={loadScenarios}
          className="btn btn-primary"
          style={{ marginTop: '1rem' }}
        >
          Reload Scenarios
        </button>
      </div>
    );
  }
  
  // Extract P&L and cashflow data - they should be directly in currentData
  const pnl = currentData.pnl_monthly || [];
  const cashflow = currentData.cashflow_monthly || [];

  // Calculate totals
  const totalRevenue = pnl.reduce((sum, m) => sum + (m.revenue || 0), 0);
  const totalExpenses = pnl.reduce((sum, m) => sum + (m.total_expenses || 0), 0);
  const totalProfit = pnl.reduce((sum, m) => sum + (m.net_profit || 0), 0);
  const avgMonthlyProfit = totalProfit / Math.max(1, pnl.length);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#001639', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BarChart3 size={24} /> Scenario Planning
        </h3>
        <button
          onClick={loadScenarios}
          className="btn btn-secondary"
          style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Scenario Selector */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => { setActiveScenario('best_case'); setCustomResult(null); }}
          style={{
            flex: 1,
            minWidth: '150px',
            padding: '1rem',
            background: activeScenario === 'best_case' ? '#E6F7F0' : '#F8FAFC',
            border: activeScenario === 'best_case' ? '2px solid #27AC85' : '2px solid #E2E8F0',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <TrendingUp size={24} color={activeScenario === 'best_case' ? '#27AC85' : '#64748B'} />
          <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#001639' }}>Best Case</div>
          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>+20% Revenue<br />-10% Costs</div>
        </button>
        <button
          onClick={() => { setActiveScenario('realistic'); setCustomResult(null); }}
          style={{
            flex: 1,
            minWidth: '150px',
            padding: '1rem',
            background: activeScenario === 'realistic' ? '#EBF5FF' : '#F8FAFC',
            border: activeScenario === 'realistic' ? '2px solid #3B82F6' : '2px solid #E2E8F0',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <BarChart3 size={24} color={activeScenario === 'realistic' ? '#3B82F6' : '#64748B'} />
          <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#001639' }}>Realistic</div>
          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Base Projections</div>
        </button>
        <button
          onClick={() => { setActiveScenario('worst_case'); setCustomResult(null); }}
          style={{
            flex: 1,
            minWidth: '150px',
            padding: '1rem',
            background: activeScenario === 'worst_case' ? '#FEF2F2' : '#F8FAFC',
            border: activeScenario === 'worst_case' ? '2px solid #EF4444' : '2px solid #E2E8F0',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <TrendingDown size={24} color={activeScenario === 'worst_case' ? '#EF4444' : '#64748B'} />
          <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#001639' }}>Worst Case</div>
          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>-30% Revenue<br />+15% Costs</div>
        </button>
      </div>

      {/* Key Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '0.5rem' }}>Total Revenue</div>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#27AC85' }}>
            ${(totalRevenue / 1000).toFixed(1)}K
          </div>
        </div>
        <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '0.5rem' }}>Total Expenses</div>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#EF4444' }}>
            ${(totalExpenses / 1000).toFixed(1)}K
          </div>
        </div>
        <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '0.5rem' }}>Total Profit</div>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', color: totalProfit >= 0 ? '#27AC85' : '#EF4444' }}>
            ${(totalProfit / 1000).toFixed(1)}K
          </div>
        </div>
        <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '0.5rem' }}>Avg Monthly Profit</div>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', color: avgMonthlyProfit >= 0 ? '#27AC85' : '#EF4444' }}>
            ${avgMonthlyProfit.toFixed(0)}
          </div>
        </div>
      </div>

      {/* What-If Calculator */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#001639', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calculator size={18} /> What-If Analysis
        </h4>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#475569' }}>
              Revenue Multiplier
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="3.0"
              value={customRevenue}
              onChange={(e) => setCustomRevenue(parseFloat(e.target.value) || 1.0)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '0.875rem'
              }}
            />
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#475569' }}>
              Cost Multiplier
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="3.0"
              value={customCost}
              onChange={(e) => setCustomCost(parseFloat(e.target.value) || 1.0)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '0.875rem'
              }}
            />
          </div>
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {analyzing ? <Loader2 size={18} className="spin-animation" /> : <Calculator size={18} />}
            Analyze
          </button>
        </div>
        {customResult && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#001639', marginBottom: '0.5rem' }}>
              Custom Scenario Results
            </div>
            <div style={{ fontSize: '0.875rem', color: '#64748B' }}>
              Revenue: {customResult.revenue_multiplier}x | Costs: {customResult.cost_multiplier}x
            </div>
          </div>
        )}
      </div>

      {/* Sensitivity Analysis */}
      {sensitivity.length > 0 && (
        <div className="card">
          <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#001639', marginBottom: '1rem' }}>
            Sensitivity Analysis
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {sensitivity.map((variable, idx) => (
              <div key={idx} style={{
                padding: '1rem',
                background: '#F8FAFC',
                borderRadius: '8px',
                border: '1px solid #E2E8F0'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#001639' }}>
                    {variable.name}
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600', color: variable.effect === 'positive' ? '#27AC85' : '#EF4444' }}>
                    Impact: {variable.impact_score}/100
                  </div>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  {variable.description}
                </div>
                <div style={{ marginTop: '0.5rem', width: '100%', height: '6px', background: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${variable.impact_score}%`,
                    height: '100%',
                    background: variable.effect === 'positive' ? '#27AC85' : '#EF4444',
                    transition: 'width 0.3s ease'
                  }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ScenarioPlanning;
