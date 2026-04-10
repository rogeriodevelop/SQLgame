import React, { useState, useEffect } from 'react';
import { Terminal as TerminalIcon, Play, RefreshCw } from 'lucide-react';

interface TerminalProps {
  onExecute: (query: string) => void;
  initialQuery?: string;
  error?: string | null;
}

export const Terminal: React.FC<TerminalProps> = ({ onExecute, initialQuery = '', error }) => {
  const [query, setQuery] = useState(initialQuery);

  const handleExecute = () => {
    onExecute(query);
  };

  return (
    <div className="glass-morphism glow-blue" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ 
        padding: '0.75rem 1rem', 
        borderBottom: '1px solid var(--border-color)', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: 'rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          <TerminalIcon size={16} />
          SQL TERMINAL
        </div>
        <button className="btn btn-primary" onClick={handleExecute} style={{ padding: '0.4rem 1rem', fontSize: '0.875rem' }}>
          <Play size={14} /> EXECUTAR
        </button>
      </div>
      
      <div style={{ flex: 1, position: 'relative' }}>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          spellCheck={false}
          style={{
            width: '100%',
            height: '100%',
            background: 'transparent',
            border: 'none',
            color: '#60a5fa',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '1rem',
            padding: '1.5rem',
            outline: 'none',
            resize: 'none',
            lineHeight: '1.6'
          }}
          placeholder="Digite sua consulta SQL aqui..."
        />
      </div>

      {error && (
        <div style={{ 
          padding: '0.75rem 1.5rem', 
          background: 'rgba(239, 68, 68, 0.1)', 
          borderTop: '1px solid var(--error)',
          color: 'var(--error)',
          fontSize: '0.875rem',
          fontFamily: 'JetBrains Mono, monospace'
        }}>
          Erro: {error}
        </div>
      )}
    </div>
  );
};
