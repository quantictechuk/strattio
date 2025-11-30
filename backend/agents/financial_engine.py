"""Deterministic Financial Engine - NO AI INVOLVED
All calculations are formula-based per PRD v3 Appendix C"""

from typing import Dict, List

class FinancialEngine:
    """
    Deterministic financial projection engine.
    All calculations are formula-based. NO AI INVOLVED.
    """
    
    def __init__(self, intake_data: Dict, benchmarks: Dict):
        self.intake = intake_data
        self.benchmarks = benchmarks
        
    def calculate_revenue_projection(self, years: int = 5) -> List[Dict]:
        """Revenue Projection Formula from PRD v3"""
        revenue = []
        
        # Year 1
        year1_revenue = self.intake.get("monthly_revenue_estimate", 0) * 12
        if year1_revenue == 0:
            year1_revenue = self.intake["starting_capital"] * self.benchmarks.get("revenue_to_capital_ratio", 0.30)
        
        revenue.append({"year": 1, "revenue": year1_revenue})
        
        # Subsequent years
        growth_rate = min(self.benchmarks.get("growth_rate", 0.15), 0.20)
        for year in range(2, years + 1):
            prev_revenue = revenue[-1]["revenue"]
            year_revenue = prev_revenue * (1 + growth_rate)
            revenue.append({"year": year, "revenue": round(year_revenue, 2)})
        
        return revenue
    
    def calculate_cogs(self, revenue_projections: List[Dict]) -> List[Dict]:
        """COGS = Revenue × COGS Percentage"""
        cogs = []
        for proj in revenue_projections:
            cogs_value = proj["revenue"] * self.benchmarks.get("cogs_percentage", 0.35)
            cogs.append({"year": proj["year"], "cogs": round(cogs_value, 2)})
        return cogs
    
    def calculate_operating_expenses(self, revenue_projections: List[Dict]) -> List[Dict]:
        """Operating Expenses calculation"""
        opex = []
        employee_count = self.intake.get("team_size", 3)
        sqft = self.intake.get("space_sqft", 1000)
        
        for proj in revenue_projections:
            salaries = employee_count * self.benchmarks.get("employee_cost_average", 25000)
            rent = sqft * self.benchmarks.get("rent_per_sqft_average", 50)
            marketing = proj["revenue"] * self.benchmarks.get("marketing_spend_percentage", 0.08)
            utilities = self.benchmarks.get("utilities_monthly", 500) * 12
            insurance = self.benchmarks.get("insurance_annual", 2000)
            other = proj["revenue"] * 0.05
            
            total_opex = salaries + rent + marketing + utilities + insurance + other
            
            opex.append({
                "year": proj["year"],
                "salaries": round(salaries, 2),
                "rent": round(rent, 2),
                "marketing": round(marketing, 2),
                "utilities": round(utilities, 2),
                "insurance": round(insurance, 2),
                "other": round(other, 2),
                "total_opex": round(total_opex, 2)
            })
        return opex
    
    def calculate_pnl(self, revenue_projections: List[Dict], cogs: List[Dict], opex: List[Dict]) -> List[Dict]:
        """P&L Statement calculation"""
        pnl = []
        tax_rate = 0.19  # UK corporate tax
        
        for i, rev_proj in enumerate(revenue_projections):
            year = rev_proj["year"]
            revenue = rev_proj["revenue"]
            cogs_value = cogs[i]["cogs"]
            total_opex = opex[i]["total_opex"]
            
            gross_profit = revenue - cogs_value
            operating_profit = gross_profit - total_opex
            tax = max(0, operating_profit) * tax_rate
            net_profit = operating_profit - tax
            
            pnl.append({
                "year": year,
                "revenue": round(revenue, 2),
                "cogs": round(cogs_value, 2),
                "gross_profit": round(gross_profit, 2),
                "total_opex": round(total_opex, 2),
                "operating_profit": round(operating_profit, 2),
                "tax": round(tax, 2),
                "net_profit": round(net_profit, 2)
            })
        return pnl
    
    def calculate_break_even(self) -> Dict:
        """Break-Even Analysis"""
        employee_count = self.intake.get("team_size", 3)
        sqft = self.intake.get("space_sqft", 1000)
        
        annual_fixed_costs = (
            employee_count * self.benchmarks.get("employee_cost_average", 25000) +
            sqft * self.benchmarks.get("rent_per_sqft_average", 50) +
            self.benchmarks.get("utilities_monthly", 500) * 12 +
            self.benchmarks.get("insurance_annual", 2000)
        )
        fixed_costs_monthly = annual_fixed_costs / 12
        
        price_per_unit = self.intake.get("price_per_unit", 10.0)
        variable_cost_per_unit = price_per_unit * self.benchmarks.get("cogs_percentage", 0.35)
        contribution_margin = price_per_unit - variable_cost_per_unit
        
        break_even_units = fixed_costs_monthly / contribution_margin if contribution_margin > 0 else 0
        break_even_revenue = break_even_units * price_per_unit
        
        return {
            "fixed_costs_monthly": round(fixed_costs_monthly, 2),
            "contribution_margin_per_unit": round(contribution_margin, 2),
            "break_even_units_monthly": round(break_even_units, 0),
            "break_even_revenue_monthly": round(break_even_revenue, 2)
        }
    
    def calculate_kpis(self, pnl: List[Dict]) -> Dict:
        """KPI Dashboard"""
        year1_pnl = pnl[0]
        
        gross_margin_pct = (year1_pnl["gross_profit"] / year1_pnl["revenue"]) * 100 if year1_pnl["revenue"] > 0 else 0
        net_margin_pct = (year1_pnl["net_profit"] / year1_pnl["revenue"]) * 100 if year1_pnl["revenue"] > 0 else 0
        roi_year1 = (year1_pnl["net_profit"] / self.intake.get("starting_capital", 1)) * 100
        
        return {
            "gross_margin_percent": round(gross_margin_pct, 2),
            "net_margin_percent": round(net_margin_pct, 2),
            "roi_year1_percent": round(roi_year1, 2)
        }
    
    def generate_financial_model(self) -> Dict:
        """Generate complete financial model"""
        revenue_projections = self.calculate_revenue_projection(years=5)
        cogs = self.calculate_cogs(revenue_projections)
        opex = self.calculate_operating_expenses(revenue_projections)
        pnl = self.calculate_pnl(revenue_projections, cogs, opex)
        break_even = self.calculate_break_even()
        kpis = self.calculate_kpis(pnl)
        
        return {
            "pnl_annual": pnl,
            "break_even": break_even,
            "kpis": kpis,
            "formulas_used": [
                {"metric": "revenue", "formula": "Year(N) = Year(N-1) × (1 + growth_rate)"},
                {"metric": "cogs", "formula": "COGS = Revenue × cogs_percentage"},
                {"metric": "gross_profit", "formula": "Gross Profit = Revenue - COGS"},
                {"metric": "net_profit", "formula": "Net Profit = Operating Profit - Tax"}
            ]
        }
