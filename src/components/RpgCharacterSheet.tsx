import { useState } from 'react';
import { Award, Settings, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AVATARS, findAvatar } from './avatars';
import { browserStore, STORAGE_KEYS } from '../data/storage';
import type { Rank } from '../domain/progress';

type Props = {
  totalScore: number;
  totalSolved: number;
  casesCount: number;
  rank: Rank;
  upcomingRank: { rank: Rank; missing: number } | null;
};

/**
 * Ficha do jogador.
 *
 * As barras antigas (HP = % de casos, MP = 100 − tentativas × 15) eram
 * decorativas e enganosas: nomeavam "vida" e "mana" algo que não afetava
 * nada. Aqui as duas barras mostram o que de fato progride — pontuação rumo
 * à próxima patente e casos fechados.
 */
export function RpgCharacterSheet({ totalScore, totalSolved, casesCount, rank, upcomingRank }: Props) {
  const [avatarId, setAvatarId] = useState(() =>
    browserStore.read<string>(STORAGE_KEYS.avatar, 'netrunner')
  );
  const [isPickerOpen, setPickerOpen] = useState(false);

  const avatar = findAvatar(avatarId);

  const rankProgress = upcomingRank
    ? Math.round(
        ((totalScore - rank.minScore) / (upcomingRank.rank.minScore - rank.minScore)) * 100
      )
    : 100;

  const caseProgress = Math.round((totalSolved / casesCount) * 100);

  const chooseAvatar = (id: string) => {
    setAvatarId(id);
    browserStore.write(STORAGE_KEYS.avatar, id);
    setPickerOpen(false);
  };

  return (
    <section
      className="glass-morphism"
      aria-label="Ficha do investigador"
      style={{ overflow: 'hidden', border: '1px solid rgba(168, 85, 247, 0.2)' }}
    >
      <div
        style={{
          height: '84px',
          backgroundImage: "url('/cyberpunk_city.webp')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-end',
          padding: 'var(--sp-3)',
        }}
      >
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(7, 8, 10, 0.95) 0%, rgba(7, 8, 10, 0.3) 100%)',
          }}
        />

        <div style={{ zIndex: 1, display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="rpg-avatar-hover"
            aria-label="Escolher avatar"
            title="Escolher avatar"
            style={{
              width: '44px',
              height: '44px',
              padding: 0,
              cursor: 'pointer',
              position: 'relative',
              borderRadius: '8px',
              overflow: 'hidden',
              background: 'rgba(10,11,15,0.7)',
              border: `1.5px solid ${avatar.color}`,
            }}
          >
            {avatar.render({ strokeColor: avatar.color })}
            <span
              className="rpg-avatar-overlay"
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0,
                transition: 'opacity 0.25s ease',
              }}
            >
              <Settings size={14} color="white" />
            </span>
          </button>

          <div>
            <h3 style={{ fontSize: 'var(--fs-sm)', margin: 0 }}>
              <span style={{ color: avatar.color }}>{avatar.name}</span>
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-xs)', margin: 0 }}>
              {rank.badge} {rank.title}
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding: 'var(--sp-4)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
        <ProgressBar
          label={upcomingRank ? `Próxima patente: ${upcomingRank.rank.title}` : 'Patente máxima'}
          value={rankProgress}
          caption={upcomingRank ? `faltam ${upcomingRank.missing.toLocaleString('pt-BR')} pts` : 'concluído'}
          gradient="linear-gradient(90deg, #c084fc 0%, #a855f7 100%)"
          color="#c084fc"
        />

        <ProgressBar
          label="Casos fechados"
          value={caseProgress}
          caption={`${totalSolved}/${casesCount}`}
          gradient="linear-gradient(90deg, #10b981 0%, #059669 100%)"
          color="var(--easy-color)"
        />
      </div>

      <AnimatePresence>
        {isPickerOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Seleção de avatar"
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(5, 7, 10, 0.85)',
              backdropFilter: 'blur(8px)',
              padding: 'var(--sp-4)',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.22 }}
              className="glass-morphism"
              style={{
                width: '100%',
                maxWidth: '460px',
                background: 'rgba(14, 17, 23, 0.97)',
                border: '2px solid rgba(168, 85, 247, 0.4)',
                padding: 'var(--sp-5)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--sp-4)',
                position: 'relative',
              }}
            >
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                aria-label="Fechar"
                className="btn btn-ghost"
                style={{ position: 'absolute', top: 'var(--sp-3)', right: 'var(--sp-3)', padding: '4px' }}
              >
                <X size={16} aria-hidden />
              </button>

              <div>
                <h3 style={{ margin: 0, fontSize: 'var(--fs-md)', display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                  <Award size={16} style={{ color: '#a855f7' }} aria-hidden />
                  Escolha seu avatar
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>
                  Apenas visual — não altera a jogabilidade.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(96px, 1fr))', gap: 'var(--sp-3)' }}>
                {AVATARS.map(option => {
                  const isSelected = option.id === avatarId;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => chooseAvatar(option.id)}
                      className="rpg-avatar-select-card"
                      aria-pressed={isSelected}
                      title={option.description}
                      style={{
                        background: isSelected ? 'rgba(168, 85, 247, 0.1)' : 'rgba(0,0,0,0.25)',
                        border: `2px solid ${isSelected ? option.color : 'transparent'}`,
                        borderRadius: 'var(--radius-md)',
                        padding: 'var(--sp-2)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 'var(--sp-1)',
                      }}
                    >
                      <span style={{ width: '46px', height: '46px' }}>
                        {option.render({ strokeColor: option.color })}
                      </span>
                      <span
                        style={{
                          fontSize: 'var(--fs-xs)',
                          fontWeight: 700,
                          color: isSelected ? 'white' : 'var(--text-muted)',
                          textAlign: 'center',
                        }}
                      >
                        {option.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

type BarProps = {
  label: string;
  value: number;
  caption: string;
  gradient: string;
  color: string;
};

function ProgressBar({ label, value, caption, gradient, color }: BarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 'var(--sp-2)',
          fontSize: 'var(--fs-xs)',
          fontWeight: 700,
          marginBottom: '3px',
          color,
        }}
      >
        <span>{label}</span>
        <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>{caption}</span>
      </div>
      <div
        className="rpg-bar-container"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div className="rpg-bar-fill" style={{ width: `${clamped}%`, background: gradient }} />
      </div>
    </div>
  );
}
