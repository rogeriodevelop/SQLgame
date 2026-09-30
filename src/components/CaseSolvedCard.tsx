import { useEffect, useState } from 'react';
import { ChevronRight, Share2, Check, Newspaper, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  queryCount: number;
  hasNextCase: boolean;
  onNextCase: () => void;
};

function duration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes ? `${minutes} min ${seconds} s` : `${seconds} s`;
}

function Stars({ stars }: { stars: number }) {
  return (
    <span aria-label={`${stars} de 3 estrelas`} style={{ letterSpacing: '4px', color: 'var(--brass-dark)', fontSize: '1.3rem' }}>
      {'★'.repeat(stars)}
      <span style={{ color: 'var(--paper-edge)' }}>{'★'.repeat(3 - stars)}</span>
    </span>
  );
}

/**
 * Encerramento do caso: um cartão de arquivamento na mesa e, quando o caso
 * acaba de ser resolvido, a primeira página do jornal com a manchete.
 */
export function CaseSolvedCard(props: Props) {
  const { currentCase, score, hasNextCase, onNextCase } = props;
  const [copied, setCopied] = useState(false);
  const [paperOpen, setPaperOpen] = useState(score !== null);
  const stars = score === null ? null : starRating(score, currentCase.difficulty);

  const share = async () => {
    if (score === null || stars === null) return;
    const text = buildShareText({
      caseNumber: props.caseNumber,
      currentCase,
      score,
      stars,
      wrongAttempts: props.wrongAttempts,
      usedHint: props.usedHint,
      elapsedSeconds: props.elapsedSeconds,
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

  useEffect(() => {
    if (!paperOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPaperOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [paperOpen]);

  const actions = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
      {hasNextCase && (
        <button type="button" className="btn btn-brass" onClick={onNextCase} style={{ width: '100%' }}>
          Próximo caso <ChevronRight size={15} aria-hidden />
        </button>
      )}
      {score !== null && (
        <button type="button" className="btn btn-ink" onClick={share} style={{ width: '100%' }}>
          {copied ? <Check size={14} aria-hidden /> : <Share2 size={14} aria-hidden />}
          {copied ? 'Resultado copiado' : 'Compartilhar resultado'}
        </button>
      )}
    </div>
  );

  return (
    <>
      <motion.section
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="paper"
        aria-label="Caso resolvido"
        style={{ padding: 'var(--sp-4)', flexShrink: 0, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)', alignItems: 'center' }}
      >
        <span className="stamp stamp-in" style={{ fontSize: '1.1rem', color: 'var(--green-ink)' }}>
          Caso resolvido
        </span>
        {stars !== null && <Stars stars={stars} />}
        {score !== null && <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-xl)', fontWeight: 900 }}>+{score} pts</p>}
        <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--ink-soft)' }}>
          Responsável: <strong style={{ color: 'var(--ink)' }}>{currentCase.solution}</strong>
        </p>
        {score !== null && (
          <button type="button" className="btn btn-ink" onClick={() => setPaperOpen(true)} style={{ padding: '2px 10px', fontSize: 'var(--fs-xs)' }}>
            <Newspaper size={13} aria-hidden /> Ver a manchete
          </button>
        )}
        <div style={{ width: '100%', marginTop: 'var(--sp-1)' }}>{actions}</div>
      </motion.section>

      <AnimatePresence>
        {paperOpen && score !== null && stars !== null && (
          <motion.div
            key="paper"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPaperOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(5,4,3,0.78)', display: 'grid', placeItems: 'center', padding: 'var(--sp-4)', overflowY: 'auto' }}
          >
            <motion.article
              role="dialog"
              aria-modal="true"
              aria-label="Edição extra do jornal"
              onClick={event => event.stopPropagation()}
              initial={{ rotate: -540, scale: 0.1 }}
              animate={{ rotate: -1.2, scale: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.9, bounce: 0.25 }}
              className="paper"
              style={{ width: 'min(680px, 100%)', padding: 'clamp(1rem, 3vw, 2rem)', position: 'relative', background: '#efe7d3' }}
            >
              <button type="button" className="icon-btn" onClick={() => setPaperOpen(false)} aria-label="Fechar o jornal" style={{ position: 'absolute', top: 8, right: 8 }}>
                <X size={16} aria-hidden />
              </button>

              <header style={{ textAlign: 'center', borderBottom: '3px double var(--ink)', paddingBottom: 'var(--sp-2)' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(1.6rem, 5vw, 2.6rem)', letterSpacing: '0.02em', lineHeight: 1 }}>
                  O Diário da Cidade
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-type)', fontSize: 'var(--fs-xs)', borderTop: '1px solid var(--ink)', marginTop: '8px', paddingTop: '3px' }}>
                  <span>EDIÇÃO EXTRA</span>
                  <span>CASO Nº {String(props.caseNumber).padStart(3, '0')}</span>
                  <span>PREÇO: 1 CONSULTA</span>
                </div>
              </header>

              <p className="type-label" style={{ textAlign: 'center', marginTop: 'var(--sp-3)', color: 'var(--red)' }}>
                Caso resolvido
              </p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(1.4rem, 4.2vw, 2.3rem)', textAlign: 'center', lineHeight: 1.1, margin: '4px 0 var(--sp-3)' }}>
                {currentCase.title}: os dados apontam para {currentCase.solution}
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: 'var(--sp-4)', alignItems: 'start' }}>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: 'var(--fs-sm)', lineHeight: 1.65, textAlign: 'justify', columnCount: 1 }}>
                  <strong>DA REDAÇÃO</strong> — A delegacia encerrou na noite de hoje a investigação do caso “
                  {currentCase.title}”. Segundo fontes da corporação, o detetive responsável cruzou os registros do
                  banco de dados em {props.queryCount} consulta(s) até chegar a {currentCase.solution}. O trabalho
                  levou {duration(props.elapsedSeconds)}
                  {props.wrongAttempts > 0 ? `, com ${props.wrongAttempts} mandado(s) indeferido(s) no caminho` : ', sem nenhum mandado indeferido'}
                  {props.usedHint ? ' e contou com uma pista anônima.' : ' e dispensou pistas anônimas.'}
                </p>
                <div style={{ border: '2px solid var(--ink)', padding: 'var(--sp-3)', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                  <span className="type-label">Avaliação da chefia</span>
                  <Stars stars={stars} />
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'var(--fs-xl)' }}>+{score} pts</span>
                  <span className="stamp stamp-in" style={{ marginTop: '6px', fontSize: '0.95rem' }}>Arquivado</span>
                </div>
              </div>

              <div style={{ marginTop: 'var(--sp-4)', display: 'flex', gap: 'var(--sp-2)', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-ink" onClick={() => setPaperOpen(false)}>
                  Voltar à mesa
                </button>
                {hasNextCase && (
                  <button type="button" className="btn btn-brass" onClick={onNextCase}>
                    Próximo caso <ChevronRight size={15} aria-hidden />
                  </button>
                )}
              </div>
            </motion.article>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
