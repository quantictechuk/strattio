import React, { useState, useEffect, useRef } from 'react';
import { api, apiRequest } from '../lib/api';
import FinancialCharts from '../components/FinancialCharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function FinancialsPage({ navigate, user, planId }) {
  const [chartsData, setChartsData] = useState(null);
  const [financialModel, setFinancialModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef(null);

  useEffect(() => {
    if (planId) {
      loadFinancialData();
    }
  }, [planId]);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
    };

    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportMenu]);

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      const [chartsResponse, modelResponse] = await Promise.all([
        apiRequest(`/api/${planId}/financials/charts`),
        api.financials.get(planId)
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

  const getFileName = (extension) => {
    return `financial-analysis-${planId}-${new Date().toISOString().split('T')[0]}.${extension}`;
  };

  const exportToCSV = () => {
    if (!chartsData && !financialModel) {
      alert('No financial data available to export');
      return;
    }

    let csvContent = 'Financial Analysis Export\n\n';

    // Export KPIs
    if (chartsData && chartsData.kpis) {
      csvContent += 'Key Performance Indicators\n';
      csvContent += 'Metric,Value\n';
      csvContent += `Gross Margin,${chartsData.kpis.gross_margin}%\n`;
      csvContent += `Net Margin,${chartsData.kpis.net_margin}%\n`;
      csvContent += `ROI Year 1,${chartsData.kpis.roi_year1}%\n`;
      csvContent += `Break-even,${chartsData.kpis.break_even_months} months\n\n`;
    }

    // Export Revenue Chart Data
    if (chartsData && chartsData.revenue_chart) {
      csvContent += 'Revenue & Costs (Annual)\n';
      csvContent += 'Year,Revenue,COGS,Gross Profit\n';
      chartsData.revenue_chart.forEach(row => {
        csvContent += `${row.year},${row.revenue},${row.cogs},${row.gross_profit}\n`;
      });
      csvContent += '\n';
    }

    // Export Profit Chart Data
    if (chartsData && chartsData.profit_chart) {
      csvContent += 'Profitability (Annual)\n';
      csvContent += 'Year,Gross Profit,Net Profit,Operating Expenses\n';
      chartsData.profit_chart.forEach(row => {
        csvContent += `${row.year},${row.gross_profit},${row.net_profit},${row.total_opex}\n`;
      });
      csvContent += '\n';
    }

    // Export Cash Flow Data
    if (chartsData && chartsData.cashflow_chart) {
      csvContent += 'Cash Flow (Annual)\n';
      csvContent += 'Year,Operating CF,Net CF,Cumulative CF\n';
      chartsData.cashflow_chart.forEach(row => {
        csvContent += `${row.year},${row.operating_cf},${row.net_cf},${row.cumulative_cf}\n`;
      });
      csvContent += '\n';
    }

    // Export P&L Statement
    if (financialModel && financialModel.data && financialModel.data.pnl_annual) {
      csvContent += 'Profit & Loss Statement (Annual)\n';
      csvContent += 'Year,Revenue,COGS,Gross Profit,Operating Expenses,Net Profit\n';
      financialModel.data.pnl_annual.slice(0, 5).forEach(year => {
        csvContent += `${year.year},${year.revenue},${year.cogs},${year.gross_profit},${year.total_opex},${year.net_profit}\n`;
      });
    }

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', getFileName('csv'));
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  const exportToXLSX = () => {
    if (!XLSX) {
      alert('XLSX library not available. Please install: npm install xlsx');
      return;
    }
    
    if (!chartsData && !financialModel) {
      alert('No financial data available to export');
      return;
    }

    const workbook = XLSX.utils.book_new();

    // KPIs Sheet
    if (chartsData && chartsData.kpis) {
      const kpisData = [
        ['Key Performance Indicators'],
        ['Metric', 'Value'],
        ['Gross Margin', `${chartsData.kpis.gross_margin}%`],
        ['Net Margin', `${chartsData.kpis.net_margin}%`],
        ['ROI Year 1', `${chartsData.kpis.roi_year1}%`],
        ['Break-even', `${chartsData.kpis.break_even_months} months`]
      ];
      const kpisSheet = XLSX.utils.aoa_to_sheet(kpisData);
      XLSX.utils.book_append_sheet(workbook, kpisSheet, 'KPIs');
    }

    // Revenue & Costs Sheet
    if (chartsData && chartsData.revenue_chart) {
      const revenueData = [
        ['Year', 'Revenue', 'COGS', 'Gross Profit'],
        ...chartsData.revenue_chart.map(row => [row.year, row.revenue, row.cogs, row.gross_profit])
      ];
      const revenueSheet = XLSX.utils.aoa_to_sheet(revenueData);
      XLSX.utils.book_append_sheet(workbook, revenueSheet, 'Revenue & Costs');
    }

    // Profitability Sheet
    if (chartsData && chartsData.profit_chart) {
      const profitData = [
        ['Year', 'Gross Profit', 'Net Profit', 'Operating Expenses'],
        ...chartsData.profit_chart.map(row => [row.year, row.gross_profit, row.net_profit, row.total_opex])
      ];
      const profitSheet = XLSX.utils.aoa_to_sheet(profitData);
      XLSX.utils.book_append_sheet(workbook, profitSheet, 'Profitability');
    }

    // Cash Flow Sheet
    if (chartsData && chartsData.cashflow_chart) {
      const cashflowData = [
        ['Year', 'Operating CF', 'Net CF', 'Cumulative CF'],
        ...chartsData.cashflow_chart.map(row => [row.year, row.operating_cf, row.net_cf, row.cumulative_cf])
      ];
      const cashflowSheet = XLSX.utils.aoa_to_sheet(cashflowData);
      XLSX.utils.book_append_sheet(workbook, cashflowSheet, 'Cash Flow');
    }

    // P&L Statement Sheet
    if (financialModel && financialModel.data && financialModel.data.pnl_annual) {
      const pnlData = [
        ['Year', 'Revenue', 'COGS', 'Gross Profit', 'Operating Expenses', 'Net Profit'],
        ...financialModel.data.pnl_annual.slice(0, 5).map(year => [
          year.year, year.revenue, year.cogs, year.gross_profit, year.total_opex, year.net_profit
        ])
      ];
      const pnlSheet = XLSX.utils.aoa_to_sheet(pnlData);
      XLSX.utils.book_append_sheet(workbook, pnlSheet, 'P&L Statement');
    }

    XLSX.writeFile(workbook, getFileName('xlsx'));
    setShowExportMenu(false);
  };

  const exportToPDF = () => {
    if (!jsPDF || !autoTable) {
      alert('PDF library not available. Please install: npm install jspdf jspdf-autotable');
      return;
    }
    
    if (!chartsData && !financialModel) {
      alert('No financial data available to export');
      return;
    }

    const doc = new jsPDF();
    let yPos = 20;

    // Title
    doc.setFontSize(18);
    doc.text('Financial Analysis Report', 14, yPos);
    yPos += 10;

    // KPIs Table
    if (chartsData && chartsData.kpis) {
      doc.setFontSize(14);
      doc.text('Key Performance Indicators', 14, yPos);
      yPos += 8;

      const kpisTableData = [
        ['Gross Margin', `${chartsData.kpis.gross_margin}%`],
        ['Net Margin', `${chartsData.kpis.net_margin}%`],
        ['ROI Year 1', `${chartsData.kpis.roi_year1}%`],
        ['Break-even', `${chartsData.kpis.break_even_months} months`]
      ];

      autoTable(doc, {
        startY: yPos,
        head: [['Metric', 'Value']],
        body: kpisTableData,
        theme: 'striped',
        headStyles: { fillColor: [0, 22, 57] }
      });
      yPos = doc.lastAutoTable.finalY + 15;
    }

    // Revenue & Costs Table
    if (chartsData && chartsData.revenue_chart && Array.isArray(chartsData.revenue_chart) && chartsData.revenue_chart.length > 0) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(14);
      doc.text('Revenue & Costs (Annual)', 14, yPos);
      yPos += 8;

      const revenueTableData = chartsData.revenue_chart.map(row => [
        row.year ? row.year.toString() : '',
        `£${(row.revenue || 0).toLocaleString()}`,
        `£${(row.cogs || 0).toLocaleString()}`,
        `£${(row.gross_profit || 0).toLocaleString()}`
      ]);

      try {
        autoTable(doc, {
          startY: yPos,
          head: [['Year', 'Revenue', 'COGS', 'Gross Profit']],
          body: revenueTableData,
          theme: 'striped',
          headStyles: { fillColor: [0, 22, 57] },
          styles: { fontSize: 9 }
        });
        yPos = doc.lastAutoTable.finalY + 15;
      } catch (error) {
        console.error('Error adding Revenue & Costs table:', error);
        // Fallback: Add as text if table fails
        doc.setFontSize(10);
        chartsData.revenue_chart.forEach((row, idx) => {
          if (yPos > 280) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(`${row.year || ''}: Revenue £${(row.revenue || 0).toLocaleString()}, COGS £${(row.cogs || 0).toLocaleString()}, Gross Profit £${(row.gross_profit || 0).toLocaleString()}`, 14, yPos);
          yPos += 6;
        });
        yPos += 5;
      }
    }

    // Profitability Table
    if (chartsData && chartsData.profit_chart && Array.isArray(chartsData.profit_chart) && chartsData.profit_chart.length > 0) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(14);
      doc.text('Profitability (Annual)', 14, yPos);
      yPos += 8;

      const profitTableData = chartsData.profit_chart.map(row => [
        row.year ? row.year.toString() : '',
        `£${(row.gross_profit || 0).toLocaleString()}`,
        `£${(row.net_profit || 0).toLocaleString()}`,
        `£${(row.total_opex || 0).toLocaleString()}`
      ]);

      try {
        autoTable(doc, {
          startY: yPos,
          head: [['Year', 'Gross Profit', 'Net Profit', 'Operating Expenses']],
          body: profitTableData,
          theme: 'striped',
          headStyles: { fillColor: [0, 22, 57] },
          styles: { fontSize: 9 }
        });
        yPos = doc.lastAutoTable.finalY + 15;
      } catch (error) {
        console.error('Error adding Profitability table:', error);
        // Fallback: Add as text if table fails
        doc.setFontSize(10);
        chartsData.profit_chart.forEach((row, idx) => {
          if (yPos > 280) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(`${row.year || ''}: Gross Profit £${(row.gross_profit || 0).toLocaleString()}, Net Profit £${(row.net_profit || 0).toLocaleString()}, Operating Expenses £${(row.total_opex || 0).toLocaleString()}`, 14, yPos);
          yPos += 6;
        });
        yPos += 5;
      }
    }

    // Cash Flow Table
    if (chartsData && chartsData.cashflow_chart) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(14);
      doc.text('Cash Flow (Annual)', 14, yPos);
      yPos += 8;

      const cashflowTableData = chartsData.cashflow_chart.map(row => [
        row.year.toString(),
        `£${row.operating_cf.toLocaleString()}`,
        `£${row.net_cf.toLocaleString()}`,
        `£${row.cumulative_cf.toLocaleString()}`
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Year', 'Operating CF', 'Net CF', 'Cumulative CF']],
        body: cashflowTableData,
        theme: 'striped',
        headStyles: { fillColor: [0, 22, 57] }
      });
      yPos = doc.lastAutoTable.finalY + 15;
    }

    // P&L Statement Table
    if (financialModel && financialModel.data && financialModel.data.pnl_annual) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(14);
      doc.text('Profit & Loss Statement (Annual)', 14, yPos);
      yPos += 8;

      const pnlTableData = financialModel.data.pnl_annual.slice(0, 5).map(year => [
        year.year.toString(),
        `£${year.revenue.toLocaleString()}`,
        `£${year.cogs.toLocaleString()}`,
        `£${year.gross_profit.toLocaleString()}`,
        `£${year.total_opex.toLocaleString()}`,
        `£${year.net_profit.toLocaleString()}`
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Year', 'Revenue', 'COGS', 'Gross Profit', 'Operating Expenses', 'Net Profit']],
        body: pnlTableData,
        theme: 'striped',
        headStyles: { fillColor: [0, 22, 57] }
      });
    }

    doc.save(getFileName('pdf'));
    setShowExportMenu(false);
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
            <div style={{ position: 'relative' }} ref={exportMenuRef}>
              <button
                className="btn btn-secondary"
                onClick={() => setShowExportMenu(!showExportMenu)}
                data-testid="download-financials"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                📥 Export Data
                <span style={{ fontSize: '0.75rem' }}>▼</span>
              </button>
              
              {showExportMenu && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '0.5rem',
                  background: 'white',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  minWidth: '180px',
                  zIndex: 1000
                }}>
                  <button
                    onClick={exportToCSV}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      color: '#0F172A',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#F8FAFC'}
                    onMouseLeave={(e) => e.target.style.background = 'none'}
                  >
                    📄 Export as CSV
                  </button>
                  <button
                    onClick={exportToXLSX}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                      borderTop: '1px solid #E2E8F0',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      color: '#0F172A',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#F8FAFC'}
                    onMouseLeave={(e) => e.target.style.background = 'none'}
                  >
                    📊 Export as XLSX
                  </button>
                  <button
                    onClick={exportToPDF}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                      borderTop: '1px solid #E2E8F0',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      color: '#0F172A',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#F8FAFC'}
                    onMouseLeave={(e) => e.target.style.background = 'none'}
                  >
                    📑 Export as PDF
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Charts */}
        <FinancialCharts chartsData={chartsData} />

        {/* Financial Tables */}
        {financialModel && financialModel.data && (
          <div style={{ marginTop: '2rem' }}>
            {/* P&L Table */}
            <div className="card">
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Profit & Loss Statement (Annual)</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%' }} data-testid="pnl-table">
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                      <th style={{ textAlign: 'left', padding: '0.5rem 0' }}>Metric</th>
                      {financialModel.data.pnl_annual.slice(0, 5).map((year) => (
                        <th key={year.year} style={{ textAlign: 'right', padding: '0.5rem 0' }}>Year {year.year}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                      <td style={{ padding: '0.5rem 0', fontWeight: '500' }}>Revenue</td>
                      {financialModel.data.pnl_annual.slice(0, 5).map((year) => (
                        <td key={year.year} style={{ textAlign: 'right', padding: '0.5rem 0' }}>£{year.revenue.toLocaleString()}</td>
                      ))}
                    </tr>
                    <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                      <td style={{ padding: '0.5rem 0' }}>COGS</td>
                      {financialModel.data.pnl_annual.slice(0, 5).map((year) => (
                        <td key={year.year} style={{ textAlign: 'right', padding: '0.5rem 0' }}>£{year.cogs.toLocaleString()}</td>
                      ))}
                    </tr>
                    <tr style={{ borderBottom: '1px solid #E5E7EB', background: '#F0FDF4' }}>
                      <td style={{ padding: '0.5rem 0', fontWeight: '500' }}>Gross Profit</td>
                      {financialModel.data.pnl_annual.slice(0, 5).map((year) => (
                        <td key={year.year} style={{ textAlign: 'right', padding: '0.5rem 0', fontWeight: '500' }}>£{year.gross_profit.toLocaleString()}</td>
                      ))}
                    </tr>
                    <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                      <td style={{ padding: '0.5rem 0' }}>Operating Expenses</td>
                      {financialModel.data.pnl_annual.slice(0, 5).map((year) => (
                        <td key={year.year} style={{ textAlign: 'right', padding: '0.5rem 0' }}>£{year.total_opex.toLocaleString()}</td>
                      ))}
                    </tr>
                    <tr style={{ borderBottom: '1px solid #E5E7EB', background: '#EFF6FF' }}>
                      <td style={{ padding: '0.5rem 0', fontWeight: '500' }}>Net Profit</td>
                      {financialModel.data.pnl_annual.slice(0, 5).map((year) => (
                        <td key={year.year} style={{ textAlign: 'right', padding: '0.5rem 0', fontWeight: '500' }}>£{year.net_profit.toLocaleString()}</td>
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
