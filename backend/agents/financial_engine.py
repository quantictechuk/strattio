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
        """
        Operating Expenses calculation using USER-PROVIDED values.
        No more hard-coded benchmarks - uses actual user inputs.
        """
        opex = []
        
        # Get user-provided operating expenses (monthly)
        user_opex = self.intake.get("operating_expenses", {})
        
        # Calculate base monthly OPEX from user inputs
        base_monthly_opex = (
            user_opex.get("salaries", 0) +
            user_opex.get("software_tools", 0) +
            user_opex.get("hosting_domain", 0) +
            user_opex.get("marketing", 0) +
            user_opex.get("workspace_utilities", 0) +
            user_opex.get("miscellaneous", 0)
        )
        
        # Add custom expenses
        custom_expenses = user_opex.get("custom", [])
        for expense in custom_expenses:
            base_monthly_opex += expense.get("amount", 0)
        
        # Annual base OPEX
        annual_base_opex = base_monthly_opex * 12
        
        # For each year, OPEX grows slightly with revenue (for scalability)
        for idx, proj in enumerate(revenue_projections):
            year = proj["year"]
            
            # Year 1: Use base OPEX
            if year == 1:
                total_opex = annual_base_opex
            else:
                # Subsequent years: OPEX grows at 50% of revenue growth rate
                # (as business scales, costs increase but not linearly)
                growth_rate = self.benchmarks.get("growth_rate", 0.15)
                opex_growth = growth_rate * 0.5
                total_opex = opex[-1]["total_opex"] * (1 + opex_growth)
            
            opex.append({
                "year": year,
                "salaries": user_opex.get("salaries", 0) * 12 * (1 + (year - 1) * 0.075),  # 7.5% annual increase
                "software_tools": user_opex.get("software_tools", 0) * 12,
                "hosting_domain": user_opex.get("hosting_domain", 0) * 12,
                "marketing": user_opex.get("marketing", 0) * 12,
                "workspace_utilities": user_opex.get("workspace_utilities", 0) * 12,
                "miscellaneous": user_opex.get("miscellaneous", 0) * 12,
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
        """
        Break-Even Analysis using USER-PROVIDED operating expenses.
        """
        # Get user-provided operating expenses (monthly)
        user_opex = self.intake.get("operating_expenses", {})
        
        # Calculate monthly fixed costs from user inputs
        fixed_costs_monthly = (
            user_opex.get("salaries", 0) +
            user_opex.get("software_tools", 0) +
            user_opex.get("hosting_domain", 0) +
            user_opex.get("marketing", 0) +
            user_opex.get("workspace_utilities", 0) +
            user_opex.get("miscellaneous", 0)
        )
        
        # Add custom expenses
        custom_expenses = user_opex.get("custom", [])
        for expense in custom_expenses:
            fixed_costs_monthly += expense.get("amount", 0)
        
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
