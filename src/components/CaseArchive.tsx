import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
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

/**
 * O arquivo da delegacia: uma gaveta por nível, uma pasta por caso. Casos
 * resolvidos levam o carimbo e as estrelas conquistadas.
 */
export function CaseArchive({ isOpen, onClose, currentCaseIndex, onSelectCase, solvedIds, starsForCase }: Props) {
  const groups = casesByDifficulty();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(5,4,3,0.8)', zIndex: 200 }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Arquivo de casos"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              position: 'fixed',
              inset: 'clamp(8px, 3vw, 32px)',
              zIndex: 201,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '8px',
              background: 'linear-gradient(180deg, #5b6166 0%, #3f4448 100%)',
              boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.15), 0 20px 60px rgba(0,0,0,0.7)',
              padding: 'clamp(0.75rem, 2vw, 1.5rem)',
            }}
          >
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-4)' }}>
              <div>
                <h2 style={{ fontSize: 'var(--fs-xl)', color: '#f4efe4' }}>Arquivo de casos</h2>
                <p style={{ color: '#d2cbbd', fontSize: 'var(--fs-sm)' }}>
                  {solvedIds.length} caso(s) arquivado(s) · refaça um caso para melhorar as estrelas
                </p>
              </div>
              <button type="button" onClick={onClose} className="btn btn-ghost" aria-label="Fechar o arquivo" style={{ padding: 'var(--sp-2)' }}>
                <X size={18} aria-hidden />
              </button>
            </header>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', paddingRight: '4px' }}>
              {groups.map(({ difficulty, cases }) => {
                const color = DIFFICULTY_COLOR_VARS[difficulty];
                const solvedHere = cases.filter(c => solvedIds.includes(c.id)).length;
                return (
                  <section
                    key={difficulty}
                    aria-label={DIFFICULTY_LABELS[difficulty]}
                    style={{
                      borderRadius: '6px',
                      background: 'linear-gradient(180deg, #2c2f32, #1f2123)',
                      boxShadow: 'inset 0 3px 8px rgba(0,0,0,0.6)',
                      padding: 'var(--sp-3)',
                    }}
                  >
                    {/* Porta-etiqueta da gaveta */}
                    <div
                      style={{
                        display: 'inline-flex',
                        gap: 'var(--sp-3)',
                        alignItems: 'center',
                        padding: '3px 12px',
                        marginBottom: 'var(--sp-3)',
                        background: 'var(--paper)',
                        border: '2px solid #9aa0a5',
                        color: 'var(--ink)',
                        fontFamily: 'var(--font-type)',
                        fontSize: 'var(--fs-sm)',
                      }}
                    >
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: color }} aria-hidden />
                      {DIFFICULTY_LABELS[difficulty]}
                      <span style={{ color: 'var(--ink-faint)' }}>
                        {solvedHere}/{cases.length}
                      </span>
                    </div>

                    <ul style={{ listStyle: 'none', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 'var(--sp-4) var(--sp-3)', paddingTop: '14px' }}>
                      {cases.map(item => {
                        const globalIndex = indexOfCase(item.id);
                        const isActive = globalIndex === currentCaseIndex;
                        const stars = starsForCase(item.id, difficulty);
                        const solved = stars > 0;
                        return (
                          <li key={item.id}>
                            <button
                              type="button"
                              onClick={() => {
                                onSelectCase(globalIndex);
                                onClose();
                              }}
                              aria-current={isActive ? 'true' : undefined}
                              aria-label={`Caso ${globalIndex + 1}: ${item.title}${solved ? `, resolvido com ${stars} de 3 estrelas` : ', em aberto'}`}
                              className="folder"
                              style={{
                                width: '100%',
                                minHeight: '96px',
                                marginTop: 0,
                                padding: '10px 10px 8px',
                                border: isActive ? '2px solid var(--brass-light)' : '2px solid transparent',
                                cursor: 'pointer',
                                textAlign: 'left',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                gap: '6px',
                                font: 'inherit',
                                position: 'relative',
                                overflow: 'visible',
                              }}
                            >
                              <span className="folder-tab" style={{ top: '-18px', height: '18px', fontSize: '11px', padding: '1px 10px 0' }}>
                                Nº {String(globalIndex + 1).padStart(3, '0')}
                              </span>
                              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-sm)', lineHeight: 1.25, color: 'var(--ink)' }}>
                                {item.title}
                              </span>
                              <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span aria-hidden style={{ color: 'var(--brass-dark)', letterSpacing: '2px' }}>
                                  {solved ? '★'.repeat(stars) + '☆'.repeat(3 - stars) : ''}
                                </span>
                                {solved && (
                                  <span className="stamp" style={{ fontSize: '10px', color: 'var(--green-ink)', padding: '0 4px' }}>
                                    Resolvido
                                  </span>
                                )}
                                {isActive && !solved && <span className="type-label" style={{ fontSize: '11px' }}>na mesa</span>}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
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
