import { useCallback, useEffect, useRef, useState } from 'react';
import type { Case, QueryResult } from '../domain/case';
import { judgeAccusation, resultContainsValue, type VerdictKind } from '../domain/investigation';
import { scoreCase } from '../domain/scoring';
import type { CaseRecord } from '../domain/progress';
import type { TableModel } from '../domain/schemaModel';
import { appendLog, tablesIn, techniquesIn, type LogEntry } from '../domain/casefile';
import type { SavedSession } from '../domain/savedSession';

export type CaseSession = {
  result: QueryResult | null;
  queryError: string | null;
  showHint: boolean;
  usedHint: boolean;
  wrongAttempts: number;
  /** Alguma consulta do jogador já revelou o responsável. */
  proven: boolean;
  solved: boolean;
  /** Pontuação obtida ao fechar o caso; null enquanto não resolvido nesta sessão. */
  earnedScore: number | null;
  /** Segundos gastos até fechar o caso; 0 enquanto aberto. */
  elapsedSeconds: number;
  lastVerdict: VerdictKind | null;
  /** Consulta que produziu o resultado exibido. */
  lastSql: string | null;
  /** O banco acabou de ser restaurado e nenhuma consulta rodou depois. */
  databaseRestored: boolean;
  /** Diário de consultas, mais recente primeiro. */
  log: LogEntry[];
};

type Options = {
  currentCase: Case;
  /** Tabelas do caso, para o diário saber quais arquivos cada consulta abriu. */
  tables: readonly TableModel[];
  alreadySolved: boolean;
  /** Investigação salva deste caso, retomada ao reabrir. */
  restored?: SavedSession | null;
  runQuery: (sql: string) => { result: QueryResult | null; error: string | null };
  onSolved: (record: CaseRecord) => void;
};

/**
 * Estado de uma investigação em andamento.
 *
 * Concentra tudo que é efêmero e específico do caso atual (consulta, erros,
 * tentativas, cronômetro) e delega as regras — veredito e pontuação — ao
 * domínio. A interface só consome o estado e dispara as duas ações.
 */
export function useCaseSession({ currentCase, tables, alreadySolved, restored, runQuery, onSolved }: Options) {
  const [session, setSession] = useState<CaseSession>(() => initialSession(alreadySolved, restored));
  // Uma investigação retomada mantém o instante original de abertura: sair e
  // voltar não reinicia o cronômetro. Caso novo é marcado no efeito abaixo —
  // ler o relógio durante o render é impuro.
  const startedAt = useRef<number>(restored?.startedAt ?? 0);

  // Só marca o início. Trocar de caso NÃO é tratado aqui: quem consome este
  // hook é remontado via `key={currentCase.id}`, então o estado já nasce
  // zerado. Ressincronizar por efeito causaria renders em cascata.
  useEffect(() => {
    if (!startedAt.current) startedAt.current = Date.now();
  }, []);

  /** Instante de abertura do caso, para gravar a investigação. */
  const getStartedAt = useCallback(() => startedAt.current, []);

  const execute = useCallback(
    (sql: string) => {
      const { result, error } = runQuery(sql);
      const at = Date.now();
      setSession(previous => ({
        ...previous,
        result,
        queryError: error,
        lastSql: sql,
        databaseRestored: false,
        proven: previous.proven || resultContainsValue(result, currentCase.solution),
        log: appendLog(previous.log, {
          id: (previous.log[0]?.id ?? 0) + 1,
          sql,
          rowCount: result ? result.values.length : null,
          error,
          at,
          techniques: techniquesIn(sql),
          tables: tablesIn(sql, tables),
        }),
      }));
    },
    [runQuery, currentCase.solution, tables]
  );

  /**
   * O resultado na tela veio do banco antigo e pode mostrar registros que já
   * não existem (ou esconder os que voltaram): some junto com a restauração.
   */
  const markDatabaseRestored = useCallback(() => {
    setSession(previous => ({ ...previous, result: null, queryError: null, databaseRestored: true }));
  }, []);

  const revealHint = useCallback(() => {
    setSession(previous => ({
      ...previous,
      showHint: !previous.showHint,
      // A penalidade é cobrada uma vez só, na primeira revelação.
      usedHint: previous.usedHint || !previous.showHint,
    }));
  }, []);

  const accuse = useCallback(
    (answer: string): VerdictKind => {
      const verdict = judgeAccusation({
        answer,
        solution: currentCase.solution,
        proven: session.proven,
      });

      if (verdict.kind === 'solved') {
        // startedAt=0 só ocorreria antes da montagem; nesse caso não há tempo a medir.
        const elapsedSeconds = startedAt.current
          ? Math.round((Date.now() - startedAt.current) / 1000)
          : 0;
        const earned = scoreCase({
          difficulty: currentCase.difficulty,
          wrongAttempts: session.wrongAttempts,
          usedHint: session.usedHint,
          elapsedSeconds,
        });

        setSession(previous => ({
          ...previous,
          solved: true,
          earnedScore: earned,
          elapsedSeconds,
          lastVerdict: verdict.kind,
        }));

        onSolved({
          caseId: currentCase.id,
          score: earned,
          wrongAttempts: session.wrongAttempts,
          usedHint: session.usedHint,
          elapsedSeconds,
          solvedAt: Date.now(),
        });

        return verdict.kind;
      }

      // 'unproven' também conta como tentativa: chutar tem custo, senão o
      // jogador varre a lista de nomes sem prejuízo nenhum.
      const penalized = verdict.kind === 'incorrect' || verdict.kind === 'unproven';
      setSession(previous => ({
        ...previous,
        wrongAttempts: penalized ? previous.wrongAttempts + 1 : previous.wrongAttempts,
        lastVerdict: verdict.kind,
      }));

      return verdict.kind;
    },
    [currentCase, session.proven, session.wrongAttempts, session.usedHint, onSolved]
  );

  return { session, execute, revealHint, accuse, getStartedAt, markDatabaseRestored };
}

function initialSession(alreadySolved: boolean, restored?: SavedSession | null): CaseSession {
  return {
    result: null,
    queryError: null,
    showHint: false,
    // Penalidades já cobradas continuam cobradas.
    usedHint: restored?.usedHint ?? false,
    wrongAttempts: restored?.wrongAttempts ?? 0,
    proven: restored?.proven ?? false,
    solved: alreadySolved,
    earnedScore: null,
    elapsedSeconds: 0,
    lastVerdict: null,
    lastSql: null,
    databaseRestored: false,
    log: restored?.log ?? [],
  };
}
