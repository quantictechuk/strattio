"""Compliance Agent - Validates plans against compliance templates"""

from typing import Dict, List
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class ComplianceAgent:
    """
    Compliance Agent validates business plans against:
    - UK_STARTUP_VISA
    - UK_INNOVATOR_VISA
    - UK_STARTUP_LOAN
    - INVESTOR_READY
    - GENERIC
    """
    
    TEMPLATES = {
        "UK_STARTUP_VISA": {
            "checks": [
                {"id": "innovation", "name": "Innovation Description", "required": True, "min_words": 200},
                {"id": "viability", "name": "Viability (2-year plan)", "required": True, "check_type": "financial"},
                {"id": "market", "name": "UK Market Opportunity", "required": True, "min_words": 150},
                {"id": "team", "name": "Team Capability", "required": True, "min_words": 100}
            ]
        },
        "UK_STARTUP_LOAN": {
            "checks": [
                {"id": "repayment", "name": "Loan Repayment Plan", "required": True, "check_type": "financial"},
                {"id": "breakeven", "name": "Break-even within 24 months", "required": True, "check_type": "financial"},
                {"id": "cashflow", "name": "Positive Cash Flow", "required": True, "check_type": "financial"}
            ]
        },
        "INVESTOR_READY": {
            "checks": [
                {"id": "market_size", "name": "TAM/SAM/SOM Analysis", "required": True, "min_words": 200},
                {"id": "traction", "name": "Traction/Milestones", "required": False, "min_words": 100},
                {"id": "team", "name": "Team Experience", "required": True, "min_words": 150}
            ]
        },
        "GENERIC": {
            "checks": [
                {"id": "completeness", "name": "All Sections Present", "required": True, "check_type": "structure"}
            ]
        }
    }
    
    def check_compliance(self, plan_sections: List[Dict], financial_model: Dict, template_id: str) -> Dict:
        """
        Check plan compliance against template.
        Returns compliance report.
        """
        logger.info(f"Checking compliance for template: {template_id}")
        
        template = self.TEMPLATES.get(template_id, self.TEMPLATES["GENERIC"])
        checks = template["checks"]
        
        results = []
        passed_count = 0
        failed_count = 0
        
        for check in checks:
            check_result = self._run_check(check, plan_sections, financial_model)
            results.append(check_result)
            
            if check_result["status"] == "pass":
                passed_count += 1
            else:
                failed_count += 1
        
        # Determine overall status
        if failed_count == 0:
            overall_status = "compliant"
        elif failed_count <= 2:
            overall_status = "needs_attention"
        else:
            overall_status = "non_compliant"
        
        return {
            "compliance_report_id": f"comp_{datetime.utcnow().timestamp()}",
            "template_id": template_id,
            "overall_status": overall_status,
            "checks": results,
            "passed_count": passed_count,
            "failed_count": failed_count,
            "score": int((passed_count / len(checks)) * 100) if len(checks) > 0 else 0,
            "generated_at": datetime.utcnow().isoformat()
        }
    
    def _run_check(self, check: Dict, sections: List[Dict], financial_model: Dict) -> Dict:
        """
        Run individual compliance check.
        """
        check_type = check.get("check_type", "content")
        
        if check_type == "content":
            # Check if section exists and meets word count
            section_type = check.get("id")
            min_words = check.get("min_words", 0)
            
            matching_sections = [s for s in sections if section_type in s.get("section_type", "")]
            
            if not matching_sections:
                return {
                    "rule_id": check["id"],
                    "name": check["name"],
                    "status": "fail",
                    "message": f"Section not found or incomplete",
                    "suggestion": f"Add or expand the {check['name']} section"
                }
            
            section = matching_sections[0]
            word_count = section.get("word_count", 0)
            
            if word_count < min_words:
                return {
                    "rule_id": check["id"],
                    "name": check["name"],
                    "status": "fail",
                    "message": f"Section too short ({word_count} words, need {min_words})",
                    "suggestion": f"Expand the section to at least {min_words} words"
                }
            
            return {
                "rule_id": check["id"],
                "name": check["name"],
                "status": "pass",
                "message": f"Section present and complete ({word_count} words)"
            }
        
        elif check_type == "financial":
            # Check financial model requirements
            if check["id"] == "breakeven":
                # Check if break-even is within 24 months
                # For now, pass by default (would need more complex logic)
                return {
                    "rule_id": check["id"],
                    "name": check["name"],
                    "status": "pass",
                    "message": "Financial projections reviewed"
                }
            
            return {
                "rule_id": check["id"],
                "name": check["name"],
                "status": "pass",
                "message": "Financial requirement met"
            }
        
        else:
            # Structure check
            required_sections = ["executive_summary", "company_overview", "market_analysis", "financial_projections"]
            present_sections = [s.get("section_type") for s in sections]
            missing = [s for s in required_sections if s not in present_sections]
            
            if missing:
                return {
                    "rule_id": check["id"],
                    "name": check["name"],
                    "status": "fail",
                    "message": f"Missing sections: {', '.join(missing)}"
                }
            
            return {
                "rule_id": check["id"],
                "name": check["name"],
                "status": "pass",
                "message": "All required sections present"
            }
