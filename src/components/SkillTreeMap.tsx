import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Trophy } from 'lucide-react';
import { cases } from '../data/cases';

interface SkillTreeMapProps {
  isOpen: boolean;
  onClose: () => void;
  currentCaseIndex: number;
  onSelectCase: (index: number) => void;
  solvedCases: string[];
}

export const SkillTreeMap: React.FC<SkillTreeMapProps> = ({
  isOpen,
  onClose,
  currentCaseIndex,
  onSelectCase,
  solvedCases,
}) => {
  const categories = [
    { label: 'Fácil (Iniciante)', diff: 'Easy', color: 'var(--easy-color)' },
    { label: 'Médio (Investigador)', diff: 'Medium', color: 'var(--medium-color)' },
    { label: 'Difícil (Detetive Chefe)', diff: 'Hard', color: 'var(--hard-color)' },
    { label: 'Especialista', diff: 'Expert', color: 'var(--expert-color)' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop blur */}
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

          {/* Skill Tree Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="crt-container crt-flicker"
            style={{
              position: 'fixed',
              top: '5%',
              left: '5%',
              width: '90%',
              height: '90%',
              background: 'rgba(10, 12, 16, 0.95)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '20px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(59, 130, 246, 0.1)',
              zIndex: 201,
              display: 'flex',
              flexDirection: 'column',
              padding: '2rem',
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexShrink: 0 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Trophy style={{ color: 'var(--accent-secondary)' }} size={24} />
                  <h2 style={{ color: 'white', fontSize: '1.5rem', margin: 0, letterSpacing: '1px' }}>MAPA DE OPERAÇÕES DE REDE</h2>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0.2rem 0 0 0' }}>
                  Hackee os nós de banco de dados para resolver os crimes da Hydra Syndicate
                </p>
              </div>
              <button 
                onClick={onClose}
                className="btn btn-ghost"
                style={{ padding: '0.5rem', borderRadius: '50%' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Conteúdo scrollable do Mapa */}
            <div 
              className="cyber-grid"
              style={{ 
                flex: 1, 
                overflowY: 'auto', 
                padding: '1rem',
                borderRadius: '12px',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.02)',
                display: 'flex',
                flexDirection: 'column',
                gap: '2.5rem'
              }}
            >
              {categories.map((cat, catIdx) => {
                const categoryCases = cases.filter(c => c.difficulty === cat.diff);
                if (categoryCases.length === 0) return null;

                return (
                  <div key={catIdx} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    
                    {/* Dificuldade divisor */}
                    <div style={{ 
                      fontSize: '0.85rem', 
                      fontWeight: 800, 
                      color: cat.color,
                      letterSpacing: '2px',
                      textTransform: 'uppercase',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <span style={{ height: '2px', width: '20px', background: cat.color }} />
                      {cat.label}
                      <span style={{ flex: 1, height: '1px', background: `linear-gradient(90deg, ${cat.color}33 0%, transparent 100%)` }} />
                    </div>

                    {/* Nodes representados em Grid circular */}
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', 
                      gap: '1.25rem',
                      justifyItems: 'center',
                      padding: '0.5rem 1rem'
                    }}>
                      {categoryCases.map(c => {
                        const globalIndex = cases.findIndex(x => x.id === c.id);
                        const isActive = globalIndex === currentCaseIndex;
                        const isSolved = solvedCases.includes(c.id);

                        return (
                          <div key={c.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                            <button
                              onClick={() => {
                                onSelectCase(globalIndex);
                                onClose();
                              }}
                              className={isActive ? 'pulse-glow-active' : ''}
                              style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '50%',
                                border: isActive 
                                  ? `2.5px solid ${cat.color}` 
                                  : `1.5px solid ${isSolved ? cat.color + '88' : 'rgba(255,255,255,0.06)'}`,
                                background: isSolved 
                                  ? `${cat.color}15` 
                                  : (isActive ? 'rgba(59, 130, 246, 0.1)' : 'rgba(0,0,0,0.5)'),
                                color: isSolved ? cat.color : (isActive ? 'white' : 'var(--text-muted)'),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1rem',
                                fontWeight: 800,
                                fontFamily: "'JetBrains Mono', monospace",
                                cursor: 'pointer',
                                position: 'relative',
                                boxShadow: isSolved ? `0 0 12px ${cat.color}22` : 'none',
                                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.transform = 'scale(1.1)';
                                e.currentTarget.style.borderColor = cat.color;
                                e.currentTarget.style.boxShadow = `0 0 15px ${cat.color}44`;
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.transform = 'scale(1)';
                                if (!isActive) {
                                  e.currentTarget.style.borderColor = isSolved ? `${cat.color}88` : 'rgba(255,255,255,0.06)';
                                  e.currentTarget.style.boxShadow = isSolved ? `0 0 12px ${cat.color}22` : 'none';
                                }
                              }}
                              title={`Caso #${globalIndex + 1}: ${c.title}`}
                            >
                              {globalIndex + 1}

                              {/* Mini badge check */}
                              {isSolved && (
                                <div style={{ 
                                  position: 'absolute', 
                                  bottom: -2, 
                                  right: -2, 
                                  background: '#07080a', 
                                  borderRadius: '50%', 
                                  display: 'flex' 
                                }}>
                                  <CheckCircle2 size={13} style={{ color: 'var(--easy-color)' }} />
                                </div>
                              )}
                            </button>
                            <span 
                              style={{ 
                                fontSize: '0.62rem', 
                                color: isActive ? 'white' : 'var(--text-muted)',
                                maxWidth: '70px',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textAlign: 'center',
                                fontWeight: isActive ? 700 : 400
                              }}
                            >
                              {c.title}
                            </span>
                          </div>
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
