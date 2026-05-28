import React, { useState } from 'react';
import { List, Database, Copy, Check } from 'lucide-react';
import type { Case } from '../types';

interface SchemaViewerProps {
  currentCase: Case;
}

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={handleCopy}
      style={{
        background: 'transparent',
        border: 'none',
        color: copied ? 'var(--easy-color)' : 'var(--text-muted)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        padding: '0.2rem',
        borderRadius: '4px',
        transition: 'color 0.15s ease'
      }}
      title="Copiar nome da tabela"
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
};

export const SchemaViewer: React.FC<SchemaViewerProps> = ({ currentCase }) => {
  const tables = currentCase.schema
    .split(';')
    .map(s => s.trim())
    .filter(s => s.toLowerCase().startsWith('create table'));

  return (
    <div 
      className="glass-morphism" 
      style={{ 
        padding: '1.25rem', 
        flex: 1, 
        overflow: 'hidden', 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: 0 
      }}
    >
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          marginBottom: '1rem', 
          color: 'var(--text-muted)', 
          fontSize: '0.72rem', 
          fontWeight: 700, 
          letterSpacing: '1px', 
          flexShrink: 0 
        }}
      >
        <List size={13} style={{ color: 'var(--accent-primary)' }} /> 
        TABELAS DISPONÍVEIS
      </div>

      <div style={{ overflow: 'auto', flex: 1, paddingRight: '0.2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {tables.map((stmt, idx) => {
          const match = stmt.match(/CREATE TABLE\s+(\w+)\s*\((.+)\)/is);
          if (!match) return null;
          
          const tableName = match[1];
          const columns = match[2].split(',').map(c => c.trim().split(/\s+/));

          return (
            <div 
              key={idx} 
              style={{ 
                background: 'rgba(0,0,0,0.2)', 
                padding: '0.75rem 0.85rem', 
                borderRadius: '10px', 
                border: '1px solid rgba(255,255,255,0.03)' 
              }}
            >
              {/* Tabela Header */}
              <div 
                style={{ 
                  color: 'var(--accent-primary)', 
                  fontWeight: 700, 
                  marginBottom: '0.5rem', 
                  fontSize: '0.8rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between' 
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: "'JetBrains Mono', monospace" }}>
                  <Database size={11} /> {tableName}
                </div>
                <CopyButton text={tableName} />
              </div>

              {/* Colunas */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {columns.map((col, i) => {
                  const columnName = col[0];
                  // Une o tipo caso o split divida algo composto (ex: PRIMARY KEY)
                  const columnType = col.slice(1).join(' ') || 'TEXT';

                  return (
                    <div 
                      key={i} 
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        fontSize: '0.7rem', 
                        padding: '2px 0', 
                        borderBottom: i < columns.length - 1 ? '1px solid rgba(255,255,255,0.02)' : 'none',
                        fontFamily: "'JetBrains Mono', monospace"
                      }}
                    >
                      <span style={{ color: 'var(--text-main)' }}>{columnName}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.62rem' }}>{columnType.toLowerCase()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
