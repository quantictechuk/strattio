import React from 'react';
import Footer from '../components/Footer';

function TermsOfServicePage({ navigate, user }) {
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
              Terms of Service
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
                  1. Acceptance of Terms
                </h2>
                <p style={{ marginBottom: '1rem' }}>
                  By accessing and using Strattio ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
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
                  2. Description of Service
                </h2>
                <p style={{ marginBottom: '1rem' }}>
                  Strattio is an AI-powered business plan generation platform that helps users create professional business plans for various purposes including investor presentations, loan applications, and visa applications. Our service uses artificial intelligence to generate business plan content based on user-provided information.
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
                  3. User Accounts
                </h2>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#001639',
                  marginTop: '1.5rem',
                  marginBottom: '0.75rem'
                }}>
                  3.1 Account Creation
                </h3>
                <p style={{ marginBottom: '1rem' }}>
                  To use certain features of our Service, you must register for an account. You agree to:
                </p>
                <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
                  <li style={{ marginBottom: '0.5rem' }}>Provide accurate, current, and complete information</li>
                  <li style={{ marginBottom: '0.5rem' }}>Maintain and update your information to keep it accurate</li>
                  <li style={{ marginBottom: '0.5rem' }}>Maintain the security of your password and account</li>
                  <li style={{ marginBottom: '0.5rem' }}>Accept responsibility for all activities under your account</li>
                </ul>

                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#001639',
                  marginTop: '1.5rem',
                  marginBottom: '0.75rem'
                }}>
                  3.2 Account Termination
                </h3>
                <p style={{ marginBottom: '1rem' }}>
                  We reserve the right to suspend or terminate your account at any time for violation of these Terms or for any other reason we deem necessary.
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
                  4. Subscription and Payment
                </h2>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#001639',
                  marginTop: '1.5rem',
                  marginBottom: '0.75rem'
                }}>
                  4.1 Subscription Plans
                </h3>
                <p style={{ marginBottom: '1rem' }}>
                  We offer various subscription plans with different features and limitations. Subscription fees are billed in advance on a monthly or annual basis, as applicable.
                </p>

                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#001639',
                  marginTop: '1.5rem',
                  marginBottom: '0.75rem'
                }}>
                  4.2 Payment Terms
                </h3>
                <p style={{ marginBottom: '1rem' }}>
                  By subscribing to a paid plan, you agree to pay all fees associated with your subscription. All fees are non-refundable except as required by law or as explicitly stated in our refund policy.
                </p>

                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#001639',
                  marginTop: '1.5rem',
                  marginBottom: '0.75rem'
                }}>
                  4.3 Auto-Renewal
                </h3>
                <p style={{ marginBottom: '1rem' }}>
                  Subscriptions automatically renew unless cancelled before the renewal date. You may cancel your subscription at any time through your account settings.
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
                  5. User Content and Intellectual Property
                </h2>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#001639',
                  marginTop: '1.5rem',
                  marginBottom: '0.75rem'
                }}>
                  5.1 Your Content
                </h3>
                <p style={{ marginBottom: '1rem' }}>
                  You retain all ownership rights to the business information and data you provide to our Service. By using our Service, you grant us a license to use, process, and store your content solely for the purpose of providing the Service.
                </p>

                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#001639',
                  marginTop: '1.5rem',
                  marginBottom: '0.75rem'
                }}>
                  5.2 Generated Content
                </h3>
                <p style={{ marginBottom: '1rem' }}>
                  Business plans generated by our AI are based on your input and are intended for your use. However, you acknowledge that AI-generated content may not be unique and similar content may be generated for other users.
                </p>

                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#001639',
                  marginTop: '1.5rem',
                  marginBottom: '0.75rem'
                }}>
                  5.3 Our Intellectual Property
                </h3>
                <p style={{ marginBottom: '1rem' }}>
                  The Service, including its original content, features, and functionality, is owned by Strattio and is protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
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
                  6. Acceptable Use
                </h2>
                <p style={{ marginBottom: '1rem' }}>
                  You agree not to:
                </p>
                <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
                  <li style={{ marginBottom: '0.5rem' }}>Use the Service for any illegal purpose or in violation of any laws</li>
                  <li style={{ marginBottom: '0.5rem' }}>Attempt to gain unauthorized access to the Service or its related systems</li>
                  <li style={{ marginBottom: '0.5rem' }}>Interfere with or disrupt the Service or servers</li>
                  <li style={{ marginBottom: '0.5rem' }}>Use automated systems to access the Service without permission</li>
                  <li style={{ marginBottom: '0.5rem' }}>Share your account credentials with others</li>
                  <li style={{ marginBottom: '0.5rem' }}>Reverse engineer, decompile, or disassemble any part of the Service</li>
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
                  7. Disclaimers and Limitations
                </h2>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#001639',
                  marginTop: '1.5rem',
                  marginBottom: '0.75rem'
                }}>
                  7.1 Service Availability
                </h3>
                <p style={{ marginBottom: '1rem' }}>
                  We strive to maintain high availability but do not guarantee that the Service will be available at all times. The Service may be unavailable due to maintenance, updates, or unforeseen circumstances.
                </p>

                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#001639',
                  marginTop: '1.5rem',
                  marginBottom: '0.75rem'
                }}>
                  7.2 AI-Generated Content
                </h3>
                <p style={{ marginBottom: '1rem' }}>
                  Our AI-generated business plans are provided "as is" and should be reviewed and customized by you. We do not guarantee the accuracy, completeness, or suitability of generated content for your specific needs. You are responsible for reviewing and validating all generated content.
                </p>

                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#001639',
                  marginTop: '1.5rem',
                  marginBottom: '0.75rem'
                }}>
                  7.3 Limitation of Liability
                </h3>
                <p style={{ marginBottom: '1rem' }}>
                  To the maximum extent permitted by law, Strattio shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly.
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
                  8. Indemnification
                </h2>
                <p style={{ marginBottom: '1rem' }}>
                  You agree to indemnify and hold harmless Strattio, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising out of or relating to your use of the Service or violation of these Terms.
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
                  9. Changes to Terms
                </h2>
                <p style={{ marginBottom: '1rem' }}>
                  We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting the updated Terms on this page and updating the "Last updated" date. Your continued use of the Service after such changes constitutes acceptance of the new Terms.
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
                  10. Governing Law
                </h2>
                <p style={{ marginBottom: '1rem' }}>
                  These Terms shall be governed by and construed in accordance with the laws of the United Kingdom, without regard to its conflict of law provisions. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts of the United Kingdom.
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
                  11. Contact Information
                </h2>
                <p style={{ marginBottom: '1rem' }}>
                  If you have any questions about these Terms of Service, please contact us:
                </p>
                <p style={{ marginBottom: '1rem' }}>
                  <strong>Email:</strong> <a href="mailto:legal@strattio.com" style={{ color: '#001639', textDecoration: 'underline' }}>legal@strattio.com</a><br />
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

export default TermsOfServicePage;
