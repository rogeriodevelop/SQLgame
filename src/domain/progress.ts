import { starRating } from './scoring';
import type { Difficulty } from './case';

/** Registro do melhor desempenho do jogador em um caso. */
export type CaseRecord = {
  caseId: string;
  score: number;
  wrongAttempts: number;
  usedHint: boolean;
  elapsedSeconds: number;
  solvedAt: number;
};

export type Progress = {
  records: Record<string, CaseRecord>;
};

export const EMPTY_PROGRESS: Progress = { records: {} };

/**
 * Guarda apenas o melhor resultado por caso: refazer um caso pode subir a
 * pontuação, nunca derrubá-la. Sem isso, rejogar seria punitivo e ninguém
 * caçaria as 3 estrelas.
 */
export function withRecord(progress: Progress, record: CaseRecord): Progress {
  const previous = progress.records[record.caseId];
  if (previous && previous.score >= record.score) return progress;
  return { records: { ...progress.records, [record.caseId]: record } };
}

export function isSolved(progress: Progress, caseId: string): boolean {
  return progress.records[caseId] !== undefined;
}

export function solvedCaseIds(progress: Progress): string[] {
  return Object.keys(progress.records);
}

export function totalScore(progress: Progress): number {
  return Object.values(progress.records).reduce((sum, r) => sum + r.score, 0);
}

export function totalSolved(progress: Progress): number {
  return Object.keys(progress.records).length;
}

/** Estrelas obtidas em um caso, ou 0 se ainda não foi resolvido. */
export function starsFor(
  progress: Progress,
  caseId: string,
  difficulty: Difficulty
): 0 | 1 | 2 | 3 {
  const record = progress.records[caseId];
  if (!record) return 0;
  return starRating(record.score, difficulty);
}

export type Rank = { title: string; badge: string; minScore: number };

/**
 * Patentes por pontuação acumulada, não por contagem de casos: assim
 * resolver bem vale mais que resolver muito.
 */
export const RANKS: Rank[] = [
  { title: 'Cadete de Dados', badge: '🔰', minScore: 0 },
  { title: 'Agente de SQL', badge: '🕵️', minScore: 2500 },
  { title: 'Investigador Pleno', badge: '🔎', minScore: 8000 },
  { title: 'Detetive Chefe de Dados', badge: '🗂️', minScore: 20000 },
  { title: 'Lenda da Hydra Syndicate', badge: '👑', minScore: 40000 },
];

export function rankFor(score: number): Rank {
  let current = RANKS[0];
  for (const rank of RANKS) {
    if (score >= rank.minScore) current = rank;
  }
  return current;
}

/** Próxima patente e quanto falta para ela; null quando já está no topo. */
export function nextRank(score: number): { rank: Rank; missing: number } | null {
  const upcoming = RANKS.find(r => r.minScore > score);
  return upcoming ? { rank: upcoming, missing: upcoming.minScore - score } : null;
}
