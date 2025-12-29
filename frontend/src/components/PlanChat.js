import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Bot, User, Loader2 } from 'lucide-react';
import { api } from '../lib/api';

function PlanChat({ planId, currentSectionId = null, isOpen, onClose, isInTab = false }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (isOpen && planId) {
      loadChatHistory();
    }
  }, [isOpen, planId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    try {
      setLoadingHistory(true);
      setError('');
      const data = await api.planChat.getHistory(planId);
      setMessages(data.messages || []);
    } catch (err) {
      setError(err.message || 'Failed to load chat history');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || sending) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setSending(true);
    setError('');

    // Add user message to UI immediately
    const tempUserMessage = {
      user_message: userMessage,
      assistant_message: null,
      created_at: new Date().toISOString(),
      is_loading: true
    };
    setMessages(prev => [...prev, tempUserMessage]);

    try {
      const response = await api.planChat.send(planId, userMessage, currentSectionId);
      
      // Update the message with assistant response
      setMessages(prev => prev.map((msg, idx) => 
        idx === prev.length - 1 && msg.is_loading
          ? {
              ...msg,
              assistant_message: response.message,
              is_loading: false,
              timestamp: response.timestamp
            }
          : msg
      ));
    } catch (err) {
      setError(err.message || 'Failed to send message');
      // Remove the loading message on error
      setMessages(prev => prev.filter(msg => !msg.is_loading));
    } finally {
      setSending(false);
    }
  };

  const suggestedQuestions = [
    "How can I improve my executive summary?",
    "What financial metrics should I highlight?",
    "Is my market analysis comprehensive enough?",
    "What risks should I address?",
    "How can I make my plan more investor-ready?"
  ];

  // If not in modal mode, render inline
  if (!isOpen) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>
        <Bot size={48} color="#CBD4E0" style={{ marginBottom: '1rem', margin: '0 auto' }} />
        <p>AI Chat will appear here when you start a conversation.</p>
      </div>
    );
  }

  return (
    <div style={{
      ...(isInTab ? {} : {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '400px',
        maxWidth: 'calc(100vw - 40px)',
        height: '600px',
        maxHeight: 'calc(100vh - 40px)',
        zIndex: 1000,
      }),
      ...(isInTab ? {
        width: '100%',
        height: '100%',
        minHeight: '600px'
      } : {}),
      background: 'white',
      borderRadius: '16px',
      boxShadow: isInTab ? 'none' : '0 20px 60px rgba(0, 0, 0, 0.3)',
      display: 'flex',
      flexDirection: 'column',
      border: '1px solid #E2E8F0'
    }}>
      {/* Header */}
      <div style={{
        padding: '1rem 1.25rem',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #001639 0%, #003366 100%)',
        borderRadius: '16px 16px 0 0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Bot size={18} color="white" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: 'white' }}>Plan Advisor</h3>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.8)' }}>AI Assistant</p>
          </div>
        </div>
        {!isInTab && (
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '6px',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
          >
            <X size={16} color="white" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div
        ref={chatContainerRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1rem',
          background: '#F8FAFC'
        }}
      >
        {loadingHistory ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Loader2 size={24} className="spin-animation" color="#64748B" />
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748B' }}>
            <Bot size={48} color="#CBD4E0" style={{ marginBottom: '1rem' }} />
            <p style={{ fontSize: '0.875rem', margin: '0 0 1rem 0' }}>
              Ask me anything about your business plan!
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {suggestedQuestions.slice(0, 3).map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputMessage(question)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'white',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    color: '#475569',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#F1F5F9';
                    e.currentTarget.style.borderColor = '#001639';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.borderColor = '#E2E8F0';
                  }}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {messages.map((msg, idx) => (
              <div key={idx}>
                {/* User Message */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
                  <div style={{
                    maxWidth: '80%',
                    padding: '0.75rem 1rem',
                    background: '#001639',
                    color: 'white',
                    borderRadius: '12px 12px 4px 12px',
                    fontSize: '0.875rem',
                    lineHeight: '1.5'
                  }}>
                    {msg.user_message}
                  </div>
                </div>

                {/* Assistant Message */}
                {msg.is_loading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem' }}>
                    <Loader2 size={16} className="spin-animation" color="#64748B" />
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Thinking...</span>
                  </div>
                ) : msg.assistant_message ? (
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: '#EBF5FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Bot size={18} color="#3B82F6" />
                    </div>
                    <div style={{
                      flex: 1,
                      padding: '0.75rem 1rem',
                      background: 'white',
                      borderRadius: '12px 12px 12px 4px',
                      fontSize: '0.875rem',
                      lineHeight: '1.5',
                      color: '#475569',
                      border: '1px solid #E2E8F0'
                    }}>
                      {msg.assistant_message}
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        {error && (
          <div style={{
            padding: '0.75rem',
            background: '#FEF2F2',
            border: '1px solid #EF4444',
            borderRadius: '8px',
            color: '#DC2626',
            fontSize: '0.875rem',
            marginTop: '1rem'
          }}>
            {error}
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} style={{
        padding: '1rem',
        borderTop: '1px solid #E2E8F0',
        background: 'white',
        borderRadius: '0 0 16px 16px'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask about your plan..."
            disabled={sending}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              fontSize: '0.875rem',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#001639'}
            onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
          />
          <button
            type="submit"
            disabled={sending || !inputMessage.trim()}
            style={{
              padding: '0.75rem 1rem',
              background: sending || !inputMessage.trim() ? '#F1F5F9' : '#001639',
              color: sending || !inputMessage.trim() ? '#94A3B8' : 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: sending || !inputMessage.trim() ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s'
            }}
          >
            {sending ? <Loader2 size={18} className="spin-animation" /> : <Send size={18} />}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PlanChat;
