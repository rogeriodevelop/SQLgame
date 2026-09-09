import type { Case, Difficulty } from '../domain/case';
import { DIFFICULTIES } from '../domain/case';
import { tutorialCases } from './cases/tutorial';
import { cases as easyCases } from './cases/easy';
import { mediumCases } from './cases/medium';
import { hardCases } from './cases/hard';
import { seniorCases } from './cases/senior';
import { specialCases } from './cases/special';
import { expertCases } from './cases/expert';

/**
 * Ponto único de acesso aos casos. Componentes consultam este módulo em vez
 * de importar os arquivos de dados diretamente — assim trocar a origem
 * (arquivo, API, banco) não vaza para a interface.
 */
const allCases: readonly Case[] = Object.freeze([
  ...tutorialCases,
  ...easyCases,
  ...mediumCases,
  ...hardCases,
  ...seniorCases,
  ...specialCases,
  ...expertCases,
]);

export function listCases(): readonly Case[] {
  return allCases;
}

export function caseCount(): number {
  return allCases.length;
}

export function caseAt(index: number): Case | undefined {
  return allCases[index];
}

export function indexOfCase(id: string): number {
  return allCases.findIndex(c => c.id === id);
}

/** Casos agrupados por dificuldade, na ordem canônica de progressão. */
export function casesByDifficulty(): { difficulty: Difficulty; cases: Case[] }[] {
  return DIFFICULTIES.map(difficulty => ({
    difficulty,
    cases: allCases.filter(c => c.difficulty === difficulty),
  })).filter(group => group.cases.length > 0);
}
