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
          <p className="text-red-600">{error}</p>
          <Button onClick={() => navigate(`/plan/${planId}`)} className="mt-4">
            Back to Plan
          </Button>
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
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/plan/${planId}`)}
                data-testid="back-button"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Plan
              </Button>
              <h1 className="text-2xl font-bold">Financial Analysis</h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              data-testid="download-financials"
            >
              <Download className="w-4 h-4 mr-1" />
              Export Data
            </Button>
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
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Profit & Loss Statement (Annual)</h3>
              <div className="overflow-x-auto">
                <table className="w-full" data-testid="pnl-table">
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
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default FinancialsPage;
