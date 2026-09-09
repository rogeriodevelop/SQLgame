import { useCallback, useEffect, useRef, useState } from 'react';
import type { Case, QueryResult } from '../domain/case';
import { judgeAccusation, resultContainsValue, type VerdictKind } from '../domain/investigation';
import { scoreCase } from '../domain/scoring';
import type { CaseRecord } from '../domain/progress';

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
};

type Options = {
  currentCase: Case;
  alreadySolved: boolean;
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
export function useCaseSession({ currentCase, alreadySolved, runQuery, onSolved }: Options) {
  const [session, setSession] = useState<CaseSession>(() => initialSession(alreadySolved));
  // Preenchido no efeito abaixo, que roda na montagem: ler o relógio durante o
  // render é impuro e daria um instante diferente a cada re-render.
  const startedAt = useRef<number>(0);

  // Só marca o início. Trocar de caso NÃO é tratado aqui: quem consome este
  // hook é remontado via `key={currentCase.id}`, então o estado já nasce
  // zerado. Ressincronizar por efeito causaria renders em cascata.
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const execute = useCallback(
    (sql: string) => {
      const { result, error } = runQuery(sql);
      setSession(previous => ({
        ...previous,
        result,
        queryError: error,
        proven: previous.proven || resultContainsValue(result, currentCase.solution),
      }));
    },
    [runQuery, currentCase.solution]
  );

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

  return { session, execute, revealHint, accuse };
}

function initialSession(alreadySolved: boolean): CaseSession {
  return {
    result: null,
    queryError: null,
    showHint: false,
    usedHint: false,
    wrongAttempts: 0,
    proven: false,
    solved: alreadySolved,
    earnedScore: null,
    elapsedSeconds: 0,
    lastVerdict: null,
  };
}
