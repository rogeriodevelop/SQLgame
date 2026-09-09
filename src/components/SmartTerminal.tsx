import { lazy, Suspense, useMemo, useState } from 'react';
import { Terminal as TerminalIcon, Play, AlertTriangle, Layers, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { parseSchema, toCompletionSchema } from '../domain/schemaModel';

// CodeMirror responde por ~370 kB do pacote. Carregá-lo à parte deixa a tela
// inicial leve; ele chega enquanto o jogador lê o briefing.
const SqlEditor = lazy(() =>
  import('./SqlEditor').then(module => ({ default: module.SqlEditor }))
);

type Props = {
  /** Schema do caso atual, usado para alimentar o autocomplete. */
  schema: string;
  queryError: string | null;
  onExecute: (sql: string) => void;
  /** Recria o banco do caso, desfazendo DELETE/DROP acidentais. */
  onResetDatabase: () => void;
};

/** Espaço reservado enquanto o editor é baixado. */
function EditorSkeleton() {
  return (
    <p
      role="status"
      style={{
        padding: 'var(--sp-4)',
        color: 'var(--text-faint)',
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--fs-xs)',
      }}
    >
      -- carregando editor…
    </p>
  );
}

/** Rótulo curto de uma statement, para a aba. */
function statementLabel(statement: string): string {
  const match = statement.match(/(?:SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)\b.{0,32}/i);
  return match ? `${match[0].replace(/\s+/g, ' ')}…` : 'Consulta';
}

export function SmartTerminal({ schema, queryError, onExecute, onResetDatabase }: Props) {
  const [code, setCode] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const completionSchema = useMemo(
    () => toCompletionSchema(parseSchema(schema)),
    [schema]
  );

  const statements = useMemo(
    () => code.split(';').map(s => s.trim()).filter(Boolean),
    [code]
  );

  const hasMultiple = statements.length > 1;
  // Clamp em vez de zerar num efeito: apagar uma statement não pode deixar o
  // índice apontando para fora da lista, e resolver isso com setState dentro de
  // useEffect provoca um render extra (e o aviso do eslint react-hooks).
  const safeIndex = Math.min(activeIndex, Math.max(statements.length - 1, 0));
  const selectedQuery = statements[safeIndex] ?? '';

  const run = () => {
    if (selectedQuery) onExecute(selectedQuery);
  };

  return (
    <section
      className="glass-morphism glow-blue"
      aria-label="Terminal SQL"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        border: '1px solid rgba(34, 211, 238, 0.15)',
      }}
    >
      <header
        style={{
          padding: 'var(--sp-2) var(--sp-4)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 'var(--sp-2)',
          background: 'rgba(0,0,0,0.3)',
          borderBottom: '1px solid var(--border-color)',
          flexShrink: 0,
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--sp-2)',
            fontSize: 'var(--fs-xs)',
            fontWeight: 700,
            letterSpacing: '1px',
            color: 'var(--text-muted)',
          }}
        >
          <TerminalIcon size={14} style={{ color: 'var(--accent-primary)' }} aria-hidden />
          TERMINAL SQL
          <span style={{ fontWeight: 400, letterSpacing: 0, color: 'var(--text-faint)' }}>
            Ctrl+Enter executa · Ctrl+Espaço completa
          </span>
        </div>

        <div style={{ display: 'flex', gap: 'var(--sp-2)', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onResetDatabase}
            title="Restaurar o banco do caso ao estado original"
            style={{ padding: '0.3rem 0.6rem', fontSize: 'var(--fs-xs)', borderRadius: 'var(--radius-sm)' }}
          >
            <RotateCcw size={12} aria-hidden /> Restaurar banco
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={run}
            disabled={!selectedQuery}
            style={{ padding: '0.35rem 0.85rem', fontSize: 'var(--fs-xs)', borderRadius: 'var(--radius-sm)' }}
          >
            <Play size={11} aria-hidden /> EXECUTAR
          </button>
        </div>
      </header>

      {hasMultiple && (
        <div
          role="tablist"
          aria-label="Consultas no editor"
          style={{
            display: 'flex',
            overflowX: 'auto',
            borderBottom: '1px solid var(--border-color)',
            background: 'rgba(0,0,0,0.2)',
            flexShrink: 0,
          }}
        >
          {statements.map((statement, index) => {
            const isActive = index === safeIndex;
            return (
              <button
                key={index}
                role="tab"
                type="button"
                aria-selected={isActive}
                onClick={() => setActiveIndex(index)}
                title={statement}
                style={{
                  padding: '0.45rem 0.85rem',
                  fontSize: 'var(--fs-xs)',
                  whiteSpace: 'nowrap',
                  border: 'none',
                  background: 'transparent',
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--sp-1)',
                  position: 'relative',
                }}
              >
                <Layers size={11} aria-hidden />
                {statementLabel(statement)}
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '2px',
                      background: 'var(--accent-primary)',
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      <div style={{ flex: 1, minHeight: 0, background: 'rgba(0, 0, 0, 0.1)' }}>
        <Suspense fallback={<EditorSkeleton />}>
          <SqlEditor
            value={code}
            onChange={setCode}
            onRun={run}
            completionSchema={completionSchema}
          />
        </Suspense>
      </div>

      {queryError && (
        <div
          role="alert"
          style={{
            color: '#fecdd3',
            padding: 'var(--sp-2) var(--sp-4)',
            fontSize: 'var(--fs-xs)',
            background: 'rgba(255, 77, 109,0.1)',
            borderTop: '1px solid rgba(255, 77, 109,0.25)',
            display: 'flex',
            gap: 'var(--sp-2)',
            alignItems: 'flex-start',
            flexShrink: 0,
          }}
        >
          <AlertTriangle size={13} style={{ marginTop: '1px', flexShrink: 0, color: 'var(--error)' }} aria-hidden />
          <span style={{ fontFamily: 'var(--font-mono)' }}>{queryError}</span>
        </div>
      )}
    </section>
  );
}
