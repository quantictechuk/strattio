import React, { useState } from 'react';
import { FileDown, Sparkles, Loader2, Download } from 'lucide-react';
import { api } from '../lib/api';

function PitchDeckGenerator({ planId }) {
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deckGenerated, setDeckGenerated] = useState(false);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setError('');
      setSuccess('');
      
      const result = await api.pitchDeck.generate(planId);
      
      setSuccess(`Pitch deck generated successfully with ${result.slide_count} slides!`);
      setDeckGenerated(true);
    } catch (err) {
      setError(err.message || 'Failed to generate pitch deck');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      setError('');
      
      const blob = await api.pitchDeck.download(planId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pitch_deck_${planId}.pptx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setSuccess('Pitch deck downloaded successfully!');
    } catch (err) {
      setError(err.message || 'Failed to download pitch deck');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="card">
      <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#001639', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Sparkles size={24} /> Pitch Deck Generator
      </h3>
      
      <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '1.5rem' }}>
        Automatically generate a professional pitch deck from your business plan. The AI will create 8-10 slides covering all key aspects of your business.
      </p>

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

      {success && (
        <div style={{
          padding: '0.75rem',
          background: '#F0FDF4',
          border: '1px solid #27AC85',
          borderRadius: '8px',
          color: '#1F8A6A',
          fontSize: '0.875rem',
          marginBottom: '1rem'
        }}>
          {success}
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {!deckGenerated ? (
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {generating ? (
              <>
                <Loader2 size={18} className="spin-animation" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Generate Pitch Deck
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {downloading ? (
              <>
                <Loader2 size={18} className="spin-animation" />
                Downloading...
              </>
            ) : (
              <>
                <Download size={18} />
                Download PPTX
              </>
            )}
          </button>
        )}
      </div>

      <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#001639', marginBottom: '0.5rem' }}>
          What's Included:
        </h4>
        <ul style={{ fontSize: '0.875rem', color: '#64748B', margin: 0, paddingLeft: '1.25rem' }}>
          <li>Title slide with business name</li>
          <li>Problem statement</li>
          <li>Solution overview</li>
          <li>Market opportunity</li>
          <li>Business model</li>
          <li>Traction and metrics</li>
          <li>Team highlights</li>
          <li>Financial highlights</li>
          <li>Funding ask</li>
          <li>Contact information</li>
        </ul>
      </div>
    </div>
  );
}

export default PitchDeckGenerator;
