import { useState, useEffect, useCallback } from 'react';
import initSqlJs, { Database } from 'sql.js';
import { QueryResult } from '../types';

export const useSqlDatabase = (initialSchema: string) => {
  const [db, setDb] = useState<Database | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const SQL = await initSqlJs({
          locateFile: (file) => `/${file}`
        });
        const database = new SQL.Database();
        database.run(initialSchema);
        setDb(database);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };
    init();
  }, [initialSchema]);

  const runQuery = useCallback((query: string): QueryResult | null => {
    if (!db) return null;
    setError(null);
    try {
      const res = db.exec(query);
      if (res.length === 0) return { columns: [], values: [] };
      return {
        columns: res[0].columns,
        values: res[0].values
      };
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }, [db]);

  const reset = useCallback(() => {
    if (db) {
      // Re-run the initial schema on a new database or just run it again if it drops tables
      // For simplicity, let's just re-initialize the current one if needed, 
      // but usually we just want to restart the state.
    }
  }, [db, initialSchema]);

  return { runQuery, error, loading, db };
};
