import { describe, it, expect } from 'vitest';
import {
  scoreCase,
  speedBonus,
  starRating,
  MINIMUM_SCORE,
  MAX_SPEED_BONUS,
  SPEED_BONUS_WINDOW_SECONDS,
} from '../scoring';
import { DIFFICULTY_BASE_POINTS } from '../case';

describe('speedBonus', () => {
  it('é máximo no instante zero', () => {
    expect(speedBonus(0)).toBe(MAX_SPEED_BONUS);
  });

  it('zera ao fim da janela', () => {
    expect(speedBonus(SPEED_BONUS_WINDOW_SECONDS)).toBe(0);
  });

  it('não fica negativo depois da janela', () => {
    expect(speedBonus(SPEED_BONUS_WINDOW_SECONDS * 10)).toBe(0);
  });

  it('decai conforme o tempo passa', () => {
    expect(speedBonus(60)).toBeGreaterThan(speedBonus(120));
  });
});

describe('scoreCase', () => {
  it('dá base + bônus para um caso perfeito e instantâneo', () => {
    const score = scoreCase({
      difficulty: 'Easy',
      wrongAttempts: 0,
      usedHint: false,
      elapsedSeconds: 0,
    });
    expect(score).toBe(DIFFICULTY_BASE_POINTS.Easy + MAX_SPEED_BONUS);
  });

  it('desconta erros e dica', () => {
    const limpo = scoreCase({
      difficulty: 'Hard', wrongAttempts: 0, usedHint: false, elapsedSeconds: 60,
    });
    const sujo = scoreCase({
      difficulty: 'Hard', wrongAttempts: 3, usedHint: true, elapsedSeconds: 60,
    });
    expect(sujo).toBeLessThan(limpo);
  });

  it('nunca desce abaixo do piso, por pior que seja o desempenho', () => {
    const score = scoreCase({
      difficulty: 'Tutorial',
      wrongAttempts: 999,
      usedHint: true,
      elapsedSeconds: 99999,
    });
    expect(score).toBe(MINIMUM_SCORE);
  });

  it('caso mais difícil vale mais que o fácil em igualdade de condições', () => {
    const cond = { wrongAttempts: 1, usedHint: false, elapsedSeconds: 30 };
    expect(scoreCase({ ...cond, difficulty: 'Expert' }))
      .toBeGreaterThan(scoreCase({ ...cond, difficulty: 'Easy' }));
  });
});

describe('starRating', () => {
  it('dá 3 estrelas para desempenho quase perfeito', () => {
    const perfeito = DIFFICULTY_BASE_POINTS.Medium + MAX_SPEED_BONUS;
    expect(starRating(perfeito, 'Medium')).toBe(3);
  });

  it('dá 1 estrela para pontuação baixa', () => {
    expect(starRating(MINIMUM_SCORE, 'Medium')).toBe(1);
  });

  it('sempre devolve 1, 2 ou 3', () => {
    for (let s = 0; s <= 2000; s += 50) {
      expect([1, 2, 3]).toContain(starRating(s, 'Hard'));
    }
  });
});
