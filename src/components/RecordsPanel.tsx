import { useEffect, useState, type ReactNode } from 'react';
import { Copy, Check, KeyRound, Link2, CornerDownLeft, Maximize2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Relation, TableModel } from '../domain/schemaModel';

type Props = {
  tables: readonly TableModel[];
  relations: readonly Relation[];
  /** Coloca uma consulta no terminal, sem executar. */
  onInsert: (sql: string) => void;
};

type Tab = 'cards' | 'links';

function CopyName({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // Área de transferência bloqueada; o jogador ainda pode digitar o nome.
    }
  };
  return (
    <button type="button" className="icon-btn" onClick={copy} aria-label={copied ? `${text} copiado` : `Copiar ${text}`} title={copied ? 'Copiado' : `Copiar "${text}"`}>
      {copied ? <Check size={13} aria-hidden /> : <Copy size={13} aria-hidden />}
    </button>
  );
}

/**
 * Para onde aponta cada coluna que é chave estrangeira. A ligação com o `id`
 * de outra tabela vence a ligação com uma coluna homônima (`org_id` aponta
 * para `organizacao.id`, não para o `org_id` de uma terceira tabela).
 */
function foreignTargets(table: string, relations: readonly Relation[]): Map<string, string> {
  const map = new Map<string, string>();
  const offer = (column: string, otherTable: string, otherColumn: string) => {
    if (column.toLowerCase() === 'id') return;
    const toPrimaryKey = otherColumn.toLowerCase() === 'id';
    const current = map.get(column);
    if (!current || (toPrimaryKey && !current.endsWith('.id'))) map.set(column, `${otherTable}.${otherColumn}`);
  };
  for (const r of relations) {
    if (r.tableA === table) offer(r.colA, r.tableB, r.colB);
    if (r.tableB === table) offer(r.colB, r.tableA, r.colA);
  }
  return map;
}

function TabStrip({ tab, onTab, count, children }: { tab: Tab; onTab: (tab: Tab) => void; count: number; children?: ReactNode }) {
  return (
    <div className="tabs" role="tablist" style={{ alignItems: 'flex-end' }}>
      <button type="button" role="tab" className="tab" aria-selected={tab === 'cards'} onClick={() => onTab('cards')}>
        Fichas <span className="tab-badge" style={{ background: 'var(--ink-soft)' }}>{count}</span>
      </button>
      <button type="button" role="tab" className="tab" aria-selected={tab === 'links'} onClick={() => onTab('links')}>
        <Link2 size={12} aria-hidden /> Conexões
      </button>
      <span style={{ flex: 1 }} />
      {children}
    </div>
  );
}

/**
 * Conteúdo das abas. `wide` distribui as fichas em grade, para a visão
 * ampliada, onde casos com dez ou mais tabelas cabem de uma vez.
 */
