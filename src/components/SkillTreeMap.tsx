import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Lock } from 'lucide-react';
import { casesByDifficulty, indexOfCase } from '../data/caseRepository';
import { DIFFICULTY_COLOR_VARS, DIFFICULTY_LABELS, type Difficulty } from '../domain/case';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  currentCaseIndex: number;
  onSelectCase: (index: number) => void;
  solvedIds: string[];
  starsForCase: (caseId: string, difficulty: Difficulty) => 0 | 1 | 2 | 3;
};

export function SkillTreeMap({
  isOpen,
  onClose,
  currentCaseIndex,
  onSelectCase,
  solvedIds,
  starsForCase,
}: Props) {
  const groups = casesByDifficulty();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(5, 6, 8, 0.85)',
              backdropFilter: 'blur(8px)',
              zIndex: 200,
            }}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Mapa de casos"
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.3 }}
            style={{
              position: 'fixed',
              inset: '4%',
              background: 'rgba(10, 12, 16, 0.97)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '20px',
              zIndex: 201,
              display: 'flex',
              flexDirection: 'column',
              padding: 'clamp(1rem, 3vw, 2rem)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 'var(--sp-3)',
                marginBottom: 'var(--sp-5)',
                flexShrink: 0,
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                  <Trophy style={{ color: 'var(--accent-secondary)' }} size={22} aria-hidden />
                  <h2 style={{ fontSize: 'var(--fs-xl)', margin: 0, letterSpacing: '1px' }}>MAPA DE CASOS</h2>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-sm)', margin: '2px 0 0' }}>
                  {solvedIds.length} casos fechados · refaça um caso para melhorar as estrelas
                </p>
              </div>

              <button type="button" onClick={onClose} className="btn btn-ghost" aria-label="Fechar mapa" style={{ padding: 'var(--sp-2)' }}>
                <X size={18} aria-hidden />
              </button>
            </div>

            <div
              className="cyber-grid"
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: 'var(--sp-4)',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(0,0,0,0.3)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--sp-6)',
              }}
            >
              {groups.map(({ difficulty, cases }) => {
                const color = DIFFICULTY_COLOR_VARS[difficulty];

                return (
                  <section key={difficulty} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
                    <h3
                      style={{
                        fontSize: 'var(--fs-sm)',
                        color,
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--sp-2)',
                        margin: 0,
                      }}
                    >
                      <span aria-hidden style={{ height: '2px', width: '20px', background: color }} />
                      {DIFFICULTY_LABELS[difficulty]}
                      <span aria-hidden style={{ flex: 1, height: '1px', background: `linear-gradient(90deg, ${color} 0%, transparent 100%)`, opacity: 0.25 }} />
                    </h3>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(84px, 1fr))',
                        gap: 'var(--sp-4)',
                        justifyItems: 'center',
                      }}
                    >
                      {cases.map(item => {
                        const globalIndex = indexOfCase(item.id);
                        const isActive = globalIndex === currentCaseIndex;
                        const stars = starsForCase(item.id, difficulty);
                        const isSolved = stars > 0;

                        return (
                          <div key={item.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--sp-1)', width: '100%' }}>
                            <button
                              type="button"
                              onClick={() => {
                                onSelectCase(globalIndex);
                                onClose();
                              }}
                              className={isActive ? 'pulse-glow-active' : undefined}
                              aria-current={isActive ? 'true' : undefined}
                              aria-label={`Caso ${globalIndex + 1}: ${item.title}${isSolved ? `, ${stars} de 3 estrelas` : ', não resolvido'}`}
                              style={{
                                width: '54px',
                                height: '54px',
                                borderRadius: '50%',
                                border: isActive ? `2.5px solid ${color}` : `1.5px solid ${isSolved ? color : 'var(--border-color)'}`,
                                background: isSolved ? `color-mix(in srgb, ${color} 14%, transparent)` : 'rgba(0,0,0,0.5)',
                                color: isSolved ? color : 'var(--text-muted)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 'var(--fs-md)',
                                fontWeight: 800,
                                fontFamily: 'var(--font-mono)',
                                cursor: 'pointer',
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                              }}
                            >
                              {globalIndex + 1}
                            </button>

                            <span aria-hidden style={{ fontSize: 'var(--fs-xs)', color: isSolved ? 'var(--accent-secondary)' : 'var(--text-faint)', letterSpacing: '1px', height: '1em' }}>
                              {isSolved ? '★'.repeat(stars) + '☆'.repeat(3 - stars) : <Lock size={10} />}
                            </span>

                            <span
                              title={item.title}
                              style={{
                                fontSize: 'var(--fs-xs)',
                                color: isActive ? 'white' : 'var(--text-muted)',
                                textAlign: 'center',
                                lineHeight: 1.3,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {item.title}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
