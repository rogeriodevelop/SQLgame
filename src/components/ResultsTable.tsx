import React from 'react';
import { Database, FileSpreadsheet } from 'lucide-react';
import type { QueryResult } from '../types';

interface ResultsTableProps {
  result: QueryResult | null;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ result }) => {
  if (!result) {
    return (
      <div 
        className="glass-morphism" 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%', 
          color: 'var(--text-muted)', 
          gap: '0.5rem',
          background: 'rgba(14, 17, 23, 0.4)'
        }}
      >
        <Database size={24} style={{ opacity: 0.2 }} />
        <span style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>Aguardando consulta SQL...</span>
      </div>
    );
  }

  if (result.columns.length === 0) {
    return (
      <div 
        className="glass-morphism" 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%', 
          color: 'var(--text-muted)', 
          fontSize: '0.8rem' 
        }}
      >
        Consulta executada — zero linhas retornadas.
      </div>
    );
  }

  return (
    <div className="glass-morphism" style={{ height: '100%', minWidth: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div 
        style={{ 
          padding: '0.5rem 1rem', 
          background: 'rgba(0,0,0,0.3)', 
          fontSize: '0.72rem', 
          fontWeight: 700, 
          color: 'var(--text-muted)', 
          letterSpacing: '1px', 
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--border-color)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <FileSpreadsheet size={13} style={{ color: 'var(--accent-primary)' }} />
          RESULTADOS DA CONSULTA
        </div>
        <span 
          style={{ 
            background: 'rgba(59, 130, 246, 0.1)', 
            color: 'var(--accent-primary)', 
            padding: '1px 8px', 
            borderRadius: '99px', 
            fontSize: '0.65rem',
            fontWeight: 700
          }}
        >
          {result.values.length} registros
        </span>
      </div>

      {/* Tabela com scroll */}
      <div style={{ overflow: 'auto', flex: 1, minWidth: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
          <thead>
            <tr style={{ background: 'rgba(0,0,0,0.4)', position: 'sticky', top: 0, zIndex: 2 }}>
              {result.columns.map((c, colIdx) => (
                <th 
                  key={colIdx} 
                  style={{ 
                    padding: '0.65rem 0.85rem', 
                    textAlign: 'left', 
                    color: 'var(--accent-primary)', 
                    borderBottom: '1px solid var(--border-color)', 
                    whiteSpace: 'nowrap',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    letterSpacing: '0.5px'
                  }}
                >
                  {c}
                  {result.columns.indexOf(c) !== colIdx && (
                    <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)', marginLeft: 4 }}>({colIdx})</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.values.map((row, i) => (
              <tr 
                key={i} 
                style={{ 
                  borderBottom: '1px solid rgba(255,255,255,0.02)', 
                  background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                  transition: 'background 0.15s ease' 
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(59,130,246,0.04)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)';
                }}
              >
                {row.map((v, j) => (
                  <td 
                    key={j} 
                    style={{ 
                      padding: '0.55rem 0.85rem', 
                      color: v === null ? 'var(--text-muted)' : 'var(--text-main)', 
                      fontFamily: v === null ? 'inherit' : "'JetBrains Mono', monospace"
                    }}
                  >
                    {v === null ? (
                      <span 
                        style={{ 
                          padding: '1px 6px', 
                          background: 'rgba(244, 63, 94, 0.08)', 
                          color: 'var(--error)', 
                          borderRadius: '4px', 
                          fontSize: '0.65rem', 
                          fontStyle: 'italic', 
                          fontWeight: 700,
                          border: '1px solid rgba(244, 63, 94, 0.15)'
                        }}
                      >
                        null
                      </span>
                    ) : (
                      v.toString()
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
