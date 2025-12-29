import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, Clock, CheckCircle2, XCircle, AlertCircle, Send, Filter } from 'lucide-react';
import { api } from '../lib/api';

function SupportTickets({ user }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  
  // Create ticket form
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('general');
  const [creating, setCreating] = useState(false);
  
  // Response form
  const [responseMessage, setResponseMessage] = useState('');
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    loadTickets();
  }, [statusFilter]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.tickets.list(statusFilter || undefined);
      setTickets(data.tickets || []);
    } catch (err) {
      setError(err.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      setError('Subject and description are required');
      return;
    }
    
    try {
      setCreating(true);
      setError('');
      await api.tickets.create({
        subject: subject.trim(),
        description: description.trim(),
        priority,
        category
      });
      
      // Reset form
      setSubject('');
      setDescription('');
      setPriority('medium');
      setCategory('general');
      setShowCreateModal(false);
      
      // Reload tickets
      await loadTickets();
    } catch (err) {
      setError(err.message || 'Failed to create ticket');
    } finally {
      setCreating(false);
    }
  };

  const handleViewTicket = async (ticketId) => {
    try {
      const ticket = await api.tickets.get(ticketId);
      setSelectedTicket(ticket);
    } catch (err) {
      setError(err.message || 'Failed to load ticket');
    }
  };

  const handleRespond = async (e) => {
    e.preventDefault();
    if (!responseMessage.trim()) {
      setError('Message is required');
      return;
    }
    
    try {
      setResponding(true);
      setError('');
      await api.tickets.respond(selectedTicket.id, responseMessage.trim());
      setResponseMessage('');
      
      // Reload ticket
      const updatedTicket = await api.tickets.get(selectedTicket.id);
      setSelectedTicket(updatedTicket);
      
      // Reload tickets list
      await loadTickets();
    } catch (err) {
      setError(err.message || 'Failed to send response');
    } finally {
      setResponding(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return '#3B82F6';
      case 'in_progress': return '#F59E0B';
      case 'resolved': return '#27AC85';
      case 'closed': return '#64748B';
      default: return '#64748B';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return <Clock size={16} />;
      case 'in_progress': return <AlertCircle size={16} />;
      case 'resolved': return <CheckCircle2 size={16} />;
      case 'closed': return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#EF4444';
      case 'high': return '#F59E0B';
      case 'medium': return '#3B82F6';
      case 'low': return '#64748B';
      default: return '#64748B';
    }
  };

  if (loading && tickets.length === 0) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#001639', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquare size={24} /> Support Tickets
        </h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={18} /> New Ticket
        </button>
      </div>

      {error && (
        <div className="error-message" style={{ marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {/* Filter */}
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <Filter size={18} color="#64748B" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '0.5rem 1rem',
            border: '1px solid #E2E8F0',
            borderRadius: '6px',
            fontSize: '0.875rem',
            background: 'white',
            cursor: 'pointer'
          }}
        >
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Tickets List */}
      {tickets.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
          <MessageSquare size={48} color="#CBD4E0" style={{ margin: '0 auto 1rem' }} />
          <p style={{ fontSize: '1rem', margin: 0 }}>No support tickets yet.</p>
          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Click "New Ticket" to create your first support request.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="card"
              style={{
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: selectedTicket?.id === ticket.id ? '2px solid #001639' : '1px solid #E2E8F0'
              }}
              onClick={() => handleViewTicket(ticket.id)}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#001639', margin: 0 }}>
                      {ticket.subject}
                    </h3>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      background: getPriorityColor(ticket.priority) + '15',
                      color: getPriorityColor(ticket.priority),
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      textTransform: 'capitalize'
                    }}>
                      {ticket.priority}
                    </span>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      background: getStatusColor(ticket.status) + '15',
                      color: getStatusColor(ticket.status),
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      textTransform: 'capitalize',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      {getStatusIcon(ticket.status)}
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: '#64748B', margin: '0 0 0.5rem 0' }}>
                    {ticket.description.substring(0, 150)}{ticket.description.length > 150 ? '...' : ''}
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#94A3B8' }}>
                    <span>Created: {new Date(ticket.created_at).toLocaleDateString()}</span>
                    {ticket.assigned_admin && (
                      <span>Assigned to: {ticket.assigned_admin.name}</span>
                    )}
                    {ticket.responses && ticket.responses.length > 0 && (
                      <span>{ticket.responses.length} response{ticket.responses.length !== 1 ? 's' : ''}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }} onClick={() => setShowCreateModal(false)}>
          <div className="card" style={{
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#001639', margin: 0 }}>Create Support Ticket</h2>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <XCircle size={20} color="#94A3B8" />
              </button>
            </div>
            
            <form onSubmit={handleCreateTicket}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#475569' }}>
                  Subject <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    fontSize: '0.9375rem'
                  }}
                  placeholder="Brief description of your issue"
                />
              </div>
              
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#475569' }}>
                  Description <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    fontSize: '0.9375rem',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                  placeholder="Please provide detailed information about your issue..."
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#475569' }}>
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #E2E8F0',
                      borderRadius: '6px',
                      fontSize: '0.9375rem',
                      background: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#475569' }}>
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #E2E8F0',
                      borderRadius: '6px',
                      fontSize: '0.9375rem',
                      background: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="general">General</option>
                    <option value="billing">Billing</option>
                    <option value="technical">Technical</option>
                    <option value="feature">Feature Request</option>
                    <option value="bug">Bug Report</option>
                  </select>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn btn-primary" disabled={creating} style={{ flex: 1 }}>
                  {creating ? 'Creating...' : 'Create Ticket'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }} onClick={() => setSelectedTicket(null)}>
          <div className="card" style={{
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#001639', margin: '0 0 0.5rem 0' }}>
                  {selectedTicket.subject}
                </h2>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    background: getStatusColor(selectedTicket.status) + '15',
                    color: getStatusColor(selectedTicket.status),
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    textTransform: 'capitalize'
                  }}>
                    {selectedTicket.status.replace('_', ' ')}
                  </span>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    background: getPriorityColor(selectedTicket.priority) + '15',
                    color: getPriorityColor(selectedTicket.priority),
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    textTransform: 'capitalize'
                  }}>
                    {selectedTicket.priority}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedTicket(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <XCircle size={20} color="#94A3B8" />
              </button>
            </div>
            
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#F8FAFC', borderRadius: '8px' }}>
              <p style={{ fontSize: '0.9375rem', color: '#475569', margin: 0, whiteSpace: 'pre-wrap' }}>
                {selectedTicket.description}
              </p>
            </div>
            
            {/* Responses */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#001639', marginBottom: '1rem' }}>
                Responses ({selectedTicket.responses?.length || 0})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {selectedTicket.responses?.map((response, idx) => (
                  <div key={idx} style={{
                    padding: '1rem',
                    background: response.is_admin ? '#EBF5FF' : '#F8FAFC',
                    borderRadius: '8px',
                    borderLeft: response.is_admin ? '3px solid #3B82F6' : '3px solid #E2E8F0'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div style={{ fontWeight: '600', color: '#001639' }}>
                        {response.user_name} {response.is_admin && <span style={{ fontSize: '0.75rem', color: '#3B82F6' }}>(Admin)</span>}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                        {new Date(response.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: '#475569', margin: 0, whiteSpace: 'pre-wrap' }}>
                      {response.message}
                    </p>
                  </div>
                ))}
                {(!selectedTicket.responses || selectedTicket.responses.length === 0) && (
                  <p style={{ fontSize: '0.875rem', color: '#64748B', textAlign: 'center', padding: '2rem' }}>
                    No responses yet. Be the first to respond!
                  </p>
                )}
              </div>
            </div>
            
            {/* Response Form */}
            {selectedTicket.status !== 'closed' && (
              <form onSubmit={handleRespond}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#475569' }}>
                    Add Response
                  </label>
                  <textarea
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                    required
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #E2E8F0',
                      borderRadius: '6px',
                      fontSize: '0.9375rem',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                    placeholder="Type your response here..."
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={responding} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Send size={16} />
                  {responding ? 'Sending...' : 'Send Response'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SupportTickets;
