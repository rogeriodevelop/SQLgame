import { useEffect, useState } from 'react';
import { Target, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { VerdictKind } from '../domain/investigation';

type Props = {
  onAccuse: (answer: string) => VerdictKind;
  wrongAttempts: number;
};

/**
 * As mensagens de 'unproven' e 'incorrect' são deliberadamente distintas, mas
 * nenhuma delas revela se o nome digitado estava certo: 'unproven' é devolvido
 * pelo domínio antes de comparar a resposta, justamente para não confirmar
 * palpite.
 */
const MESSAGES: Record<Exclude<VerdictKind, 'solved'>, string> = {
  empty: 'Campo vazio. Informe um nome, produto ou local.',
  unproven: 'Acusação sem provas. Investigue no terminal até que uma consulta revele o responsável.',
  incorrect: 'Não confere com as evidências. Reveja sua consulta.',
};

export function AccusationPanel({ onAccuse, wrongAttempts }: Props) {
  const [answer, setAnswer] = useState('');
  const [verdict, setVerdict] = useState<Exclude<VerdictKind, 'solved'> | null>(null);
  const [shaking, setShaking] = useState(false);

  useEffect(() => {
    if (!shaking) return;
    const timer = setTimeout(() => setShaking(false), 450);
    return () => clearTimeout(timer);
  }, [shaking]);

  const submit = () => {
    const kind = onAccuse(answer);
    if (kind === 'solved') {
      setVerdict(null);
      return;
    }
    setVerdict(kind);
    setShaking(true);
  };

  const message = verdict ? MESSAGES[verdict] : null;
  const suggestHint = wrongAttempts >= 3 && verdict === 'incorrect';

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      aria-label="Conclusão do caso"
      className="glass-morphism glow-amber"
      style={{
        padding: 'var(--sp-4)',
        background: 'var(--bg-card)',
        border: '1px solid rgba(245, 158, 11, 0.22)',
        flexShrink: 0,
      }}
    >
      <h3
        style={{
          fontSize: 'var(--fs-xs)',
          color: 'var(--accent-secondary)',
          marginBottom: 'var(--sp-2)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--sp-2)',
          fontWeight: 800,
          letterSpacing: '1px',
        }}
      >
        <Target size={14} aria-hidden /> CONCLUSÃO DO CASO
      </h3>

      <label htmlFor="answer-input" style={{ display: 'block', fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginBottom: 'var(--sp-2)', lineHeight: 1.5 }}>
        A Central só aceita acusações comprovadas por consulta SQL.
      </label>

      <input
        id="answer-input"
        type="text"
        value={answer}
        className={shaking ? 'shake' : undefined}
        aria-invalid={verdict !== null}
        aria-describedby={message ? 'answer-feedback' : undefined}
        onChange={event => {
          setAnswer(event.target.value);
          setVerdict(null);
        }}
        onKeyDown={event => {
          if (event.key === 'Enter') submit();
        }}
        placeholder="Nome do responsável, produto ou local…"
        style={{
          width: '100%',
          padding: '0.65rem 0.9rem',
          background: 'rgba(0,0,0,0.45)',
          border: `1px solid ${verdict ? 'var(--error)' : 'var(--border-color)'}`,
          borderRadius: 'var(--radius-md)',
          color: 'white',
          marginBottom: 'var(--sp-2)',
          outline: 'none',
          fontFamily: 'var(--font-ui)',
          fontSize: 'var(--fs-sm)',
        }}
      />

      <AnimatePresence>
        {message && (
          <motion.p
            id="answer-feedback"
            role="alert"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              background: 'rgba(244,63,94,0.1)',
              border: '1px solid rgba(244,63,94,0.25)',
              borderRadius: 'var(--radius-sm)',
              padding: 'var(--sp-2)',
              marginBottom: 'var(--sp-2)',
              fontSize: 'var(--fs-xs)',
              color: '#fecdd3',
              display: 'flex',
              gap: 'var(--sp-1)',
              alignItems: 'flex-start',
              overflow: 'hidden',
              lineHeight: 1.5,
            }}
          >
            <AlertTriangle size={13} style={{ flexShrink: 0, color: 'var(--error)', marginTop: '1px' }} aria-hidden />
            <span>
              {message}
              {suggestHint && ' Considere abrir a dica — ela custa pontos, mas destrava o caso.'}
            </span>
          </motion.p>
        )}
      </AnimatePresence>

      <button
        type="button"
        className="btn btn-primary"
        onClick={submit}
        style={{
          width: '100%',
          justifyContent: 'center',
          fontSize: 'var(--fs-sm)',
          background: 'linear-gradient(135deg, var(--accent-secondary) 0%, #d97706 100%)',
        }}
      >
        ENVIAR DOSSIÊ
      </button>
    </motion.section>
  );
}
