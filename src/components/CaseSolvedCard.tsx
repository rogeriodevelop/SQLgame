import { useState } from 'react';
import { CheckCircle2, ChevronRight, Share2, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Case } from '../domain/case';
import { buildShareText } from '../domain/share';
import { starRating } from '../domain/scoring';

type Props = {
  currentCase: Case;
  caseNumber: number;
  score: number | null;
  wrongAttempts: number;
  usedHint: boolean;
  elapsedSeconds: number;
  hasNextCase: boolean;
  onNextCase: () => void;
};

/** Painel de encerramento: placar, estrelas e compartilhamento. */
export function CaseSolvedCard({
  currentCase,
  caseNumber,
  score,
  wrongAttempts,
  usedHint,
  elapsedSeconds,
  hasNextCase,
  onNextCase,
}: Props) {
  const [copied, setCopied] = useState(false);
  const stars = score === null ? null : starRating(score, currentCase.difficulty);

  const share = async () => {
    if (score === null || stars === null) return;
    const text = buildShareText({
      caseNumber,
      currentCase,
      score,
      stars,
      wrongAttempts,
      usedHint,
      elapsedSeconds,
    });

    try {
      // Em celular o menu nativo é bem melhor que copiar para a área de transferência.
      if (navigator.share) {
        await navigator.share({ text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Cancelar o menu de compartilhamento não é erro; nada a fazer.
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.94, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="glass-morphism"
      style={{
        padding: 'var(--sp-4)',
        background: 'rgba(10,213,158,0.05)',
        border: '1px solid var(--easy-color)',
        textAlign: 'center',
        flexShrink: 0,
      }}
    >
      <CheckCircle2 size={30} style={{ color: 'var(--easy-color)', margin: '0 auto var(--sp-2)' }} aria-hidden />

      <h3 style={{ color: 'var(--easy-color)', margin: '0 0 var(--sp-1)', fontSize: 'var(--fs-lg)' }}>
        Caso resolvido
      </h3>

      {stars !== null && (
        <p
          aria-label={`${stars} de 3 estrelas`}
          style={{ fontSize: 'var(--fs-lg)', letterSpacing: '4px', color: 'var(--accent-secondary)', margin: '0 0 var(--sp-1)' }}
        >
          {'★'.repeat(stars)}
          <span style={{ color: 'var(--text-faint)' }}>{'★'.repeat(3 - stars)}</span>
        </p>
      )}

      {score !== null && (
        <p style={{ margin: '0 0 var(--sp-2)', fontSize: 'var(--fs-md)', fontWeight: 700 }}>
          +{score} pts
        </p>
      )}

      <p style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-xs)', margin: '0 0 var(--sp-4)' }}>
        Responsável: <strong style={{ color: 'white' }}>{currentCase.solution}</strong>
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
        {score !== null && (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={share}
            style={{ width: '100%', justifyContent: 'center', fontSize: 'var(--fs-sm)' }}
          >
            {copied ? <Check size={14} aria-hidden /> : <Share2 size={14} aria-hidden />}
            {copied ? 'Resultado copiado' : 'Compartilhar resultado'}
          </button>
        )}

        {hasNextCase && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={onNextCase}
            style={{
              width: '100%',
              justifyContent: 'center',
              fontSize: 'var(--fs-sm)',
              background: 'linear-gradient(135deg, var(--easy-color) 0%, #059669 100%)',
            }}
          >
            Próximo caso <ChevronRight size={14} aria-hidden />
          </button>
        )}
      </div>
    </motion.div>
  );
}
