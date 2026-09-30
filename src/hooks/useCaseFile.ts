import { useCallback, useEffect, useState } from 'react';
import {
  cellText,
  evidenceId,
  toggleEvidence,
  toggleSuspect,
  type Evidence,
} from '../domain/casefile';
import type { SqlValue } from 'sql.js';
import { browserStore, STORAGE_KEYS } from '../data/storage';
import type { SavedSession } from '../domain/savedSession';

type NotesByCase = Record<string, string>;

/**
 * Quadro de provas, suspeitos e anotações do caso aberto.
 *
 * Provas e suspeitos valem para a investigação em andamento e são retomados
 * da sessão salva (o componente é remontado a cada troca de caso). As anotações são do jogador e ficam
 * salvas por caso, para quem volta a um caso difícil no dia seguinte.
 */
export function useCaseFile(caseId: string, restored?: SavedSession | null) {
  const [evidence, setEvidence] = useState<Evidence[]>(() => restored?.evidence ?? []);
  const [suspects, setSuspects] = useState<string[]>(() => restored?.suspects ?? []);
  const [notes, setNotes] = useState<string>(
    () => browserStore.read<NotesByCase>(STORAGE_KEYS.notes, {})[caseId] ?? ''
  );

  // Gravação com atraso: não escreve no armazenamento a cada tecla.
  useEffect(() => {
    const timer = setTimeout(() => {
      const all = browserStore.read<NotesByCase>(STORAGE_KEYS.notes, {});
      if ((all[caseId] ?? '') === notes) return;
      if (notes.trim()) all[caseId] = notes;
      else delete all[caseId];
      browserStore.write(STORAGE_KEYS.notes, all);
    }, 400);
    return () => clearTimeout(timer);
  }, [caseId, notes]);

  const pinRow = useCallback((columns: string[], row: SqlValue[], sql: string) => {
    const values = row.map(cellText);
    setEvidence(board => toggleEvidence(board, { id: evidenceId(columns, values), columns, values, sql }));
  }, []);

  const unpin = useCallback((id: string) => {
    setEvidence(board => board.filter(e => e.id !== id));
  }, []);

  const toggleSuspectName = useCallback((name: string) => {
    setSuspects(list => toggleSuspect(list, name));
  }, []);

  return { evidence, suspects, notes, setNotes, pinRow, unpin, toggleSuspect: toggleSuspectName };
}
