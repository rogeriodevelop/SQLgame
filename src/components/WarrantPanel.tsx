import { useEffect, useState } from 'react';
import { Gavel } from 'lucide-react';
import { motion } from 'framer-motion';
import type { VerdictKind } from '../domain/investigation';
import { WRONG_ANSWER_PENALTY } from '../domain/scoring';

type Props = {
  answer: string;
  onAnswerChange: (value: string) => void;
  suspects: readonly string[];
  onAccuse: (answer: string) => VerdictKind;
  wrongAttempts: number;
};

type Failure = Exclude<VerdictKind, 'solved'>;

/**
 * As mensagens de 'unproven' e 'incorrect' são deliberadamente distintas, mas
 * nenhuma delas revela se o nome digitado estava certo: 'unproven' é devolvido
 * pelo domínio antes de comparar a resposta, justamente para não confirmar
 * palpite.
 */
const MESSAGES: Record<Failure, { stamp: string; text: string }> = {
  empty: { stamp: 'Em branco', text: 'O mandado está em branco. Escreva o nome do responsável, produto ou local.' },
  unproven: {
    stamp: 'Sem provas',
    text: 'Mandado negado: acusação sem provas. Nenhuma consulta sua trouxe esse registro — investigue no terminal primeiro.',
  },
  incorrect: { stamp: 'Indeferido', text: 'O juiz indeferiu: não confere com as evidências. Reveja o raciocínio.' },
};

/** O mandado de prisão: onde o jogador se compromete com uma acusação. */
export function WarrantPanel({ answer, onAnswerChange, suspects, onAccuse, wrongAttempts }: Props) {
  const [verdict, setVerdict] = useState<Failure | null>(null);
  const [attempt, setAttempt] = useState(0);
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
    setAttempt(n => n + 1);
    setShaking(true);
  };

  const message = verdict ? MESSAGES[verdict] : null;
  const suggestHelp = wrongAttempts >= 3 && verdict === 'incorrect';

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      aria-label="Mandado de prisão"
      className="paper"
      style={{ padding: 'var(--sp-3) var(--sp-4) var(--sp-4)', flexShrink: 0, overflow: 'hidden', borderTop: '6px double var(--ink-soft)' }}
    >
      <h3 style={{ fontSize: 'var(--fs-lg)', display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', color: 'var(--ink)' }}>
        <Gavel size={17} aria-hidden /> Mandado de prisão
      </h3>
      <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--ink-soft)', margin: '2px 0 var(--sp-2)', lineHeight: 1.45 }}>
        Só é expedido com prova: alguma consulta sua precisa ter trazido o nome. Erro custa {WRONG_ANSWER_PENALTY} pts.
      </p>

      {suspects.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: 'var(--sp-2)' }} aria-label="Suspeitos marcados">
          {suspects.map(name => (
            <button
              key={name}
              type="button"
              onClick={() => onAnswerChange(name)}
              className="btn btn-ink"
              aria-pressed={answer === name}
              style={{ padding: '1px 8px', fontSize: 'var(--fs-xs)', fontFamily: 'var(--font-type)', background: answer === name ? 'rgba(163,32,28,0.12)' : undefined }}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      <label htmlFor="answer-input" className="type-label" style={{ display: 'block' }}>
        Nome do acusado
      </label>
      <input
        id="answer-input"
        type="text"
        value={answer}
        className={`field${shaking ? ' shake' : ''}`}
        autoComplete="off"
        aria-invalid={verdict !== null}
        aria-describedby={message ? 'answer-feedback' : undefined}
        onChange={event => {
          onAnswerChange(event.target.value);
          setVerdict(null);
        }}
        onKeyDown={event => {
          if (event.key === 'Enter') submit();
        }}
        placeholder="Responsável, produto ou local…"
        style={{ marginBottom: 'var(--sp-3)' }}
      />

      {message && (
        <div id="answer-feedback" role="alert" style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'center', marginBottom: 'var(--sp-3)' }}>
          <span key={attempt} className="stamp stamp-in" style={{ fontSize: '13px', flexShrink: 0 }}>
            {message.stamp}
          </span>
          <p style={{ fontSize: 'var(--fs-xs)', lineHeight: 1.45, color: 'var(--ink)' }}>
            {message.text}
            {suggestHelp && ' Três tentativas erradas: abra o Manual ou o envelope com a pista.'}
          </p>
        </div>
      )}

      <button type="button" className="btn btn-red" onClick={submit} style={{ width: '100%' }}>
        Emitir mandado
      </button>
    </motion.section>
  );
}
