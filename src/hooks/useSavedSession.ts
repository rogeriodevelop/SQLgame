import { useEffect, useRef, useState } from 'react';
import { browserStore, STORAGE_KEYS } from '../data/storage';
import {
  hasActivity,
  readSavedSession,
  withoutSavedSession,
  withSavedSession,
  type SavedSession,
  type SavedSessions,
} from '../domain/savedSession';

/** Lê todas as sessões salvas, descartando as que não passam na validação. */
function readAll(now: number): SavedSessions {
  const raw = browserStore.read<unknown>(STORAGE_KEYS.caseSessions, {});
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return {};
  const valid: SavedSessions = {};
  for (const [id, value] of Object.entries(raw)) {
    const session = readSavedSession(value, now);
    if (session) valid[id] = session;
  }
  return valid;
}

/**
 * Investigação salva do caso, lida uma única vez ao abrir. Caso já
 * resolvido não retoma nada: a mesa abre direto no encerramento.
 */
export function useRestoredSession(caseId: string, alreadySolved: boolean): SavedSession | null {
  const [restored] = useState<SavedSession | null>(() =>
    alreadySolved ? null : (readAll(Date.now())[caseId] ?? null)
  );
  return restored;
}

type Snapshot = Pick<SavedSession, 'sql' | 'log' | 'evidence' | 'suspects' | 'wrongAttempts' | 'usedHint' | 'proven'>;

type AutosaveOptions = {
  solved: boolean;
  getStartedAt: () => number;
  snapshot: Snapshot;
};

/** Atraso da gravação: agrupa digitação sem deixar trabalho para trás. */
const SAVE_DELAY_MS = 300;

/**
 * Grava a investigação em andamento enquanto o jogador trabalha e a apaga
 * quando o caso é resolvido.
 *
 * Além da gravação com atraso, grava na hora quando a aba é escondida ou
 * fechada: sem isso, um erro no mandado seguido de F5 imediato escaparia
 * da penalidade.
 */
export function useAutosaveSession(caseId: string, { solved, getStartedAt, snapshot }: AutosaveOptions) {
  const { sql, log, evidence, suspects, wrongAttempts, usedHint, proven } = snapshot;
  const pending = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (solved) {
      pending.current = null;
      browserStore.write(STORAGE_KEYS.caseSessions, withoutSavedSession(readAll(Date.now()), caseId));
      return;
    }

    const current: Snapshot = { sql, log, evidence, suspects, wrongAttempts, usedHint, proven };
    if (!hasActivity(current)) {
      pending.current = null;
      return;
    }

    const save = () => {
      const now = Date.now();
      const session: SavedSession = { ...current, startedAt: getStartedAt() || now, savedAt: now };
      browserStore.write(STORAGE_KEYS.caseSessions, withSavedSession(readAll(now), caseId, session));
      pending.current = null;
    };

    pending.current = save;
    const timer = setTimeout(save, SAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [caseId, solved, getStartedAt, sql, log, evidence, suspects, wrongAttempts, usedHint, proven]);

  useEffect(() => {
    const flush = () => pending.current?.();
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      // Trocar de caso desmonta a mesa: o que estava pendente é gravado agora.
      flush();
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);
}
