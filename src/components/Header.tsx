import { Menu, RotateCcw, Database, Trophy } from 'lucide-react';
import type { Rank } from '../domain/progress';

type Props = {
  rank: Rank;
  upcomingRank: { rank: Rank; missing: number } | null;
  totalScore: number;
  totalSolved: number;
  casesCount: number;
  progressPercentage: number;
  onOpenMap: () => void;
  onResetProgress: () => void;
};

export function Header({
  rank,
  upcomingRank,
  totalScore,
  totalSolved,
  casesCount,
  progressPercentage,
  onOpenMap,
  onResetProgress,
}: Props) {
  return (
    <header style={{ marginBottom: 'var(--sp-5)', position: 'relative' }}>
      {/* Barra de progresso sangrando até as bordas da janela */}
      <div
        role="progressbar"
        aria-valuenow={progressPercentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progresso geral dos casos"
        style={{
          position: 'absolute',
          top: 'calc(var(--sp-5) * -1)',
          left: 'calc(var(--sp-5) * -1)',
          right: 'calc(var(--sp-5) * -1)',
          height: '4px',
          background: 'rgba(255,255,255,0.05)',
          overflow: 'hidden',
          zIndex: 10,
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progressPercentage}%`,
            background: 'linear-gradient(90deg, var(--neon-cyan) 0%, #a855f7 100%)',
            boxShadow: '0 0 8px rgba(34, 211, 238, 0.5)',
            transition: 'width 0.5s ease-out',
          }}
        />
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 'var(--sp-3)',
          flexWrap: 'wrap',
          minHeight: '48px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
          <Database size={20} style={{ color: 'var(--accent-primary)' }} aria-hidden />
          {/* data-text alimenta as duas cópias deslocadas do efeito glitch. */}
          <h1
            className="glitch"
            data-text="GAME SQL"
            style={{ fontSize: 'var(--fs-xl)', letterSpacing: '3px', margin: 0 }}
          >
            GAME SQL
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
          <div
            className="glass-morphism"
            title={
              upcomingRank
                ? `Faltam ${upcomingRank.missing} pts para ${upcomingRank.rank.title}`
                : 'Patente máxima atingida'
            }
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--sp-2)',
              padding: '0.35rem 0.85rem',
              borderRadius: '99px',
              fontSize: 'var(--fs-xs)',
              background: 'rgba(255,255,255,0.03)',
            }}
          >
            <span aria-hidden style={{ fontSize: 'var(--fs-sm)' }}>{rank.badge}</span>
            <strong style={{ color: 'white' }}>{rank.title}</strong>

            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                padding: '1px 8px',
                borderRadius: '99px',
                background: 'rgba(255, 61, 154, 0.15)',
                color: 'var(--accent-secondary)',
                fontWeight: 700,
              }}
            >
              <Trophy size={11} aria-hidden />
              {totalScore.toLocaleString('pt-BR')} pts
            </span>

            <span
              style={{
                padding: '1px 8px',
                borderRadius: '99px',
                background: 'rgba(34, 211, 238, 0.15)',
                color: 'var(--accent-primary)',
                fontWeight: 700,
              }}
            >
              {totalSolved}/{casesCount}
            </span>
          </div>

          <button
            type="button"
            className="btn btn-ghost"
            onClick={onResetProgress}
            aria-label="Apagar todo o progresso"
            title="Apagar todo o progresso"
            style={{ padding: '0.45rem', borderRadius: 'var(--radius-sm)' }}
          >
            <RotateCcw size={14} aria-hidden />
          </button>

          <button type="button" className="btn btn-primary" onClick={onOpenMap}>
            <Menu size={14} aria-hidden /> MAPA DE CASOS
          </button>
        </div>
      </div>
    </header>
  );
}
