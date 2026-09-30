import { CheckSquare, Square, CornerDownLeft } from 'lucide-react';
import type { Lead, LogEntry } from '../domain/casefile';
import { leadsProgress } from '../domain/casefile';
import { SqlText } from './SqlText';

type Props = {
  leads: readonly Lead[];
  log: readonly LogEntry[];
  notes: string;
  onNotesChange: (value: string) => void;
  onInsert: (sql: string) => void;
};

function clock(at: number): string {
  return new Date(at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

/**
 * Diário do caso: as linhas de investigação seguidas, cada consulta
 * executada (reaproveitável com um clique) e o bloco de anotações.
 */
export function CaseDiary({ leads, log, notes, onNotesChange, onInsert }: Props) {
  const progress = leadsProgress(leads);

  return (
    <div className="paper tab-panel" role="tabpanel" style={{ padding: 'var(--sp-3)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
      <section aria-label="Linhas de investigação">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
          <p className="type-label">Linhas de investigação</p>
          <span style={{ fontFamily: 'var(--font-type)', fontSize: 'var(--fs-sm)' }}>{progress}%</span>
        </div>
        <div role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Progresso da investigação" style={{ height: '6px', background: 'var(--paper-edge)', marginBottom: 'var(--sp-2)' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: 'var(--green-ink)', transition: 'width 0.4s ease' }} />
        </div>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {leads.map(lead => (
            <li key={lead.id} style={{ display: 'flex', gap: 'var(--sp-2)', alignItems: 'flex-start', fontSize: 'var(--fs-sm)' }}>
              {lead.done ? (
                <CheckSquare size={15} aria-label="feito" style={{ color: 'var(--green-ink)', flexShrink: 0, marginTop: '2px' }} />
              ) : (
                <Square size={15} aria-label="pendente" style={{ color: 'var(--ink-faint)', flexShrink: 0, marginTop: '2px' }} />
              )}
              <span style={{ textDecoration: lead.done ? 'line-through' : undefined, textDecorationColor: 'var(--green-ink)' }}>
                <strong>{lead.label}</strong> <span style={{ color: 'var(--ink-faint)' }}>— {lead.detail}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="Anotações">
        <label htmlFor="case-notes" className="type-label" style={{ display: 'block', marginBottom: '6px' }}>
          Anotações (ficam salvas neste caso)
        </label>
        <textarea
          id="case-notes"
          className="notes-field"
          value={notes}
          onChange={event => onNotesChange(event.target.value)}
          placeholder="Ex.: o acesso das 23:00 foi na Ala Leste…"
          rows={5}
        />
      </section>

      <section aria-label="Consultas executadas">
        <p className="type-label" style={{ marginBottom: '6px' }}>Consultas executadas ({log.length})</p>
        {log.length === 0 && (
          <p style={{ fontFamily: 'var(--font-type)', color: 'var(--ink-faint)', fontSize: 'var(--fs-sm)' }}>Nenhuma consulta ainda.</p>
        )}
        <ol style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
          {log.map(entry => (
            <li key={entry.id} style={{ borderBottom: '1px dashed var(--paper-edge)', paddingBottom: 'var(--sp-2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--sp-2)', fontSize: 'var(--fs-xs)', color: 'var(--ink-faint)', fontFamily: 'var(--font-mono)' }}>
                <span>
                  #{entry.id} · {clock(entry.at)} ·{' '}
                  {entry.error ? <span style={{ color: 'var(--red)' }}>recusada</span> : `${entry.rowCount} linha(s)`}
                </span>
                <button type="button" className="icon-btn" onClick={() => onInsert(entry.sql)} aria-label={`Reabrir a consulta ${entry.id} no terminal`} title="Reabrir no terminal">
                  <CornerDownLeft size={13} aria-hidden />
                </button>
              </div>
              <SqlText sql={entry.sql} />
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
