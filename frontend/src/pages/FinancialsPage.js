import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import FinancialCharts from '../components/FinancialCharts';

function FinancialsPage({ navigate, user, planId }) {
  const [chartsData, setChartsData] = useState(null);
  const [financialModel, setFinancialModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (planId) {
      loadFinancialData();
    }
  }, [planId]);

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      const [chartsResponse, modelResponse] = await Promise.all([
        api.get(`/api/plans/${planId}/financials/charts`),
        api.get(`/api/plans/${planId}/financials`)
      ]);
      setChartsData(chartsResponse);
      setFinancialModel(modelResponse);
      setError(null);
    } catch (err) {
      console.error('Failed to load financial data:', err);
      setError('Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading financials...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p style={{ color: '#DC2626' }}>{error}</p>
          <button className="btn btn-primary" onClick={() => navigate('plan-editor', { planId })} style={{ marginTop: '1rem' }}>
            Back to Plan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                className="btn btn-ghost"
                onClick={() => navigate('plan-editor', { planId })}
                data-testid="back-button"
              >
                ← Back to Plan
              </button>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Financial Analysis</h1>
            </div>
            <button
              className="btn btn-secondary"
              data-testid="download-financials"
            >
              📥 Export Data
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Charts */}
        <FinancialCharts chartsData={chartsData} />

        {/* Financial Tables */}
        {financialModel && financialModel.data && (
          <div className="mt-8 space-y-6">
            {/* P&L Table */}
            <div className="card">
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Profit & Loss Statement (Annual)</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%' }} data-testid="pnl-table">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Metric</th>
                      {financialModel.data.pnl_annual.slice(0, 5).map((year) => (
                        <th key={year.year} className="text-right py-2">Year {year.year}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 font-medium">Revenue</td>
                      {financialModel.data.pnl_annual.slice(0, 5).map((year) => (
                        <td key={year.year} className="text-right py-2">£{year.revenue.toLocaleString()}</td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">COGS</td>
                      {financialModel.data.pnl_annual.slice(0, 5).map((year) => (
                        <td key={year.year} className="text-right py-2">£{year.cogs.toLocaleString()}</td>
                      ))}
                    </tr>
                    <tr className="border-b bg-green-50">
                      <td className="py-2 font-medium">Gross Profit</td>
                      {financialModel.data.pnl_annual.slice(0, 5).map((year) => (
                        <td key={year.year} className="text-right py-2 font-medium">£{year.gross_profit.toLocaleString()}</td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">Operating Expenses</td>
                      {financialModel.data.pnl_annual.slice(0, 5).map((year) => (
                        <td key={year.year} className="text-right py-2">£{year.total_opex.toLocaleString()}</td>
                      ))}
                    </tr>
                    <tr className="border-b bg-blue-50">
                      <td className="py-2 font-medium">Net Profit</td>
                      {financialModel.data.pnl_annual.slice(0, 5).map((year) => (
                        <td key={year.year} className="text-right py-2 font-medium">£{year.net_profit.toLocaleString()}</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FinancialsPage;
