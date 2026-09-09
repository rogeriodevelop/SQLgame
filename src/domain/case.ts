import type { SqlValue } from 'sql.js';

/** Níveis de dificuldade, do tutorial ao especialista. */
export const DIFFICULTIES = ['Tutorial', 'Easy', 'Medium', 'Hard', 'Expert'] as const;

export type Difficulty = (typeof DIFFICULTIES)[number];

export type Case = {
  id: string;
  title: string;
  difficulty: Difficulty;
  description: string;
  objective: string;
  /** DDL + INSERTs que montam o banco isolado do caso. */
  schema: string;
  /** Valor que o jogador deve identificar; precisa existir como célula no banco. */
  solution: string;
  hint?: string;
};

/** Resultado tabular de uma consulta, no formato devolvido pelo sql.js. */
export type QueryResult = {
  columns: string[];
  values: SqlValue[][];
};

/** Peso de cada dificuldade na pontuação base do caso. */
export const DIFFICULTY_BASE_POINTS: Record<Difficulty, number> = {
  Tutorial: 100,
  Easy: 300,
  Medium: 600,
  Hard: 1000,
  Expert: 1500,
};

/** Rótulos exibidos ao jogador, por dificuldade. */
export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  Tutorial: 'Treinamento',
  Easy: 'Iniciante',
  Medium: 'Investigador',
  Hard: 'Detetive Chefe',
  Expert: 'Especialista',
};

/** Variável CSS que carrega a cor de cada dificuldade. */
export const DIFFICULTY_COLOR_VARS: Record<Difficulty, string> = {
  Tutorial: 'var(--tutorial-color)',
  Easy: 'var(--easy-color)',
  Medium: 'var(--medium-color)',
  Hard: 'var(--hard-color)',
  Expert: 'var(--expert-color)',
};