function RecordsBody({ tab, tables, relations, onInsert, wide }: Props & { tab: Tab; wide?: boolean }) {
  if (tab === 'links') {
    return (
      <>
        <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--ink-soft)', lineHeight: 1.55, marginBottom: 'var(--sp-3)' }}>
          Uma tabela não repete os dados da outra: guarda só o número de identificação. Estas são as ligações
          prováveis entre os arquivos — cada uma é a condição de um <strong>JOIN … ON</strong>.
        </p>
        {relations.length === 0 && (
          <p style={{ fontFamily: 'var(--font-type)', color: 'var(--ink-faint)' }}>
            Nenhuma ligação por chave neste caso. Consulte as tabelas separadamente.
          </p>
        )}
        <ul style={{ listStyle: 'none', display: 'grid', gridTemplateColumns: wide ? 'repeat(auto-fill, minmax(340px, 1fr))' : '1fr', gap: 'var(--sp-2) var(--sp-4)' }}>
          {relations.map(r => {
            const snippet = `SELECT *\nFROM ${r.tableA}\nJOIN ${r.tableB} ON ${r.tableA}.${r.colA} = ${r.tableB}.${r.colB};`;
            return (
              <li
                key={`${r.tableA}.${r.colA}-${r.tableB}.${r.colB}`}
                style={{ borderLeft: '3px solid var(--red)', padding: '4px 0 4px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--sp-2)' }}
              >
                <code style={{ fontSize: 'var(--fs-sm)', lineHeight: 1.6, wordBreak: 'break-word' }}>
                  {r.tableA}.<strong>{r.colA}</strong>
                  <span style={{ color: 'var(--red)' }}> ═ </span>
                  {r.tableB}.<strong>{r.colB}</strong>
                </code>
                <button type="button" className="btn btn-ink" onClick={() => onInsert(snippet)} style={{ padding: '2px 8px', fontSize: 'var(--fs-xs)', flexShrink: 0 }}>
                  Montar JOIN
                </button>
              </li>
            );
          })}
        </ul>
      </>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: wide ? 'repeat(auto-fill, minmax(250px, 1fr))' : '1fr', gap: 'var(--sp-3)', alignItems: 'start' }}>
      {tables.map((table, index) => {
        const fks = foreignTargets(table.name, relations);
        return (
          <article key={table.name} className="index-card" style={{ padding: '4px 10px 8px', transform: `rotate(${index % 2 ? 0.35 : -0.3}deg)` }}>
            <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '24px', gap: 'var(--sp-2)' }}>
              <strong style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-md)' }}>{table.name}</strong>
              <span style={{ display: 'flex', gap: '2px' }}>
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => onInsert(`SELECT *\nFROM ${table.name}\nLIMIT 10;`)}
                  aria-label={`Levar consulta de ${table.name} para o terminal`}
                  title="Levar SELECT desta tabela para o terminal"
                >
                  <CornerDownLeft size={13} aria-hidden />
                </button>
                <CopyName text={table.name} />
              </span>
            </header>
            <ul style={{ listStyle: 'none', marginTop: '6px' }}>
              {table.columns.map(column => {
                const target = fks.get(column.name);
                const isPk = column.name.toLowerCase() === 'id' || /primary/i.test(column.type);
                return (
                  <li
                    key={column.name}
                    style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--sp-2)', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-xs)', lineHeight: '22px' }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', minWidth: 0, flexWrap: 'wrap' }}>
                      {isPk && <KeyRound size={11} aria-label="chave primária" style={{ color: 'var(--brass-dark)' }} />}
                      {target && <Link2 size={11} aria-label={`liga a ${target}`} style={{ color: 'var(--red)' }} />}
                      <span>{column.name}</span>
                      {target && <span style={{ color: 'var(--red)', fontSize: '11px' }}>→ {target}</span>}
                    </span>
                    <span style={{ color: 'var(--ink-faint)', flexShrink: 0 }}>{column.type.toLowerCase().replace(/\s*primary key/, '')}</span>
                  </li>
                );
              })}
            </ul>
          </article>
        );
      })}
    </div>
  );
}

/**
 * Os arquivos do caso: uma ficha por tabela e, na outra aba, as ligações
 * entre elas — o mapa que o jogador precisa para montar um JOIN. Na coluna
 * rola por conta própria; "Ampliar" abre tudo em tela cheia.
 */
export function RecordsPanel(props: Props) {
  const [tab, setTab] = useState<Tab>('cards');
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!expanded) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setExpanded(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [expanded]);

  // Na visão ampliada, levar algo ao terminal também fecha a visão.
  const insertAndClose = (sql: string) => {
    setExpanded(false);
    props.onInsert(sql);
  };

  return (
    <section aria-label="Arquivos do caso" className="records-area">
      <TabStrip tab={tab} onTab={setTab} count={props.tables.length}>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setExpanded(true)}
          title="Ver fichas e conexões em tela cheia"
          style={{ padding: '3px 10px', fontSize: 'var(--fs-xs)', marginBottom: '3px' }}
        >
          <Maximize2 size={12} aria-hidden /> Ampliar
        </button>
      </TabStrip>

      <div className="paper tab-panel" role="tabpanel" style={{ padding: 'var(--sp-3)' }}>
        <RecordsBody {...props} tab={tab} />
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            key="records-expanded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setExpanded(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 250, background: 'rgba(5,4,3,0.78)', padding: 'clamp(8px, 3vw, 32px)', display: 'flex' }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Arquivos do caso em tela cheia"
              initial={{ y: 24 }}
              animate={{ y: 0 }}
              exit={{ y: 24 }}
              onClick={event => event.stopPropagation()}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, maxWidth: '1400px', margin: '0 auto', width: '100%' }}
            >
              <TabStrip tab={tab} onTab={setTab} count={props.tables.length}>
                <button type="button" className="btn btn-ghost" onClick={() => setExpanded(false)} aria-label="Fechar tela cheia" style={{ padding: '4px 10px', fontSize: 'var(--fs-xs)', marginBottom: '3px' }}>
                  <X size={13} aria-hidden /> Fechar
                </button>
              </TabStrip>
              <div className="paper tab-panel" role="tabpanel" style={{ padding: 'var(--sp-4)' }}>
                <RecordsBody {...props} onInsert={insertAndClose} tab={tab} wide />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
