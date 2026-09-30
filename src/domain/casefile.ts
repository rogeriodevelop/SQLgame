import type { SqlValue } from 'sql.js';
import type { TableModel } from './schemaModel';
import { normalizeText } from './text';

/**
 * Dossiê do caso: o que o detetive fez durante a investigação.
 *
 * Nada aqui decide se o caso está resolvido — isso é de `investigation.ts`.
 * Este módulo só registra e classifica o trabalho do jogador para a interface
 * mostrar progresso, diário e quadro de provas. Nenhuma função recebe a
 * solução do caso: o dossiê nunca pode confirmar um palpite.
 */

/** Técnicas de investigação reconhecidas numa consulta. */
export const TECHNIQUES = ['select', 'where', 'join', 'aggregate', 'order', 'subquery'] as const;

export type Technique = (typeof TECHNIQUES)[number];

export const TECHNIQUE_LABELS: Record<Technique, string> = {
  select: 'Consultar registros',
  where: 'Filtrar os fatos',
  join: 'Cruzar arquivos',
  aggregate: 'Contar e somar',
  order: 'Ordenar os indícios',
  subquery: 'Consulta dentro de consulta',
};

/**
 * Remove comentários e literais de texto antes de procurar palavras-chave:
 * `WHERE nome = 'Join Silva'` não pode contar como JOIN.
 */
function stripNoise(sql: string): string {
  return sql
    .replace(/--[^\n]*/g, ' ')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/'(?:[^']|'')*'/g, "''")
    .replace(/"(?:[^"]|"")*"/g, '""');
}

/** Técnicas empregadas numa consulta, na ordem canônica de TECHNIQUES. */
export function techniquesIn(sql: string): Technique[] {
  const code = stripNoise(sql).toUpperCase();
  const found = new Set<Technique>();

  if (/\bSELECT\b/.test(code)) found.add('select');
  if (/\bWHERE\b|\bHAVING\b/.test(code)) found.add('where');
  if (/\bJOIN\b/.test(code) || /\bFROM\s+\w+(\s+\w+)?\s*,\s*\w+/.test(code)) found.add('join');
  if (/\b(COUNT|SUM|AVG|MIN|MAX)\s*\(|\bGROUP\s+BY\b/.test(code)) found.add('aggregate');
  if (/\bORDER\s+BY\b/.test(code)) found.add('order');
  if (/\(\s*SELECT\b/.test(code)) found.add('subquery');

  return TECHNIQUES.filter(t => found.has(t));
}

/** Tabelas do caso citadas numa consulta (comparação sem caixa). */
export function tablesIn(sql: string, tables: readonly TableModel[]): string[] {
  const code = stripNoise(sql).toLowerCase();
  return tables
    .map(t => t.name)
    .filter(name => new RegExp(`\\b${escapeRegExp(name.toLowerCase())}\\b`).test(code));
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Uma consulta registrada no diário do detetive. */
export type LogEntry = {
  id: number;
  sql: string;
  /** Linhas devolvidas; null quando a consulta falhou. */
  rowCount: number | null;
  error: string | null;
  at: number;
  techniques: Technique[];
  tables: string[];
};

/** Limite do diário: o suficiente para rever a investigação sem crescer sem fim. */
export const LOG_LIMIT = 40;

/** Acrescenta ao diário, mais recente primeiro, respeitando LOG_LIMIT. */
export function appendLog(log: readonly LogEntry[], entry: LogEntry): LogEntry[] {
  return [entry, ...log].slice(0, LOG_LIMIT);
}

/** Uma linha de resultado fixada no quadro como prova. */
export type Evidence = {
  id: string;
  columns: string[];
  values: string[];
  /** Consulta que produziu a linha — a cadeia de custódia da prova. */
  sql: string;
};

/** Representação textual de uma célula, com NULL explícito. */
export function cellText(value: SqlValue): string {
  if (value === null) return 'NULL';
  if (value instanceof Uint8Array) return `<blob ${value.length} bytes>`;
  return String(value);
}

/** Identidade estável de uma linha: a mesma linha fixada duas vezes é uma prova só. */
export function evidenceId(columns: readonly string[], values: readonly string[]): string {
  return columns.map((c, i) => `${c}=${values[i] ?? ''}`).join('|');
}

export const EVIDENCE_LIMIT = 12;

/** Fixa ou desafixa uma prova (alternância), respeitando EVIDENCE_LIMIT. */
export function toggleEvidence(board: readonly Evidence[], item: Evidence): Evidence[] {
  if (board.some(e => e.id === item.id)) return board.filter(e => e.id !== item.id);
  if (board.length >= EVIDENCE_LIMIT) return [...board];
  return [...board, item];
}

export const SUSPECT_LIMIT = 8;

/**
 * Marca ou desmarca um suspeito. Duplicatas cosméticas ("ana reis" e
 * "Ana Reis") contam como a mesma pessoa.
 */
export function toggleSuspect(suspects: readonly string[], name: string): string[] {
  const clean = name.trim();
  if (!clean) return [...suspects];
  const key = normalizeText(clean);
  if (suspects.some(s => normalizeText(s) === key)) {
    return suspects.filter(s => normalizeText(s) !== key);
  }
  if (suspects.length >= SUSPECT_LIMIT) return [...suspects];
  return [...suspects, clean];
}

export function isSuspect(suspects: readonly string[], name: string): boolean {
  const key = normalizeText(name);
  return suspects.some(s => normalizeText(s) === key);
}

/** Uma linha de investigação e se já foi seguida. */
export type Lead = { id: string; label: string; detail: string; done: boolean };

/**
 * Linhas de investigação de um caso, derivadas só do que o jogador fez.
 *
 * Cruzar arquivos só é exigido quando o banco tem mais de uma tabela, e
 * examinar todos os arquivos conta tabelas citadas em consultas que
 * rodaram sem erro.
 */
export function leadsFor(
  tables: readonly TableModel[],
  log: readonly LogEntry[],
  evidenceCount: number,
  suspectCount: number
): Lead[] {
  const ok = log.filter(entry => entry.error === null);
  const examined = new Set(ok.flatMap(entry => entry.tables));
  const used = new Set(ok.flatMap(entry => entry.techniques));

  const leads: Lead[] = [
    {
      id: 'files',
      label: 'Examinar os arquivos',
      detail: `${Math.min(examined.size, tables.length)}/${tables.length} tabelas consultadas`,
      done: tables.length > 0 && tables.every(t => examined.has(t.name)),
    },
    {
      id: 'filter',
      label: TECHNIQUE_LABELS.where,
      detail: 'uma consulta com WHERE',
      done: used.has('where'),
    },
  ];

  if (tables.length > 1) {
    leads.push({
      id: 'join',
      label: TECHNIQUE_LABELS.join,
      detail: 'ligar duas tabelas com JOIN',
      done: used.has('join'),
    });
  }

  leads.push(
    {
      id: 'evidence',
      label: 'Fixar provas no quadro',
      detail: `${evidenceCount} prova(s) no quadro`,
      done: evidenceCount > 0,
    },
    {
      id: 'suspects',
      label: 'Apontar suspeitos',
      detail: `${suspectCount} suspeito(s) marcado(s)`,
      done: suspectCount > 0,
    }
  );

  return leads;
}

/** Fração de linhas seguidas, de 0 a 100. */
export function leadsProgress(leads: readonly Lead[]): number {
  if (leads.length === 0) return 0;
  return Math.round((leads.filter(l => l.done).length / leads.length) * 100);
}
