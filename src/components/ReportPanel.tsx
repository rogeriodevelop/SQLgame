import { useMemo, useState } from 'react';
import { Pin, PinOff, Printer, BookOpenCheck } from 'lucide-react';
import type { SqlValue } from 'sql.js';
import type { QueryResult } from '../domain/case';
import { cellText, evidenceId, isSuspect } from '../domain/casefile';
import { adviceForEmptyResult, explainQuery } from '../domain/tutor';
import { SqlText } from './SqlText';
import { PunchCard, TapeReel } from './NoirArt';

type Props = {
  result: QueryResult | null;
  /** O banco foi restaurado e ainda não houve consulta depois. */
  databaseRestored: boolean;
  lastSql: string | null;
  /** Número da consulta no diário, para numerar o relatório e animar a impressão. */
  reportNumber: number;
  /** Instante em que a consulta rodou. */
  reportAt: number | null;
  pinnedIds: ReadonlySet<string>;
  suspects: readonly string[];
  onPinRow: (columns: string[], row: SqlValue[]) => void;
  onToggleSuspect: (name: string) => void;
};

type Tab = 'report' | 'reading';

/**
 * Onde o resultado sai: um relatório impresso em formulário contínuo, com
 * ações de investigação em cada linha, e ao lado a leitura didática da
 * consulta na ordem em que o banco a executou.
 */
export function ReportPanel(props: Props) {
  const [tab, setTab] = useState<Tab>('report');
  const steps = useMemo(() => (props.lastSql ? explainQuery(props.lastSql) : []), [props.lastSql]);

  return (
    <section aria-label="Relatório da consulta" style={{ display: 'flex', flexDirection: 'column', minHeight: 0, height: '100%' }}>
      <div className="tabs" role="tablist">
        <button type="button" role="tab" className="tab" aria-selected={tab === 'report'} onClick={() => setTab('report')}>
          <Printer size={12} aria-hidden /> Relatório impresso
          {props.result && props.result.columns.length > 0 && (
            <span className="tab-badge" style={{ background: 'var(--ink-soft)' }}>{props.result.values.length}</span>
          )}
        </button>
        <button type="button" role="tab" className="tab" aria-selected={tab === 'reading'} onClick={() => setTab('reading')}>
          <BookOpenCheck size={12} aria-hidden /> Como o banco leu sua consulta
        </button>
      </div>

      {tab === 'report' ? <Report {...props} /> : <Reading steps={steps} sql={props.lastSql} />}
    </section>
  );
}

