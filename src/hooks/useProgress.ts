import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  EMPTY_PROGRESS,
  withRecord,
  isSolved,
  solvedCaseIds,
  totalScore,
  totalSolved,
  rankFor,
  nextRank,
  starsFor,
  type CaseRecord,
  type Progress,
} from '../domain/progress';
import type { Difficulty } from '../domain/case';
import { browserStore, STORAGE_KEYS } from '../data/storage';
import { caseCount } from '../data/caseRepository';

/**
 * Progressão persistida do jogador: quais casos caíram, com que pontuação e
 * qual patente isso rende. Não sabe nada sobre o caso em andamento — isso é
 * responsabilidade de useCaseSession.
 */
export function useProgress() {
  const [progress, setProgress] = useState<Progress>(() =>
    browserStore.read<Progress>(STORAGE_KEYS.progress, EMPTY_PROGRESS)
  );

  const [currentCaseIndex, setCurrentCaseIndex] = useState<number>(() => {
    const saved = browserStore.read<number>(STORAGE_KEYS.currentIndex, 0);
    return Number.isInteger(saved) && saved >= 0 && saved < caseCount() ? saved : 0;
  });

  useEffect(() => {
    browserStore.write(STORAGE_KEYS.progress, progress);
  }, [progress]);

  useEffect(() => {
    browserStore.write(STORAGE_KEYS.currentIndex, currentCaseIndex);
  }, [currentCaseIndex]);

  const recordSolved = useCallback((record: CaseRecord) => {
    setProgress(previous => withRecord(previous, record));
  }, []);

  const resetAllProgress = useCallback(() => {
    setProgress(EMPTY_PROGRESS);
    setCurrentCaseIndex(0);
    browserStore.remove(STORAGE_KEYS.progress);
    browserStore.remove(STORAGE_KEYS.currentIndex);
  }, []);

  const score = useMemo(() => totalScore(progress), [progress]);
  const solved = useMemo(() => totalSolved(progress), [progress]);

  return {
    progress,
    currentCaseIndex,
    setCurrentCaseIndex,
    recordSolved,
    resetAllProgress,
    solvedIds: useMemo(() => solvedCaseIds(progress), [progress]),
    hasSolved: useCallback((caseId: string) => isSolved(progress, caseId), [progress]),
    starsForCase: useCallback(
      (caseId: string, difficulty: Difficulty) => starsFor(progress, caseId, difficulty),
      [progress]
    ),
    totalScore: score,
    totalSolved: solved,
    casesCount: caseCount(),
    progressPercentage: Math.round((solved / caseCount()) * 100),
    rank: useMemo(() => rankFor(score), [score]),
    upcomingRank: useMemo(() => nextRank(score), [score]),
  };
}
