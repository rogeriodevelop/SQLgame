import type { QueryResult } from './case';
import { normalizeText, textEquals } from './text';

/**
 * O jogador precisa comprovar a acusação: alguma consulta executada por ele
 * tem de ter trazido o responsável em alguma célula. Isso impede fechar o
 * caso por chute sem tocar no SQL.
 */
export function resultContainsValue(result: QueryResult | null, value: string): boolean {
  if (!result) return false;
  const target = normalizeText(value);
  return result.values.some(row =>
    row.some(cell => cell !== null && normalizeText(String(cell)) === target)
  );
}

/** Resultado da avaliação de uma acusação. */
export type VerdictKind =
  /** Campo vazio. */
  | 'empty'
  /** Nenhuma consulta do jogador revelou o responsável ainda. */
  | 'unproven'
  /** Nome não confere. */
  | 'incorrect'
  /** Caso resolvido. */
  | 'solved';

export type Verdict = { kind: VerdictKind };

export type AccusationInput = {
  answer: string;
  solution: string;
  /** Se alguma consulta anterior já revelou o responsável. */
  proven: boolean;
};

/**
 * Avalia uma acusação.
 *
 * A checagem de prova vem ANTES da comparação de propósito: se ela viesse
 * depois, a mensagem "sem provas" só apareceria para quem digitou o nome
 * certo — e portanto confirmaria o chute. Com esta ordem, palpite certo e
 * errado sem prova recebem exatamente o mesmo retorno.
 */
export function judgeAccusation({ answer, solution, proven }: AccusationInput): Verdict {
  if (!answer.trim()) return { kind: 'empty' };
  if (!proven) return { kind: 'unproven' };
  if (textEquals(answer, solution)) return { kind: 'solved' };
  return { kind: 'incorrect' };
}
