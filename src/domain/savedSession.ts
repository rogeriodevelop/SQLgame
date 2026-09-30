import { EVIDENCE_LIMIT, LOG_LIMIT, SUSPECT_LIMIT, TECHNIQUES, type Evidence, type LogEntry, type Technique } from './casefile';

/**
 * Investigação em andamento guardada no navegador, para que sair e voltar
 * não apague o trabalho — nem as penalidades já cobradas.
 *
 * Erros, dica usada e o instante de abertura do caso vêm daqui ao reabrir:
 * recarregar a página não zera mais a pontuação nem reinicia o cronômetro.
 */
export type SavedSession = {
  sql: string;
  log: LogEntry[];
  evidence: Evidence[];
  suspects: string[];
  wrongAttempts: number;
  usedHint: boolean;
  /**
   * Alguma consulta já trouxe o responsável. Guardado porque o diário não
   * guarda resultados: sem isto, o jogador teria de refazer a consulta
   * depois de voltar para poder acusar.
   */
  proven: boolean;
  /** Instante (ms) em que o caso foi aberto pela primeira vez nesta investigação. */
  startedAt: number;
  savedAt: number;
};

export type SavedSessions = Record<string, SavedSession>;

/** Quantas investigações abertas o navegador guarda; as mais antigas saem. */
export const SAVED_SESSION_LIMIT = 20;

/** Tamanho máximo do texto do editor guardado. */
const SQL_LIMIT = 20_000;

/** Houve trabalho que vale guardar? Abrir um caso e sair não conta. */
export function hasActivity(session: Pick<SavedSession, 'sql' | 'log' | 'evidence' | 'suspects' | 'wrongAttempts' | 'usedHint'>): boolean {
  return (
    session.sql.trim() !== '' ||
    session.log.length > 0 ||
    session.evidence.length > 0 ||
    session.suspects.length > 0 ||
    session.wrongAttempts > 0 ||
    session.usedHint
  );
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isStringArray = (v: unknown): v is string[] => Array.isArray(v) && v.every(x => typeof x === 'string');
const isCount = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v) && v >= 0;
const isTime = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v > 0;

function readLogEntry(raw: unknown): LogEntry | null {
  if (!isObject(raw)) return null;
  const { id, sql, rowCount, error, at, techniques, tables } = raw;
  if (!isCount(id) || typeof sql !== 'string' || !isTime(at) || !isStringArray(tables)) return null;
  if (!(rowCount === null || isCount(rowCount))) return null;
  if (!(error === null || typeof error === 'string')) return null;
  if (!isStringArray(techniques)) return null;
  const known = techniques.filter((t): t is Technique => (TECHNIQUES as readonly string[]).includes(t));
  return { id, sql, rowCount, error, at, techniques: known, tables };
}

function readEvidence(raw: unknown): Evidence | null {
  if (!isObject(raw)) return null;
  const { id, columns, values, sql } = raw;
  if (typeof id !== 'string' || !isStringArray(columns) || !isStringArray(values) || typeof sql !== 'string') return null;
  return { id, columns, values, sql };
}

/**
 * Valida o que veio do armazenamento. Qualquer campo essencial fora do
 * formato descarta a sessão inteira (melhor recomeçar que travar o jogo);
 * itens individuais inválidos do diário e do quadro são só ignorados.
 */
export function readSavedSession(raw: unknown, now: number): SavedSession | null {
  if (!isObject(raw)) return null;
  const { sql, log, evidence, suspects, wrongAttempts, usedHint, proven, startedAt, savedAt } = raw;
  if (typeof sql !== 'string' || !Array.isArray(log) || !Array.isArray(evidence) || !isStringArray(suspects)) return null;
  if (!isCount(wrongAttempts) || typeof usedHint !== 'boolean' || typeof proven !== 'boolean' || !isTime(startedAt) || !isTime(savedAt)) return null;
  // Relógio do sistema voltou no tempo ou dado forjado: início no futuro não vale.
  if (startedAt > now) return null;

  return {
    sql: sql.slice(0, SQL_LIMIT),
    log: log.map(readLogEntry).filter((e): e is LogEntry => e !== null).slice(0, LOG_LIMIT),
    evidence: evidence.map(readEvidence).filter((e): e is Evidence => e !== null).slice(0, EVIDENCE_LIMIT),
    suspects: suspects.slice(0, SUSPECT_LIMIT),
    wrongAttempts,
    usedHint,
    proven,
    startedAt,
    savedAt,
  };
}

/** Grava a sessão de um caso, descartando as mais antigas além do limite. */
export function withSavedSession(all: SavedSessions, caseId: string, session: SavedSession): SavedSessions {
  const next: SavedSessions = { ...all, [caseId]: session };
  const ids = Object.keys(next);
  if (ids.length <= SAVED_SESSION_LIMIT) return next;
  ids
    .sort((a, b) => next[a].savedAt - next[b].savedAt)
    .slice(0, ids.length - SAVED_SESSION_LIMIT)
    .forEach(id => delete next[id]);
  return next;
}

export function withoutSavedSession(all: SavedSessions, caseId: string): SavedSessions {
  if (!(caseId in all)) return all;
  const next = { ...all };
  delete next[caseId];
  return next;
}
