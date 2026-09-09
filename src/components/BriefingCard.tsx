import { ShieldAlert, FileText, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Case } from '../domain/case';
import { DIFFICULTY_COLOR_VARS, DIFFICULTY_LABELS } from '../domain/case';
import { HINT_PENALTY } from '../domain/scoring';

type Props = {
  currentCase: Case;
  caseNumber: number;
  showHint: boolean;
  usedHint: boolean;
  onToggleHint: () => void;
};

export function BriefingCard({ currentCase, caseNumber, showHint, usedHint, onToggleHint }: Props) {
  const color = DIFFICULTY_COLOR_VARS[currentCase.difficulty];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
      <div
        className="glass-morphism"
        style={{
          padding: 'var(--sp-4)',
          borderLeft: `4px solid ${color}`,
          background: `linear-gradient(135deg, color-mix(in srgb, ${color} 6%, transparent) 0%, var(--glass-bg) 100%)`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginBottom: 'var(--sp-1)' }}>
          <ShieldAlert size={16} style={{ color: 'var(--accent-secondary)', flexShrink: 0 }} aria-hidden />
          <h2 style={{ fontSize: 'var(--fs-lg)', margin: 0 }}>{currentCase.title}</h2>
        </div>

        <div style={{ display: 'flex', gap: 'var(--sp-2)', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
            CASO #{caseNumber}
          </span>
          <span
            style={{
              fontSize: 'var(--fs-xs)',
              background: `color-mix(in srgb, ${color} 14%, transparent)`,
              color,
              padding: '2px 10px',
              borderRadius: '99px',
              fontWeight: 800,
              border: `1px solid color-mix(in srgb, ${color} 30%, transparent)`,
              letterSpacing: '0.5px',
            }}
          >
            {DIFFICULTY_LABELS[currentCase.difficulty]}
          </span>
        </div>
      </div>

      {/* Transmissão da assistente E.V.A. */}
      <div style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
          <img
            src="/cyber_dispatcher.webp"
            alt=""
            width={52}
            height={52}
            loading="lazy"
            decoding="async"
            style={{
              width: '52px',
              height: '52px',
              objectFit: 'cover',
              borderRadius: 'var(--radius-md)',
              border: `1.5px solid ${color}`,
            }}
          />
          <span
            style={{
              fontSize: 'var(--fs-xs)',
              fontWeight: 800,
              color: 'var(--accent-primary)',
              background: 'rgba(59,130,246,0.15)',
              padding: '1px 6px',
              borderRadius: '4px',
            }}
          >
            E.V.A.
          </span>
        </div>

        <div
          className="rpg-dialog-bubble"
          style={{
            flex: 1,
            padding: 'var(--sp-3)',
            fontSize: 'var(--fs-sm)',
            lineHeight: 1.65,
            fontFamily: 'var(--font-mono)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--sp-1)',
              marginBottom: 'var(--sp-1)',
              color,
              fontSize: 'var(--fs-xs)',
              fontWeight: 800,
            }}
          >
            <FileText size={11} aria-hidden /> TRANSMISSÃO ENTRANTE
          </div>
          {currentCase.description}
        </div>
      </div>

      <div
        className="glass-morphism"
        style={{
          padding: 'var(--sp-4)',
          borderLeft: `3px solid ${color}`,
          background: 'var(--bg-sunken)',
        }}
      >
        <div style={{ fontSize: 'var(--fs-xs)', fontWeight: 800, color, marginBottom: 'var(--sp-1)', letterSpacing: '1px' }}>
          OBJETIVO
        </div>
        <p style={{ fontWeight: 600, margin: 0, fontSize: 'var(--fs-sm)', lineHeight: 1.5 }}>
          {currentCase.objective}
        </p>
      </div>

      {currentCase.hint && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onToggleHint}
            aria-expanded={showHint}
            style={{ width: '100%', fontSize: 'var(--fs-xs)', justifyContent: 'center', padding: 'var(--sp-2)' }}
          >
            <Lightbulb size={13} aria-hidden />
            {showHint ? 'Esconder dica' : 'Pedir dica'}
            {/* O custo é anunciado antes de abrir, e some depois de já cobrado. */}
            {!usedHint && (
              <span style={{ color: 'var(--accent-secondary)', fontWeight: 700 }}>
                (−{HINT_PENALTY} pts)
              </span>
            )}
            {showHint ? <ChevronUp size={12} aria-hidden /> : <ChevronDown size={12} aria-hidden />}
          </button>

          <AnimatePresence>
            {showHint && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.18 }}
                style={{ overflow: 'hidden' }}
              >
                <p
                  style={{
                    padding: 'var(--sp-3)',
                    background: 'rgba(245,158,11,0.06)',
                    border: '1px solid rgba(245,158,11,0.18)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--fs-xs)',
                    color: '#fcd34d',
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {currentCase.hint}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
