import React from 'react';
import { Case } from '../types';
import { FileText, Target, ShieldAlert, Key } from 'lucide-react';
import { motion } from 'framer-motion';

interface BriefingProps {
  currentCase: Case;
  showHint: boolean;
  onToggleHint: () => void;
}

export const Briefing: React.FC<BriefingProps> = ({ currentCase, showHint, onToggleHint }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <header>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <ShieldAlert className="text-accent-secondary" size={24} style={{ color: 'var(--accent-secondary)' }} />
          <h2 style={{ fontSize: '1.5rem' }}>{currentCase.title}</h2>
        </div>
        <span style={{ 
          fontSize: '0.75rem', 
          background: 'rgba(59, 130, 246, 0.1)', 
          color: 'var(--accent-primary)', 
          padding: '2px 8px', 
          borderRadius: '4px',
          fontWeight: 600,
          textTransform: 'uppercase'
        }}>
          Nível: {currentCase.difficulty}
        </span>
      </header>

      <section className="glass-morphism" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>
          <FileText size={16} /> O CASO
        </div>
        <p style={{ lineHeight: '1.7', color: 'var(--text-main)', fontSize: '0.95rem' }}>
          {currentCase.description}
        </p>
      </section>

      <section className="glass-morphism glow-amber" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-secondary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--accent-secondary)', fontSize: '0.875rem', fontWeight: 600 }}>
          <Target size={16} /> OBJETIVO
        </div>
        <p style={{ fontWeight: 600, color: 'white' }}>
          {currentCase.objective}
        </p>
      </section>

      <div style={{ marginTop: 'auto' }}>
        <button 
          className="btn btn-ghost" 
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={onToggleHint}
        >
          <Key size={16} /> {showHint ? 'Esconder Dica' : 'Pedir Ajuda (Dica)'}
        </button>
        
        {showHint && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ 
              marginTop: '1rem', 
              padding: '1rem', 
              background: 'rgba(255, 255, 255, 0.05)', 
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontStyle: 'italic',
              color: 'var(--text-muted)',
              border: '1px dashed var(--border-color)'
            }}
          >
            {currentCase.hint}
          </motion.div>
        )}
      </div>
    </div>
  );
};
