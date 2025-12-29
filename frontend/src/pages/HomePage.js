import React from 'react';
import { FileText, Bot, Download, BarChart3, ShieldCheck, Target, Globe2, Check, CheckCircle2, ShieldCheck as ShieldCheckIcon, Zap, ArrowRight } from 'lucide-react';
import Footer from '../components/Footer';

function HomePage({ navigate, user }) {
  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
      {/* Premium Header */}
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
                const pricingSection = document.getElementById('pricing-section');
                if (pricingSection) {
                  pricingSection.scrollIntoView({ behavior: 'smooth' });
                } else {
                  navigate('home');
                  setTimeout(() => {
                    const section = document.getElementById('pricing-section');
                    if (section) {
                      section.scrollIntoView({ behavior: 'smooth' });
                    }
                  }, 100);
                }
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
                data-testid="goto-dashboard-btn"
                style={{ padding: '0.625rem 1.5rem', fontSize: '0.9375rem' }}
              >
                Dashboard
              </button>
            ) : (
              <>
                <button 
                  className="btn btn-ghost" 
                  onClick={() => navigate('login')}
                  data-testid="goto-login-btn"
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
                  data-testid="goto-register-btn"
                  style={{ padding: '0.625rem 1.5rem', fontSize: '0.9375rem' }}
                >
                  Start Free Trial
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section - Split Layout */}
      <section style={{ 
        background: '#F8FAFC',
        padding: '8rem 0 5rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Abstract Background Grid */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(to right, #F1F5F9 1px, transparent 1px), linear-gradient(to bottom, #F1F5F9 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          opacity: 0.4,
          pointerEvents: 'none'
        }}></div>
        
        {/* Subtle Gradient Spots */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '1280px',
          height: '100%',
          zIndex: 0,
          pointerEvents: 'none'
        }}>
          <div style={{
            position: 'absolute',
            top: '-10%',
            left: '-10%',
            width: '600px',
            height: '600px',
            background: 'rgba(0, 22, 57, 0.1)',
            borderRadius: '50%',
            filter: 'blur(120px)',
            opacity: 0.5
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '-10%',
            right: '-10%',
            width: '600px',
            height: '600px',
            background: '#E2E8F0',
            borderRadius: '50%',
            filter: 'blur(120px)',
            opacity: 0.5
          }}></div>
        </div>

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '4rem',
            alignItems: 'center',
            maxWidth: '1400px',
            margin: '0 auto'
          }}>
            {/* Left Side - Content */}
            <div>
              {/* Badge */}
              <div style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'white',
                border: '1px solid #E2E8F0',
                borderRadius: '100px',
                padding: '0.375rem 0.75rem',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                marginBottom: '2rem'
              }}>
                <span style={{ 
                  display: 'flex',
                  height: '8px',
                  width: '8px',
                  position: 'relative'
                }}>
                  <span style={{
                    position: 'absolute',
                    display: 'inline-flex',
                    height: '100%',
                    width: '100%',
                    borderRadius: '50%',
                    background: '#001639',
                    opacity: 0.75,
                    animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite'
                  }}></span>
                  <span style={{
                    position: 'relative',
                    display: 'inline-flex',
                    borderRadius: '50%',
                    height: '8px',
                    width: '8px',
                    background: '#001639'
                  }}></span>
                </span>
                <span style={{ 
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: '#64748B',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}>
                  New: Visa-Ready Export v2.0
                </span>
              </div>
              
              {/* Headline */}
              <h1 style={{ 
                fontSize: 'clamp(2.75rem, 5vw, 4.5rem)', 
                marginBottom: '1.5rem', 
                color: '#0F1419',
                lineHeight: '1.1',
                fontWeight: '700',
                letterSpacing: '-0.04em'
              }}>
                The Operating System for<br />
                <span style={{ 
                  color: '#001639',
                  background: 'linear-gradient(135deg, #001639 0%, #003366 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>Professional Planning</span>
              </h1>
              
              {/* Description */}
              <p style={{ 
                fontSize: '1.125rem', 
                color: '#4A5568', 
                marginBottom: '2.5rem',
                lineHeight: '1.7',
                fontWeight: '400',
                letterSpacing: '-0.01em',
                maxWidth: '560px'
              }}>
                Generate bank-compliant, investor-grade business plans with deterministic financial modeling. 
                Zero hallucination, 100% auditable data.
              </p>
              
              {/* CTA Buttons */}
              <div style={{ 
                display: 'flex', 
                gap: '1rem', 
                marginBottom: '2.5rem',
                flexWrap: 'wrap'
              }}>
                <button 
                  className="btn btn-primary" 
                  onClick={() => navigate(user ? 'dashboard' : 'register')}
                  data-testid="hero-cta-btn"
                  style={{ 
                    fontSize: '1rem', 
                    padding: '1rem 2rem',
                    boxShadow: '0 4px 16px rgba(0, 22, 57, 0.2)',
                    fontWeight: '600',
                    letterSpacing: '-0.01em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  Get Started for Free
                  <ArrowRight size={18} />
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => navigate('features')}
                  style={{ 
                    fontSize: '1rem', 
                    padding: '1rem 2rem',
                    border: '1.5px solid #E4E9EF',
                    fontWeight: '600',
                    letterSpacing: '-0.01em',
                    background: 'white'
                  }}
                >
                  Explore Features
                </button>
              </div>

              {/* Trust Indicators */}
              <div style={{ 
                display: 'flex',
                gap: '2rem',
                flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="#10B981" style={{ marginRight: '0.5rem' }} />
                  <span style={{ color: '#4A5568', fontSize: '0.9375rem', fontWeight: '500' }}>
                    No credit card required
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheckIcon size={16} color="#10B981" style={{ marginRight: '0.5rem' }} />
                  <span style={{ color: '#4A5568', fontSize: '0.9375rem', fontWeight: '500' }}>
                    GDPR Compliant
                  </span>
                </div>
              </div>
            </div>

            {/* Right Side - Dashboard Preview */}
            <div style={{
              position: 'relative',
              background: '#FFFFFF',
              borderRadius: '16px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.12), 0 0 1px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              overflow: 'hidden'
            }}>
              {/* Browser Bar */}
              <div style={{
                background: '#F8FAFB',
                padding: '0.75rem 1rem',
                borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <div style={{ display: 'flex', gap: '0.375rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FF5F57' }}></div>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FFBD2E' }}></div>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#28CA42' }}></div>
                </div>
                <div style={{
                  flex: 1,
                  background: 'white',
                  borderRadius: '6px',
                  padding: '0.5rem 1rem',
                  fontSize: '0.8125rem',
                  color: '#6B7A91',
                  textAlign: 'center',
                  border: '1px solid rgba(0, 0, 0, 0.06)'
                }}>
                  strattio.com/dashboard/project-alpha
                </div>
              </div>

              {/* Dashboard Content */}
              <div style={{ padding: '2rem', background: '#FFFFFF' }}>
                {/* Chart Section */}
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '1rem'
                  }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#0F1419' }}>Financial Overview</h3>
                    <div style={{ fontSize: '0.8125rem', color: '#6B7A91' }}>Last 12 months</div>
                  </div>
                  
                  {/* Bar Chart */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '0.5rem',
                    height: '120px',
                    marginBottom: '1rem'
                  }}>
                    {[45, 52, 48, 65, 58, 72, 68, 85, 78, 92, 88, 105].map((height, idx) => (
                      <div key={idx} style={{
                        flex: 1,
                        background: idx === 11 ? '#001639' : 'rgba(0, 22, 57, 0.1)',
                        height: `${height}%`,
                        borderRadius: '4px 4px 0 0',
                        position: 'relative',
                        transition: 'all 0.3s'
                      }}>
                        {idx === 11 && (
                          <div style={{
                            position: 'absolute',
                            top: '-24px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: '#10B981',
                            color: 'white',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            whiteSpace: 'nowrap'
                          }}>
                            +12.5%
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metrics Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem'
                }}>
                  <div style={{
                    background: '#F8FAFB',
                    padding: '1rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(0, 0, 0, 0.06)'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: '#6B7A91', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Revenue
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0F1419' }}>
                      £245K
                    </div>
                  </div>
                  <div style={{
                    background: '#F8FAFB',
                    padding: '1rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(0, 0, 0, 0.06)'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: '#6B7A91', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Growth
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10B981' }}>
                      +18.2%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trusted By Strip */}
          <div style={{
            marginTop: '5rem',
            paddingTop: '2.5rem',
            borderTop: '1px solid #E2E8F0'
          }}>
            <p style={{
              textAlign: 'center',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#94A3B8',
              marginBottom: '1.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}>
              Trusted by modern business leaders
            </p>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '2rem 4rem',
              filter: 'grayscale(100%)',
              opacity: 0.4
            }}>
              <span style={{ fontSize: '1.25rem', fontWeight: '700', fontFamily: 'serif', fontStyle: 'italic' }}>Vanguard</span>
              <span style={{ fontSize: '1.25rem', fontWeight: '700', letterSpacing: '-0.05em' }}>NEXUS</span>
              <span style={{ fontSize: '1.25rem', fontWeight: '700', fontFamily: 'monospace' }}>block.io</span>
              <span style={{ fontSize: '1.25rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Global</span>
              <span style={{ fontSize: '1.25rem', fontWeight: '700' }}>Acme Corp</span>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Capabilities Section */}
      <section style={{ padding: '6rem 0', background: '#FFFFFF' }}>
        <div className="container" style={{ maxWidth: '1280px' }}>
          {/* Section Header */}
          <div style={{ maxWidth: '768px', margin: '0 auto 4rem', textAlign: 'center' }}>
            <div style={{
              fontSize: '0.875rem',
              color: '#001639',
              fontWeight: '600',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '0.5rem'
            }}>
              Platform Capabilities
            </div>
            <h2 style={{ 
              fontSize: 'clamp(1.875rem, 4vw, 2.25rem)', 
              marginBottom: '1.5rem', 
              color: '#0F172A', 
              fontWeight: '700',
              letterSpacing: '-0.03em',
              lineHeight: '1.2'
            }}>
              Precision engineering for your business narrative.
            </h2>
            <p style={{ 
              fontSize: '1.125rem', 
              color: '#64748B', 
              lineHeight: '1.7',
              letterSpacing: '-0.01em'
            }}>
              We combine deterministic financial modeling with generative AI to produce documents that stand up to the rigorous scrutiny of visa officers and loan underwriters.
            </p>
          </div>

          {/* Bento Grid Layout */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.5rem',
            gridAutoRows: 'minmax(200px, auto)'
          }}>
              {/* Feature 1: Deterministic Financials - Large Box (spans 2 columns) */}
              <div style={{
                gridColumn: 'span 2',
                borderRadius: '16px',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '2rem',
                overflow: 'hidden',
                transition: 'border-color 0.3s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#CBD5E1'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#E2E8F0'}
              >
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#001639'
                  }}>
                    <BarChart3 size={24} strokeWidth={1.5} />
                  </div>
                  <h3 style={{ 
                    fontSize: '1.5rem', 
                    marginBottom: '0.5rem', 
                    color: '#0F172A', 
                    fontWeight: '700',
                    letterSpacing: '-0.02em'
                  }}>
                    Deterministic Financials
                  </h3>
                  <p style={{ 
                    color: '#64748B', 
                    lineHeight: '1.7',
                    fontSize: '0.9375rem',
                    marginBottom: '0.5rem'
                  }}>
                    Unlike generic LLMs, Strattio uses a rigid mathematical engine for financial projections. Your P&L, Balance Sheet, and Cash Flow connect perfectly.
                  </p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0.5rem 0 0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <li style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '0.875rem',
                      color: '#334155'
                    }}>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: '#001639',
                        marginRight: '0.5rem',
                        flexShrink: 0
                      }}></div>
                      Automatic 5-year projections
                    </li>
                    <li style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '0.875rem',
                      color: '#334155'
                    }}>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: '#001639',
                        marginRight: '0.5rem',
                        flexShrink: 0
                      }}></div>
                      Break-even analysis included
                    </li>
                  </ul>
                </div>
                <div style={{ flex: 1, position: 'relative', width: '100%' }}>
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to right, #F8FAFC, transparent, transparent)',
                    zIndex: 10,
                    pointerEvents: 'none'
                  }}></div>
                  {/* Abstract Chart UI */}
                  <div style={{
                    background: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                    border: '1px solid #E2E8F0',
                    padding: '1rem',
                    width: '100%',
                    height: '100%',
                    transform: 'scale(1)',
                    transformOrigin: 'left',
                    transition: 'transform 0.5s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: '#F1F5F9'
                      }}></div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div style={{ height: '8px', width: '80px', background: '#F1F5F9', borderRadius: '4px' }}></div>
                        <div style={{ height: '8px', width: '48px', background: '#F1F5F9', borderRadius: '4px' }}></div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ height: '32px', background: '#F8FAFC', borderRadius: '4px', width: '100%' }}></div>
                      <div style={{ height: '32px', background: '#F8FAFC', borderRadius: '4px', width: '100%' }}></div>
                      <div style={{ height: '32px', background: '#F8FAFC', borderRadius: '4px', width: '100%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature 2: Visa & Loan Compliance - Tall Box (spans 2 rows) */}
              <div style={{
                gridRow: 'span 2',
                borderRadius: '16px',
                background: '#0F172A',
                color: 'white',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <div style={{ position: 'relative', zIndex: 10 }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: '#1E293B',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem',
                    border: '1px solid #334155',
                    color: 'white'
                  }}>
                    <ShieldCheck size={24} strokeWidth={1.5} />
                  </div>
                  <h3 style={{ 
                    fontSize: '1.5rem', 
                    marginBottom: '1rem', 
                    color: 'white', 
                    fontWeight: '700',
                    letterSpacing: '-0.02em'
                  }}>
                    Visa & Loan Compliance
                  </h3>
                  <p style={{ 
                    color: '#94A3B8', 
                    lineHeight: '1.7',
                    fontSize: '0.9375rem',
                    marginBottom: '1.5rem'
                  }}>
                    Pre-configured templates for UK Innovator Founder Visa, SBA 7(a) Loans, and Tier 1 Investor schemes. We check your plan against official scoring criteria.
                  </p>
                </div>
                
                <div style={{
                  position: 'relative',
                  zIndex: 10,
                  background: 'rgba(30, 41, 59, 0.5)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                  padding: '1rem',
                  border: '1px solid #334155'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.75rem',
                    paddingBottom: '0.75rem',
                    borderBottom: '1px solid #334155'
                  }}>
                    <span style={{
                      fontSize: '0.75rem',
                      fontFamily: 'monospace',
                      color: '#94A3B8',
                      fontWeight: '600'
                    }}>
                      COMPLIANCE_CHECK
                    </span>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      color: '#34D399'
                    }}>
                      PASSED
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {['Executive Summary', 'Market Validation', 'Financial Viability'].map((item, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '0.75rem',
                        color: '#CBD5E1'
                      }}>
                        <span style={{ 
                          color: '#10B981', 
                          marginRight: '0.5rem',
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}>✓</span>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Background Gradient */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '256px',
                  height: '256px',
                  background: '#001639',
                  borderRadius: '50%',
                  filter: 'blur(100px)',
                  opacity: 0.2,
                  pointerEvents: 'none'
                }}></div>
              </div>

              {/* Feature 3: Zero Hallucination - Small Box */}
              <div style={{
                borderRadius: '16px',
                background: 'white',
                border: '1px solid #E2E8F0',
                padding: '2rem',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                transition: 'box-shadow 0.3s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)'}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'rgba(0, 22, 57, 0.06)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                  color: '#001639'
                }}>
                  <Target size={20} strokeWidth={1.5} />
                </div>
                <h3 style={{ 
                  fontSize: '1.125rem', 
                  marginBottom: '0.5rem', 
                  color: '#0F172A', 
                  fontWeight: '700',
                  letterSpacing: '-0.01em'
                }}>
                  Zero Hallucination
                </h3>
                <p style={{ 
                  color: '#64748B', 
                  lineHeight: '1.6',
                  fontSize: '0.875rem'
                }}>
                  Every statistic is cited. We don't invent numbers; we source them.
                </p>
              </div>

              {/* Feature 4: Global Data Sourcing - Small Box */}
              <div style={{
                borderRadius: '16px',
                background: 'white',
                border: '1px solid #E2E8F0',
                padding: '2rem',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                transition: 'box-shadow 0.3s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)'}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'rgba(0, 22, 57, 0.06)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                  color: '#001639'
                }}>
                  <Globe2 size={20} strokeWidth={1.5} />
                </div>
                <h3 style={{ 
                  fontSize: '1.125rem', 
                  marginBottom: '0.5rem', 
                  color: '#0F172A', 
                  fontWeight: '700',
                  letterSpacing: '-0.01em'
                }}>
                  Global Data Sourcing
                </h3>
                <p style={{ 
                  color: '#64748B', 
                  lineHeight: '1.6',
                  fontSize: '0.875rem'
                }}>
                  Live connections to ONS, Eurostat, and Statista for market sizing.
                </p>
              </div>
            </div>
        </div>
      </section>

      {/* The Process Section */}
      <section style={{ padding: '6rem 0', background: '#F8FAFC' }}>
        <div className="container" style={{ maxWidth: '1280px' }}>
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '4rem',
            alignItems: 'flex-start'
          }}>
            {/* Left Header */}
            <div style={{ flex: '0 0 33.333%', position: 'sticky', top: '8rem' }}>
              <div style={{
                fontSize: '0.875rem',
                color: '#001639',
                fontWeight: '600',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '0.5rem'
              }}>
                The Process
              </div>
              <h2 style={{
                fontSize: 'clamp(1.875rem, 3vw, 2.25rem)',
                marginBottom: '1.5rem',
                color: '#0F172A',
                fontWeight: '700',
                letterSpacing: '-0.03em',
                lineHeight: '1.2'
              }}>
                From Idea to Audit-Ready Plan.
              </h2>
              <p style={{
                fontSize: '1.125rem',
                color: '#64748B',
                lineHeight: '1.7',
                marginBottom: '2rem'
              }}>
                We've distilled the complexity of business planning into a streamlined, intelligent workflow that respects your time.
              </p>
              <button
                onClick={() => navigate('features')}
                style={{
                  color: '#001639',
                  fontWeight: '600',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.9375rem',
                  padding: 0
                }}
                onMouseEnter={(e) => e.target.style.color = '#003366'}
                onMouseLeave={(e) => e.target.style.color = '#001639'}
              >
                See documentation details →
              </button>
            </div>

            {/* Right Timeline */}
            <div style={{ flex: '0 0 66.666%', position: 'relative' }}>
              {/* Vertical Line */}
              <div style={{
                position: 'absolute',
                left: '32px',
                top: '32px',
                bottom: '32px',
                width: '1px',
                background: '#E2E8F0'
              }}></div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
                {[
                  {
                    id: 1,
                    title: 'Guided Intake Protocol',
                    description: 'Our adaptive questionnaire learns about your business context. Answer high-level strategy questions, and we handle the granular details.',
                    icon: FileText
                  },
                  {
                    id: 2,
                    title: 'Multi-Agent Generation',
                    description: 'Seven specialized AI agents work in parallel: A Market Researcher, a Financial Analyst, a Strategist, and a Copywriter collaborate on your document.',
                    icon: Bot
                  },
                  {
                    id: 3,
                    title: 'Review & Export',
                    description: 'Refine the output in our collaborative editor. Export to perfectly formatted PDF or fully editable DOCX suitable for official submission.',
                    icon: Download
                  }
                ].map((step) => (
                  <div key={step.id} style={{ position: 'relative', paddingLeft: '6rem' }}>
                    {/* Icon Marker */}
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      width: '64px',
                      height: '64px',
                      background: 'white',
                      border: '1px solid #E2E8F0',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#0F172A',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                      zIndex: 10,
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#001639';
                      e.currentTarget.style.color = '#001639';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#E2E8F0';
                      e.currentTarget.style.color = '#0F172A';
                    }}
                    >
                      <step.icon size={28} strokeWidth={1.5} />
                    </div>

                    <div style={{
                      background: 'white',
                      borderRadius: '12px',
                      padding: '2rem',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                      transition: 'box-shadow 0.3s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          color: '#001639',
                          background: 'rgba(0, 22, 57, 0.06)',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px'
                        }}>
                          STEP 0{step.id}
                        </span>
                      </div>
                      <h4 style={{
                        fontSize: '1.25rem',
                        fontWeight: '700',
                        color: '#0F172A',
                        marginBottom: '0.75rem'
                      }}>
                        {step.title}
                      </h4>
                      <p style={{
                        color: '#64748B',
                        lineHeight: '1.7'
                      }}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing-section" style={{ padding: '6rem 0', background: 'white', borderTop: '1px solid #E2E8F0' }}>
        <div className="container" style={{ maxWidth: '1280px' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{
              fontSize: '0.875rem',
              color: '#001639',
              fontWeight: '600',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '0.5rem'
            }}>
              Pricing
            </div>
            <h2 style={{
              fontSize: 'clamp(1.875rem, 3vw, 2.25rem)',
              marginBottom: '1rem',
              color: '#0F172A',
              fontWeight: '700',
              letterSpacing: '-0.03em',
              lineHeight: '1.2'
            }}>
              Transparent Investment
            </h2>
            <p style={{
              fontSize: '1.125rem',
              color: '#64748B',
              maxWidth: '640px',
              margin: '0 auto',
              lineHeight: '1.7'
            }}>
              Choose the capacity that matches your business stage. No hidden fees.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '2rem',
            maxWidth: '1280px',
            margin: '0 auto'
          }}>
            {[
              {
                name: 'Free',
                price: '£0',
                period: '/mo',
                description: 'Perfect for trying out our platform.',
                cta: 'Get Started',
                features: [
                  '1 Plan per month',
                  'Basic AI generation',
                  'Preview only',
                  'No exports'
                ],
                highlighted: false
              },
              {
                name: 'Starter',
                price: '£12',
                period: '/mo',
                description: 'Essential tools for early-stage validation.',
                cta: 'Start Trial',
                features: [
                  '3 Business Plans',
                  'Standard PDF Export',
                  '5-Year Financials',
                  'SWOT Analysis'
                ],
                highlighted: false
              },
              {
                name: 'Professional',
                price: '£29',
                period: '/mo',
                description: 'Complete suite for funding and visa applications.',
                cta: 'Get Professional',
                features: [
                  'Unlimited Business Plans',
                  'Editable DOCX & PDF',
                  'Advanced Investor Charts',
                  'Visa Compliance Check',
                  'Competitor Intelligence',
                  'Pitch Deck Generator'
                ],
                highlighted: true
              },
              {
                name: 'Agency',
                price: '£99',
                period: '/mo',
                description: 'For consultants managing multiple clients.',
                cta: 'Contact Sales',
                features: [
                  '5 Team Seats',
                  'White-Label Reports',
                  'Client Management Portal',
                  'API Access',
                  'Priority Support',
                  'Custom Templates'
                ],
                highlighted: false
              }
            ].map((tier, index) => (
              <div
                key={index}
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '2rem',
                  borderRadius: '16px',
                  transition: 'all 0.3s',
                  ...(tier.highlighted ? {
                    background: '#0F172A',
                    color: 'white',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                    transform: 'scale(1.05)',
                    zIndex: 10
                  } : {
                    background: 'white',
                    border: '1px solid #E2E8F0',
                    color: '#0F172A'
                  })
                }}
              >
                {tier.highlighted && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    transform: 'translate(12px, -12px)'
                  }}>
                    <span style={{
                      background: '#001639',
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '100px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Recommended
                    </span>
                  </div>
                )}

                <div style={{ marginBottom: '2rem' }}>
                  <h4 style={{
                    fontSize: '1.125rem',
                    fontWeight: '700',
                    marginBottom: '0.5rem',
                    color: tier.highlighted ? 'white' : '#0F172A'
                  }}>
                    {tier.name}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '1rem' }}>
                    <span style={{
                      fontSize: '2.5rem',
                      fontWeight: '800',
                      letterSpacing: '-0.02em',
                      color: tier.highlighted ? 'white' : '#0F172A'
                    }}>
                      {tier.price}
                    </span>
                    <span style={{
                      fontSize: '0.875rem',
                      marginLeft: '0.25rem',
                      color: tier.highlighted ? 'rgba(255, 255, 255, 0.6)' : '#64748B'
                    }}>
                      {tier.period}
                    </span>
                  </div>
                  <p style={{
                    fontSize: '0.875rem',
                    lineHeight: '1.6',
                    color: tier.highlighted ? 'rgba(255, 255, 255, 0.7)' : '#64748B'
                  }}>
                    {tier.description}
                  </p>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                  {tier.features.map((feature, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start' }}>
                      <div style={{
                        marginTop: '2px',
                        borderRadius: '50%',
                        padding: '2px',
                        marginRight: '0.75rem',
                        ...(tier.highlighted ? {
                          background: 'rgba(0, 22, 57, 0.2)',
                          color: '#001639'
                        } : {
                          background: 'rgba(0, 22, 57, 0.06)',
                          color: '#001639'
                        })
                      }}>
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <span style={{
                        fontSize: '0.875rem',
                        color: tier.highlighted ? 'rgba(255, 255, 255, 0.9)' : '#334155'
                      }}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  className={tier.highlighted ? 'btn btn-primary' : 'btn btn-secondary'}
                  onClick={() => navigate(user ? 'dashboard' : 'register')}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1.5rem',
                    fontWeight: '600',
                    ...(tier.highlighted ? {
                      background: '#001639',
                      color: 'white',
                      border: 'none'
                    } : {
                      background: 'white',
                      color: '#001639',
                      border: '1.5px solid #E2E8F0'
                    })
                  }}
                >
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Final CTA */}
      <section style={{ 
        background: '#0F172A',
        padding: '6rem 0',
        color: 'white',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '800px' }}>
          <h2 style={{ 
            fontSize: 'clamp(2.25rem, 4vw, 3rem)', 
            marginBottom: '1.5rem', 
            fontWeight: '700',
            letterSpacing: '-0.03em',
            lineHeight: '1.2',
            color: 'white'
          }}>
            Your roadmap to funding{' '}
            <span style={{ color: '#60A5FA' }}>starts here.</span>
          </h2>
          <p style={{ 
            fontSize: '1.125rem', 
            color: 'white', 
            marginBottom: '2.5rem', 
            maxWidth: '640px', 
            margin: '0 auto 2.5rem',
            lineHeight: '1.7',
            letterSpacing: '-0.01em'
          }}>
            Deterministic financials, compliance-ready text, and automated market research. The professional advantage your business deserves.
          </p>
          
          {/* CTA Buttons */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            marginBottom: '3rem',
            flexWrap: 'wrap'
          }}>
            <button 
              className="btn btn-primary" 
              onClick={() => navigate(user ? 'dashboard' : 'register')}
              style={{ 
                background: 'white', 
                color: '#0F172A',
                fontSize: '1rem',
                padding: '0.875rem 2rem',
                borderRadius: '8px',
                fontWeight: '600',
                letterSpacing: '-0.01em',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Get Started Free
              <ArrowRight size={18} />
            </button>
            <button 
              onClick={() => navigate('contact')}
              style={{ 
                background: 'transparent', 
                color: 'white',
                fontSize: '1rem',
                padding: '0.875rem 2rem',
                borderRadius: '8px',
                fontWeight: '600',
                letterSpacing: '-0.01em',
                border: '1.5px solid rgba(255, 255, 255, 0.3)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              }}
            >
              Talk to Sales
            </button>
          </div>

          {/* Key Features */}
          <div style={{
            display: 'flex',
            gap: '2rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={18} color="#10B981" />
              <span style={{ fontSize: '0.9375rem', color: 'white', fontWeight: '500' }}>
                Used by 10,000+ Founders
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={18} color="#10B981" />
              <span style={{ fontSize: '0.9375rem', color: 'white', fontWeight: '500' }}>
                Bank-Compliant Outputs
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer navigate={navigate} user={user} />
    </div>
  );
}

export default HomePage;
