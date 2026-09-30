import { X, Gavel } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Evidence } from '../domain/casefile';
import { EVIDENCE_LIMIT, SUSPECT_LIMIT } from '../domain/casefile';

type Props = {
  evidence: readonly Evidence[];
  suspects: readonly string[];
  onUnpin: (id: string) => void;
  onRemoveSuspect: (name: string) => void;
  /** Leva o nome para o mandado de prisão. */
  onChooseSuspect: (name: string) => void;
};

/** Inclinação determinística por posição: o quadro não "treme" a cada render. */
function tilt(index: number): number {
  return [-2.2, 1.6, -0.8, 2.4, -1.5, 0.9][index % 6];
}

/** Silhueta genérica de ficha policial. */
function Silhouette() {
  return (
    <svg viewBox="0 0 60 60" width="100%" height="100%" aria-hidden style={{ display: 'block' }}>
      <rect width="60" height="60" fill="#3a3530" />
      {[12, 24, 36, 48].map(y => (
        <line key={y} x1="0" x2="60" y1={y} y2={y} stroke="rgba(255,255,255,0.12)" strokeWidth="0.6" />
      ))}
      <circle cx="30" cy="24" r="10" fill="#15120f" />
      <path d="M10 60 C12 42 20 37 30 37 C40 37 48 42 50 60 Z" fill="#15120f" />
    </svg>
  );
}

/**
 * O quadro de investigação: suspeitos em polaroid ligados por barbante
 * vermelho no alto, e abaixo as linhas de resultado fixadas como prova.
 */
export function EvidenceBoard({ evidence, suspects, onUnpin, onRemoveSuspect, onChooseSuspect }: Props) {
  return (
    <div className="cork tab-panel" role="tabpanel" style={{ padding: 'var(--sp-3)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', minHeight: '260px' }}>
      <section aria-label="Suspeitos">
        <div
          className="type-label"
          style={{ background: 'var(--paper)', display: 'inline-block', padding: '1px 8px', color: 'var(--ink)', transform: 'rotate(-1deg)', boxShadow: '0 1px 3px rgba(0,0,0,0.4)' }}
        >
          Suspeitos {suspects.length}/{SUSPECT_LIMIT}
        </div>

        {suspects.length === 0 ? (
          <p style={{ marginTop: 'var(--sp-2)', fontSize: 'var(--fs-sm)', color: '#fff4df', textShadow: '0 1px 2px #000', lineHeight: 1.5 }}>
            Clique num nome do relatório impresso para marcá-lo como suspeito. Ele aparece aqui.
          </p>
        ) : (
          <div style={{ position: 'relative', marginTop: 'var(--sp-3)' }}>
            {/* Barbante vermelho ligando os suspeitos. */}
            {suspects.length > 1 && (
              <div aria-hidden style={{ position: 'absolute', left: '30px', right: '30px', top: '4px', height: '2px', background: 'var(--red-bright)', boxShadow: '0 1px 1px rgba(0,0,0,0.5)' }} />
            )}
            <ul style={{ listStyle: 'none', display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-3)' }}>
              <AnimatePresence>
                {suspects.map((name, index) => (
                  <motion.li
                    key={name}
                    initial={{ opacity: 0, y: -12, rotate: 0 }}
                    animate={{ opacity: 1, y: 0, rotate: tilt(index) }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="polaroid"
                    style={{ position: 'relative', width: '86px' }}
                  >
                    <span className="pushpin" style={{ top: '-4px' }} />
                    <div style={{ width: '74px', height: '66px' }}>
                      <Silhouette />
                    </div>
                    <p style={{ fontFamily: 'var(--font-type)', fontSize: '12px', lineHeight: 1.2, marginTop: '5px', textAlign: 'center', wordBreak: 'break-word' }}>{name}</p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', marginTop: '3px' }}>
                      <button type="button" className="icon-btn" onClick={() => onChooseSuspect(name)} aria-label={`Levar ${name} para o mandado`} title="Levar para o mandado de prisão" style={{ width: 24, height: 22 }}>
                        <Gavel size={12} aria-hidden />
                      </button>
                      <button type="button" className="icon-btn" onClick={() => onRemoveSuspect(name)} aria-label={`Tirar ${name} dos suspeitos`} title="Tirar dos suspeitos" style={{ width: 24, height: 22 }}>
                        <X size={12} aria-hidden />
                      </button>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </div>
        )}
      </section>

      <section aria-label="Provas fixadas">
        <div
          className="type-label"
          style={{ background: 'var(--paper)', display: 'inline-block', padding: '1px 8px', color: 'var(--ink)', transform: 'rotate(0.8deg)', boxShadow: '0 1px 3px rgba(0,0,0,0.4)' }}
        >
          Provas {evidence.length}/{EVIDENCE_LIMIT}
        </div>

        {evidence.length === 0 ? (
          <p style={{ marginTop: 'var(--sp-2)', fontSize: 'var(--fs-sm)', color: '#fff4df', textShadow: '0 1px 2px #000', lineHeight: 1.5 }}>
            Use o alfinete ao lado de uma linha do relatório para fixá-la aqui. Provas reunidas ajudam a
            conferir o raciocínio antes de emitir o mandado.
          </p>
        ) : (
          <ul style={{ listStyle: 'none', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 'var(--sp-4) var(--sp-3)', marginTop: 'var(--sp-4)' }}>
            <AnimatePresence>
              {evidence.map((item, index) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1, rotate: tilt(index + 2) * 0.6 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  className="paper"
                  style={{ position: 'relative', padding: '12px 8px 6px', background: index % 3 === 1 ? '#f7e99a' : undefined }}
                  title={item.sql}
                >
                  <span className="pushpin" />
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => onUnpin(item.id)}
                    aria-label="Retirar prova do quadro"
                    title="Retirar do quadro"
                    style={{ position: 'absolute', top: 2, right: 2, width: 20, height: 20 }}
                  >
                    <X size={11} aria-hidden />
                  </button>
                  <dl style={{ fontSize: '12px', lineHeight: 1.35 }}>
                    {item.columns.map((column, i) => (
                      <div key={i} style={{ display: 'flex', gap: '4px', minWidth: 0 }}>
                        <dt style={{ color: 'var(--ink-faint)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>{column}:</dt>
                        <dd style={{ fontFamily: 'var(--font-type)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.values[i]}</dd>
                      </div>
                    ))}
                  </dl>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </section>
    </div>
  );
}
