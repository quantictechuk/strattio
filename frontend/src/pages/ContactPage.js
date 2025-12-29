import React, { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import Footer from '../components/Footer';
import { api } from '../lib/api';

function ContactPage({ navigate, user }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await api.contact.send(formData);
      setLoading(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Failed to send message. Please try again later.');
    }
  };

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
            <MessageSquare size={32} color="white" />
          </div>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
            fontWeight: '700',
            marginBottom: '1rem',
            letterSpacing: '-0.03em',
            lineHeight: '1.2'
          }}>
            Get in Touch
          </h1>
          <p style={{
            fontSize: '1.25rem',
            color: 'rgba(255, 255, 255, 0.9)',
            lineHeight: '1.7',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Have a question or need help? We're here to assist you. Send us a message and we'll get back to you as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section style={{ padding: '4rem 0', flex: 1 }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          {/* Contact Form */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '2.5rem',
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
            }}>
              <h2 style={{
                fontSize: '1.75rem',
                fontWeight: '700',
                color: '#0F172A',
                marginBottom: '0.5rem'
              }}>
                Send us a Message
              </h2>
              <p style={{
                color: '#64748B',
                fontSize: '0.9375rem',
                marginBottom: '2rem',
                lineHeight: '1.6'
              }}>
                Fill out the form below and we'll get back to you within 24 hours.
              </p>

              {error && (
                <div style={{
                  background: '#FEE2E2',
                  border: '1px solid #EF4444',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <span style={{ color: '#DC2626', fontSize: '0.9375rem', fontWeight: '500' }}>
                    {error}
                  </span>
                </div>
              )}

              {submitted && (
                <div style={{
                  background: '#D1FAE5',
                  border: '1px solid #10B981',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <CheckCircle2 size={20} color="#10B981" />
                  <span style={{ color: '#065F46', fontSize: '0.9375rem', fontWeight: '500' }}>
                    Thank you! Your message has been sent. We'll get back to you soon.
                  </span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#0F172A',
                    marginBottom: '0.5rem'
                  }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      fontSize: '0.9375rem',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#001639';
                      e.target.style.boxShadow = '0 0 0 3px rgba(0, 22, 57, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E2E8F0';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#0F172A',
                    marginBottom: '0.5rem'
                  }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      fontSize: '0.9375rem',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#001639';
                      e.target.style.boxShadow = '0 0 0 3px rgba(0, 22, 57, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E2E8F0';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#0F172A',
                    marginBottom: '0.5rem'
                  }}>
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      fontSize: '0.9375rem',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#001639';
                      e.target.style.boxShadow = '0 0 0 3px rgba(0, 22, 57, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E2E8F0';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#0F172A',
                    marginBottom: '0.5rem'
                  }}>
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      fontSize: '0.9375rem',
                      outline: 'none',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#001639';
                      e.target.style.boxShadow = '0 0 0 3px rgba(0, 22, 57, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E2E8F0';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '0.875rem 2rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {loading ? (
                    <>Sending...</>
                  ) : (
                    <>
                      <Send size={18} />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
        </div>
      </section>

      {/* Footer */}
      <Footer navigate={navigate} user={user} />
    </div>
  );
}

export default ContactPage;
