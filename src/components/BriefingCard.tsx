import React from 'react';
import { ShieldAlert, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Case } from '../types';

interface BriefingCardProps {
  currentCase: Case;
  showHint: boolean;
  onToggleHint: () => void;
}

export const BriefingCard: React.FC<BriefingCardProps> = ({
  currentCase,
  showHint,
  onToggleHint,
}) => {
  const diffColors: Record<string, string> = {
    Easy: 'var(--easy-color)',
    Medium: 'var(--medium-color)',
    Hard: 'var(--hard-color)',
    Expert: 'var(--expert-color)',
  };

  const color = diffColors[currentCase.difficulty] ?? 'var(--accent-primary)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', height: '100%', overflowY: 'auto', paddingRight: '0.2rem' }}>
      {/* Caso Header Card */}
      <div 
        className="glass-morphism" 
        style={{ 
          padding: '1rem 1.25rem',
          borderLeft: `4px solid ${color}`,
          background: `linear-gradient(135deg, ${color}08 0%, rgba(14,17,23,0.7) 100%)`,
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
          <ShieldAlert size={16} style={{ color: 'var(--accent-secondary)' }} />
          <h2 style={{ fontSize: '1.15rem', color: 'white', margin: 0, fontWeight: 800 }}>{currentCase.title}</h2>
        </div>
        <span 
          style={{ 
            fontSize: '0.62rem', 
            background: `${color}1a`, 
            color, 
            padding: '2px 8px', 
            borderRadius: '99px', 
            fontWeight: 800, 
            border: `1px solid ${color}33`,
            letterSpacing: '1px'
          }}
        >
          {currentCase.difficulty.toUpperCase()}
        </span>
      </div>

      {/* Caixa de Diálogo do Caso - Estilo Visual Novel / RPG */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
        
        {/* Avatar da Assistente E.V.A. */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
          <div 
            style={{ 
              width: '56px', 
              height: '56px', 
              borderRadius: '10px', 
              backgroundImage: "url('/cyber_dispatcher.png')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              border: `1.5px solid ${color}`,
              boxShadow: `0 0 10px ${color}33`,
              flexShrink: 0
            }}
          />
          <span style={{ fontSize: '0.58rem', fontWeight: 800, color: 'var(--accent-primary)', background: 'rgba(59,130,246,0.15)', padding: '1px 6px', borderRadius: '4px', letterSpacing: '0.5px' }}>
            E.V.A.
          </span>
        </div>

        {/* Bolha de Diálogo */}
        <div 
          className="rpg-dialog-bubble" 
          style={{ 
            flex: 1, 
            padding: '0.85rem 1rem', 
            fontSize: '0.8rem', 
            lineHeight: '1.6', 
            color: 'var(--text-main)', 
            fontFamily: "'JetBrains Mono', monospace" 
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem', color: color, fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.5px' }}>
            <FileText size={10} /> TRANSMISSÃO ENTRANTE:
          </div>
          {currentCase.description}
        </div>
      </div>

      {/* Objetivo */}
      <div 
        className="glass-morphism" 
        style={{ 
          padding: '1rem 1.25rem', 
          borderLeft: `3px solid ${color}`,
          background: 'rgba(0,0,0,0.15)',
          flexShrink: 0
        }}
      >
        <div style={{ fontSize: '0.68rem', fontWeight: 800, color, marginBottom: '0.3rem', letterSpacing: '1px', textTransform: 'uppercase' }}>OBJETIVO</div>
        <p style={{ fontWeight: 600, color: 'white', margin: 0, fontSize: '0.82rem', lineHeight: '1.4' }}>
          {currentCase.objective}
        </p>
      </div>

      {/* Botão de Dica */}
      {currentCase.hint && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexShrink: 0 }}>
          <button 
            className="btn btn-ghost" 
            onClick={onToggleHint} 
            style={{ 
              width: '100%', 
              fontSize: '0.74rem',
              justifyContent: 'center',
              padding: '0.45rem',
              borderRadius: '8px'
            }}
          >
            {showHint ? (
              <>Esconder Dica <ChevronUp size={12} /></>
            ) : (
              <>💡 Pedir Dica <ChevronDown size={12} /></>
            )}
          </button>
          
          <AnimatePresence>
            {showHint && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -5 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -5 }}
                transition={{ duration: 0.18 }}
                style={{ overflow: 'hidden' }}
              >
                <div 
                  style={{ 
                    padding: '0.85rem 1rem', 
                    background: 'rgba(245,158,11,0.04)', 
                    border: '1px solid rgba(245,158,11,0.12)', 
                    borderRadius: '8px', 
                    fontSize: '0.76rem', 
                    color: '#fcd34d', 
                    lineHeight: '1.5' 
                  }}
                >
                  {currentCase.hint}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
