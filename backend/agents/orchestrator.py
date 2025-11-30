"""Multi-Agent Orchestrator - Coordinates the 5-agent pipeline"""

from typing import Dict
from datetime import datetime
import logging
import asyncio

from .research_agent import ResearchAgent
from .validation_agent import ValidationAgent
from .financial_engine import FinancialEngine
from .writer_agent import WriterAgent
from .compliance_agent import ComplianceAgent

logger = logging.getLogger(__name__)

class PlanOrchestrator:
    """
    Orchestrates the multi-agent pipeline:
    Research → Validation → Financial Engine → Writer → Compliance
    """
    
    def __init__(self):
        self.research_agent = ResearchAgent()
        self.validation_agent = ValidationAgent()
        self.writer_agent = WriterAgent()
        self.compliance_agent = ComplianceAgent()
    
    async def generate_plan(self, intake_data: Dict, plan_purpose: str = "generic") -> Dict:
        """
        Generate a complete business plan using the multi-agent pipeline.
        
        Returns:
            {
                "status": "complete" | "failed",
                "research_pack": {...},
                "validation_report": {...},
                "financial_model": {...},
                "sections": [...],
                "compliance_report": {...},
                "generation_metadata": {...}
            }
        """
        start_time = datetime.utcnow()
        logger.info(f"Starting plan generation for purpose: {plan_purpose}")
        
        try:
            # Stage 1: Research Agent (30s max)
            logger.info("Stage 1: Research Agent")
            research_pack = await asyncio.wait_for(
                self.research_agent.fetch_market_data(
                    industry=intake_data.get("industry", "generic"),
                    location=intake_data.get("location_country", "UK"),
                    intake_data=intake_data
                ),
                timeout=30.0
            )
            
            # Stage 2: Validation Agent (5s max)
            logger.info("Stage 2: Validation Agent")
            validation_report = self.validation_agent.validate_data_pack(research_pack)
            
            # Check if validation failed critically
            if validation_report["status"] == "failed":
                logger.error("Validation failed critically")
                return {
                    "status": "failed",
                    "error": "Data validation failed",
                    "validation_report": validation_report
                }
            
            # Stage 3: Financial Engine (2s max)
            logger.info("Stage 3: Financial Engine")
            benchmarks = self._get_industry_benchmarks(intake_data.get("industry", "generic"))
            financial_engine = FinancialEngine(intake_data, benchmarks)
            financial_model = financial_engine.generate_financial_model()
            
            # Stage 4: Plan Writer Agent (60s max)
            logger.info("Stage 4: Plan Writer Agent")
            sections = await asyncio.wait_for(
                self.writer_agent.generate_all_sections(
                    data_pack=research_pack,
                    financial_pack=financial_model,
                    intake_data=intake_data
                ),
                timeout=60.0
            )
            
            # Stage 5: Compliance Agent (10s max)
            logger.info("Stage 5: Compliance Agent")
            compliance_template = self._map_purpose_to_template(plan_purpose)
            compliance_report = self.compliance_agent.check_compliance(
                plan_sections=sections,
                financial_model=financial_model,
                template_id=compliance_template
            )
            
            end_time = datetime.utcnow()
            duration_seconds = (end_time - start_time).total_seconds()
            
            logger.info(f"Plan generation complete in {duration_seconds:.2f}s")
            
            return {
                "status": "complete",
                "research_pack": research_pack,
                "validation_report": validation_report,
                "financial_model": financial_model,
                "sections": sections,
                "compliance_report": compliance_report,
                "generation_metadata": {
                    "duration_seconds": duration_seconds,
                    "started_at": start_time.isoformat(),
                    "completed_at": end_time.isoformat(),
                    "pipeline_version": "1.0"
                }
            }
            
        except asyncio.TimeoutError as e:
            logger.error(f"Pipeline timeout: {e}")
            return {
                "status": "failed",
                "error": "Pipeline timeout",
                "details": str(e)
            }
        except Exception as e:
            logger.error(f"Pipeline error: {e}")
            return {
                "status": "failed",
                "error": "Pipeline execution failed",
                "details": str(e)
            }
    
    def _get_industry_benchmarks(self, industry: str) -> Dict:
        """
        Get industry-specific benchmarks.
        For MVP: Returns default benchmarks. Can be expanded with real data.
        """
        # Default benchmarks (suitable for most SMB)
        return {
            "gross_margin_median": 0.65,
            "operating_expense_ratio": 0.45,
            "cogs_percentage": 0.35,
            "employee_cost_average": 25000,
            "rent_per_sqft_average": 50,
            "marketing_spend_percentage": 0.08,
            "utilities_monthly": 500,
            "insurance_annual": 2000,
            "failure_rate_year1": 0.20,
            "break_even_months_median": 18,
            "revenue_to_capital_ratio": 0.30,
            "growth_rate": 0.15
        }
    
    def _map_purpose_to_template(self, plan_purpose: str) -> str:
        """Map plan purpose to compliance template"""
        mapping = {
            "visa_startup": "UK_STARTUP_VISA",
            "visa_innovator": "UK_STARTUP_VISA",
            "loan": "UK_STARTUP_LOAN",
            "investor": "INVESTOR_READY",
            "personal": "GENERIC",
            "generic": "GENERIC"
        }
        return mapping.get(plan_purpose, "GENERIC")
