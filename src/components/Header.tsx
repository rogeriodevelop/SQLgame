import { FolderArchive, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import type { Rank } from '../domain/progress';
import { RANKS } from '../domain/progress';
import { Fingerprint } from './NoirArt';

type Props = {
  rank: Rank;
  upcomingRank: { rank: Rank; missing: number } | null;
  totalScore: number;
  totalSolved: number;
  casesCount: number;
  muted: boolean;
  onToggleMute: () => void;
  onOpenMap: () => void;
  onResetProgress: () => void;
};

/** Distintivo de latão: uma estrela por patente conquistada. */
function Badge({ level }: { level: number }) {
  return (
    <svg viewBox="0 0 48 52" width="40" height="44" aria-hidden>
      <defs>
        <linearGradient id="brass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f0d48f" />
          <stop offset="0.5" stopColor="#c9a35a" />
          <stop offset="1" stopColor="#7d5f2a" />
        </linearGradient>
      </defs>
      <path d="M24 2 L44 10 L42 30 C40 42 32 48 24 50 C16 48 8 42 6 30 L4 10 Z" fill="url(#brass)" stroke="#5a4218" strokeWidth="1.5" />
      <path d="M24 8 L39 14 L37.5 30 C36 39 30 43.5 24 45 C18 43.5 12 39 10.5 30 L9 14 Z" fill="none" stroke="#6d521f" strokeWidth="1" />
      <text x="24" y="33" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="900" fontSize="16" fill="#3a2a0c">
        {level}
      </text>
      <text x="24" y="20" textAnchor="middle" fontSize="7" fill="#3a2a0c" fontFamily="Georgia, serif" letterSpacing="0.5">
        {'★'.repeat(Math.min(level, 5))}
      </text>
    </svg>
  );
}

/** Placa da delegacia: nome do jogo, patente, pontuação e acesso ao arquivo. */
export function Header({
  rank,
  upcomingRank,
  totalScore,
  totalSolved,
  casesCount,
  muted,
  onToggleMute,
  onOpenMap,
  onResetProgress,
}: Props) {
  const level = RANKS.indexOf(rank) + 1;
  const rankProgress = upcomingRank
    ? Math.max(0, Math.min(100, Math.round(((totalScore - rank.minScore) / (upcomingRank.rank.minScore - rank.minScore)) * 100)))
    : 100;

  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
        <Fingerprint color="var(--brass)" style={{ width: '22px', alignSelf: 'center', opacity: 0.8 }} />
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(1.4rem, 2.6vw, 1.9rem)', color: 'var(--on-dark)', letterSpacing: '0.04em' }}>
          GAME <span style={{ color: 'var(--brass)' }}>SQL</span>
        </h1>
        <span className="type-label on-dark">Delegacia de Dados · Divisão de Consultas</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
        <div
          title={upcomingRank ? `Faltam ${upcomingRank.missing.toLocaleString('pt-BR')} pts para ${upcomingRank.rank.title}` : 'Patente máxima atingida'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--sp-2)',
            padding: '4px 14px 4px 6px',
            borderRadius: '6px',
            background: 'linear-gradient(180deg, rgba(0,0,0,0.35), rgba(0,0,0,0.5))',
            border: '1px solid rgba(201,163,90,0.35)',
          }}
        >
          <Badge level={level} />
          <div style={{ minWidth: '150px' }}>
            <div style={{ fontWeight: 700, fontSize: 'var(--fs-sm)', color: 'var(--on-dark)' }}>{rank.title}</div>
            <div
              role="progressbar"
              aria-valuenow={rankProgress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={upcomingRank ? `Progresso até ${upcomingRank.rank.title}` : 'Patente máxima'}
              style={{ height: '4px', background: 'rgba(255,255,255,0.1)', margin: '4px 0 2px' }}
            >
              <div style={{ width: `${rankProgress}%`, height: '100%', background: 'var(--brass)' }} />
            </div>
            <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--on-dark-muted)', display: 'flex', gap: 'var(--sp-3)' }}>
              <span>{totalScore.toLocaleString('pt-BR')} pts</span>
              <span>
                {totalSolved}/{casesCount} casos
              </span>
            </div>
          </div>
        </div>

        <button type="button" className="btn btn-ghost" onClick={onToggleMute} aria-label={muted ? 'Ligar sons' : 'Desligar sons'} title={muted ? 'Ligar sons' : 'Desligar sons'} style={{ padding: '0.5rem' }}>
          {muted ? <VolumeX size={15} aria-hidden /> : <Volume2 size={15} aria-hidden />}
        </button>

        <button type="button" className="btn btn-ghost" onClick={onResetProgress} aria-label="Apagar todo o progresso" title="Apagar todo o progresso" style={{ padding: '0.5rem' }}>
          <RotateCcw size={15} aria-hidden />
        </button>

        <button type="button" className="btn btn-brass" onClick={onOpenMap}>
          <FolderArchive size={15} aria-hidden /> Arquivo de casos
        </button>
      </div>
    </header>
  );
}
