import { useCallback, useEffect, useState } from 'react';
import initSqlJs, { type Database as SqlDatabase, type SqlJsStatic, type SqlValue } from 'sql.js';
import type { QueryResult } from '../domain/case';

/** sql.js é pesado; uma instância só do runtime serve todos os casos. */
let sqlEnginePromise: Promise<SqlJsStatic> | null = null;

function loadSqlEngine(): Promise<SqlJsStatic> {
  sqlEnginePromise ??= initSqlJs({ locateFile: file => `/${file}` });
  return sqlEnginePromise;
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Banco em memória isolado por caso.
 *
 * O jogador roda SQL irrestrito, inclusive DELETE e DROP. `reset` recria o
 * banco a partir do schema original para que destruir a evidência por engano
 * não obrigue a recarregar a página.
 */
export function useSqlDatabase(schema: string) {
  const [db, setDb] = useState<SqlDatabase | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generation, setGeneration] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let database: SqlDatabase | null = null;

    const build = async () => {
      setLoading(true);
      setDbError(null);
      try {
        const engine = await loadSqlEngine();
        if (cancelled) return;
        database = new engine.Database();
        database.run(schema);
        setDb(database);
      } catch (error) {
        if (!cancelled) setDbError(messageOf(error));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void build();

    return () => {
      cancelled = true;
      database?.close();
    };
  }, [schema, generation]);

  /** Recria o banco do zero, descartando o que o jogador alterou. */
  const reset = useCallback(() => setGeneration(g => g + 1), []);

  const runQuery = useCallback(
    (sql: string): { result: QueryResult | null; error: string | null } => {
      if (!db) return { result: null, error: 'Banco ainda não carregado.' };

      const clean = sql.replace(/--[^\n]*/g, '').trim().replace(/;+$/, '');
      if (!clean) return { result: { columns: [], values: [] }, error: null };

      try {
        // prepare/step isola uma única statement e devolve as linhas.
        const statement = db.prepare(clean);
        const columns = statement.getColumnNames();
        const values: SqlValue[][] = [];
        while (statement.step()) values.push(statement.get());
        statement.free();
        return { result: { columns, values }, error: null };
      } catch {
        // DML (INSERT/UPDATE/DELETE) não retorna linhas e falha no prepare/step.
        try {
          db.run(clean);
          return { result: { columns: [], values: [] }, error: null };
        } catch (error) {
          return { result: null, error: messageOf(error) };
        }
      }
    },
    [db]
  );

  return { runQuery, reset, dbError, loading };
}