function Report({ result, databaseRestored, lastSql, reportNumber, reportAt, pinnedIds, suspects, onPinRow, onToggleSuspect }: Props) {
  if (!result && databaseRestored) {
    return (
      <div className="printout tab-panel print-in" role="tabpanel" style={{ display: 'grid', placeContent: 'center', textAlign: 'center', gap: 'var(--sp-3)' }}>
        <p role="status" style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>*** BANCO RESTAURADO ***</p>
        <p style={{ fontFamily: 'var(--font-type)', color: 'var(--ink-soft)', maxWidth: '46ch', lineHeight: 1.6, margin: '0 auto' }}>
          Todas as tabelas voltaram ao estado original do caso: o que foi apagado ou alterado com DELETE,
          UPDATE, INSERT ou DROP foi desfeito. Seu SQL no terminal, o diário e o quadro continuam como estavam.
          Execute a consulta de novo para ver os dados.
        </p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="printout tab-panel" role="tabpanel" style={{ display: 'grid', placeContent: 'center', textAlign: 'center' }}>
        <div aria-hidden style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--sp-4)', marginBottom: 'var(--sp-3)', opacity: 0.85 }}>
          <TapeReel style={{ width: '64px' }} />
          <PunchCard seed="impressora" style={{ width: '150px', transform: 'rotate(-3deg)' }} />
          <TapeReel style={{ width: '64px' }} />
        </div>
        <p style={{ fontFamily: 'var(--font-type)', color: 'var(--ink-faint)', maxWidth: '40ch', lineHeight: 1.6, margin: '0 auto' }}>
          A impressora está parada.
          <br />
          Escreva uma consulta no terminal e pressione Ctrl+Enter — o resultado sai aqui.
        </p>
      </div>
    );
  }

  const time = reportAt ? new Date(reportAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';
  const header = (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 'var(--sp-2)',
        padding: '8px 0 6px',
        borderBottom: '1px dashed rgba(0,0,0,0.3)',
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--fs-xs)',
        color: 'var(--ink-soft)',
        flexWrap: 'wrap',
      }}
    >
      <span>RELATÓRIO Nº {String(reportNumber).padStart(4, '0')}</span>
      <span>{result.columns.length > 0 ? `${result.values.length} REGISTRO(S)` : 'COMANDO'}</span>
      <span>{time}</span>
    </div>
  );

  if (result.columns.length === 0 || result.values.length === 0) {
    const isCommand = result.columns.length === 0 && !/^\s*select/i.test(lastSql ?? '');
    return (
      <div key={reportNumber} className="printout tab-panel print-in" role="tabpanel">
        {header}
        {isCommand ? (
          <p style={{ fontFamily: 'var(--font-mono)', padding: 'var(--sp-3) 0' }}>Comando executado. Nenhuma linha para imprimir.</p>
        ) : (
          <div style={{ padding: 'var(--sp-3) 0', display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>*** NENHUM REGISTRO ENCONTRADO ***</p>
            <p className="type-label">Por que pode ter vindo vazio</p>
            <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: 'var(--fs-sm)', lineHeight: 1.55 }}>
              {adviceForEmptyResult(lastSql ?? '').map(text => (
                <li key={text}>{text}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div key={reportNumber} className="printout tab-panel print-in" role="tabpanel" style={{ display: 'flex', flexDirection: 'column' }}>
      {header}
      <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--ink-faint)', padding: '4px 0', display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
        <Pin size={11} aria-hidden /> fixa a linha no quadro como prova · clique num valor para marcá-lo como suspeito
      </p>
      <div style={{ overflow: 'auto', flex: 1, minHeight: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-sm)' }}>
          <thead>
            <tr>
              <th style={{ width: '34px', position: 'sticky', top: 0, background: 'var(--printout)' }}>
                <span className="sr-only">Fixar</span>
              </th>
              {result.columns.map((column, index) => (
                <th
                  key={index}
                  scope="col"
                  style={{
                    position: 'sticky',
                    top: 0,
                    background: 'var(--printout)',
                    textAlign: 'left',
                    padding: '6px 10px',
                    borderBottom: '2px solid var(--ink)',
                    whiteSpace: 'nowrap',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    zIndex: 1,
                  }}
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.values.map((row, rowIndex) => {
              const values = row.map(cellText);
              const pinned = pinnedIds.has(evidenceId(result.columns, values));
              return (
                <tr key={rowIndex} style={{ height: '30px', background: pinned ? 'rgba(163,32,28,0.08)' : undefined }}>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => onPinRow(result.columns, row)}
                      aria-pressed={pinned}
                      aria-label={pinned ? `Remover a linha ${rowIndex + 1} do quadro` : `Fixar a linha ${rowIndex + 1} no quadro`}
                      title={pinned ? 'Remover do quadro' : 'Fixar no quadro como prova'}
                      style={{ color: pinned ? 'var(--red)' : 'var(--ink-faint)' }}
                    >
                      {pinned ? <PinOff size={14} aria-hidden /> : <Pin size={14} aria-hidden />}
                    </button>
                  </td>
                  {row.map((value, cellIndex) => {
                    const text = values[cellIndex];
                    const marked = value !== null && isSuspect(suspects, text);
                    return (
                      <td key={cellIndex} style={{ padding: '0 10px', whiteSpace: 'nowrap' }}>
                        {value === null ? (
                          <span style={{ color: 'var(--ink-faint)', fontStyle: 'italic' }}>NULL</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onToggleSuspect(text)}
                            aria-pressed={marked}
                            title={marked ? 'Desmarcar suspeito' : 'Marcar como suspeito'}
                            style={{
                              font: 'inherit',
                              color: 'var(--ink)',
                              background: 'none',
                              border: marked ? '2px solid var(--red)' : '2px solid transparent',
                              borderRadius: '45% 55% 50% 50% / 60% 50% 55% 45%',
                              padding: '0 6px',
                              margin: '0 -8px',
                              cursor: 'pointer',
                            }}
                          >
                            {text}
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Reading({ steps, sql }: { steps: ReturnType<typeof explainQuery>; sql: string | null }) {
  return (
    <div className="paper tab-panel" role="tabpanel" style={{ padding: 'var(--sp-4)' }}>
      {!sql && (
        <p style={{ fontFamily: 'var(--font-type)', color: 'var(--ink-faint)' }}>
          Execute uma consulta SELECT e aqui aparece, passo a passo, o que o banco fez com ela.
        </p>
      )}

      {sql && steps.length === 0 && (
        <p style={{ fontFamily: 'var(--font-type)', color: 'var(--ink-faint)' }}>
          A leitura passo a passo cobre consultas SELECT simples. Esta consulta não se encaixa nesse formato.
        </p>
      )}

      {steps.length > 0 && (
        <>
          <p style={{ fontSize: 'var(--fs-sm)', lineHeight: 1.6, marginBottom: 'var(--sp-3)' }}>
            Você escreve o SQL começando por <strong>SELECT</strong>, mas o banco não o executa nessa ordem. Ele
            primeiro descobre <em>de onde</em> vêm os dados, depois <em>quais linhas</em> ficam e só no fim{' '}
            <em>o que mostrar</em>. Foi isto que aconteceu com a sua consulta:
          </p>
          <ol style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
            {steps.map((step, index) => (
              <li key={index} style={{ display: 'grid', gridTemplateColumns: '28px 1fr', gap: 'var(--sp-2)' }}>
                <span
                  aria-hidden
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    border: '2px solid var(--blue-ink)',
                    color: 'var(--blue-ink)',
                    display: 'grid',
                    placeItems: 'center',
                    fontFamily: 'var(--font-type)',
                  }}
                >
                  {index + 1}
                </span>
                <div>
                  <SqlText sql={step.text} />
                  <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--ink-soft)', lineHeight: 1.55, marginTop: '2px' }}>{step.meaning}</p>
                </div>
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}
