import { lazy, Suspense, useMemo, useState } from 'react';
import { Play, RotateCcw, Layers, FileWarning } from 'lucide-react';
import type { TableModel } from '../domain/schemaModel';
import { toCompletionSchema } from '../domain/schemaModel';
import { explainError } from '../domain/tutor';

// CodeMirror responde por ~370 kB do pacote. Carregá-lo à parte deixa a tela
// inicial leve; ele chega enquanto o jogador lê o memorando.
const SqlEditor = lazy(() =>
  import('./SqlEditor').then(module => ({ default: module.SqlEditor }))
);

type Props = {
  /** Tabelas do caso: alimentam o autocomplete e o parecer sobre erros. */
  tables: readonly TableModel[];
  code: string;
  onCodeChange: (code: string) => void;
  queryError: string | null;
  onExecute: (sql: string) => void;
  /** Recria o banco do caso, desfazendo DELETE/DROP acidentais. */
  onResetDatabase: () => void;
};

function EditorSkeleton() {
  return (
    <p role="status" className="crt-text" style={{ padding: 'var(--sp-4)', fontSize: 'var(--fs-sm)' }}>
      CARREGANDO EDITOR…<span className="type-caret" />
    </p>
  );
}

/** Rótulo curto de uma statement, para a aba. */
function statementLabel(statement: string): string {
  const match = statement.match(/(?:SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)\b.{0,28}/i);
  return match ? `${match[0].replace(/\s+/g, ' ')}…` : 'Consulta';
}

/**
 * O terminal da delegacia: um monitor de fósforo âmbar onde o jogador
 * escreve SQL. Quando o banco recusa a consulta, o perito explica o porquê.
 */
export function SmartTerminal({ tables, code, onCodeChange, queryError, onExecute, onResetDatabase }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  const completionSchema = useMemo(() => toCompletionSchema([...tables]), [tables]);
  const statements = useMemo(() => code.split(';').map(s => s.trim()).filter(Boolean), [code]);

  const hasMultiple = statements.length > 1;
  // Clamp em vez de zerar num efeito: apagar uma statement não pode deixar o
  // índice apontando para fora da lista.
  const safeIndex = Math.min(activeIndex, Math.max(statements.length - 1, 0));
  const selectedQuery = statements[safeIndex] ?? '';

  const explanation = useMemo(
    () => (queryError ? explainError(queryError, tables) : null),
    [queryError, tables]
  );

  const run = () => {
    if (selectedQuery) onExecute(selectedQuery);
  };

  return (
    <section className="monitor" aria-label="Terminal SQL" style={{ height: '100%' }}>
      <div className="monitor-screen">
        <header
          className="crt-text"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 'var(--sp-2)',
            padding: '8px 12px',
            borderBottom: '1px dashed rgba(255,182,72,0.3)',
            fontSize: 'var(--fs-xs)',
            flexWrap: 'wrap',
            position: 'relative',
            zIndex: 4,
          }}
        >
          <span style={{ letterSpacing: '0.12em' }}>C:\DELEGACIA\CONSULTAS&gt; SQLITE</span>
          <span style={{ display: 'flex', gap: 'var(--sp-2)' }}>
            <button type="button" className="btn btn-crt" onClick={onResetDatabase} title="Restaurar o banco do caso ao estado original">
              <RotateCcw size={12} aria-hidden /> Restaurar banco
            </button>
            <button type="button" className="btn btn-crt-solid" onClick={run} disabled={!selectedQuery}>
              <Play size={12} aria-hidden /> EXECUTAR
            </button>
          </span>
        </header>

        {hasMultiple && (
          <div role="tablist" aria-label="Consultas no editor" style={{ display: 'flex', overflowX: 'auto', borderBottom: '1px dashed rgba(255,182,72,0.25)', flexShrink: 0, position: 'relative', zIndex: 4 }}>
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
                  className="crt-text"
                  style={{
                    padding: '5px 12px',
                    fontSize: 'var(--fs-xs)',
                    whiteSpace: 'nowrap',
                    border: 'none',
                    background: isActive ? 'rgba(255,182,72,0.14)' : 'transparent',
                    opacity: isActive ? 1 : 0.6,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <Layers size={11} aria-hidden />
                  {statementLabel(statement)}
                </button>
              );
            })}
          </div>
        )}

        <div style={{ flex: 1, minHeight: 0, position: 'relative', zIndex: 2 }}>
          <Suspense fallback={<EditorSkeleton />}>
            <SqlEditor value={code} onChange={onCodeChange} onRun={run} completionSchema={completionSchema} />
          </Suspense>
        </div>

        {explanation && (
          <div
            role="alert"
            style={{
              position: 'relative',
              zIndex: 4,
              flexShrink: 0,
              maxHeight: '45%',
              overflowY: 'auto',
              margin: '0 10px 10px',
              padding: '10px 12px',
              border: '1px solid rgba(255,120,80,0.55)',
              background: 'rgba(60, 12, 4, 0.55)',
              color: '#ffd6b0',
              fontSize: 'var(--fs-sm)',
              lineHeight: 1.55,
            }}
          >
            <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ffb08a', fontFamily: 'var(--font-mono)' }}>
              <FileWarning size={14} aria-hidden /> PARECER DO PERITO: {explanation.title}
            </strong>
            <p style={{ marginTop: '4px' }}>
              <span style={{ color: '#ffb08a' }}>Por quê: </span>
              {explanation.why}
            </p>
            <p style={{ marginTop: '2px' }}>
              <span style={{ color: '#ffb08a' }}>Como corrigir: </span>
              {explanation.fix}
            </p>
            <p style={{ marginTop: '4px', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-xs)', opacity: 0.7 }}>
              sqlite: {queryError}
            </p>
          </div>
        )}
      </div>

      <div className="monitor-chin">
        <span>DATACOP · 2000</span>
        <span style={{ fontFamily: 'var(--font-ui)', letterSpacing: 0, color: '#8f846f' }}>
          Ctrl+Enter executa · Ctrl+Espaço completa
        </span>
        <span className="power-led" aria-hidden />
      </div>
    </section>
  );
}
