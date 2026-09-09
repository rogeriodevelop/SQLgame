import { useCallback } from 'react';
import { AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { AnimatePresence } from 'framer-motion';

import { BriefingCard } from './BriefingCard';
import { SmartTerminal } from './SmartTerminal';
import { ResultsTable } from './ResultsTable';
import { ERDiagram } from './ERDiagram';
import { SchemaViewer } from './SchemaViewer';
import { RpgCharacterSheet } from './RpgCharacterSheet';
import { AccusationPanel } from './AccusationPanel';
import { CaseSolvedCard } from './CaseSolvedCard';

import { useCaseSession } from '../hooks/useCaseSession';
import { useSqlDatabase } from '../hooks/useSqlDatabase';
import { playSound } from '../utils/sound';

import type { Case } from '../domain/case';
import type { CaseRecord, Rank } from '../domain/progress';

type Props = {
  currentCase: Case;
  caseNumber: number;
  alreadySolved: boolean;
  hasNextCase: boolean;
  onNextCase: () => void;
  onSolved: (record: CaseRecord) => void;
  /** Dados de progressão exibidos na ficha do jogador. */
  totalScore: number;
  totalSolved: number;
  casesCount: number;
  rank: Rank;
  upcomingRank: { rank: Rank; missing: number } | null;
};

/**
 * O tabuleiro de um caso.
 *
 * É montado com `key={currentCase.id}`: trocar de caso descarta esta árvore e
 * cria outra, então banco, consulta, tentativas e cronômetro nascem zerados
 * sem nenhum efeito de sincronização.
 */
export function CaseWorkspace({
  currentCase,
  caseNumber,
  alreadySolved,
  hasNextCase,
  onNextCase,
  onSolved,
  totalScore,
  totalSolved,
  casesCount,
  rank,
  upcomingRank,
}: Props) {
  const { runQuery, reset: resetDatabase, dbError, loading } = useSqlDatabase(currentCase.schema);

  const handleSolved = useCallback(
    (record: CaseRecord) => {
      onSolved(record);
      playSound('success');
      confetti({
        particleCount: 160,
        spread: 80,
        origin: { y: 0.65 },
        colors: ['#0ad59e', '#3b82f6', '#f59e0b', '#a855f7'],
      });
    },
    [onSolved]
  );

  const { session, execute, revealHint, accuse } = useCaseSession({
    currentCase,
    alreadySolved,
    runQuery,
    onSolved: handleSolved,
  });

  const handleAccuse = useCallback(
    (answer: string) => {
      const verdict = accuse(answer);
      if (verdict !== 'solved') playSound('error');
      return verdict;
    },
    [accuse]
  );

  if (loading || dbError) return <BootScreen error={dbError} />;

  return (
    <main className="grid-layout" style={{ flex: 1, minHeight: 0 }}>
      <section
        aria-label="Investigação"
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', minHeight: 0, overflowY: 'auto' }}
      >
        <RpgCharacterSheet
          totalScore={totalScore}
          totalSolved={totalSolved}
          casesCount={casesCount}
          rank={rank}
          upcomingRank={upcomingRank}
        />

        <BriefingCard
          currentCase={currentCase}
          caseNumber={caseNumber}
          showHint={session.showHint}
          usedHint={session.usedHint}
          onToggleHint={() => {
            playSound('click');
            revealHint();
          }}
        />

        <div style={{ flex: 1, minHeight: '220px' }}>
          <SchemaViewer currentCase={currentCase} />
        </div>
      </section>

      <section
        aria-label="Terminal e resultados"
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', minHeight: 0, minWidth: 0 }}
      >
        <div style={{ flex: '1 1 55%', minHeight: '240px' }}>
          <SmartTerminal
            schema={currentCase.schema}
            queryError={session.queryError}
            onExecute={sql => {
              playSound('click');
              execute(sql);
            }}
            onResetDatabase={() => {
              playSound('click');
              resetDatabase();
            }}
          />
        </div>

        <div style={{ flex: '1 1 45%', minHeight: '200px', minWidth: 0 }}>
          <ResultsTable result={session.result} />
        </div>
      </section>

      <aside
        aria-label="Diagrama e conclusão"
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', minHeight: 0 }}
      >
        <div style={{ flex: 1, minHeight: '220px' }}>
          <ERDiagram currentCase={currentCase} />
        </div>

        <AnimatePresence mode="wait">
          {session.solved ? (
            <CaseSolvedCard
              key="solved"
              currentCase={currentCase}
              caseNumber={caseNumber}
              score={session.earnedScore}
              wrongAttempts={session.wrongAttempts}
              usedHint={session.usedHint}
              elapsedSeconds={session.elapsedSeconds}
              hasNextCase={hasNextCase}
              onNextCase={onNextCase}
            />
          ) : (
            <AccusationPanel key="form" onAccuse={handleAccuse} wrongAttempts={session.wrongAttempts} />
          )}
        </AnimatePresence>
      </aside>
    </main>
  );
}

/** Carregamento do banco do caso, ou falha ao montá-lo. */
function BootScreen({ error }: { error: string | null }) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        flex: 1,
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: error ? 'var(--error)' : 'var(--accent-primary)',
        gap: 'var(--sp-4)',
        padding: 'var(--sp-4)',
        textAlign: 'center',
      }}
    >
      {error ? (
        <>
          <AlertTriangle size={36} aria-hidden />
          <p style={{ maxWidth: '46ch', fontSize: 'var(--fs-sm)', lineHeight: 1.6 }}>
            Falha ao montar o banco do caso:
            <br />
            <code
              style={{
                background: 'rgba(0,0,0,0.35)',
                padding: '4px 8px',
                borderRadius: '4px',
                display: 'inline-block',
                marginTop: 'var(--sp-2)',
              }}
            >
              {error}
            </code>
          </p>
        </>
      ) : (
        <>
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '3px solid rgba(59,130,246,0.15)',
              borderTopColor: 'var(--easy-color)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <p style={{ letterSpacing: '1.5px', fontSize: 'var(--fs-sm)', fontWeight: 700, color: 'var(--easy-color)' }}>
            CONECTANDO À CENTRAL…
          </p>
          <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
        </>
      )}
    </div>
  );
}
