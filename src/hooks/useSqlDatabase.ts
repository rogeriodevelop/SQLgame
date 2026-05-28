import { useState, useEffect, useCallback } from 'react';
import initSqlJs, { type Database as SqlDatabase } from 'sql.js';
import type { QueryResult } from '../types';

export const useSqlDatabase = (initialSchema: string) => {
  const [db, setDb] = useState<SqlDatabase | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let database: SqlDatabase;
    const init = async () => {
      setLoading(true);
      setDbError(null);
      try {
        const SQL = await initSqlJs({ locateFile: (file) => `/${file}` });
        database = new SQL.Database();
        database.run(initialSchema);
        setDb(database);
      } catch (err: any) {
        setDbError(err.message);
      } finally {
        setLoading(false);
      }
    };
    init();
    return () => {
      if (database) {
        database.close();
      }
    };
  }, [initialSchema]);

  const runQuery = useCallback((query: string): { result: QueryResult | null; error: string | null } => {
    if (!db) return { result: null, error: 'Banco ainda não carregado.' };
    
    // Remove comentários de linha e normaliza
    const clean = query.replace(/--[^\n]*/g, '').trim().replace(/;+$/, '');
    if (!clean) return { result: { columns: [], values: [] }, error: null };
    
    try {
      // Usa prepare+step para garantir execução isolada de uma única statement
      const stmt = db.prepare(clean);
      const columns: string[] = stmt.getColumnNames();
      const values: any[][] = [];
      while (stmt.step()) {
        values.push(stmt.get());
      }
      stmt.free();
      return { result: { columns, values }, error: null };
    } catch (err: any) {
      // Fallback para DML (INSERT, UPDATE, etc.) que não retornam linhas
      try {
        db.run(clean);
        return { result: { columns: [], values: [] }, error: null };
      } catch (err2: any) {
        return { result: null, error: err2.message };
      }
    }
  }, [db]);

  return { runQuery, dbError, loading };
};
