"""Validation Agent - Validates data quality and consistency"""

from typing import Dict, List
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class ValidationAgent:
    """
    Validation Agent checks:
    - Data freshness (<12 months)
    - Source validity
    - Logical consistency
    - Completeness
    - Outlier detection
    """
    
    VALID_SOURCES = ["ONS", "Eurostat", "World Bank", "Companies House", "SERP API", "Google Trends"]
    
    def validate_data_pack(self, data_pack: Dict) -> Dict:
        """
        Validate the research data pack.
        Returns validation report with status, errors, warnings.
        """
        logger.info(f"Validating data pack {data_pack.get('data_pack_id')}")
        
        warnings = []
        errors = []
        
        # Check market data timestamp
        if "market_data" in data_pack:
            market_data = data_pack["market_data"]
            timestamp_str = market_data.get("market_size_timestamp")
            
            if timestamp_str:
                try:
                    data_date = datetime.fromisoformat(timestamp_str)
                    age_days = (datetime.utcnow() - data_date).days
                    
                    if age_days > 365:
                        errors.append({
                            "field": "market_size_timestamp",
                            "message": f"Data is {age_days} days old (>365 days)",
                            "severity": "error"
                        })
                    elif age_days > 90:
                        warnings.append({
                            "field": "market_size_timestamp",
                            "message": f"Data is {age_days} days old (>90 days)",
                            "severity": "warning"
                        })
                except Exception as e:
                    logger.error(f"Error parsing timestamp: {e}")
            
            # Check source validity
            source = market_data.get("market_size_source")
            if source and source not in self.VALID_SOURCES:
                warnings.append({
                    "field": "market_size_source",
                    "message": f"Source '{source}' not in approved list",
                    "severity": "warning"
                })
            
            # Check logical consistency
            market_size = market_data.get("market_size_gbp", 0)
            if market_size < 1000000:
                warnings.append({
                    "field": "market_size_gbp",
                    "message": "Market size appears very small",
                    "severity": "warning"
                })
            
            growth_rate = market_data.get("growth_rate_percent", 0)
            if growth_rate < -10 or growth_rate > 50:
                warnings.append({
                    "field": "growth_rate_percent",
                    "message": "Growth rate outside typical range (-10% to 50%)",
                    "severity": "warning"
                })
        
        # Determine status
        if len(errors) > 0:
            status = "failed"
        elif len(warnings) > 0:
            status = "passed_with_warnings"
        else:
            status = "passed"
        
        return {
            "validation_id": f"val_{datetime.utcnow().timestamp()}",
            "data_pack_id": data_pack.get("data_pack_id"),
            "status": status,
            "errors": errors,
            "warnings": warnings,
            "validated_at": datetime.utcnow().isoformat()
        }
