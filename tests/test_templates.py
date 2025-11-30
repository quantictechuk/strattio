"""Test Template System - Verify all templates work correctly"""

import sys
sys.path.append('/app/backend')

from agents.templates import TemplateFactory

def test_all_templates_load():
    """Test that all templates load and have correct section counts"""
    print("\n=== Testing Template System ===\n")
    
    expected_counts = {
        'generic': 11,
        'loan': 15,
        'visa_startup': 16,
        'visa_innovator': 17,
        'investor': 19
    }
    
    all_passed = True
    
    for plan_purpose, expected_count in expected_counts.items():
        config = TemplateFactory.get_template(plan_purpose)
        sections = TemplateFactory.get_all_sections_for_plan(plan_purpose)
        actual_count = len(sections)
        
        status = "✅ PASS" if actual_count == expected_count else "❌ FAIL"
        
        if actual_count != expected_count:
            all_passed = False
        
        print(f"{status} - {config.template_name}")
        print(f"   Expected: {expected_count} sections, Got: {actual_count} sections")
        print(f"   Tone: {config.tone}")
        print(f"   Emphasis: {config.emphasis}")
        print()
    
    return all_passed

def test_section_overrides():
    """Test that section overrides are applied correctly"""
    print("\n=== Testing Section Overrides ===\n")
    
    # Test loan template executive summary override
    loan_exec = TemplateFactory.get_section_definition('loan', 'executive_summary')
    
    if "loan request" in loan_exec.instructions.lower():
        print("✅ PASS - Loan executive summary override applied")
        print(f"   Instructions include: 'loan request'")
    else:
        print("❌ FAIL - Loan executive summary override not applied")
        return False
    
    # Test investor template executive summary override
    investor_exec = TemplateFactory.get_section_definition('investor', 'executive_summary')
    
    if "investor pitch" in investor_exec.instructions.lower():
        print("✅ PASS - Investor executive summary override applied")
        print(f"   Instructions include: 'investor pitch'")
    else:
        print("❌ FAIL - Investor executive summary override not applied")
        return False
    
    print()
    return True

def test_additional_sections():
    """Test that additional sections are included correctly"""
    print("\n=== Testing Additional Sections ===\n")
    
    # Test loan template has loan-specific sections
    loan_sections = TemplateFactory.get_all_sections_for_plan('loan')
    loan_section_types = [s.section_type for s in loan_sections]
    
    required_loan_sections = ['loan_request', 'survival_budget', 'repayment_plan', 'loan_eligibility']
    
    missing = [s for s in required_loan_sections if s not in loan_section_types]
    
    if not missing:
        print("✅ PASS - Loan template has all required additional sections")
        print(f"   Found: {', '.join(required_loan_sections)}")
    else:
        print(f"❌ FAIL - Loan template missing: {', '.join(missing)}")
        return False
    
    # Test visa_startup template has visa-specific sections
    visa_sections = TemplateFactory.get_all_sections_for_plan('visa_startup')
    visa_section_types = [s.section_type for s in visa_sections]
    
    required_visa_sections = ['innovation_section', 'viability_assessment', 'scalability_roadmap', 'uk_job_creation']
    
    missing = [s for s in required_visa_sections if s not in visa_section_types]
    
    if not missing:
        print("✅ PASS - Visa Start-Up template has all required additional sections")
        print(f"   Found: {', '.join(required_visa_sections)}")
    else:
        print(f"❌ FAIL - Visa Start-Up template missing: {', '.join(missing)}")
        return False
    
    # Test investor template has investor-specific sections
    investor_sections = TemplateFactory.get_all_sections_for_plan('investor')
    investor_section_types = [s.section_type for s in investor_sections]
    
    required_investor_sections = ['tam_sam_som', 'traction_metrics', 'unit_economics', 'exit_strategy']
    
    missing = [s for s in required_investor_sections if s not in investor_section_types]
    
    if not missing:
        print("✅ PASS - Investor template has all required additional sections")
        print(f"   Found: {', '.join(required_investor_sections)}")
    else:
        print(f"❌ FAIL - Investor template missing: {', '.join(missing)}")
        return False
    
    print()
    return True

def test_section_ordering():
    """Test that sections are ordered correctly"""
    print("\n=== Testing Section Ordering ===\n")
    
    all_passed = True
    
    for plan_purpose in ['generic', 'loan', 'visa_startup', 'visa_innovator', 'investor']:
        sections = TemplateFactory.get_all_sections_for_plan(plan_purpose)
        
        # Check that order_index increases monotonically
        for i in range(1, len(sections)):
            if sections[i].order_index <= sections[i-1].order_index:
                print(f"❌ FAIL - {plan_purpose} has incorrect ordering")
                all_passed = False
                break
        else:
            print(f"✅ PASS - {plan_purpose} sections ordered correctly (0-{len(sections)-1})")
    
    print()
    return all_passed

if __name__ == "__main__":
    print("\n" + "="*60)
    print("TEMPLATE SYSTEM TEST SUITE")
    print("="*60)
    
    results = []
    
    # Run all tests
    results.append(("Template Loading", test_all_templates_load()))
    results.append(("Section Overrides", test_section_overrides()))
    results.append(("Additional Sections", test_additional_sections()))
    results.append(("Section Ordering", test_section_ordering()))
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60 + "\n")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print(f"\n{passed}/{total} test suites passed")
    
    if passed == total:
        print("\n🎉 All tests passed! Template system is working correctly.\n")
        sys.exit(0)
    else:
        print(f"\n⚠️ {total - passed} test suite(s) failed.\n")
        sys.exit(1)
