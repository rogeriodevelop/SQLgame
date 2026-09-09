import { useMemo, useState } from 'react';
import { List, Database, Copy, Check } from 'lucide-react';
import type { Case } from '../domain/case';
import { parseSchema } from '../domain/schemaModel';

type Props = { currentCase: Case };

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Área de transferência bloqueada; o jogador ainda pode digitar o nome.
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? `${label} copiado` : `Copiar ${label}`}
      title={copied ? 'Copiado' : `Copiar ${label}`}
      style={{
        background: 'transparent',
        border: 'none',
        color: copied ? 'var(--easy-color)' : 'var(--text-muted)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        padding: '2px',
        borderRadius: '4px',
      }}
    >
      {copied ? <Check size={13} aria-hidden /> : <Copy size={13} aria-hidden />}
    </button>
  );
}

/** Lista as tabelas e colunas do caso, com atalho para copiar os nomes. */
export function SchemaViewer({ currentCase }: Props) {
  const tables = useMemo(() => parseSchema(currentCase.schema), [currentCase.schema]);

  return (
    <section
      className="glass-morphism"
      aria-label="Tabelas disponíveis"
      style={{
        padding: 'var(--sp-4)',
        height: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}
    >
      <h3
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--sp-2)',
          marginBottom: 'var(--sp-3)',
          color: 'var(--text-muted)',
          fontSize: 'var(--fs-xs)',
          letterSpacing: '1px',
          flexShrink: 0,
        }}
      >
        <List size={13} style={{ color: 'var(--accent-primary)' }} aria-hidden />
        TABELAS DISPONÍVEIS
        <span style={{ color: 'var(--text-faint)', fontWeight: 400, letterSpacing: 0 }}>
          ({tables.length})
        </span>
      </h3>

      <div style={{ overflow: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
        {tables.map(table => (
          <div
            key={table.name}
            style={{
              background: 'var(--bg-sunken)',
              padding: 'var(--sp-3)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
            }}
          >
            <div
              style={{
                color: 'var(--accent-primary)',
                fontWeight: 700,
                marginBottom: 'var(--sp-2)',
                fontSize: 'var(--fs-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 'var(--sp-2)',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-1)', fontFamily: 'var(--font-mono)' }}>
                <Database size={12} aria-hidden /> {table.name}
              </span>
              <CopyButton text={table.name} label={`tabela ${table.name}`} />
            </div>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '2px', margin: 0, padding: 0 }}>
              {table.columns.map(column => (
                <li
                  key={column.name}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 'var(--sp-2)',
                    fontSize: 'var(--fs-xs)',
                    padding: '2px 0',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  <span>{column.name}</span>
                  <span style={{ color: 'var(--text-faint)' }}>{column.type.toLowerCase()}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
