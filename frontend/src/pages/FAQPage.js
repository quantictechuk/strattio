import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Search } from 'lucide-react';
import Footer from '../components/Footer';

function FAQPage({ navigate, user }) {
  const [openIndex, setOpenIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const faqCategories = [
    {
      title: 'Getting Started',
      icon: '🚀',
      questions: [
        {
          q: 'How do I create my first business plan?',
          a: 'Simply sign up for a free account, click "Create New Plan", and follow our guided intake wizard. You\'ll answer questions about your business, and our AI will generate a comprehensive plan in 60-90 seconds.'
        },
        {
          q: 'Do I need a credit card to get started?',
          a: 'No! Our free tier allows you to create 1 plan per month with full AI generation. You can preview your plan and upgrade anytime to unlock PDF exports and additional features.'
        },
        {
          q: 'How long does it take to generate a business plan?',
          a: 'Typically 60-90 seconds. Our multi-agent AI pipeline works in parallel to research, validate, and write your plan efficiently while ensuring accuracy and compliance.'
        },
        {
          q: 'What information do I need to provide?',
          a: 'Our intake wizard collects essential information including your business idea, target market, financial projections, operating expenses, and business goals. The process takes just a few minutes.'
        }
      ]
    },
    {
      title: 'Pricing & Plans',
      icon: '💰',
      questions: [
        {
          q: 'What\'s included in the Free plan?',
          a: 'The Free plan includes 1 plan per month, basic AI generation, and preview access. You can view your plan but cannot export it as PDF. Perfect for trying out our platform!'
        },
        {
          q: 'What\'s the difference between Starter and Professional plans?',
          a: 'Starter (£12/mo) includes 3 plans per month with PDF export. Professional (£29/mo) offers unlimited plans, editable DOCX & PDF exports, advanced financial charts, visa compliance checking, competitor intelligence, and pitch deck generation.'
        },
        {
          q: 'Can I upgrade or downgrade my plan anytime?',
          a: 'Yes! You can upgrade your plan at any time. Downgrades require contacting support to ensure you don\'t lose access to plans you\'ve already created. Changes take effect immediately.'
        },
        {
          q: 'Do you offer annual billing discounts?',
          a: 'Currently, we offer monthly billing. Annual plans with discounts are coming soon. Contact us if you\'re interested in annual billing for your organization.'
        },
        {
          q: 'What happens if I exceed my plan limit?',
          a: 'You\'ll be notified when approaching your limit. You can either upgrade your plan or wait until the next billing cycle. Free tier users can create 1 plan per month.'
        }
      ]
    },
    {
      title: 'Features & Capabilities',
      icon: '✨',
      questions: [
        {
          q: 'How accurate is the market data in my plan?',
          a: '100% accurate. We use zero-hallucination architecture with verified data from official sources like ONS, Eurostat, and Companies House. Every statistic includes source citations.'
        },
        {
          q: 'Are the financial projections accurate?',
          a: 'Yes! Our deterministic financial engine uses proven formulas, not AI guesses. All P&L statements, cash flow forecasts, and break-even analyses are calculated using mathematical formulas, ensuring reproducible and auditable results.'
        },
        {
          q: 'Can I edit the generated content?',
          a: 'Absolutely! Our rich text editor allows you to edit any section with formatting options (bold, italic, headers, lists). Changes save instantly, and you can regenerate sections with custom tone and length controls.'
        },
        {
          q: 'What templates are available?',
          a: 'We offer 5 specialized templates: General Business Plan, UK Start-Up Loan Application, UK Start-Up Visa, UK Innovator Founder Visa, and Investor Pitch/Fundraising. Each is validated against specific compliance requirements.'
        },
        {
          q: 'Can I export my plan?',
          a: 'Yes! Starter and Professional plans include PDF export. Professional plans also include editable DOCX export. Free plans can preview but cannot export.'
        },
        {
          q: 'Does the plan meet UK visa requirements?',
          a: 'Our UK visa templates (Start-Up Visa and Innovator Founder Visa) are validated against official requirements. We include compliance checking to ensure your plan meets all necessary standards.'
        }
      ]
    },
    {
      title: 'Account & Management',
      icon: '👤',
      questions: [
        {
          q: 'How do I manage my subscription?',
          a: 'Log into your dashboard and click "Manage Subscription" in the usage banner. You can upgrade, view billing history, and manage your plan settings.'
        },
        {
          q: 'Can I delete my account?',
          a: 'Yes, you can delete your account from your dashboard settings. All your plans will be permanently deleted. Contact support if you need assistance.'
        },
        {
          q: 'How many plans can I save?',
          a: 'Free and Starter plans have monthly limits (1 and 3 respectively), but you can save unlimited plans on Professional. All saved plans remain accessible in your dashboard.'
        },
        {
          q: 'Can I duplicate or clone a plan?',
          a: 'Yes! You can duplicate any plan from your dashboard. This is useful for creating variations or updating plans for different purposes (e.g., visa application vs. loan application).'
        },
        {
          q: 'Is my data secure and private?',
          a: 'Absolutely. We use JWT authentication, encrypted data storage, and never share your business information with third parties. We\'re GDPR compliant and take data privacy seriously.'
        }
      ]
    },
    {
      title: 'Technical & Support',
      icon: '🔧',
      questions: [
        {
          q: 'What browsers are supported?',
          a: 'Strattio works on all modern browsers including Chrome, Firefox, Safari, and Edge. We recommend using the latest version for the best experience.'
        },
        {
          q: 'Do you have an API?',
          a: 'API access is available on our Agency/Enterprise plans. Contact sales for API documentation and access details.'
        },
        {
          q: 'What if my plan generation fails?',
          a: 'If generation fails, you\'ll be notified immediately. You can retry at no cost. If issues persist, contact support and we\'ll investigate and ensure your plan is generated successfully.'
        },
        {
          q: 'How do I contact support?',
          a: 'You can reach our support team through the Support link in the footer, or email us directly. Professional and Enterprise plan users receive priority support.'
        },
        {
          q: 'Can I cancel my subscription anytime?',
          a: 'Yes, you can cancel your subscription at any time from your dashboard. You\'ll retain access until the end of your billing period. No refunds for partial months.'
        }
      ]
    }
  ];

  const toggleQuestion = (categoryIndex, questionIndex) => {
    const key = `${categoryIndex}-${questionIndex}`;
    setOpenIndex(openIndex === key ? null : key);
  };

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(qa =>
      qa.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      qa.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>
      {/* Header */}
      <header style={{ 
        padding: '1.25rem 0', 
        background: 'rgba(255, 255, 255, 0.98)', 
        position: 'sticky', 
        top: 0, 
        zIndex: 1000,
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('home')}>
            <img 
              src="/logo.png" 
              alt="Strattio" 
              style={{ height: '36px', width: 'auto' }}
            />
          </div>
          <nav style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); navigate('home'); }}
              style={{ 
                color: '#2D3748', 
                textDecoration: 'none', 
                fontSize: '0.9375rem', 
                fontWeight: '500',
                letterSpacing: '-0.01em',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = '#001639'}
              onMouseLeave={(e) => e.target.style.color = '#2D3748'}
            >
              Home
            </a>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); navigate('features'); }}
              style={{ 
                color: '#2D3748', 
                textDecoration: 'none', 
                fontSize: '0.9375rem', 
                fontWeight: '500',
                letterSpacing: '-0.01em',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = '#001639'}
              onMouseLeave={(e) => e.target.style.color = '#2D3748'}
            >
              Features
            </a>
            <a 
              href="#pricing-section" 
              onClick={(e) => { 
                e.preventDefault(); 
                navigate('home');
                setTimeout(() => {
                  const pricingSection = document.getElementById('pricing-section');
                  if (pricingSection) {
                    pricingSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }, 100);
              }}
              style={{ 
                color: '#2D3748', 
                textDecoration: 'none', 
                fontSize: '0.9375rem', 
                fontWeight: '500',
                letterSpacing: '-0.01em',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = '#001639'}
              onMouseLeave={(e) => e.target.style.color = '#2D3748'}
            >
              Pricing
            </a>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); navigate('faq'); }}
              style={{ 
                color: '#001639', 
                textDecoration: 'none', 
                fontSize: '0.9375rem', 
                fontWeight: '500',
                letterSpacing: '-0.01em',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = '#001639'}
              onMouseLeave={(e) => e.target.style.color = '#001639'}
            >
              FAQ
            </a>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); navigate('contact'); }}
              style={{ 
                color: '#2D3748', 
                textDecoration: 'none', 
                fontSize: '0.9375rem', 
                fontWeight: '500',
                letterSpacing: '-0.01em',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = '#001639'}
              onMouseLeave={(e) => e.target.style.color = '#2D3748'}
            >
              Contact
            </a>
          </nav>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {user ? (
              <button 
                className="btn btn-primary" 
                onClick={() => navigate('dashboard')}
                style={{ padding: '0.625rem 1.5rem', fontSize: '0.9375rem' }}
              >
                Dashboard
              </button>
            ) : (
              <>
                <button 
                  className="btn btn-ghost" 
                  onClick={() => navigate('login')}
                  style={{ 
                    padding: '0.625rem 1.25rem', 
                    fontSize: '0.9375rem',
                    color: '#4A5568',
                    background: 'transparent'
                  }}
                >
                  Sign In
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={() => navigate('register')}
                  style={{ padding: '0.625rem 1.5rem', fontSize: '0.9375rem' }}
                >
                  Start Free Trial
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #001639 0%, #003366 100%)',
        padding: '6rem 0 4rem',
        color: 'white',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)',
          pointerEvents: 'none'
        }} />
        <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '800px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            marginBottom: '1.5rem'
          }}>
            <HelpCircle size={32} color="white" />
          </div>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
            fontWeight: '700',
            marginBottom: '1rem',
            letterSpacing: '-0.03em',
            lineHeight: '1.2'
          }}>
            Frequently Asked Questions
          </h1>
          <p style={{
            fontSize: '1.25rem',
            color: 'rgba(255, 255, 255, 0.9)',
            lineHeight: '1.7',
            maxWidth: '600px',
            margin: '0 auto 2rem'
          }}>
            Everything you need to know about Strattio, from getting started to advanced features.
          </p>

          {/* Search Bar */}
          <div style={{ position: 'relative', maxWidth: '500px', margin: '0 auto' }}>
            <Search size={20} style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94A3B8'
            }} />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '1rem 1rem 1rem 3rem',
                background: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1rem',
                outline: 'none',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
            />
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section style={{ padding: '4rem 0', flex: 1 }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          {filteredCategories.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              background: 'white',
              borderRadius: '16px',
              border: '1px solid #E2E8F0'
            }}>
              <p style={{ fontSize: '1.125rem', color: '#64748B' }}>
                No FAQs found matching "{searchQuery}". Try a different search term.
              </p>
            </div>
          ) : (
            filteredCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} style={{ marginBottom: '3rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1.5rem'
                }}>
                  <span style={{ fontSize: '1.5rem' }}>{category.icon}</span>
                  <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#0F172A',
                    letterSpacing: '-0.02em'
                  }}>
                    {category.title}
                  </h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {category.questions.map((qa, questionIndex) => {
                    const isOpen = openIndex === `${categoryIndex}-${questionIndex}`;
                    return (
                      <div
                        key={questionIndex}
                        style={{
                          background: 'white',
                          borderRadius: '12px',
                          border: '1px solid #E2E8F0',
                          overflow: 'hidden',
                          transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                          e.currentTarget.style.borderColor = '#CBD5E1';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.borderColor = '#E2E8F0';
                        }}
                      >
                        <button
                          onClick={() => toggleQuestion(categoryIndex, questionIndex)}
                          style={{
                            width: '100%',
                            padding: '1.25rem 1.5rem',
                            background: 'none',
                            border: 'none',
                            textAlign: 'left',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '1rem'
                          }}
                        >
                          <h3 style={{
                            fontSize: '1rem',
                            fontWeight: '600',
                            color: '#0F172A',
                            flex: 1,
                            lineHeight: '1.5'
                          }}>
                            {qa.q}
                          </h3>
                          <ChevronDown
                            size={20}
                            style={{
                              color: '#64748B',
                              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: 'transform 0.3s',
                              flexShrink: 0
                            }}
                          />
                        </button>
                        {isOpen && (
                          <div style={{
                            padding: '0 1.5rem 1.25rem 1.5rem',
                            color: '#64748B',
                            lineHeight: '1.7',
                            fontSize: '0.9375rem',
                            animation: 'fadeIn 0.3s ease-in'
                          }}>
                            {qa.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        background: 'white',
        padding: '4rem 0',
        borderTop: '1px solid #E2E8F0'
      }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '600px' }}>
          <h2 style={{
            fontSize: '1.75rem',
            fontWeight: '700',
            color: '#0F172A',
            marginBottom: '1rem'
          }}>
            Still have questions?
          </h2>
          <p style={{
            fontSize: '1rem',
            color: '#64748B',
            marginBottom: '2rem',
            lineHeight: '1.7'
          }}>
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              onClick={() => navigate(user ? 'dashboard' : 'register')}
              style={{
                padding: '0.875rem 2rem',
                fontSize: '1rem'
              }}
            >
              {user ? 'Go to Dashboard' : 'Get Started Free'}
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => navigate('contact')}
              style={{
                padding: '0.875rem 2rem',
                fontSize: '1rem',
                background: 'white',
                border: '1.5px solid #E2E8F0'
              }}
            >
              Contact Support
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer navigate={navigate} user={user} />
    </div>
  );
}

export default FAQPage;
