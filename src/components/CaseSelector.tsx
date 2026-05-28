import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Circle } from 'lucide-react';
import { cases } from '../data/cases';

interface CaseSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  currentCaseIndex: number;
  onSelectCase: (index: number) => void;
  solvedCases: string[];
}

export const CaseSelector: React.FC<CaseSelectorProps> = ({
  isOpen,
  onClose,
  currentCaseIndex,
  onSelectCase,
  solvedCases,
}) => {
  // Agrupa os casos por dificuldade
  const categories = [
    { label: 'Iniciante (Fácil)', diff: 'Easy', color: 'var(--easy-color)' },
    { label: 'Investigador (Médio)', diff: 'Medium', color: 'var(--medium-color)' },
    { label: 'Detetive Chefe (Difícil)', diff: 'Hard', color: 'var(--hard-color)' },
    { label: 'Especialista', diff: 'Expert', color: 'var(--expert-color)' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop semi-transparente */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(4px)',
              zIndex: 100,
            }}
          />

          {/* Drawer Lateral */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '400px',
              maxWidth: '90vw',
              background: '#0d0f14',
              borderLeft: '1px solid rgba(255, 255, 255, 0.05)',
              boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.5)',
              zIndex: 101,
              display: 'flex',
              flexDirection: 'column',
              padding: '1.5rem',
            }}
          >
            {/* Header do Drawer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexShrink: 0 }}>
              <div>
                <h3 style={{ color: 'white', fontSize: '1.15rem', margin: 0 }}>Dossiê de Casos</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', margin: '0.1rem 0 0 0' }}>Selecione um caso para investigar</p>
              </div>
              <button 
                onClick={onClose}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: '0.2rem' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Conteúdo com rolagem */}
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {categories.map((cat, catIdx) => {
                const categoryCases = cases.filter(c => c.difficulty === cat.diff);
                if (categoryCases.length === 0) return null;

                return (
                  <div key={catIdx}>
                    <div style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 700, 
                      color: cat.color, 
                      marginBottom: '0.5rem', 
                      textTransform: 'uppercase', 
                      letterSpacing: '1px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: cat.color }} />
                      {cat.label}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      {categoryCases.map(c => {
                        const globalIndex = cases.findIndex(x => x.id === c.id);
                        const isActive = globalIndex === currentCaseIndex;
                        const isSolved = solvedCases.includes(c.id);

                        return (
                          <button
                            key={c.id}
                            onClick={() => {
                              onSelectCase(globalIndex);
                              onClose();
                            }}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              padding: '0.65rem 0.85rem',
                              border: isActive 
                                ? `1px solid ${cat.color}` 
                                : '1px solid rgba(255, 255, 255, 0.03)',
                              borderRadius: '10px',
                              background: isActive 
                                ? `${cat.color}0c` 
                                : 'rgba(255, 255, 255, 0.01)',
                              color: isActive ? 'white' : 'var(--text-main)',
                              fontFamily: "'Outfit', sans-serif",
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '0.75rem',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={e => {
                              if (!isActive) {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                              }
                            }}
                            onMouseLeave={e => {
                              if (!isActive) {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.01)';
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.03)';
                              }
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                              <span style={{ 
                                fontSize: '0.7rem', 
                                background: isActive ? cat.color : 'rgba(255,255,255,0.06)', 
                                color: isActive ? '#000' : 'var(--text-muted)',
                                fontWeight: 700,
                                width: '22px',
                                height: '22px',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}>
                                {globalIndex + 1}
                              </span>
                              <span style={{ 
                                fontSize: '0.82rem', 
                                fontWeight: isActive ? 600 : 400,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}>
                                {c.title}
                              </span>
                            </div>

                            {/* Indicador de Status */}
                            <div style={{ flexShrink: 0, display: 'flex' }}>
                              {isSolved ? (
                                <CheckCircle2 size={15} style={{ color: 'var(--easy-color)' }} />
                              ) : (
                                <Circle size={15} style={{ color: 'rgba(255,255,255,0.1)' }} />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
