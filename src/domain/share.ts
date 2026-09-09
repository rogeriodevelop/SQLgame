import type { Case } from './case';
import { DIFFICULTY_LABELS } from './case';

export type ShareData = {
  caseNumber: number;
  currentCase: Case;
  score: number;
  stars: 1 | 2 | 3;
  wrongAttempts: number;
  usedHint: boolean;
  elapsedSeconds: number;
};

const GAME_URL = 'https://sqlgame-sandy.vercel.app';

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Texto de resultado no formato "Wordle": curto, com o placar em emoji e sem
 * revelar a resposta. É o mecanismo de divulgação mais barato que existe —
 * o jogador publica o resultado e o link vai junto.
 */
export function buildShareText(data: ShareData): string {
  const stars = '★'.repeat(data.stars) + '☆'.repeat(3 - data.stars);
  const marks = [
    data.wrongAttempts === 0 ? '🎯 sem erros' : `❌ ${data.wrongAttempts} erro(s)`,
    data.usedHint ? '💡 com dica' : '🧠 sem dica',
    `⏱️ ${formatDuration(data.elapsedSeconds)}`,
  ].join(' · ');

  return [
    `Game SQL — Caso #${data.caseNumber} (${DIFFICULTY_LABELS[data.currentCase.difficulty]})`,
    `${stars}  ${data.score} pts`,
    marks,
    GAME_URL,
  ].join('\n');
}
