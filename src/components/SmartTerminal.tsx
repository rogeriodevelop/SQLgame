import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, Play, AlertTriangle, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

interface SmartTerminalProps {
  onExecute: (query: string) => void;
  queryError: string | null;
}

const SQL_KEYWORDS = /\b(SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AS|AND|OR|NOT|IN|LIKE|IS|NULL|ORDER|BY|GROUP|HAVING|LIMIT|OFFSET|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|DROP|ALTER|DISTINCT|COUNT|SUM|AVG|MAX|MIN|UNION|ALL|BETWEEN|CASE|WHEN|THEN|ELSE|END|PRIMARY|KEY|FOREIGN|REFERENCES|INDEX|VIEW|WITH|EXISTS|RETURNING|ASC|DESC)\b/gi;

function sqlHighlight(code: string): string {
  const escaped = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return escaped
    .replace(/(--[^\n]*)/g, '<span class="sql-comment">$1</span>')
    .replace(/('(?:[^'\\]|\\.)*')/g, '<span class="sql-string">$1</span>')
    .replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="sql-number">$1</span>')
    .replace(SQL_KEYWORDS, '<span class="sql-kw">$&</span>');
}

export const SmartTerminal: React.FC<SmartTerminalProps> = ({ onExecute, queryError }) => {
  const [code, setCode] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  const statements = code
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  const hasMultiple = statements.length > 1;
  const selectedQuery = statements[activeIdx] ?? '';

  useEffect(() => {
    setActiveIdx(0);
  }, [statements.length]);

  const handleExecute = () => {
    if (selectedQuery) onExecute(selectedQuery);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleExecute();
    }
  };

  const syncScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    if (overlayRef.current) {
      overlayRef.current.scrollTop = scrollTop;
    }
    if (gutterRef.current) {
      gutterRef.current.scrollTop = scrollTop;
    }
  };

  const lineCount = code.split('\n').length;
  const lines = Array.from({ length: Math.max(lineCount, 6) }, (_, i) => i + 1);

  const statementLabel = (s: string, i: number) => {
    const match = s.match(/(?:SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)\b.{0,30}/i);
    return match ? match[0].replace(/\s+/g, ' ') + '…' : `Query ${i + 1}`;
  };

  return (
    <div 
      className="glass-morphism glow-blue" 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%', 
        overflow: 'hidden',
        border: '1px solid rgba(59, 130, 246, 0.15)'
      }}
    >
      {/* Header */}
      <div 
        style={{ 
          padding: '0.5rem 1rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          background: 'rgba(0,0,0,0.3)', 
          borderBottom: '1px solid var(--border-color)', 
          flexShrink: 0 
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px', color: 'var(--text-muted)' }}>
          <TerminalIcon size={13} style={{ color: 'var(--accent-primary)' }} /> SQL TERMINAL
          <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.2)' }}>Ctrl+Enter para rodar</span>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleExecute}
          disabled={!selectedQuery}
          style={{ padding: '0.35rem 0.8rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', borderRadius: '6px' }}
        >
          <Play size={10} /> EXECUTAR
        </button>
      </div>

      {/* Abas */}
      {hasMultiple && (
        <div style={{ display: 'flex', overflowX: 'auto', borderBottom: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', flexShrink: 0 }}>
          {statements.map((s, i) => {
            const isActive = i === activeIdx;
            return (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                style={{
                  padding: '0.45rem 0.85rem',
                  fontSize: '0.7rem',
                  whiteSpace: 'nowrap',
                  border: 'none',
                  background: 'transparent',
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontFamily: "'JetBrains Mono', monospace",
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  position: 'relative',
                  outline: 'none',
                }}
                title={s}
              >
                <Layers size={10} />
                Query {i + 1}
                {isActive && (
                  <motion.div 
                    layoutId="activeTabIndicator"
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '2px',
                      background: 'var(--accent-primary)'
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Query selecionada info */}
      {hasMultiple && (
        <div style={{ padding: '0.35rem 1rem', background: 'rgba(59,130,246,0.04)', borderBottom: '1px solid var(--border-color)', fontSize: '0.7rem', color: 'var(--accent-primary)', fontFamily: "'JetBrains Mono', monospace", flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          ▶ {statementLabel(selectedQuery, activeIdx)}
        </div>
      )}

      {/* Editor com Gutter e Highlighting */}
      <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden', background: 'rgba(0, 0, 0, 0.1)' }}>
        
        {/* Gutter */}
        <div 
          ref={gutterRef} 
          className="editor-gutter"
          style={{ 
            overflow: 'hidden',
            width: '32px',
            boxSizing: 'content-box',
            paddingTop: '0.75rem',
            paddingBottom: '0.75rem',
          }}
        >
          {lines.map(line => (
            <div key={line} style={{ height: '1.65em' }}>{line}</div>
          ))}
        </div>

        {/* Área do Código */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {/* Overlay Highlight */}
          <div
            ref={overlayRef}
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: sqlHighlight(code) + '\n' }}
            style={{
              position: 'absolute', 
              inset: 0,
              pointerEvents: 'none',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.85rem',
              lineHeight: '1.65',
              padding: '0.75rem 1rem',
              margin: 0,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              overflow: 'hidden',
              color: '#93c5fd',
              background: 'transparent',
            }}
          />
          {/* Real Textarea */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={e => {
              setCode(e.target.value);
              if (overlayRef.current) overlayRef.current.scrollTop = e.target.scrollTop;
              if (gutterRef.current) gutterRef.current.scrollTop = e.target.scrollTop;
            }}
            onScroll={syncScroll}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            style={{
              position: 'absolute', 
              inset: 0,
              background: 'transparent',
              border: 'none',
              color: 'transparent',
              caretColor: '#3b82f6',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.85rem',
              padding: '0.75rem 1rem',
              outline: 'none',
              resize: 'none',
              lineHeight: '1.65',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              overflowY: 'auto',
              width: '100%',
              height: '100%',
              boxSizing: 'border-box',
              zIndex: 1,
            }}
            placeholder={"-- Escreva seus comandos SQL aqui\n-- Separe múltiplas queries com ;\n-- Pressione Ctrl+Enter para executar"}
          />
        </div>
      </div>

      {/* Footer com Erro SQL */}
      {queryError && (
        <div 
          style={{ 
            color: '#fda4af', 
            padding: '0.5rem 1rem', 
            fontSize: '0.75rem', 
            background: 'rgba(244,63,94,0.08)', 
            borderTop: '1px solid rgba(244,63,94,0.2)', 
            display: 'flex', 
            gap: '0.5rem', 
            alignItems: 'flex-start', 
            flexShrink: 0 
          }}
        >
          <AlertTriangle size={13} style={{ marginTop: '1px', flexShrink: 0, color: 'var(--error)' }} />
          <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{queryError}</span>
        </div>
      )}
    </div>
  );
};
