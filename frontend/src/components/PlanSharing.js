import React, { useState, useEffect } from 'react';
import { Share2, Users, MessageSquare, History, X, Copy, Check, Eye, Edit, Shield, Trash2, Send, Clock } from 'lucide-react';
import { api } from '../lib/api';

function PlanSharing({ planId, user, isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('share');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Share links
  const [shares, setShares] = useState([]);
  const [newShareAccess, setNewShareAccess] = useState('read');
  const [newSharePassword, setNewSharePassword] = useState('');
  const [newShareExpires, setNewShareExpires] = useState('');
  const [creatingShare, setCreatingShare] = useState(false);
  const [copiedToken, setCopiedToken] = useState(null);
  
  // Collaborators
  const [collaborators, setCollaborators] = useState([]);
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState('');
  const [newCollaboratorRole, setNewCollaboratorRole] = useState('viewer');
  const [inviting, setInviting] = useState(false);
  
  // Comments
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentSectionId, setCommentSectionId] = useState(null);
  const [sendingComment, setSendingComment] = useState(false);
  
  // Versions
  const [versions, setVersions] = useState([]);
  const [loadingVersions, setLoadingVersions] = useState(false);

  useEffect(() => {
    if (isOpen && planId) {
      loadData();
    }
  }, [isOpen, planId, activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (activeTab === 'share') {
        const data = await api.sharing.listShares(planId);
        setShares(data.shares || []);
      } else if (activeTab === 'collaborators') {
        const data = await api.sharing.listCollaborators(planId);
        setCollaborators(data.collaborators || []);
      } else if (activeTab === 'comments') {
        const data = await api.sharing.listComments(planId);
        setComments(data.comments || []);
      } else if (activeTab === 'versions') {
        setLoadingVersions(true);
        const data = await api.sharing.getVersions(planId);
        setVersions(data.versions || []);
        setLoadingVersions(false);
      }
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShare = async (e) => {
    e.preventDefault();
    try {
      setCreatingShare(true);
      setError('');
      const shareData = {
        access_level: newShareAccess,
        password: newSharePassword || undefined,
        expires_in_days: newShareExpires ? parseInt(newShareExpires) : undefined
      };
      const data = await api.sharing.createShare(planId, shareData);
      
      // Reset form
      setNewShareAccess('read');
      setNewSharePassword('');
      setNewShareExpires('');
      
      // Reload shares
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to create share link');
    } finally {
      setCreatingShare(false);
    }
  };

  const handleCopyShareLink = (token) => {
    const shareUrl = `${window.location.origin}/shared/${token}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleRevokeShare = async (token) => {
    if (!window.confirm('Are you sure you want to revoke this share link?')) return;
    try {
      await api.sharing.revokeShare(planId, token);
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to revoke share link');
    }
  };

  const handleInviteCollaborator = async (e) => {
    e.preventDefault();
    if (!newCollaboratorEmail.trim()) {
      setError('Email is required');
      return;
    }
    try {
      setInviting(true);
      setError('');
      await api.sharing.inviteCollaborator(planId, newCollaboratorEmail, newCollaboratorRole);
      setNewCollaboratorEmail('');
      setNewCollaboratorRole('viewer');
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to invite collaborator');
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveCollaborator = async (collaboratorId) => {
    if (!window.confirm('Are you sure you want to remove this collaborator?')) return;
    try {
      await api.sharing.removeCollaborator(planId, collaboratorId);
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to remove collaborator');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      setSendingComment(true);
      setError('');
      await api.sharing.addComment(planId, newComment.trim(), commentSectionId);
      setNewComment('');
      setCommentSectionId(null);
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to add comment');
    } finally {
      setSendingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await api.sharing.deleteComment(planId, commentId);
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to delete comment');
    }
  };

  const handleRestoreVersion = async (versionId) => {
    if (!window.confirm('Restore this version? Current changes will be saved as a new version.')) return;
    try {
      await api.sharing.restoreVersion(planId, versionId);
      alert('Plan restored successfully. Please refresh the page.');
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to restore version');
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Shield size={16} />;
      case 'editor': return <Edit size={16} />;
      case 'viewer': return <Eye size={16} />;
      default: return <Eye size={16} />;
    }
  };

  if (!isOpen) return null;

  return (
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
    }} onClick={onClose}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '800px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#001639', margin: 0 }}>
            Share & Collaborate
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={24} color="#64748B" />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0' }}>
          {[
            { id: 'share', label: 'Share Links', icon: Share2 },
            { id: 'collaborators', label: 'Collaborators', icon: Users },
            { id: 'comments', label: 'Comments', icon: MessageSquare },
            { id: 'versions', label: 'History', icon: History }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '1rem',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid #001639' : '2px solid transparent',
                color: activeTab === tab.id ? '#001639' : '#64748B',
                fontWeight: activeTab === tab.id ? '600' : '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem'
              }}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {error && (
            <div style={{
              padding: '0.75rem',
              background: '#FEF2F2',
              border: '1px solid #EF4444',
              borderRadius: '8px',
              color: '#DC2626',
              fontSize: '0.875rem',
              marginBottom: '1rem'
            }}>
              {error}
            </div>
          )}

          {/* Share Links Tab */}
          {activeTab === 'share' && (
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#001639', marginBottom: '1rem' }}>
                Create Share Link
              </h3>
              <form onSubmit={handleCreateShare} style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#475569' }}>
                      Access Level
                    </label>
                    <select
                      value={newShareAccess}
                      onChange={(e) => setNewShareAccess(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        fontSize: '0.875rem'
                      }}
                    >
                      <option value="read">Read Only</option>
                      <option value="comment">Can Comment</option>
                      <option value="edit">Can Edit</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#475569' }}>
                      Password (Optional)
                    </label>
                    <input
                      type="password"
                      value={newSharePassword}
                      onChange={(e) => setNewSharePassword(e.target.value)}
                      placeholder="Leave empty for no password"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#475569' }}>
                      Expires In (Days, Optional)
                    </label>
                    <input
                      type="number"
                      value={newShareExpires}
                      onChange={(e) => setNewShareExpires(e.target.value)}
                      placeholder="Leave empty for no expiration"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={creatingShare}
                    style={{ width: '100%' }}
                  >
                    {creatingShare ? 'Creating...' : 'Create Share Link'}
                  </button>
                </div>
              </form>

              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#001639', marginBottom: '1rem' }}>
                Active Share Links
              </h3>
              {shares.length === 0 ? (
                <p style={{ color: '#64748B', textAlign: 'center', padding: '2rem' }}>No share links created yet</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {shares.map((share) => (
                    <div key={share.id} style={{
                      padding: '1rem',
                      background: '#F8FAFC',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#001639', marginBottom: '0.25rem' }}>
                          {share.access_level.charAt(0).toUpperCase() + share.access_level.slice(1)} Access
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                          {share.expires_at ? `Expires: ${new Date(share.expires_at).toLocaleDateString()}` : 'Never expires'}
                          {share.password_hash && ' • Password protected'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleCopyShareLink(share.share_token)}
                          style={{
                            padding: '0.5rem',
                            background: '#F1F5F9',
                            border: '1px solid #E2E8F0',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          {copiedToken === share.share_token ? <Check size={16} color="#27AC85" /> : <Copy size={16} color="#64748B" />}
                        </button>
                        <button
                          onClick={() => handleRevokeShare(share.share_token)}
                          style={{
                            padding: '0.5rem',
                            background: '#FEF2F2',
                            border: '1px solid #EF4444',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={16} color="#DC2626" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Collaborators Tab */}
          {activeTab === 'collaborators' && (
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#001639', marginBottom: '1rem' }}>
                Invite Collaborator
              </h3>
              <form onSubmit={handleInviteCollaborator} style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <input
                    type="email"
                    value={newCollaboratorEmail}
                    onChange={(e) => setNewCollaboratorEmail(e.target.value)}
                    placeholder="email@example.com"
                    required
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      fontSize: '0.875rem'
                    }}
                  />
                  <select
                    value={newCollaboratorRole}
                    onChange={(e) => setNewCollaboratorRole(e.target.value)}
                    style={{
                      padding: '0.75rem',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      fontSize: '0.875rem'
                    }}
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button type="submit" className="btn btn-primary" disabled={inviting}>
                    {inviting ? 'Inviting...' : 'Invite'}
                  </button>
                </div>
              </form>

              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#001639', marginBottom: '1rem' }}>
                Collaborators ({collaborators.length})
              </h3>
              {collaborators.length === 0 ? (
                <p style={{ color: '#64748B', textAlign: 'center', padding: '2rem' }}>No collaborators yet</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {collaborators.map((collab) => (
                    <div key={collab.id} style={{
                      padding: '1rem',
                      background: '#F8FAFC',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#001639' }}>
                          {collab.user?.name || collab.user?.email}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                          {getRoleIcon(collab.role)}
                          {collab.role.charAt(0).toUpperCase() + collab.role.slice(1)}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveCollaborator(collab.user_id)}
                        style={{
                          padding: '0.5rem',
                          background: '#FEF2F2',
                          border: '1px solid #EF4444',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={16} color="#DC2626" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Comments Tab */}
          {activeTab === 'comments' && (
            <div>
              <form onSubmit={handleAddComment} style={{ marginBottom: '1.5rem' }}>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    marginBottom: '0.75rem'
                  }}
                />
                <button type="submit" className="btn btn-primary" disabled={sendingComment || !newComment.trim()}>
                  {sendingComment ? 'Sending...' : <><Send size={16} style={{ marginRight: '0.5rem' }} /> Add Comment</>}
                </button>
              </form>

              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#001639', marginBottom: '1rem' }}>
                Comments ({comments.length})
              </h3>
              {comments.length === 0 ? (
                <p style={{ color: '#64748B', textAlign: 'center', padding: '2rem' }}>No comments yet</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {comments.map((comment) => (
                    <div key={comment.id} style={{
                      padding: '1rem',
                      background: '#F8FAFC',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <div>
                          <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#001639' }}>
                            {comment.user_name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                            <Clock size={12} />
                            {new Date(comment.created_at).toLocaleString()}
                          </div>
                        </div>
                        {comment.user_id === user?.id && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            style={{
                              padding: '0.25rem 0.5rem',
                              background: '#FEF2F2',
                              border: '1px solid #EF4444',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            <Trash2 size={14} color="#DC2626" />
                          </button>
                        )}
                      </div>
                      <p style={{ fontSize: '0.875rem', color: '#475569', margin: 0, whiteSpace: 'pre-wrap' }}>
                        {comment.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Versions Tab */}
          {activeTab === 'versions' && (
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#001639', marginBottom: '1rem' }}>
                Version History
              </h3>
              {loadingVersions ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
                </div>
              ) : versions.length === 0 ? (
                <p style={{ color: '#64748B', textAlign: 'center', padding: '2rem' }}>No version history yet</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {versions.map((version) => (
                    <div key={version.id} style={{
                      padding: '1rem',
                      background: '#F8FAFC',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <div>
                          <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#001639' }}>
                            Version {version.version_number}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                            <Clock size={12} />
                            {new Date(version.created_at).toLocaleString()} by {version.created_by_name || 'Unknown'}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRestoreVersion(version.id)}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.875rem' }}
                        >
                          Restore
                        </button>
                      </div>
                      {version.changes && version.changes.length > 0 && (
                        <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.5rem' }}>
                          {version.changes.length} change{version.changes.length !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlanSharing;
