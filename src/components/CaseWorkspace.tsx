import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { AlertTriangle, Pin, BookOpen, NotebookPen } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

import { CaseFolder } from './CaseFolder';
import { RecordsPanel } from './RecordsPanel';
import { SmartTerminal } from './SmartTerminal';
import { ReportPanel } from './ReportPanel';
import { EvidenceBoard } from './EvidenceBoard';
import { ManualPanel } from './ManualPanel';
import { CaseDiary } from './CaseDiary';
import { WarrantPanel } from './WarrantPanel';
import { CaseSolvedCard } from './CaseSolvedCard';

import { useCaseSession } from '../hooks/useCaseSession';
import { useCaseFile } from '../hooks/useCaseFile';
import { useSqlDatabase } from '../hooks/useSqlDatabase';
import { playSound } from '../utils/sound';

import type { Case } from '../domain/case';
import type { CaseRecord } from '../domain/progress';
import { inferRelations, parseSchema } from '../domain/schemaModel';
import { leadsFor } from '../domain/casefile';
import { lessonsFor, sampleKey, sampleTargets, type SampleValues } from '../domain/tutor';

type Props = {
  currentCase: Case;
  caseNumber: number;
  alreadySolved: boolean;
  hasNextCase: boolean;
  onNextCase: () => void;
  onSolved: (record: CaseRecord) => void;
};

type SideTab = 'board' | 'manual' | 'diary';

/** Primeira abertura do jogo: o Manual já vem aberto no treinamento. */
function initialSideTab(currentCase: Case): SideTab {
  return currentCase.difficulty === 'Tutorial' ? 'manual' : 'board';
}

/**
 * A mesa do detetive para um caso.
 *
 * É montada com `key={currentCase.id}`: trocar de caso descarta esta árvore e
 * cria outra, então banco, consulta, tentativas, quadro e cronômetro nascem
 * zerados sem nenhum efeito de sincronização.
 */
