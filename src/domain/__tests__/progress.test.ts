import { describe, it, expect } from 'vitest';
import {
  EMPTY_PROGRESS,
  withRecord,
  isSolved,
  totalScore,
  totalSolved,
  rankFor,
  nextRank,
  RANKS,
  type CaseRecord,
} from '../progress';

const record = (caseId: string, score: number): CaseRecord => ({
  caseId,
  score,
  wrongAttempts: 0,
  usedHint: false,
  elapsedSeconds: 10,
  solvedAt: 0,
});

describe('withRecord', () => {
  it('registra um caso novo', () => {
    const p = withRecord(EMPTY_PROGRESS, record('easy1', 400));
    expect(isSolved(p, 'easy1')).toBe(true);
    expect(totalScore(p)).toBe(400);
  });

  it('substitui quando a nova pontuação é melhor', () => {
    let p = withRecord(EMPTY_PROGRESS, record('easy1', 300));
    p = withRecord(p, record('easy1', 500));
    expect(totalScore(p)).toBe(500);
    expect(totalSolved(p)).toBe(1);
  });

  it('mantém o melhor quando a nova é pior — rejogar não pune', () => {
    let p = withRecord(EMPTY_PROGRESS, record('easy1', 500));
    p = withRecord(p, record('easy1', 100));
    expect(totalScore(p)).toBe(500);
  });

  it('não muta o progresso anterior', () => {
    const antes = withRecord(EMPTY_PROGRESS, record('easy1', 300));
    withRecord(antes, record('easy2', 300));
    expect(totalSolved(antes)).toBe(1);
  });
});

describe('rankFor', () => {
  it('começa na patente mais baixa', () => {
    expect(rankFor(0)).toEqual(RANKS[0]);
  });

  it('chega ao topo com pontuação alta', () => {
    expect(rankFor(999999)).toEqual(RANKS[RANKS.length - 1]);
  });

  it('nunca regride conforme a pontuação sobe', () => {
    let anterior = -1;
    for (let s = 0; s <= 50000; s += 500) {
      const idx = RANKS.indexOf(rankFor(s));
      expect(idx).toBeGreaterThanOrEqual(anterior);
      anterior = idx;
    }
  });
});

describe('nextRank', () => {
  it('aponta a próxima patente e o quanto falta', () => {
    const next = nextRank(0);
    expect(next?.rank).toEqual(RANKS[1]);
    expect(next?.missing).toBe(RANKS[1].minScore);
  });

  it('devolve null no topo', () => {
    expect(nextRank(999999)).toBeNull();
  });
});
