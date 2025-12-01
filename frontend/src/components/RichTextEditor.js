import React, { useState, useEffect, useRef } from 'react';
import { Save, X, RotateCw, Bold, Italic, List, AlignLeft } from 'lucide-react';

const RichTextEditor = ({ 
  initialContent, 
  onSave, 
  onCancel, 
  onRegenerate, 
  sectionTitle,
  isRegenerating = false 
}) => {
  const [content, setContent] = useState(initialContent || '');
  const [hasChanges, setHasChanges] = useState(false);
  const [showRegenerateOptions, setShowRegenerateOptions] = useState(false);
  const [regenerateOptions, setRegenerateOptions] = useState({
    tone: '',
    length: '',
    additional_instructions: ''
  });
  const editorRef = useRef(null);

  useEffect(() => {
    setContent(initialContent || '');
    setHasChanges(false);
  }, [initialContent]);

  const handleChange = (e) => {
    setContent(e.target.value);
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(content);
    setHasChanges(false);
  };

  const handleCancel = () => {
    setContent(initialContent || '');
    setHasChanges(false);
    onCancel();
  };

  const handleRegenerate = () => {
    onRegenerate(regenerateOptions);
    setShowRegenerateOptions(false);
    setRegenerateOptions({ tone: '', length: '', additional_instructions: '' });
  };

  const applyFormatting = (command) => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    if (!selectedText) return;

    let formattedText = '';
    switch(command) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'list':
        formattedText = selectedText.split('\n').map(line => `• ${line}`).join('\n');
        break;
      default:
        formattedText = selectedText;
    }

    const newContent = content.substring(0, start) + formattedText + content.substring(end);
    setContent(newContent);
    setHasChanges(true);
  };

  const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} data-testid="rich-text-editor">
      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>{sectionTitle}</h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn btn-ghost"
            onClick={() => setShowRegenerateOptions(!showRegenerateOptions)}
            disabled={isRegenerating}
            data-testid="regenerate-button"
            style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
          >
            🔄 {isRegenerating ? 'Regenerating...' : 'Regenerate'}
          </button>
          {hasChanges && (
            <>
              <button
                className="btn btn-ghost"
                onClick={handleCancel}
                data-testid="cancel-button"
                style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
              >
                ✕ Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                data-testid="save-button"
                style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
              >
                💾 Save
              </button>
            </>
          )}
        </div>
      </div>

      {/* Regeneration Options */}
      {showRegenerateOptions && (
        <div style={{ 
          background: '#EFF6FF', 
          border: '1px solid #BFDBFE', 
          borderRadius: '8px', 
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }} data-testid="regenerate-options">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Tone</label>
              <select
                style={{ width: '100%', border: '1px solid #D1D5DB', borderRadius: '6px', padding: '0.5rem' }}
                value={regenerateOptions.tone}
                onChange={(e) => setRegenerateOptions({...regenerateOptions, tone: e.target.value})}
                data-testid="tone-select"
              >
                <option value="">Keep Current</option>
                <option value="formal">More Formal</option>
                <option value="casual">More Casual</option>
                <option value="technical">More Technical</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Length</label>
              <select
                style={{ width: '100%', border: '1px solid #D1D5DB', borderRadius: '6px', padding: '0.5rem' }}
                value={regenerateOptions.length}
                onChange={(e) => setRegenerateOptions({...regenerateOptions, length: e.target.value})}
                data-testid="length-select"
              >
                <option value="">Keep Current</option>
                <option value="shorter">Shorter (25% less)</option>
                <option value="longer">Longer (25% more)</option>
              </select>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Additional Instructions</label>
            <textarea
              style={{ width: '100%', border: '1px solid #D1D5DB', borderRadius: '6px', padding: '0.5rem', fontFamily: 'inherit' }}
              rows="2"
              placeholder="e.g., Focus more on sustainability aspects..."
              value={regenerateOptions.additional_instructions}
              onChange={(e) => setRegenerateOptions({...regenerateOptions, additional_instructions: e.target.value})}
              data-testid="additional-instructions"
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn btn-primary"
              onClick={handleRegenerate}
              disabled={isRegenerating}
              data-testid="confirm-regenerate"
              style={{ fontSize: '0.875rem' }}
            >
              Regenerate with Options
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => setShowRegenerateOptions(false)}
              style={{ fontSize: '0.875rem' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Formatting Toolbar */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        padding: '0.5rem',
        background: '#F9FAFB',
        borderRadius: '8px',
        border: '1px solid #E5E7EB'
      }}>
        <button
          onClick={() => applyFormatting('bold')}
          style={{ 
            padding: '0.5rem', 
            border: 'none', 
            background: 'white',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
          title="Bold (select text first)"
        >
          B
        </button>
        <button
          onClick={() => applyFormatting('italic')}
          style={{ 
            padding: '0.5rem', 
            border: 'none', 
            background: 'white',
            borderRadius: '4px',
            cursor: 'pointer',
            fontStyle: 'italic'
          }}
          title="Italic (select text first)"
        >
          I
        </button>
        <button
          onClick={() => applyFormatting('list')}
          style={{ 
            padding: '0.5rem', 
            border: 'none', 
            background: 'white',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
          title="Bullet List (select text first)"
        >
          •
        </button>
      </div>

      {/* Editor */}
      <textarea
        ref={editorRef}
        style={{
          width: '100%',
          minHeight: '400px',
          padding: '1rem',
          border: '1px solid #D1D5DB',
          borderRadius: '8px',
          fontFamily: 'inherit',
          fontSize: '1rem',
          lineHeight: '1.7',
          resize: 'vertical'
        }}
        value={content}
        onChange={handleChange}
        placeholder="Edit section content..."
        data-testid="content-textarea"
      />

      {/* Word Count */}
      <div style={{ fontSize: '0.875rem', color: '#6B7280', textAlign: 'right' }} data-testid="word-count">
        {wordCount} words
      </div>
    </div>
  );
};

export default RichTextEditor;
