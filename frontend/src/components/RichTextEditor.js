import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from './ui/button';
import { Save, X, RotateCw } from 'lucide-react';

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

  useEffect(() => {
    setContent(initialContent || '');
    setHasChanges(false);
  }, [initialContent]);

  const handleChange = (value) => {
    setContent(value);
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

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'align'
  ];

  return (
    <div className="space-y-4" data-testid="rich-text-editor">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{sectionTitle}</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRegenerateOptions(!showRegenerateOptions)}
            disabled={isRegenerating}
            data-testid="regenerate-button"
          >
            <RotateCw className="w-4 h-4 mr-1" />
            {isRegenerating ? 'Regenerating...' : 'Regenerate'}
          </Button>
          {hasChanges && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                data-testid="cancel-button"
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                data-testid="save-button"
              >
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Regeneration Options */}
      {showRegenerateOptions && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3" data-testid="regenerate-options">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tone</label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2"
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
              <label className="block text-sm font-medium mb-1">Length</label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2"
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
            <label className="block text-sm font-medium mb-1">Additional Instructions</label>
            <textarea
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              rows="2"
              placeholder="e.g., Focus more on sustainability aspects..."
              value={regenerateOptions.additional_instructions}
              onChange={(e) => setRegenerateOptions({...regenerateOptions, additional_instructions: e.target.value})}
              data-testid="additional-instructions"
            />
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleRegenerate}
              disabled={isRegenerating}
              data-testid="confirm-regenerate"
            >
              Regenerate with Options
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRegenerateOptions(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <ReactQuill
          theme="snow"
          value={content}
          onChange={handleChange}
          modules={modules}
          formats={formats}
          placeholder="Edit section content..."
          data-testid="quill-editor"
        />
      </div>

      {/* Word Count */}
      <div className="text-sm text-gray-500 text-right" data-testid="word-count">
        {content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length} words
      </div>
    </div>
  );
};

export default RichTextEditor;
