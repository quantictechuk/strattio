import React from 'react';

function Footer({ navigate, user }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{
      background: '#0F1419',
      color: '#FFFFFF',
      padding: '4rem 0 2rem',
      marginTop: 'auto'
    }}>
      <div className="container">
        <div className="footer-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '3rem',
          marginBottom: '3rem'
        }}>
          {/* Company Info */}
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <img 
                src="/logo-dark.png" 
                alt="Strattio" 
                style={{ height: '32px', width: 'auto' }}
              />
            </div>
            <p style={{ 
              color: '#9BA9BC', 
              fontSize: '0.875rem', 
              lineHeight: '1.6',
              marginBottom: '1rem'
            }}>
              AI-powered business plan generator. Create investor-ready, loan-ready, and visa-ready business plans in minutes.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 style={{ 
              fontSize: '1rem', 
              fontWeight: '600', 
              marginBottom: '1rem',
              color: '#FFFFFF'
            }}>
              Product
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '0.75rem' }}>
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); navigate('features'); }}
                  style={{ 
                    color: '#9BA9BC', 
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#FFFFFF'}
                  onMouseLeave={(e) => e.target.style.color = '#9BA9BC'}
                >
                  Features
                </a>
              </li>
              <li style={{ marginBottom: '0.75rem' }}>
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); navigate('home'); }}
                  style={{ 
                    color: '#9BA9BC', 
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#FFFFFF'}
                  onMouseLeave={(e) => e.target.style.color = '#9BA9BC'}
                >
                  Pricing
                </a>
              </li>
              <li style={{ marginBottom: '0.75rem' }}>
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); navigate(user ? 'dashboard' : 'register'); }}
                  style={{ 
                    color: '#9BA9BC', 
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#FFFFFF'}
                  onMouseLeave={(e) => e.target.style.color = '#9BA9BC'}
                >
                  Get Started
                </a>
              </li>
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 style={{ 
              fontSize: '1rem', 
              fontWeight: '600', 
              marginBottom: '1rem',
              color: '#FFFFFF'
            }}>
              Resources
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '0.75rem' }}>
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); navigate('faq'); }}
                  style={{ 
                    color: '#9BA9BC', 
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#FFFFFF'}
                  onMouseLeave={(e) => e.target.style.color = '#9BA9BC'}
                >
                  FAQ
                </a>
              </li>
              <li style={{ marginBottom: '0.75rem' }}>
                <a 
                  href="#" 
                  style={{ 
                    color: '#9BA9BC', 
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#FFFFFF'}
                  onMouseLeave={(e) => e.target.style.color = '#9BA9BC'}
                >
                  API Reference
                </a>
              </li>
              <li style={{ marginBottom: '0.75rem' }}>
                <a 
                  href="#" 
                  style={{ 
                    color: '#9BA9BC', 
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#FFFFFF'}
                  onMouseLeave={(e) => e.target.style.color = '#9BA9BC'}
                >
                  Support
                </a>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 style={{ 
              fontSize: '1rem', 
              fontWeight: '600', 
              marginBottom: '1rem',
              color: '#FFFFFF'
            }}>
              Company
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '0.75rem' }}>
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); navigate('about'); }}
                  style={{ 
                    color: '#9BA9BC', 
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#FFFFFF'}
                  onMouseLeave={(e) => e.target.style.color = '#9BA9BC'}
                >
                  About Us
                </a>
              </li>
              <li style={{ marginBottom: '0.75rem' }}>
                <a 
                  href="#" 
                  style={{ 
                    color: '#9BA9BC', 
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#FFFFFF'}
                  onMouseLeave={(e) => e.target.style.color = '#9BA9BC'}
                >
                  Blog
                </a>
              </li>
              <li style={{ marginBottom: '0.75rem' }}>
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); navigate('contact'); }}
                  style={{ 
                    color: '#9BA9BC', 
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#FFFFFF'}
                  onMouseLeave={(e) => e.target.style.color = '#9BA9BC'}
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid #2D3748',
          paddingTop: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <p style={{ 
            color: '#9BA9BC', 
            fontSize: '0.875rem',
            margin: 0
          }}>
            © {currentYear} Strattio. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); navigate('privacy'); }}
              style={{ 
                color: '#9BA9BC', 
                textDecoration: 'none',
                fontSize: '0.875rem',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = '#FFFFFF'}
              onMouseLeave={(e) => e.target.style.color = '#9BA9BC'}
            >
              Privacy Policy
            </a>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); navigate('terms'); }}
              style={{ 
                color: '#9BA9BC', 
                textDecoration: 'none',
                fontSize: '0.875rem',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = '#FFFFFF'}
              onMouseLeave={(e) => e.target.style.color = '#9BA9BC'}
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
