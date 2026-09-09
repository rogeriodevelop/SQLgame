import { DIFFICULTY_BASE_POINTS, type Difficulty } from './case';

/** Penalidade fixa por acusação errada. */
export const WRONG_ANSWER_PENALTY = 50;

/** Penalidade fixa por dica revelada. */
export const HINT_PENALTY = 150;

/** Piso: nenhum caso resolvido vale menos que isso, por pior que tenha sido. */
export const MINIMUM_SCORE = 25;

/** Tempo (em segundos) a partir do qual o bônus de velocidade zera. */
export const SPEED_BONUS_WINDOW_SECONDS = 300;

/** Bônus máximo concedido por resolver rápido. */
export const MAX_SPEED_BONUS = 200;

export type CasePerformance = {
  difficulty: Difficulty;
  /** Acusações erradas antes de acertar. */
  wrongAttempts: number;
  /** Se o jogador revelou a dica do caso. */
  usedHint: boolean;
  /** Segundos entre abrir o caso e fechá-lo. */
  elapsedSeconds: number;
};

/**
 * Bônus decrescente por velocidade: cheio no instante zero, zerado a partir
 * de SPEED_BONUS_WINDOW_SECONDS. Linear no meio.
 */
export function speedBonus(elapsedSeconds: number): number {
  if (elapsedSeconds <= 0) return MAX_SPEED_BONUS;
  if (elapsedSeconds >= SPEED_BONUS_WINDOW_SECONDS) return 0;
  const remaining = 1 - elapsedSeconds / SPEED_BONUS_WINDOW_SECONDS;
  return Math.round(MAX_SPEED_BONUS * remaining);
}

/**
 * Pontuação final de um caso resolvido.
 *
 * base(dificuldade) + bônus de velocidade - erros - dica, com piso em
 * MINIMUM_SCORE para que resolver nunca valha menos que desistir.
 */
export function scoreCase(performance: CasePerformance): number {
  const base = DIFFICULTY_BASE_POINTS[performance.difficulty];
  const penalties =
    performance.wrongAttempts * WRONG_ANSWER_PENALTY +
    (performance.usedHint ? HINT_PENALTY : 0);

  const total = base + speedBonus(performance.elapsedSeconds) - penalties;
  return Math.max(MINIMUM_SCORE, total);
}

/**
 * Classificação de 1 a 3 estrelas, relativa ao máximo teórico da dificuldade.
 * Serve de meta secundária: dá motivo para refazer um caso já resolvido.
 */
export function starRating(score: number, difficulty: Difficulty): 1 | 2 | 3 {
  const best = DIFFICULTY_BASE_POINTS[difficulty] + MAX_SPEED_BONUS;
  const ratio = score / best;
  if (ratio >= 0.85) return 3;
  if (ratio >= 0.55) return 2;
  return 1;
}
