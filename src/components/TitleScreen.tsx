import { Database, Play, Terminal, Table2, GitBranch } from 'lucide-react';
import { motion } from 'framer-motion';

type Props = {
  onStart: () => void;
  /** Só aparece quando já existe progresso salvo. */
  onContinue?: () => void;
  hasProgress: boolean;
};

const STEPS = [
  {
    icon: <Table2 size={18} aria-hidden />,
    title: 'Leia o banco',
    text: 'Cada caso vem com um banco de dados próprio. O painel de esquema mostra tabelas e colunas.',
  },
  {
    icon: <Terminal size={18} aria-hidden />,
    title: 'Consulte com SQL',
    text: 'Escreva SELECT no terminal. Ctrl+Enter executa, Ctrl+Espaço completa nomes de tabela e coluna.',
  },
  {
    icon: <GitBranch size={18} aria-hidden />,
    title: 'Prove e acuse',
    text: 'A acusação só é aceita se alguma consulta sua tiver revelado o responsável. Chute não fecha caso.',
  },
];

/**
 * Porta de entrada do jogo.
 *
 * Antes a aplicação abria direto no painel de três colunas, sem contexto nem
 * explicação — o pior primeiro minuto possível para quem nunca escreveu SQL.
 */
export function TitleScreen({ onStart, onContinue, hasProgress }: Props) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--sp-5)',
      }}
    >
      <motion.main
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-morphism"
        style={{
          width: '100%',
          maxWidth: '680px',
          padding: 'clamp(1.5rem, 4vw, 2.5rem)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-2)' }}>
          <Database size={26} style={{ color: 'var(--accent-primary)' }} aria-hidden />
          <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', letterSpacing: '1px', margin: 0 }}>
            <span style={{ color: 'var(--accent-primary)' }}>Game</span> SQL
          </h1>
        </div>

        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: 'var(--fs-md)',
            lineHeight: 1.6,
            margin: '0 0 var(--sp-5)',
            maxWidth: '52ch',
          }}
        >
          Uma organização criminosa deixou rastros nos bancos de dados que controla.
          Você é o analista da Central: interrogue os dados com SQL e feche os casos.
          Começa do zero — não é preciso saber SQL antes de entrar.
        </p>

        <ol
          style={{
            listStyle: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--sp-3)',
            margin: '0 0 var(--sp-5)',
            padding: 0,
          }}
        >
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              style={{
                display: 'flex',
                gap: 'var(--sp-3)',
                alignItems: 'flex-start',
                background: 'var(--bg-sunken)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--sp-3)',
              }}
            >
              <span
                aria-hidden
                style={{
                  color: 'var(--accent-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--sp-1)',
                  flexShrink: 0,
                }}
              >
                <strong style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-xs)' }}>
                  0{index + 1}
                </strong>
                {step.icon}
              </span>
              <div>
                <strong style={{ display: 'block', fontSize: 'var(--fs-sm)', marginBottom: '2px' }}>
                  {step.title}
                </strong>
                <span style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-sm)', lineHeight: 1.5 }}>
                  {step.text}
                </span>
              </div>
            </li>
          ))}
        </ol>

        <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onStart}
            style={{ flex: '1 1 220px', justifyContent: 'center', fontSize: 'var(--fs-md)', padding: 'var(--sp-3)' }}
          >
            <Play size={16} aria-hidden />
            {hasProgress ? 'Recomeçar do treinamento' : 'Começar pelo treinamento'}
          </button>

          {hasProgress && onContinue && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onContinue}
              style={{ flex: '1 1 180px', justifyContent: 'center', fontSize: 'var(--fs-md)', padding: 'var(--sp-3)' }}
            >
              Continuar de onde parei
            </button>
          )}
        </div>
      </motion.main>
    </div>
  );
}
