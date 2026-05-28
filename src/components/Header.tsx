import React from 'react';
import { Menu, RotateCcw, Database } from 'lucide-react';
import type { DetectiveRank } from '../hooks/useAppData';

interface HeaderProps {
  detectiveRank: DetectiveRank;
  totalSolved: number;
  casesCount: number;
  progressPercentage: number;
  onOpenDrawer: () => void;
  onResetProgress: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  detectiveRank,
  totalSolved,
  casesCount,
  progressPercentage,
  onOpenDrawer,
  onResetProgress,
}) => {
  return (
    <header style={{ display: 'flex', flexDirection: 'column', marginBottom: '1.5rem', position: 'relative' }}>
      {/* Barra de progresso ultrafina no topo */}
      <div 
        style={{ 
          position: 'absolute', 
          top: -24, 
          left: -24, 
          right: -24, 
          height: '4px', 
          background: 'rgba(255,255,255,0.05)', 
          overflow: 'hidden',
          zIndex: 10
        }}
      >
        <div 
          style={{ 
            height: '100%', 
            width: `${progressPercentage}%`, 
            background: 'linear-gradient(90deg, #3b82f6 0%, #a855f7 100%)',
            boxShadow: '0 0 8px rgba(59, 130, 246, 0.5)',
            transition: 'width 0.5s ease-out'
          }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '48px' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Database size={20} className="glow-blue" style={{ color: 'var(--accent-primary)' }} />
          <h1 style={{ fontSize: '1.4rem', letterSpacing: '2px', color: 'white', margin: 0, userSelect: 'none' }}>
            <span style={{ color: 'var(--accent-primary)' }}>Game</span> SQL
          </h1>
        </div>

        {/* Status do Jogador / Patente */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div 
            className="glass-morphism" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              padding: '0.35rem 0.75rem', 
              borderRadius: '99px',
              fontSize: '0.78rem',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              background: 'rgba(255,255,255,0.02)'
            }}
          >
            <span style={{ fontSize: '0.9rem' }}>{detectiveRank.badge}</span>
            <span style={{ color: 'var(--text-muted)' }}>Patente:</span>
            <strong style={{ color: 'white' }}>{detectiveRank.title}</strong>
            <span 
              style={{ 
                marginLeft: '0.5rem', 
                padding: '1px 6px', 
                borderRadius: '99px', 
                background: 'rgba(59, 130, 246, 0.15)', 
                color: 'var(--accent-primary)',
                fontWeight: 700
              }}
            >
              {totalSolved}/{casesCount}
            </span>
          </div>

          {/* Reset button */}
          <button 
            className="btn btn-ghost" 
            onClick={onResetProgress}
            title="Resetar todo o progresso"
            style={{ padding: '0.45rem', borderRadius: '8px', border: 'none', background: 'transparent' }}
          >
            <RotateCcw size={14} />
          </button>

          {/* Drawer trigger button */}
          <button 
            className="btn btn-primary" 
            onClick={onOpenDrawer}
            style={{ padding: '0.45rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '8px' }}
          >
            <Menu size={14} /> MAPA DE CASOS
          </button>
        </div>
      </div>
    </header>
  );
};
