import React from 'react';
import Footer from '../components/Footer';

function PrivacyPolicyPage({ navigate, user }) {
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
      
      <main style={{ flex: 1, padding: '4rem 0' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '3rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            border: '1px solid #E4E9EF'
          }}>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: '#001639',
              marginBottom: '0.5rem'
            }}>
              Privacy Policy
            </h1>
            <p style={{
              color: '#64748B',
              fontSize: '1rem',
              marginBottom: '3rem'
            }}>
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <div style={{ lineHeight: '1.8', color: '#2D3748' }}>
              <section style={{ marginBottom: '3rem' }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#001639',
                  marginBottom: '1rem',
                  marginTop: '2rem'
                }}>
                  1. Introduction
                </h2>
                <p style={{ marginBottom: '1rem' }}>
                  Welcome to Strattio ("we," "our," or "us"). We are committed to protecting your privacy and ensuring you have a positive experience on our website and in using our products and services. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our AI-powered business plan generation service.
                </p>
              </section>

              <section style={{ marginBottom: '3rem' }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#001639',
                  marginBottom: '1rem',
                  marginTop: '2rem'
                }}>
                  2. Information We Collect
                </h2>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#001639',
                  marginTop: '1.5rem',
                  marginBottom: '0.75rem'
                }}>
                  2.1 Information You Provide
                </h3>
                <p style={{ marginBottom: '1rem' }}>
                  We collect information that you provide directly to us, including:
                </p>
                <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
                  <li style={{ marginBottom: '0.5rem' }}>Account information (name, email address, password)</li>
                  <li style={{ marginBottom: '0.5rem' }}>Business information (business name, industry, location, financial data)</li>
                  <li style={{ marginBottom: '0.5rem' }}>Payment information (processed securely through Stripe)</li>
                  <li style={{ marginBottom: '0.5rem' }}>Communication data (messages sent through our contact forms)</li>
                </ul>

                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#001639',
                  marginTop: '1.5rem',
                  marginBottom: '0.75rem'
                }}>
                  2.2 Automatically Collected Information
                </h3>
                <p style={{ marginBottom: '1rem' }}>
                  When you use our service, we automatically collect certain information, including:
                </p>
                <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
                  <li style={{ marginBottom: '0.5rem' }}>Device information (IP address, browser type, operating system)</li>
                  <li style={{ marginBottom: '0.5rem' }}>Usage data (pages visited, features used, time spent)</li>
                  <li style={{ marginBottom: '0.5rem' }}>Cookies and similar tracking technologies</li>
                </ul>
              </section>

              <section style={{ marginBottom: '3rem' }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#001639',
                  marginBottom: '1rem',
                  marginTop: '2rem'
                }}>
                  3. How We Use Your Information
                </h2>
                <p style={{ marginBottom: '1rem' }}>
                  We use the information we collect to:
                </p>
                <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
                  <li style={{ marginBottom: '0.5rem' }}>Provide, maintain, and improve our services</li>
                  <li style={{ marginBottom: '0.5rem' }}>Generate and customize your business plans</li>
                  <li style={{ marginBottom: '0.5rem' }}>Process payments and manage subscriptions</li>
                  <li style={{ marginBottom: '0.5rem' }}>Send you service-related communications</li>
                  <li style={{ marginBottom: '0.5rem' }}>Respond to your inquiries and provide customer support</li>
                  <li style={{ marginBottom: '0.5rem' }}>Detect, prevent, and address technical issues</li>
                  <li style={{ marginBottom: '0.5rem' }}>Comply with legal obligations</li>
                </ul>
              </section>

              <section style={{ marginBottom: '3rem' }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#001639',
                  marginBottom: '1rem',
                  marginTop: '2rem'
                }}>
                  4. Data Sharing and Disclosure
                </h2>
                <p style={{ marginBottom: '1rem' }}>
                  We do not sell your personal information. We may share your information only in the following circumstances:
                </p>
                <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
                  <li style={{ marginBottom: '0.5rem' }}><strong>Service Providers:</strong> With trusted third-party service providers who assist us in operating our platform (e.g., payment processors, cloud hosting providers)</li>
                  <li style={{ marginBottom: '0.5rem' }}><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                  <li style={{ marginBottom: '0.5rem' }}><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                  <li style={{ marginBottom: '0.5rem' }}><strong>With Your Consent:</strong> When you explicitly authorize us to share your information</li>
                </ul>
              </section>

              <section style={{ marginBottom: '3rem' }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#001639',
                  marginBottom: '1rem',
                  marginTop: '2rem'
                }}>
                  5. Data Security
                </h2>
                <p style={{ marginBottom: '1rem' }}>
                  We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
                </p>
              </section>

              <section style={{ marginBottom: '3rem' }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#001639',
                  marginBottom: '1rem',
                  marginTop: '2rem'
                }}>
                  6. Your Rights
                </h2>
                <p style={{ marginBottom: '1rem' }}>
                  Depending on your location, you may have the following rights regarding your personal information:
                </p>
                <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
                  <li style={{ marginBottom: '0.5rem' }}><strong>Access:</strong> Request access to your personal data</li>
                  <li style={{ marginBottom: '0.5rem' }}><strong>Correction:</strong> Request correction of inaccurate data</li>
                  <li style={{ marginBottom: '0.5rem' }}><strong>Deletion:</strong> Request deletion of your personal data</li>
                  <li style={{ marginBottom: '0.5rem' }}><strong>Portability:</strong> Request transfer of your data</li>
                  <li style={{ marginBottom: '0.5rem' }}><strong>Objection:</strong> Object to processing of your personal data</li>
                </ul>
                <p style={{ marginBottom: '1rem' }}>
                  To exercise these rights, please contact us at <a href="mailto:privacy@strattio.com" style={{ color: '#001639', textDecoration: 'underline' }}>privacy@strattio.com</a>.
                </p>
              </section>

              <section style={{ marginBottom: '3rem' }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#001639',
                  marginBottom: '1rem',
                  marginTop: '2rem'
                }}>
                  7. Cookies and Tracking Technologies
                </h2>
                <p style={{ marginBottom: '1rem' }}>
                  We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our service.
                </p>
              </section>

              <section style={{ marginBottom: '3rem' }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#001639',
                  marginBottom: '1rem',
                  marginTop: '2rem'
                }}>
                  8. Children's Privacy
                </h2>
                <p style={{ marginBottom: '1rem' }}>
                  Our service is not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you become aware that a child has provided us with personal information, please contact us immediately.
                </p>
              </section>

              <section style={{ marginBottom: '3rem' }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#001639',
                  marginBottom: '1rem',
                  marginTop: '2rem'
                }}>
                  9. Changes to This Privacy Policy
                </h2>
                <p style={{ marginBottom: '1rem' }}>
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
                </p>
              </section>

              <section style={{ marginBottom: '3rem' }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#001639',
                  marginBottom: '1rem',
                  marginTop: '2rem'
                }}>
                  10. Contact Us
                </h2>
                <p style={{ marginBottom: '1rem' }}>
                  If you have any questions about this Privacy Policy, please contact us:
                </p>
                <p style={{ marginBottom: '1rem' }}>
                  <strong>Email:</strong> <a href="mailto:privacy@strattio.com" style={{ color: '#001639', textDecoration: 'underline' }}>privacy@strattio.com</a><br />
                  <strong>Support:</strong> <a href="mailto:support@strattio.com" style={{ color: '#001639', textDecoration: 'underline' }}>support@strattio.com</a>
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer navigate={navigate} user={user} />
    </div>
  );
}

export default PrivacyPolicyPage;
