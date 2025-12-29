import React from 'react';
import { 
  Bot, 
  Target, 
  Calculator, 
  LayoutTemplate, 
  PenTool, 
  RefreshCw, 
  TrendingUp, 
  FileDown, 
  ShieldCheck, 
  Wand2, 
  FolderKanban, 
  Lock,
  Check
} from 'lucide-react';
import Footer from '../components/Footer';

function FeaturesPage({ navigate, user }) {
  const featuresList = [
    {
      title: "AI-Powered Generation",
      description: "Generate comprehensive business plans in minutes using our advanced multi-agent AI pipeline. Our system uses specialized agents for research, validation, financial modeling, writing, and compliance.",
      icon: Bot,
      items: [
        "Multi-agent orchestration for quality",
        "Context-aware content generation",
        "Industry-specific customization",
        "60-90 second generation time"
      ]
    },
    {
      title: "Zero Hallucination",
      description: "All market statistics and data come from verified sources. We integrate with ONS, Eurostat, and Statista ensuring every number is accurate and cited.",
      icon: Target,
      items: [
        "Verified data from official sources",
        "Automatic source citations",
        "No AI-generated statistics",
        "Transparent data attribution"
      ]
    },
    {
      title: "Deterministic Financials",
      description: "Financial projections are calculated using proven formulas, not AI guesses. Get accurate P&L statements, cash flow forecasts, and break-even analysis.",
      icon: Calculator,
      items: [
        "Formula-based calculations",
        "P&L, cash flow, and break-even",
        "Reproducible results",
        "Professional financial models"
      ]
    },
    {
      title: "5 Specialized Templates",
      description: "Choose from purpose-built templates designed for specific use cases. Each template includes unique sections and compliance requirements.",
      icon: LayoutTemplate,
      items: [
        "General Business Plan",
        "UK Start-Up Loan Application",
        "UK Start-Up Visa",
        "UK Innovator Founder Visa",
        "Investor Pitch / Fundraising"
      ]
    },
    {
      title: "Rich Text Editing",
      description: "Edit any section with our intuitive rich text editor. Format text, add emphasis, and customize your plan to match your exact needs.",
      icon: PenTool,
      items: [
        "WYSIWYG editor",
        "Bold, italic, headers, lists",
        "Real-time preview",
        "Save changes instantly"
      ]
    },
    {
      title: "Smart Regeneration",
      description: "Regenerate sections with custom controls. Adjust tone, length, and add specific instructions to refine your content.",
      icon: RefreshCw,
      items: [
        "Tone control (formal, casual, technical)",
        "Length adjustment (shorter/longer)",
        "Custom instructions",
        "Multiple regeneration options"
      ]
    },
    {
      title: "Financial Charts & Analysis",
      description: "Visualize your financial projections with interactive charts. View revenue trends, profitability analysis, and cash flow forecasts.",
      icon: TrendingUp,
      items: [
        "Revenue & costs bar charts",
        "Profitability line charts",
        "Cash flow visualization",
        "KPI summary cards"
      ]
    },
    {
      title: "Professional PDF Export",
      description: "Export your business plan as a beautifully formatted PDF. Perfect for sharing with investors, lenders, or visa officers.",
      icon: FileDown,
      items: [
        "Professional formatting",
        "All sections included",
        "Branded document",
        "Ready for submission"
      ]
    },
    {
      title: "Compliance Ready",
      description: "All templates are validated against UK visa and loan requirements. Ensure your plan meets all necessary compliance standards.",
      icon: ShieldCheck,
      items: [
        "UK visa compliance",
        "Loan application ready",
        "Investor pitch standards",
        "Automatic validation"
      ]
    },
    {
      title: "Intake Wizard",
      description: "Our step-by-step wizard collects all necessary information about your business. Simple, guided process that takes just a few minutes.",
      icon: Wand2,
      items: [
        "7-step guided process",
        "Business identity & market info",
        "Financial inputs",
        "Operating expenses tracking"
      ]
    },
    {
      title: "Plan Management",
      description: "Save, organize, and manage multiple business plans. Clone plans, track versions, and access your plans anytime.",
      icon: FolderKanban,
      items: [
        "Unlimited plan storage",
        "Clone and duplicate plans",
        "Version tracking",
        "Easy organization"
      ]
    },
    {
      title: "Secure & Private",
      description: "Your data is encrypted and secure. We never share your business information with third parties.",
      icon: Lock,
      items: [
        "JWT authentication",
        "Encrypted data storage",
        "Private by default",
        "GDPR compliant"
      ]
    }
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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
                  Get Started for Free
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section style={{ 
        padding: '6rem 0', 
        background: '#F8FAFC', 
        position: 'relative', 
        overflow: 'hidden',
        borderTop: '1px solid #E2E8F0',
        flex: 1
      }}>
        {/* Decorative background elements */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          pointerEvents: 'none'
        }}>
          <div style={{
            position: 'absolute',
            top: '10%',
            right: '-5%',
            width: '400px',
            height: '400px',
            background: 'rgba(0, 22, 57, 0.1)',
            borderRadius: '50%',
            filter: 'blur(100px)',
            opacity: 0.4
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '10%',
            left: '-5%',
            width: '400px',
            height: '400px',
            background: '#E2E8F0',
            borderRadius: '50%',
            filter: 'blur(100px)',
            opacity: 0.6
          }}></div>
        </div>

        <div className="container" style={{ maxWidth: '1280px', position: 'relative', zIndex: 10 }}>
          <div style={{ maxWidth: '768px', margin: '0 auto 5rem', textAlign: 'center' }}>
            <div style={{
              fontSize: '0.875rem',
              color: '#001639',
              fontWeight: '600',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '0.75rem'
            }}>
              Powerful Features
            </div>
            <h2 className="features-heading" style={{
              fontSize: 'clamp(2rem, 4vw, 2.5rem)',
              fontWeight: '700',
              color: '#0F172A',
              marginBottom: '1.5rem',
              letterSpacing: '-0.03em',
              lineHeight: '1.2'
            }}>
              Everything you need to create<br /> professional business plans.
            </h2>
            <p style={{
              fontSize: '1.125rem',
              color: '#64748B',
              lineHeight: '1.7',
              maxWidth: '640px',
              margin: '0 auto'
            }}>
              From AI-driven content generation to strict financial compliance, every feature is built to help you secure funding and visas.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '2rem'
          }}
          className="features-grid"
          >
            {featuresList.map((feature, index) => (
              <div 
                key={index} 
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '2rem',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
                  e.currentTarget.style.borderColor = 'rgba(0, 22, 57, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                  e.currentTarget.style.borderColor = '#E2E8F0';
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: '#F1F5F9',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0F172A',
                  marginBottom: '1.5rem',
                  border: '1px solid #E2E8F0',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  const card = e.currentTarget.closest('div[style*="background: white"]');
                  if (card) {
                    e.currentTarget.style.background = 'rgba(0, 22, 57, 0.06)';
                    e.currentTarget.style.color = '#001639';
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#F1F5F9';
                  e.currentTarget.style.color = '#0F172A';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                >
                  <feature.icon size={24} strokeWidth={1.5} />
                </div>
                
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: '#0F172A',
                  marginBottom: '0.75rem',
                  transition: 'color 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#001639';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#0F172A';
                }}
                >
                  {feature.title}
                </h3>
                
                <p style={{
                  color: '#64748B',
                  lineHeight: '1.7',
                  marginBottom: '1.5rem',
                  fontSize: '0.875rem',
                  flex: 1
                }}>
                  {feature.description}
                </p>
                
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  paddingTop: '1.5rem',
                  borderTop: '1px solid #F1F5F9',
                  marginTop: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  {feature.items.map((item, i) => (
                    <li key={i} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      color: '#64748B'
                    }}>
                      <Check size={14} color="#10B981" strokeWidth={3} style={{ marginRight: '0.5rem', marginTop: '2px', flexShrink: 0 }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer navigate={navigate} user={user} />
    </div>
  );
}

export default FeaturesPage;
