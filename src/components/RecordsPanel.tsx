import { useState } from 'react';
import { Copy, Check, KeyRound, Link2, CornerDownLeft } from 'lucide-react';
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

/** Para onde aponta cada coluna que é chave estrangeira. */
function foreignTargets(table: string, relations: readonly Relation[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const r of relations) {
    if (r.tableA === table && r.colA.toLowerCase() !== 'id') map.set(r.colA, `${r.tableB}.${r.colB}`);
    if (r.tableB === table && r.colB.toLowerCase() !== 'id') map.set(r.colB, `${r.tableA}.${r.colA}`);
  }
  return map;
}

/**
 * Os arquivos do caso: uma ficha por tabela e, na outra aba, as ligações
 * entre elas — o mapa que o jogador precisa para montar um JOIN.
 */
export function RecordsPanel({ tables, relations, onInsert }: Props) {
  const [tab, setTab] = useState<Tab>('cards');

  return (
    <section aria-label="Arquivos do caso" style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div className="tabs" role="tablist">
        <button type="button" role="tab" className="tab" aria-selected={tab === 'cards'} onClick={() => setTab('cards')}>
          Fichas <span className="tab-badge" style={{ background: 'var(--ink-soft)' }}>{tables.length}</span>
        </button>
        <button type="button" role="tab" className="tab" aria-selected={tab === 'links'} onClick={() => setTab('links')}>
          <Link2 size={12} aria-hidden /> Conexões
        </button>
      </div>

      <div className="paper tab-panel" role="tabpanel" style={{ padding: 'var(--sp-3)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
        {tab === 'cards' &&
          tables.map((table, index) => {
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
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', minWidth: 0 }}>
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

        {tab === 'links' && (
          <>
            <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--ink-soft)', lineHeight: 1.55 }}>
              Uma tabela não repete os dados da outra: guarda só o número de identificação. Estas são as ligações
              prováveis entre os arquivos — cada uma é a condição de um <strong>JOIN … ON</strong>.
            </p>
            {relations.length === 0 && (
              <p style={{ fontFamily: 'var(--font-type)', color: 'var(--ink-faint)' }}>
                Nenhuma ligação por chave neste caso. Consulte as tabelas separadamente.
              </p>
            )}
            {relations.map(r => {
              const snippet = `SELECT *\nFROM ${r.tableA}\nJOIN ${r.tableB} ON ${r.tableA}.${r.colA} = ${r.tableB}.${r.colB};`;
              return (
                <div
                  key={`${r.tableA}.${r.colA}-${r.tableB}.${r.colB}`}
                  style={{ borderLeft: '3px solid var(--red)', padding: '4px 0 4px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--sp-2)' }}
                >
                  <code style={{ fontSize: 'var(--fs-xs)', lineHeight: 1.6 }}>
                    {r.tableA}.<strong>{r.colA}</strong>
                    <span style={{ color: 'var(--red)' }}> ═ </span>
                    {r.tableB}.<strong>{r.colB}</strong>
                  </code>
                  <button type="button" className="btn btn-ink" onClick={() => onInsert(snippet)} style={{ padding: '2px 8px', fontSize: 'var(--fs-xs)' }}>
                    Montar JOIN
                  </button>
                </div>
              );
            })}
          </>
        )}
      </div>
    </section>
  );
}
