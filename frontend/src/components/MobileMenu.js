import React from 'react';
import { X, LogOut, Settings } from 'lucide-react';

function MobileMenu({ isOpen, onClose, navigate, user, onLogout }) {
  if (!isOpen) return null;

  return (
    <div 
      className="mobile-menu open"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'white',
        zIndex: 9999,
        padding: '1.5rem',
        overflowY: 'auto',
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <img 
          src="/logo.png" 
          alt="Strattio" 
          style={{ height: '32px', width: 'auto' }}
          onClick={() => { navigate('home'); onClose(); }}
        />
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={24} />
        </button>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); navigate('home'); onClose(); }}
          style={{
            color: '#2D3748',
            textDecoration: 'none',
            fontSize: '1.125rem',
            fontWeight: '500',
            padding: '0.75rem 0',
            borderBottom: '1px solid #E2E8F0'
          }}
        >
          Home
        </a>
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); navigate('features'); onClose(); }}
          style={{
            color: '#2D3748',
            textDecoration: 'none',
            fontSize: '1.125rem',
            fontWeight: '500',
            padding: '0.75rem 0',
            borderBottom: '1px solid #E2E8F0'
          }}
        >
          Features
        </a>
        <a
          href="#pricing-section"
          onClick={(e) => {
            e.preventDefault();
            navigate('home');
            onClose();
            setTimeout(() => {
              const section = document.getElementById('pricing-section');
              if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
              }
            }, 100);
          }}
          style={{
            color: '#2D3748',
            textDecoration: 'none',
            fontSize: '1.125rem',
            fontWeight: '500',
            padding: '0.75rem 0',
            borderBottom: '1px solid #E2E8F0'
          }}
        >
          Pricing
        </a>
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); navigate('faq'); onClose(); }}
          style={{
            color: '#2D3748',
            textDecoration: 'none',
            fontSize: '1.125rem',
            fontWeight: '500',
            padding: '0.75rem 0',
            borderBottom: '1px solid #E2E8F0'
          }}
        >
          FAQ
        </a>
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); navigate('contact'); onClose(); }}
          style={{
            color: '#2D3748',
            textDecoration: 'none',
            fontSize: '1.125rem',
            fontWeight: '500',
            padding: '0.75rem 0',
            borderBottom: '1px solid #E2E8F0'
          }}
        >
          Contact
        </a>
      </nav>

      <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {user ? (
          <>
            <button
              className="btn btn-primary"
              onClick={() => { navigate('dashboard'); onClose(); }}
              style={{ width: '100%', padding: '0.75rem 1.5rem' }}
            >
              Dashboard
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => { navigate('settings'); onClose(); }}
              style={{
                width: '100%',
                padding: '0.75rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <Settings size={18} />
              Settings
            </button>
            {onLogout && (
              <button
                className="btn btn-ghost"
                onClick={() => { onLogout(); onClose(); }}
                style={{
                  width: '100%',
                  padding: '0.75rem 1.5rem',
                  color: '#EF4444',
                  background: 'transparent',
                  border: '1px solid #FEE2E2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <LogOut size={18} />
                Log Out
              </button>
            )}
          </>
        ) : (
          <>
            <button
              className="btn btn-ghost"
              onClick={() => { navigate('login'); onClose(); }}
              style={{
                width: '100%',
                padding: '0.75rem 1.5rem',
                color: '#4A5568',
                background: 'transparent',
                border: '1px solid #E2E8F0'
              }}
            >
              Sign In
            </button>
            <button
              className="btn btn-primary"
              onClick={() => { navigate('register'); onClose(); }}
              style={{ width: '100%', padding: '0.75rem 1.5rem' }}
            >
              Get Started for Free
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default MobileMenu;
