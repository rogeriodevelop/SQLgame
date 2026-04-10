import React from 'react';
import { QueryResult } from '../types';
import { Database } from 'lucide-react';

interface ResultsTableProps {
  result: QueryResult | null;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ result }) => {
  if (!result) return (
    <div className="glass-morphism" style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      color: 'var(--text-muted)',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <Database size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
      <p>Execute uma consulta para ver os resultados aqui.</p>
    </div>
  );

  if (result.columns.length === 0) return (
    <div className="glass-morphism" style={{ 
      height: '100%', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      color: 'var(--text-muted)'
    }}>
      Consulta realizada com sucesso (sem retorno de linhas).
    </div>
  );

  return (
    <div className="glass-morphism" style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>
        RESULTADOS
      </div>
      <div style={{ overflow: 'auto', flex: 1 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
              {result.columns.map(col => (
                <th key={col} style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border-color)', color: 'var(--accent-primary)', fontWeight: 600 }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.values.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                {row.map((val, j) => (
                  <td key={j} style={{ padding: '1rem', color: 'var(--text-main)' }}>
                    {val !== null ? val.toString() : <em style={{ opacity: 0.5 }}>null</em>}
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
