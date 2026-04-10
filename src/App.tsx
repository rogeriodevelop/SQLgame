import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Terminal as TerminalIcon, Play, FileText, ShieldAlert, List,
  ChevronRight, CheckCircle2, ChevronLeft, Target, Database, Copy,
  AlertTriangle, Layers
} from 'lucide-react';
import initSqlJs, { type Database as SqlDatabase } from 'sql.js';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';

import type { Case, QueryResult } from './types';
import { cases } from './data/cases';

// ─── CopyButton ─────────────────────────────────────────────────────────────
const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      style={{ background: 'transparent', border: 'none', color: copied ? 'var(--success)' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
      title="Copiar nome da tabela"
    >
      {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
    </button>
  );
};

// ─── useSqlDatabase ──────────────────────────────────────────────────────────
const useSqlDatabase = (initialSchema: string) => {
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
    return () => { if (database) database.close(); };
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

// ─── SQL Highlight (puro, sem libs) ─────────────────────────────────────────
// Recebe texto SQL e devolve HTML com spans coloridos.
const SQL_KEYWORDS = /\b(SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AS|AND|OR|NOT|IN|LIKE|IS|NULL|ORDER|BY|GROUP|HAVING|LIMIT|OFFSET|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|DROP|ALTER|DISTINCT|COUNT|SUM|AVG|MAX|MIN|UNION|ALL|BETWEEN|CASE|WHEN|THEN|ELSE|END|PRIMARY|KEY|FOREIGN|REFERENCES|INDEX|VIEW|WITH|EXISTS|RETURNING|ASC|DESC)\b/gi;

function sqlHighlight(code: string): string {
  // Escapa HTML primeiro para segurança
  const escaped = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return escaped
    // Comentários -- ...
    .replace(/(--[^\n]*)/g, '<span class="sql-comment">$1</span>')
    // Strings 'texto'
    .replace(/('(?:[^'\\]|\\.)*')/g, '<span class="sql-string">$1</span>')
    // Números
    .replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="sql-number">$1</span>')
    // Keywords (após escapar HTML, portanto seguro)
    .replace(SQL_KEYWORDS, '<span class="sql-kw">$&</span>');
}

// ─── SmartTerminal ───────────────────────────────────────────────────────────
// Detecta múltiplos statements SQL, mostra abas, executa o selecionado.
interface SmartTerminalProps {
  onExecute: (q: string) => void;
  queryError: string | null;
}

const SmartTerminal: React.FC<SmartTerminalProps> = ({ onExecute, queryError }) => {
  const [code, setCode] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef  = useRef<HTMLDivElement>(null);

  // Quebra o código em statements separados por `;` (ignorando vazios)
  const statements = code
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  const hasMultiple = statements.length > 1;
  const selectedQuery = statements[activeIdx] ?? '';

  // Reposiciona aba ativa se statements mudarem
  useEffect(() => {
    setActiveIdx(0);
  }, [statements.length]);

  const handleExecute = () => {
    if (selectedQuery) onExecute(selectedQuery);
  };

  // Ctrl+Enter executa
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleExecute();
    }
  };

  // Extrai título amigável do statement (ex: "SELECT ... FROM tabela")
  const statementLabel = (s: string, i: number) => {
    const match = s.match(/(?:SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)\b.{0,40}/i);
    return match ? match[0].replace(/\s+/g, ' ') + '…' : `Query ${i + 1}`;
  };

  return (
    <div className="glass-morphism glow-blue" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '0.6rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.25)', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px', color: 'var(--text-muted)' }}>
          <TerminalIcon size={14} /> SQL TERMINAL
          <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)' }}>Ctrl+Enter para executar</span>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleExecute}
          disabled={!selectedQuery}
          style={{ padding: '0.35rem 0.9rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Play size={12} /> EXECUTAR
        </button>
      </div>

      {/* Abas de statements */}
      {hasMultiple && (
        <div style={{ display: 'flex', overflowX: 'auto', borderBottom: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.15)', flexShrink: 0 }}>
          {statements.map((s, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              style={{
                padding: '0.4rem 0.9rem',
                fontSize: '0.72rem',
                whiteSpace: 'nowrap',
                border: 'none',
                borderBottom: i === activeIdx ? '2px solid var(--accent-primary)' : '2px solid transparent',
                background: 'transparent',
                color: i === activeIdx ? 'var(--accent-primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                fontFamily: "'JetBrains Mono', monospace",
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                transition: 'color 0.15s'
              }}
              title={s}
            >
              <Layers size={10} />
              Query {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Preview da query selecionada (quando há múltiplas) */}
      {hasMultiple && (
        <div style={{ padding: '0.4rem 1rem', background: 'rgba(59,130,246,0.06)', borderBottom: '1px solid var(--border-color)', fontSize: '0.72rem', color: 'var(--accent-primary)', fontFamily: "'JetBrains Mono', monospace", flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          ▶ {statementLabel(selectedQuery, activeIdx)}
        </div>
      )}

      {/* Editor com Highlight ─ técnica overlay (zero libs externas) */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* Camada de highlight (atrás) */}
        <div
          ref={overlayRef}
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: sqlHighlight(code) + '\n' }}
          style={{
            position: 'absolute', inset: 0,
            pointerEvents: 'none',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.9rem',
            lineHeight: '1.65',
            padding: '0.75rem 1rem',
            margin: 0,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            overflowY: 'auto',
            color: 'transparent',  /* o texto real do overlay fica invisível */
            background: 'transparent',
          }}
        />
        {/* Textarea real (visível apenas o cursor e seleção) */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={e => {
            setCode(e.target.value);
            // Sincroniza scroll do overlay com o textarea
            if (overlayRef.current && e.target) {
              overlayRef.current.scrollTop = e.target.scrollTop;
            }
          }}
          onScroll={e => {
            if (overlayRef.current) {
              overlayRef.current.scrollTop = (e.target as HTMLTextAreaElement).scrollTop;
            }
          }}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          style={{
            position: 'absolute', inset: 0,
            background: 'transparent',
            border: 'none',
            /* caret visível, texto transparente para o overlay aparecer */
            color: 'transparent',
            caretColor: '#93c5fd',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.9rem',
            padding: '0.75rem 1rem',
            outline: 'none',
            resize: 'none',
            lineHeight: '1.65',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            overflowY: 'auto',
            width: '100%',
            height: '100%',
            boxSizing: 'border-box',
            zIndex: 1,
          }}
          placeholder={"-- Digite suas queries SQL aqui\n-- Separe múltiplas queries com ;\n-- Use Ctrl+Enter para executar"}
        />
      </div>

      {/* Erro de execução SQL */}
      {queryError && (
        <div style={{ color: '#fca5a5', padding: '0.5rem 1rem', fontSize: '0.78rem', background: 'rgba(239,68,68,0.12)', borderTop: '1px solid rgba(239,68,68,0.3)', display: 'flex', gap: '0.5rem', alignItems: 'flex-start', flexShrink: 0 }}>
          <AlertTriangle size={13} style={{ marginTop: '1px', flexShrink: 0 }} />
          <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{queryError}</span>
        </div>
      )}
    </div>
  );
};

// ─── ResultsTable ────────────────────────────────────────────────────────────
const ResultsTable: React.FC<{ result: QueryResult | null }> = ({ result }) => {
  if (!result) return (
    <div className="glass-morphism" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', gap: '0.5rem' }}>
      <TerminalIcon size={24} style={{ opacity: 0.3 }} />
      <span style={{ fontSize: '0.85rem' }}>Aguardando consulta…</span>
    </div>
  );
  if (result.columns.length === 0) return (
    <div className="glass-morphism" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
      Consulta executada — nenhuma linha retornada.
    </div>
  );
  return (
    <div className="glass-morphism" style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '0.6rem 1rem', background: 'rgba(0,0,0,0.2)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px', flexShrink: 0 }}>
        RESULTADOS — {result.values.length} linha(s)
      </div>
      <div style={{ overflow: 'auto', flex: 1 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.03)', position: 'sticky', top: 0 }}>
              {result.columns.map((c, colIdx) => (
                <th key={colIdx} style={{ padding: '0.6rem 0.75rem', textAlign: 'left', color: 'var(--accent-primary)', borderBottom: '1px solid var(--border-color)', whiteSpace: 'nowrap' }}>
                  {c}
                  {result.columns.indexOf(c) !== colIdx && (
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginLeft: 4 }}>({colIdx})</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.values.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.1s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {row.map((v, j) => (
                  <td key={j} style={{ padding: '0.55rem 0.75rem', color: v === null ? 'var(--text-muted)' : 'var(--text-main)', fontStyle: v === null ? 'italic' : 'normal' }}>
                    {v !== null ? v.toString() : 'null'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── Briefing ────────────────────────────────────────────────────────────────
const Briefing: React.FC<{ currentCase: Case; showHint: boolean; onToggleHint: () => void }> = ({ currentCase, showHint, onToggleHint }) => {
  const diffColors: Record<string, string> = {
    Easy: '#10b981', Medium: '#f59e0b', Hard: '#ef4444', Expert: '#8b5cf6'
  };
  const color = diffColors[currentCase.difficulty] ?? 'var(--accent-primary)';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <header>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <ShieldAlert size={22} style={{ color: 'var(--accent-secondary)' }} />
          <h2 style={{ fontSize: '1.4rem', color: 'white', margin: 0 }}>{currentCase.title}</h2>
        </div>
        <span style={{ fontSize: '0.72rem', background: color + '22', color, padding: '2px 10px', borderRadius: '99px', fontWeight: 700, border: `1px solid ${color}55` }}>
          {currentCase.difficulty.toUpperCase()}
        </span>
      </header>
      <section className="glass-morphism" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px' }}>
          <FileText size={13} /> O CASO
        </div>
        <p style={{ lineHeight: '1.75', color: 'var(--text-main)', fontSize: '0.9rem', margin: 0 }}>{currentCase.description}</p>
      </section>
      <section className="glass-morphism" style={{ padding: '1.25rem', borderLeft: `3px solid ${color}` }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color, marginBottom: '0.5rem', letterSpacing: '1px' }}>OBJETIVO</div>
        <p style={{ fontWeight: 600, color: 'white', margin: 0, fontSize: '0.9rem', lineHeight: '1.6' }}>{currentCase.objective}</p>
      </section>
      <button className="btn btn-ghost" onClick={onToggleHint} style={{ width: '100%', fontSize: '0.8rem' }}>
        {showHint ? '↑ Esconder Dica' : '💡 Pedir Dica'}
      </button>
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            style={{ padding: '1rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '8px', fontSize: '0.82rem', color: '#fcd34d', lineHeight: '1.6' }}
          >
            {currentCase.hint}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [currentCaseIndex, setCurrentCaseIndex] = useState(0);
  const currentCase = cases[currentCaseIndex];
  const { runQuery, dbError, loading } = useSqlDatabase(currentCase.schema);

  const [result, setResult] = useState<QueryResult | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [solved, setSolved] = useState(false);
  const [answerInput, setAnswerInput] = useState('');
  const [answerError, setAnswerError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  // Reset ao trocar de caso
  useEffect(() => {
    setResult(null);
    setQueryError(null);
    setShowHint(false);
    setSolved(false);
    setAnswerInput('');
    setAnswerError(null);
    setAttempts(0);
  }, [currentCaseIndex]);

  const handleExecute = (query: string) => {
    const { result: res, error: err } = runQuery(query);
    setResult(res);
    setQueryError(err);
  };

  const handleSolve = () => {
    if (!answerInput.trim()) {
      setAnswerError('Campo vazio. Digite o nome do suspeito ou evidência.');
      return;
    }
    const normalize = (s: string) =>
      s.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ');
    if (normalize(answerInput) === normalize(currentCase.solution)) {
      setSolved(true);
      setAnswerError(null);
      confetti({ particleCount: 180, spread: 80, origin: { y: 0.55 }, colors: ['#3b82f6', '#f59e0b', '#10b981'] });
    } else {
      const next = attempts + 1;
      setAttempts(next);
      setAnswerError(`❌ Resposta incorreta. Tente novamente.${next >= 3 ? ' Precisa de uma dica?' : ''}`);
      // Shake animation via class
      const input = document.getElementById('answer-input');
      if (input) { input.classList.add('shake'); setTimeout(() => input.classList.remove('shake'), 500); }
    }
  };

  if (loading || dbError) return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', color: dbError ? '#ef4444' : 'var(--accent-primary)', gap: '1rem' }}>
      {dbError ? <><AlertTriangle size={32} /><p style={{ maxWidth: 400, textAlign: 'center', fontSize: '0.85rem' }}>{dbError}</p></> : <p>CARREGANDO GAME SQL…</p>}
    </div>
  );

  return (
    <div className="container">
      {/* Nav */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', letterSpacing: '3px', color: 'white', margin: 0 }}>
          <span style={{ color: 'var(--accent-primary)' }}>Game</span> SQL
        </h1>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button className="btn btn-ghost" onClick={() => setCurrentCaseIndex(Math.max(0, currentCaseIndex - 1))} disabled={currentCaseIndex === 0}>
            <ChevronLeft size={16} />
          </button>
          <select
            value={currentCaseIndex}
            onChange={e => setCurrentCaseIndex(Number(e.target.value))}
            style={{ background: 'var(--bg-card)', color: 'white', padding: '0.45rem 0.9rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.82rem', outline: 'none', cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}
          >
            <optgroup label="Iniciante (Fácil)">
              {cases.filter(c => c.difficulty === 'Easy').map(c => { const i = cases.findIndex(x => x.id === c.id); return <option key={c.id} value={i}>#{i + 1} {c.title}</option>; })}
            </optgroup>
            <optgroup label="Investigador (Médio)">
              {cases.filter(c => c.difficulty === 'Medium').map(c => { const i = cases.findIndex(x => x.id === c.id); return <option key={c.id} value={i}>#{i + 1} {c.title}</option>; })}
            </optgroup>
            <optgroup label="Detetive Chefe (Difícil)">
              {cases.filter(c => c.difficulty === 'Hard').map(c => { const i = cases.findIndex(x => x.id === c.id); return <option key={c.id} value={i}>#{i + 1} {c.title}</option>; })}
            </optgroup>
            <optgroup label="Especialista">
              {cases.filter(c => c.difficulty === 'Expert').map(c => { const i = cases.findIndex(x => x.id === c.id); return <option key={c.id} value={i}>#{i + 1} {c.title}</option>; })}
            </optgroup>
          </select>
          <button className="btn btn-ghost" onClick={() => setCurrentCaseIndex(Math.min(cases.length - 1, currentCaseIndex + 1))} disabled={currentCaseIndex === cases.length - 1}>
            <ChevronRight size={16} />
          </button>
        </div>
      </nav>

      {/* Main grid */}
      <main className="grid-layout">
        {/* Col 1: Briefing */}
        <Briefing currentCase={currentCase} showHint={showHint} onToggleHint={() => setShowHint(h => !h)} />

        {/* Col 2: Terminal + Resultados */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: 0 }}>
          <div style={{ flex: '0 0 280px' }}>
            <SmartTerminal onExecute={handleExecute} queryError={queryError} />
          </div>
          <div style={{ flex: 1, minHeight: '200px' }}>
            <ResultsTable result={result} />
          </div>
        </section>

        {/* Col 3: Tabelas + Conclusão */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Schema */}
          <div className="glass-morphism" style={{ padding: '1.25rem', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px', flexShrink: 0 }}>
              <List size={13} /> TABELAS DISPONÍVEIS
            </div>
            <div style={{ overflow: 'auto', flex: 1, paddingRight: '0.25rem' }}>
              {currentCase.schema.split(';')
                .map(s => s.trim())
                .filter(s => s.toLowerCase().startsWith('create table'))
                .map((stmt, idx) => {
                  const match = stmt.match(/CREATE TABLE\s+(\w+)\s*\((.+)\)/is);
                  if (!match) return null;
                  const tableName = match[1];
                  const columns = match[2].split(',').map(c => c.trim().split(/\s+/));
                  return (
                    <div key={idx} style={{ marginBottom: '0.75rem', background: 'rgba(0,0,0,0.2)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ color: 'var(--accent-primary)', fontWeight: 600, marginBottom: '0.6rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Database size={12} /> {tableName}
                        </div>
                        <CopyButton text={tableName} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {columns.map((col, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', padding: '2px 0', borderBottom: i < columns.length - 1 ? '1px solid rgba(255,255,255,0.02)' : 'none' }}>
                            <span style={{ color: 'var(--text-main)' }}>{col[0]}</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>{col[1] || 'TEXT'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Conclusão / Resolvido */}
          <AnimatePresence mode="wait">
            {!solved ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{ padding: '1.25rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', flexShrink: 0 }}
              >
                <h3 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, letterSpacing: '1px' }}>
                  <Target size={13} /> CONCLUSÃO DO CASO
                </h3>
                <input
                  id="answer-input"
                  type="text"
                  value={answerInput}
                  onChange={e => { setAnswerInput(e.target.value); setAnswerError(null); }}
                  onKeyDown={e => { if (e.key === 'Enter') handleSolve(); }}
                  placeholder="Nome do suspeito ou evidência…"
                  style={{
                    width: '100%', padding: '0.65rem 0.9rem',
                    background: 'rgba(0,0,0,0.35)',
                    border: answerError ? '1px solid #ef4444' : '1px solid var(--border-color)',
                    borderRadius: '8px', color: 'white',
                    marginBottom: '0.75rem', outline: 'none',
                    fontFamily: "'Outfit', sans-serif", fontSize: '0.9rem',
                    boxSizing: 'border-box', transition: 'border-color 0.2s'
                  }}
                />
                {/* Feedback de erro inline */}
                <AnimatePresence>
                  {answerError && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '6px', padding: '0.5rem 0.75rem', marginBottom: '0.75rem', fontSize: '0.78rem', color: '#fca5a5', display: 'flex', gap: '0.4rem', alignItems: 'center' }}
                    >
                      <AlertTriangle size={12} style={{ flexShrink: 0 }} />
                      {answerError}
                    </motion.div>
                  )}
                </AnimatePresence>
                <button
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', fontSize: '0.82rem' }}
                  onClick={handleSolve}
                >
                  ENVIAR RELATÓRIO
                </button>
                {attempts >= 3 && !showHint && (
                  <button
                    className="btn btn-ghost"
                    style={{ width: '100%', marginTop: '0.5rem', fontSize: '0.78rem', opacity: 0.8 }}
                    onClick={() => setShowHint(true)}
                  >
                    💡 Ver Dica
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="solved"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{ padding: '1.5rem', background: 'rgba(16,185,129,0.08)', border: '1px solid var(--success)', borderRadius: '12px', textAlign: 'center', flexShrink: 0 }}
              >
                <CheckCircle2 size={36} color="var(--success)" style={{ margin: '0 auto 0.75rem' }} />
                <h3 style={{ color: 'var(--success)', margin: '0 0 0.25rem' }}>CASO RESOLVIDO!</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0 0 1rem' }}>
                  Solução: <strong style={{ color: 'white' }}>{currentCase.solution}</strong>
                </p>
                {currentCaseIndex < cases.length - 1 && (
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => setCurrentCaseIndex(currentCaseIndex + 1)}
                  >
                    PRÓXIMO CASO <ChevronRight size={16} />
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </aside>
      </main>
    </div>
  );
}
