import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Circle, CornerDownLeft, ChevronDown, Lightbulb } from 'lucide-react';
import type { Lesson } from '../domain/tutor';
import { practices } from '../domain/tutor';
import type { LogEntry } from '../domain/casefile';
import { browserStore, STORAGE_KEYS } from '../data/storage';
import { SqlText } from './SqlText';

type Props = {
  lessons: readonly Lesson[];
  log: readonly LogEntry[];
  onInsert: (sql: string) => void;
};

/**
 * Manual do detetive: as lições de SQL aplicadas ao caso aberto.
 *
 * Cada lição tem os passos na ordem de fazer, o porquê de a técnica
 * funcionar e um exemplo montado com as tabelas reais do caso. Uma lição
 * fica marcada como praticada quando o jogador roda, sem erro, uma consulta
 * que usa a técnica — e essa marca vale para o jogo todo.
 */
export function ManualPanel({ lessons, log, onInsert }: Props) {
  const [stored] = useState<string[]>(() => browserStore.read<string[]>(STORAGE_KEYS.practicedLessons, []));

  const practiced = useMemo(() => {
    const set = new Set(stored);
    for (const lesson of lessons) {
      if (log.some(entry => entry.error === null && practices(lesson, entry.sql))) set.add(lesson.id);
    }
    return set;
  }, [stored, lessons, log]);

  const practicedKey = [...practiced].sort().join(',');
  useEffect(() => {
    if (practicedKey) browserStore.write(STORAGE_KEYS.practicedLessons, practicedKey.split(','));
  }, [practicedKey]);

  // Recomendadas primeiro, preservando a ordem didática dentro de cada grupo.
  const ordered = useMemo(
    () => [...lessons.filter(l => l.recommended), ...lessons.filter(l => !l.recommended)],
    [lessons]
  );

  const [openId, setOpenId] = useState<string | null>(
    () => ordered.find(l => l.recommended && !stored.includes(l.id))?.id ?? null
  );

  return (
    <div className="paper tab-panel" role="tabpanel" style={{ padding: 'var(--sp-3)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
      <div style={{ display: 'flex', gap: 'var(--sp-2)', alignItems: 'flex-start', padding: 'var(--sp-2) var(--sp-3)', background: 'rgba(255, 221, 87, 0.35)', borderLeft: '3px solid var(--brass-dark)' }}>
        <Lightbulb size={16} aria-hidden style={{ flexShrink: 0, marginTop: '2px' }} />
        <p style={{ fontSize: 'var(--fs-sm)', lineHeight: 1.55 }}>
          Nunca escreveu SQL? Siga as lições <strong>recomendadas</strong>, de cima para baixo. Cada uma usa as
          tabelas deste caso: leve o exemplo para o terminal, execute e compare o resultado com a explicação.
          As lições não custam pontos.
        </p>
      </div>

      <p className="type-label">
        Praticadas: {lessons.filter(l => practiced.has(l.id)).length}/{lessons.length}
      </p>

      <ol style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
        {ordered.map(lesson => {
          const open = openId === lesson.id;
          const done = practiced.has(lesson.id);
          return (
            <li key={lesson.id} style={{ border: '1px solid var(--paper-edge)', background: open ? 'rgba(255,255,255,0.4)' : 'transparent' }}>
              <button
                type="button"
                onClick={() => setOpenId(open ? null : lesson.id)}
                aria-expanded={open}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--sp-2)',
                  padding: '8px 10px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--ink)',
                  textAlign: 'left',
                  font: 'inherit',
                }}
              >
                {done ? (
                  <CheckCircle2 size={16} aria-label="praticada" style={{ color: 'var(--green-ink)', flexShrink: 0 }} />
                ) : (
                  <Circle size={16} aria-label="não praticada" style={{ color: 'var(--ink-faint)', flexShrink: 0 }} />
                )}
                <span style={{ flex: 1, fontWeight: 700, fontSize: 'var(--fs-sm)' }}>{lesson.title}</span>
                {lesson.recommended && !done && (
                  <span className="type-label" style={{ color: 'var(--red)', fontSize: '11px' }}>recomendada</span>
                )}
                <ChevronDown size={14} aria-hidden style={{ transform: open ? 'rotate(180deg)' : undefined, transition: 'transform 0.15s' }} />
              </button>

              {open && (
                <div style={{ padding: '0 12px 12px', display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                  <ol style={{ paddingLeft: '1.3rem', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: 'var(--fs-sm)', lineHeight: 1.55 }}>
                    {lesson.steps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>

                  <div style={{ borderLeft: '3px solid var(--blue-ink)', paddingLeft: '10px' }}>
                    <p className="type-label" style={{ color: 'var(--blue-ink)', marginBottom: '2px' }}>Por que funciona</p>
                    <p style={{ fontSize: 'var(--fs-sm)', lineHeight: 1.6 }}>{lesson.why}</p>
                  </div>

                  <div className="index-card" style={{ padding: '4px 10px 10px' }}>
                    <p className="type-label" style={{ lineHeight: '24px' }}>Exemplo com este caso</p>
                    <pre style={{ marginTop: '6px', whiteSpace: 'pre-wrap' }}>
                      <SqlText sql={lesson.example} />
                    </pre>
                  </div>

                  <button type="button" className="btn btn-brass" onClick={() => onInsert(lesson.example)} style={{ alignSelf: 'flex-start' }}>
                    <CornerDownLeft size={14} aria-hidden /> Levar para o terminal
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