export function CaseWorkspace({ currentCase, caseNumber, alreadySolved, hasNextCase, onNextCase, onSolved }: Props) {
  const { runQuery, reset: resetDatabase, dbError, loading } = useSqlDatabase(currentCase.schema);

  const tables = useMemo(() => parseSchema(currentCase.schema), [currentCase.schema]);
  const relations = useMemo(() => inferRelations(tables), [tables]);

  const handleSolved = useCallback(
    (record: CaseRecord) => {
      onSolved(record);
      playSound('stamp');
      setTimeout(() => playSound('success'), 250);
    },
    [onSolved]
  );

  const { session, execute, revealHint, accuse } = useCaseSession({
    currentCase,
    tables,
    alreadySolved,
    runQuery,
    onSolved: handleSolved,
  });

  const file = useCaseFile(currentCase.id);
  const [code, setCode] = useState('');
  const [answer, setAnswer] = useState('');
  const [sideTab, setSideTab] = useState<SideTab>(() => initialSideTab(currentCase));

  // Valores reais do banco para os exemplos das lições devolverem linhas.
  // Leitura pura (SELECT), fora do diário: não conta como consulta do jogador.
  const samples = useMemo<SampleValues>(() => {
    if (loading) return {};
    const values: SampleValues = {};
    for (const { table, column } of sampleTargets(tables)) {
      const { result } = runQuery(`SELECT ${column} FROM ${table} WHERE ${column} IS NOT NULL LIMIT 1`);
      const cell = result?.values[0]?.[0];
      if (cell !== undefined && cell !== null) values[sampleKey(table, column)] = String(cell);
    }
    return values;
  }, [loading, runQuery, tables]);

  const lessons = useMemo(
    () => lessonsFor(tables, relations, currentCase.difficulty, samples),
    [tables, relations, currentCase.difficulty, samples]
  );

  const leads = useMemo(
    () => leadsFor(tables, session.log, file.evidence.length, file.suspects.length),
    [tables, session.log, file.evidence.length, file.suspects.length]
  );

  const pinnedIds = useMemo(() => new Set(file.evidence.map(e => e.id)), [file.evidence]);

  const insertIntoTerminal = useCallback((sql: string) => {
    playSound('paper');
    setCode(sql);
  }, []);

  const handleAccuse = useCallback(
    (value: string) => {
      const verdict = accuse(value);
      if (verdict !== 'solved') playSound('stamp');
      return verdict;
    },
    [accuse]
  );

  if (loading || dbError) return <BootScreen error={dbError} />;

  const lastEntry = session.log[0];

  return (
    <main className="desk">
      <section aria-label="Pasta e arquivos do caso" className="desk-scroll">
        <CaseFolder
          currentCase={currentCase}
          caseNumber={caseNumber}
          alreadySolved={alreadySolved}
          showHint={session.showHint}
          usedHint={session.usedHint}
          onToggleHint={() => {
            playSound('paper');
            revealHint();
          }}
        />
        <RecordsPanel tables={tables} relations={relations} onInsert={insertIntoTerminal} />
      </section>

      <section aria-label="Terminal e relatório">
        <div style={{ flex: '1 1 52%', minHeight: '250px' }}>
          <SmartTerminal
            tables={tables}
            code={code}
            onCodeChange={setCode}
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
        <div style={{ flex: '1 1 48%', minHeight: '230px' }}>
          <ReportPanel
            result={session.result}
            lastSql={session.lastSql}
            reportNumber={lastEntry?.id ?? 0}
            reportAt={lastEntry?.at ?? null}
            pinnedIds={pinnedIds}
            suspects={file.suspects}
            onPinRow={(columns, row) => {
              playSound('pin');
              file.pinRow(columns, row, session.lastSql ?? '');
            }}
            onToggleSuspect={name => {
              playSound('pin');
              file.toggleSuspect(name);
            }}
          />
        </div>
      </section>

      <aside aria-label="Quadro, manual e conclusão">
        <div style={{ flex: 1, minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
          <div className="tabs" role="tablist" aria-label="Ferramentas do detetive">
            <SideTabButton id="board" current={sideTab} onSelect={setSideTab} icon={<Pin size={12} aria-hidden />} label="Quadro" count={file.evidence.length + file.suspects.length} />
            <SideTabButton id="manual" current={sideTab} onSelect={setSideTab} icon={<BookOpen size={12} aria-hidden />} label="Manual" />
            <SideTabButton id="diary" current={sideTab} onSelect={setSideTab} icon={<NotebookPen size={12} aria-hidden />} label="Diário" count={session.log.length} />
          </div>

          {sideTab === 'board' && (
            <EvidenceBoard
              evidence={file.evidence}
              suspects={file.suspects}
              onUnpin={file.unpin}
              onRemoveSuspect={file.toggleSuspect}
              onChooseSuspect={name => {
                playSound('paper');
                setAnswer(name);
              }}
            />
          )}
          {sideTab === 'manual' && <ManualPanel lessons={lessons} log={session.log} onInsert={insertIntoTerminal} />}
          {sideTab === 'diary' && (
            <CaseDiary leads={leads} log={session.log} notes={file.notes} onNotesChange={file.setNotes} onInsert={insertIntoTerminal} />
          )}
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
              queryCount={session.log.length}
              hasNextCase={hasNextCase}
              onNextCase={onNextCase}
            />
          ) : (
            <WarrantPanel
              key="warrant"
              answer={answer}
              onAnswerChange={setAnswer}
              suspects={file.suspects}
              onAccuse={handleAccuse}
              wrongAttempts={session.wrongAttempts}
            />
          )}
        </AnimatePresence>
      </aside>
    </main>
  );
}

function SideTabButton({
  id,
  current,
  onSelect,
  icon,
  label,
  count,
}: {
  id: SideTab;
  current: SideTab;
  onSelect: (tab: SideTab) => void;
  icon: ReactNode;
  label: string;
  count?: number;
}) {
  return (
    <button
      type="button"
      role="tab"
      className="tab"
      aria-selected={current === id}
      onClick={() => {
        playSound('paper');
        onSelect(id);
      }}
    >
      {icon} {label}
      {count ? <span className="tab-badge">{count}</span> : null}
    </button>
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
        gap: 'var(--sp-4)',
        padding: 'var(--sp-4)',
        textAlign: 'center',
      }}
    >
      {error ? (
        <div className="paper" style={{ padding: 'var(--sp-5)', maxWidth: '52ch' }}>
          <AlertTriangle size={30} aria-hidden style={{ color: 'var(--red)' }} />
          <p style={{ margin: 'var(--sp-2) 0', fontFamily: 'var(--font-type)' }}>Falha ao abrir o arquivo do caso:</p>
          <code style={{ fontSize: 'var(--fs-sm)' }}>{error}</code>
        </div>
      ) : (
        <>
          <div style={{ width: '38px', height: '38px', border: '3px solid rgba(201,163,90,0.2)', borderTopColor: 'var(--brass)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontFamily: 'var(--font-type)', letterSpacing: '0.12em', color: 'var(--on-dark-muted)' }}>ABRINDO O ARQUIVO DO CASO…</p>
        </>
      )}
    </div>
  );
}
