"""Markdown Generator for Business Plans"""

from datetime import datetime
import os
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

# Use /tmp for exports in Vercel (writable), or local exports directory for development
# Vercel serverless functions have a read-only filesystem except for /tmp
# Vercel automatically sets VERCEL=1 environment variable
def get_exports_dir():
    """Get the exports directory path, using /tmp in Vercel"""
    if os.environ.get("VERCEL") or os.environ.get("VERCEL_ENV"):
        return Path("/tmp/exports")
    else:
        BACKEND_DIR = Path(__file__).parent.parent
        return BACKEND_DIR / "exports"

# Create exports directory lazily (only when needed, not at import time)
def ensure_exports_dir():
    """Ensure exports directory exists"""
    exports_dir = get_exports_dir()
    try:
        exports_dir.mkdir(exist_ok=True, parents=True)
    except (OSError, PermissionError):
        # If we can't create the directory, try /tmp as fallback
        exports_dir = Path("/tmp/exports")
        exports_dir.mkdir(exist_ok=True, parents=True)
    return exports_dir

def generate_business_plan_markdown(plan_data, sections_data, financial_data=None):
    """
    Generate a professional business plan Markdown.
    
    Args:
        plan_data: Plan metadata (name, purpose, etc.)
        sections_data: List of section objects with content
        financial_data: Financial model data (optional)
    
    Returns:
        str: Path to generated Markdown file
    """
    
    # Ensure exports directory exists and get path
    exports_dir = ensure_exports_dir()
    
    # Generate filename
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    filename = f"business_plan_{plan_data.get('id', 'unknown')}_{timestamp}.md"
    filepath = exports_dir / filename
    
    markdown_content = []
    
    # Title
    markdown_content.append(f"# {plan_data.get('name', 'Business Plan')}\n")
    markdown_content.append(f"*Generated on {datetime.utcnow().strftime('%B %d, %Y')} by Strattio*\n")
    markdown_content.append("---\n")
    
    # Table of Contents
    markdown_content.append("## Table of Contents\n")
    
    # Sort sections by order_index
    sorted_sections = sorted(sections_data, key=lambda x: x.get('order_index', 999))
    
    for idx, section in enumerate(sorted_sections):
        markdown_content.append(f"{idx + 1}. [{section.get('title', 'Section')}](#{section.get('title', 'section').lower().replace(' ', '-')})\n")
    
    markdown_content.append("\n---\n")
    
    # Sections
    for idx, section in enumerate(sorted_sections):
        # Section heading
        markdown_content.append(f"\n## {idx + 1}. {section.get('title', 'Section')}\n\n")
        
        # Section content
        content = section.get('content', '')
        
        if not content or content.strip() == "":
            content = f"[{section.get('title')} content to be added]"
        
        # Convert HTML to Markdown
        import re
        # Remove HTML tags but preserve structure
        content = re.sub(r'<strong>(.*?)</strong>', r'**\1**', content)
        content = re.sub(r'<em>(.*?)</em>', r'*\1*', content)
        content = re.sub(r'<h[1-6]>(.*?)</h[1-6]>', r'### \1', content)
        content = re.sub(r'<p>(.*?)</p>', r'\1\n\n', content)
        content = re.sub(r'<br\s*/?>', r'\n', content)
        content = re.sub(r'<[^>]+>', '', content)  # Remove any remaining HTML tags
        
        markdown_content.append(content)
        markdown_content.append("\n\n")
    
    # Financial Summary (if available)
    if financial_data and financial_data.get('data'):
        markdown_content.append("\n---\n")
        markdown_content.append("\n## Financial Summary\n\n")
        
        fin_data = financial_data['data']
        
        # KPIs
        if 'kpis' in fin_data:
            kpis = fin_data['kpis']
            markdown_content.append("### Key Performance Indicators (Year 1)\n\n")
            markdown_content.append(f"- **Gross Margin:** {kpis.get('gross_margin_percent', 0):.1f}%\n")
            markdown_content.append(f"- **Net Margin:** {kpis.get('net_margin_percent', 0):.1f}%\n")
            markdown_content.append(f"- **ROI:** {kpis.get('roi_year1_percent', 0):.1f}%\n\n")
        
        # P&L Table
        if 'pnl_annual' in fin_data:
            markdown_content.append("### 5-Year Financial Projections\n\n")
            markdown_content.append("| Metric | Year 1 | Year 2 | Year 3 | Year 4 | Year 5 |\n")
            markdown_content.append("|--------|--------|--------|--------|--------|--------|\n")
            
            pnl = fin_data['pnl_annual']
            
            # Revenue row
            revenue_row = "| Revenue (£) |"
            for year in pnl[:5]:
                revenue_row += f" £{year.get('revenue', 0):,.0f} |"
            markdown_content.append(revenue_row + "\n")
            
            # Gross Profit row
            gp_row = "| Gross Profit (£) |"
            for year in pnl[:5]:
                gp_row += f" £{year.get('gross_profit', 0):,.0f} |"
            markdown_content.append(gp_row + "\n")
            
            # Net Profit row
            np_row = "| Net Profit (£) |"
            for year in pnl[:5]:
                np_row += f" £{year.get('net_profit', 0):,.0f} |"
            markdown_content.append(np_row + "\n")
    
    # Write to file
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(''.join(markdown_content))
    
    logger.info(f"Generated Markdown: {filepath}")
    return str(filepath)
