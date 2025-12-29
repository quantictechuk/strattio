import React from 'react';
import Footer from '../components/Footer';
import { Target, Zap, Shield, Users, Award, Heart } from 'lucide-react';

function AboutUsPage({ navigate, user }) {
  const values = [
    {
      icon: <Target size={32} />,
      title: 'Mission-Driven',
      description: 'We believe every entrepreneur deserves access to professional business planning tools, regardless of their background or resources.'
    },
    {
      icon: <Zap size={32} />,
      title: 'Innovation First',
      description: 'We leverage cutting-edge AI technology to make complex business planning accessible and efficient for everyone.'
    },
    {
      icon: <Shield size={32} />,
      title: 'Trust & Security',
      description: 'Your data security and privacy are paramount. We implement industry-leading security measures to protect your information.'
    },
    {
      icon: <Users size={32} />,
      title: 'User-Centric',
      description: 'Every feature we build is designed with our users in mind. Your success is our success.'
    },
    {
      icon: <Award size={32} />,
      title: 'Quality Focus',
      description: 'We maintain the highest standards for our AI-generated content, ensuring accuracy and compliance with industry requirements.'
    },
    {
      icon: <Heart size={32} />,
      title: 'Empowerment',
      description: 'We empower entrepreneurs to turn their ideas into actionable business plans that can secure funding, visas, and growth opportunities.'
    }
  ];

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
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = '#001639'}
              onMouseLeave={(e) => e.target.style.color = '#2D3748'}
            >
              Contact
            </a>
            {user ? (
              <button
                onClick={() => navigate('dashboard')}
                style={{
                  background: '#001639',
                  color: 'white',
                  border: 'none',
                  padding: '0.625rem 1.25rem',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#001225'}
                onMouseLeave={(e) => e.target.style.background = '#001639'}
              >
                Dashboard
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => navigate('login')}
                  style={{
                    background: 'transparent',
                    color: '#2D3748',
                    border: 'none',
                    fontSize: '0.9375rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#001639'}
                  onMouseLeave={(e) => e.target.style.color = '#2D3748'}
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('register')}
                  style={{
                    background: '#001639',
                    color: 'white',
                    border: 'none',
                    padding: '0.625rem 1.25rem',
                    borderRadius: '8px',
                    fontSize: '0.9375rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#001225'}
                  onMouseLeave={(e) => e.target.style.background = '#001639'}
                >
                  Get Started
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>
      
      <main style={{ flex: 1 }}>
        {/* Hero Section */}
        <section style={{
          padding: '6rem 0 4rem',
          background: 'linear-gradient(135deg, #001639 0%, #001225 100%)',
          color: 'white'
        }}>
          <div className="container" style={{ maxWidth: '900px', textAlign: 'center' }}>
            <h1 style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: '700',
              marginBottom: '1.5rem',
              lineHeight: '1.2'
            }}>
              About Strattio
            </h1>
            <p style={{
              fontSize: '1.25rem',
              lineHeight: '1.6',
              color: '#CBD4E0',
              maxWidth: '700px',
              margin: '0 auto'
            }}>
              We're on a mission to democratize business planning by making professional, investor-ready business plans accessible to entrepreneurs everywhere.
            </p>
          </div>
        </section>

        {/* Our Story Section */}
        <section style={{ padding: '4rem 0' }}>
          <div className="container" style={{ maxWidth: '900px' }}>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '3rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              border: '1px solid #E4E9EF'
            }}>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: '#001639',
                marginBottom: '1.5rem'
              }}>
                Our Story
              </h2>
              <div style={{ lineHeight: '1.8', color: '#2D3748' }}>
                <p style={{ marginBottom: '1.5rem' }}>
                  Strattio was born from a simple observation: creating a professional business plan shouldn't be a barrier to entrepreneurship. Traditional business plan creation is time-consuming, expensive, and often requires specialized knowledge that many entrepreneurs don't have.
                </p>
                <p style={{ marginBottom: '1.5rem' }}>
                  We set out to change that by harnessing the power of artificial intelligence to generate comprehensive, compliant, and investor-ready business plans in minutes rather than weeks. Our multi-agent AI system researches your industry, validates your data, generates financial projections, and creates detailed plan sections—all while ensuring compliance with visa, loan, and investor requirements.
                </p>
                <p style={{ marginBottom: '1.5rem' }}>
                  Today, Strattio has helped thousands of entrepreneurs create business plans that have secured funding, obtained visas, and launched successful businesses. We're proud to be part of their journey and committed to making business planning accessible to everyone.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Values Section */}
        <section style={{ padding: '4rem 0', background: 'white' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                color: '#001639',
                marginBottom: '1rem'
              }}>
                Our Values
              </h2>
              <p style={{
                fontSize: '1.125rem',
                color: '#64748B',
                maxWidth: '600px',
                margin: '0 auto'
              }}>
                The principles that guide everything we do
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem',
              maxWidth: '1200px',
              margin: '0 auto'
            }}>
              {values.map((value, index) => (
                <div key={index} style={{
                  background: '#F8FAFC',
                  borderRadius: '12px',
                  padding: '2rem',
                  border: '1px solid #E4E9EF',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 22, 57, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}>
                  <div style={{
                    color: '#001639',
                    marginBottom: '1rem',
                    display: 'inline-block'
                  }}>
                    {value.icon}
                  </div>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: '#001639',
                    marginBottom: '0.75rem'
                  }}>
                    {value.title}
                  </h3>
                  <p style={{
                    color: '#64748B',
                    lineHeight: '1.6'
                  }}>
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What We Do Section */}
        <section style={{ padding: '4rem 0' }}>
          <div className="container" style={{ maxWidth: '900px' }}>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '3rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              border: '1px solid #E4E9EF'
            }}>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: '#001639',
                marginBottom: '1.5rem'
              }}>
                What We Do
              </h2>
              <div style={{ lineHeight: '1.8', color: '#2D3748' }}>
                <p style={{ marginBottom: '1.5rem' }}>
                  Strattio is an AI-powered business plan generation platform that helps entrepreneurs create professional business plans for various purposes:
                </p>
                <ul style={{ marginLeft: '1.5rem', marginBottom: '1.5rem' }}>
                  <li style={{ marginBottom: '0.75rem' }}><strong>Investor Presentations:</strong> Create compelling business plans that attract investors and secure funding</li>
                  <li style={{ marginBottom: '0.75rem' }}><strong>Loan Applications:</strong> Generate bank-compliant business plans that meet lender requirements</li>
                  <li style={{ marginBottom: '0.75rem' }}><strong>Visa Applications:</strong> Produce visa-ready business plans that comply with immigration requirements</li>
                  <li style={{ marginBottom: '0.75rem' }}><strong>Strategic Planning:</strong> Develop comprehensive business plans for internal use and growth planning</li>
                </ul>
                <p style={{ marginBottom: '1.5rem' }}>
                  Our platform uses advanced AI technology to research your industry, analyze market trends, generate financial projections, and create detailed plan sections—all in 60-90 seconds. The result is a professional, compliant business plan that you can customize and export in multiple formats.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section style={{
          padding: '4rem 0',
          background: 'linear-gradient(135deg, #001639 0%, #001225 100%)',
          color: 'white',
          textAlign: 'center'
        }}>
          <div className="container" style={{ maxWidth: '700px' }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              marginBottom: '1rem'
            }}>
              Ready to Get Started?
            </h2>
            <p style={{
              fontSize: '1.125rem',
              color: '#CBD4E0',
              marginBottom: '2rem',
              lineHeight: '1.6'
            }}>
              Join thousands of entrepreneurs who have used Strattio to create professional business plans and launch their businesses.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate(user ? 'dashboard' : 'register')}
                style={{
                  background: 'white',
                  color: '#001639',
                  border: 'none',
                  padding: '0.875rem 2rem',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 24px rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                Get Started Free
              </button>
              <button
                onClick={() => navigate('contact')}
                style={{
                  background: 'transparent',
                  color: 'white',
                  border: '2px solid white',
                  padding: '0.875rem 2rem',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                }}
              >
                Contact Us
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer navigate={navigate} user={user} />
    </div>
  );
}

export default AboutUsPage;
