import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const FinancialCharts = ({ chartsData }) => {
  if (!chartsData) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem 0', color: '#6B7280' }}>
        No financial data available
      </div>
    );
  }

  const { revenue_chart, profit_chart, cashflow_chart, kpis } = chartsData;

  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return `£${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `£${(value / 1000).toFixed(0)}K`;
    }
    return `£${value}`;
  };

  return (
    <div className="space-y-6" data-testid="financial-charts">
      {/* KPIs Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600">Gross Margin</div>
          <div className="text-2xl font-bold text-blue-600" data-testid="kpi-gross-margin">
            {kpis.gross_margin}%
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Net Margin</div>
          <div className="text-2xl font-bold text-green-600" data-testid="kpi-net-margin">
            {kpis.net_margin}%
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">ROI Year 1</div>
          <div className="text-2xl font-bold text-purple-600" data-testid="kpi-roi">
            {kpis.roi_year1}%
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Break-even</div>
          <div className="text-2xl font-bold text-orange-600" data-testid="kpi-breakeven">
            {kpis.break_even_months}mo
          </div>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Revenue & Costs</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={revenue_chart} data-testid="revenue-chart">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
            <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
            <Bar dataKey="cogs" fill="#ef4444" name="COGS" />
            <Bar dataKey="gross_profit" fill="#10b981" name="Gross Profit" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Profit Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Profitability</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={profit_chart} data-testid="profit-chart">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="gross_profit" 
              stroke="#10b981" 
              strokeWidth={2}
              name="Gross Profit" 
            />
            <Line 
              type="monotone" 
              dataKey="net_profit" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name="Net Profit" 
            />
            <Line 
              type="monotone" 
              dataKey="total_opex" 
              stroke="#ef4444" 
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Operating Expenses" 
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Cashflow Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Cash Flow</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={cashflow_chart} data-testid="cashflow-chart">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="operating_cf" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              name="Operating CF" 
            />
            <Line 
              type="monotone" 
              dataKey="net_cf" 
              stroke="#06b6d4" 
              strokeWidth={2}
              name="Net CF" 
            />
            <Line 
              type="monotone" 
              dataKey="cumulative_cf" 
              stroke="#f97316" 
              strokeWidth={2}
              name="Cumulative CF" 
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

export default FinancialCharts;
