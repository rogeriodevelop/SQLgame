import { Play, FolderOpen } from 'lucide-react';
import { motion } from 'framer-motion';

type Props = {
  onStart: () => void;
  /** Só aparece quando já existe progresso salvo. */
  onContinue?: () => void;
  hasProgress: boolean;
};

const STEPS = [
  {
    title: 'Abra a pasta',
    text: 'Cada caso traz um memorando da delegada e um banco de dados próprio. As fichas mostram as tabelas e colunas.',
  },
  {
    title: 'Interrogue os dados',
    text: 'Escreva SQL no terminal e execute com Ctrl+Enter. Não sabe SQL? O Manual ensina passo a passo, com exemplos do próprio caso.',
  },
  {
    title: 'Monte o quadro',
    text: 'Fixe linhas do relatório como prova, marque suspeitos e anote suas conclusões no diário.',
  },
  {
    title: 'Emita o mandado',
    text: 'O juiz só aceita acusação que alguma consulta sua tenha revelado. Chute não fecha caso.',
  },
];

/**
 * Porta de entrada: uma sala escura em noite de chuva, a luminária acesa e
 * as instruções do jogo em fichas sobre a mesa.
 */
export function TitleScreen({ onStart, onContinue, hasProgress }: Props) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--sp-5) var(--sp-4)', position: 'relative', overflow: 'hidden' }}>
      <div className="rain" aria-hidden />

      <motion.main
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ width: '100%', maxWidth: '820px', position: 'relative', display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}
      >
        <header style={{ textAlign: 'center' }}>
          <p className="type-label on-dark" style={{ letterSpacing: '0.3em' }}>Delegacia de Dados apresenta</p>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 900,
              fontSize: 'clamp(3rem, 11vw, 6.5rem)',
              lineHeight: 0.95,
              color: 'var(--on-dark)',
              textShadow: '0 4px 24px rgba(0,0,0,0.8), 0 0 40px rgba(255,196,120,0.15)',
              margin: '8px 0',
            }}
          >
            GAME <span style={{ color: 'var(--brass)', fontStyle: 'italic' }}>SQL</span>
          </h1>
          <p style={{ fontFamily: 'var(--font-type)', fontSize: 'clamp(1rem, 2.3vw, 1.2rem)', color: 'var(--on-dark-muted)', maxWidth: '54ch', margin: '0 auto', lineHeight: 1.6 }}>
            A cidade dorme. Os crimes, não. Todo criminoso deixa rastro num banco de dados — e você é o detetive
            que sabe perguntar. Começa do zero: não é preciso saber SQL.
          </p>
        </header>

        <ol style={{ listStyle: 'none', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 'var(--sp-4)' }}>
          {STEPS.map((step, index) => (
            <motion.li
              key={step.title}
              initial={{ opacity: 0, y: 20, rotate: 0 }}
              animate={{ opacity: 1, y: 0, rotate: [-1.5, 1, -0.6, 1.4][index] }}
              transition={{ delay: 0.25 + index * 0.12 }}
              className="index-card"
              style={{ padding: '3px 12px 12px' }}
            >
              <p style={{ fontFamily: 'var(--font-type)', lineHeight: '24px', fontSize: 'var(--fs-sm)' }}>
                {String(index + 1).padStart(2, '0')} · <strong>{step.title}</strong>
              </p>
              <p style={{ fontSize: 'var(--fs-sm)', lineHeight: '22px', marginTop: '7px' }}>{step.text}</p>
            </motion.li>
          ))}
        </ol>

        <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button type="button" className="btn btn-brass" onClick={onStart} style={{ padding: '0.8rem 1.6rem', fontSize: 'var(--fs-md)' }}>
            <Play size={16} aria-hidden />
            {hasProgress ? 'Recomeçar do treinamento' : 'Começar pelo treinamento'}
          </button>
          {hasProgress && onContinue && (
            <button type="button" className="btn btn-ghost" onClick={onContinue} style={{ padding: '0.8rem 1.6rem', fontSize: 'var(--fs-md)' }}>
              <FolderOpen size={16} aria-hidden /> Continuar de onde parei
            </button>
          )}
        </div>
      </motion.main>
    </div>
  );
}
