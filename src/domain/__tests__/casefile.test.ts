import { describe, it, expect } from 'vitest';
import {
  appendLog,
  cellText,
  evidenceId,
  isSuspect,
  leadsFor,
  leadsProgress,
  LOG_LIMIT,
  EVIDENCE_LIMIT,
  SUSPECT_LIMIT,
  tablesIn,
  techniquesIn,
  toggleEvidence,
  toggleSuspect,
  type Evidence,
  type LogEntry,
} from '../casefile';
import { inferRelations, parseSchema } from '../schemaModel';

const tables = parseSchema(`
  CREATE TABLE alas (id INTEGER PRIMARY KEY, nome_ala TEXT);
  CREATE TABLE funcionarios (id INTEGER PRIMARY KEY, nome TEXT, ala_id INTEGER);
  CREATE TABLE acessos (id INTEGER PRIMARY KEY, func_id INTEGER, log_hora TEXT);
`);

function entry(sql: string, error: string | null = null, id = 1): LogEntry {
  return {
    id,
    sql,
    rowCount: error ? null : 1,
    error,
    at: 0,
    techniques: techniquesIn(sql),
    tables: tablesIn(sql, tables),
  };
}

describe('techniquesIn', () => {
  it('reconhece filtro, cruzamento, agregação, ordenação e subconsulta', () => {
    const sql = `SELECT a.nome, COUNT(*) FROM funcionarios a JOIN acessos b ON b.func_id = a.id
                 WHERE a.id IN (SELECT id FROM alas) GROUP BY a.nome ORDER BY 2`;
    expect(techniquesIn(sql)).toEqual(['select', 'where', 'join', 'aggregate', 'order', 'subquery']);
  });

  it('ignora palavras-chave dentro de textos e comentários', () => {
    expect(techniquesIn("SELECT * FROM t WHERE nome = 'Join Silva' -- ORDER BY")).toEqual([
      'select',
      'where',
    ]);
  });

  it('conta junção implícita por vírgula como cruzamento', () => {
    expect(techniquesIn('SELECT * FROM alas a, funcionarios f WHERE f.ala_id = a.id')).toContain('join');
  });
});

describe('tablesIn', () => {
  it('encontra só as tabelas do caso citadas', () => {
    expect(tablesIn('select * from FUNCIONARIOS join acessos on 1=1', tables)).toEqual([
      'funcionarios',
      'acessos',
    ]);
  });

  it('não confunde prefixo com nome de tabela', () => {
    expect(tablesIn('SELECT * FROM alas_extra', tables)).toEqual([]);
  });
});

describe('appendLog', () => {
  it('põe o mais recente primeiro e corta no limite', () => {
    let log: LogEntry[] = [];
    for (let i = 0; i < LOG_LIMIT + 5; i++) log = appendLog(log, { ...entry('SELECT 1'), id: i });
    expect(log).toHaveLength(LOG_LIMIT);
    expect(log[0].id).toBe(LOG_LIMIT + 4);
  });
});

describe('provas', () => {
  const make = (value: string): Evidence => {
    const columns = ['nome'];
    const values = [value];
    return { id: evidenceId(columns, values), columns, values, sql: 'SELECT nome FROM t' };
  };

  it('alterna: fixar a mesma linha duas vezes a remove', () => {
    const once = toggleEvidence([], make('Ana'));
    expect(once).toHaveLength(1);
    expect(toggleEvidence(once, make('Ana'))).toHaveLength(0);
  });

  it('não passa do limite do quadro', () => {
    let board: Evidence[] = [];
    for (let i = 0; i < EVIDENCE_LIMIT + 3; i++) board = toggleEvidence(board, make(`p${i}`));
    expect(board).toHaveLength(EVIDENCE_LIMIT);
  });

  it('mostra NULL e blobs de forma legível', () => {
    expect(cellText(null)).toBe('NULL');
    expect(cellText(42)).toBe('42');
    expect(cellText(new Uint8Array(3))).toBe('<blob 3 bytes>');
  });
});

describe('suspeitos', () => {
  it('trata variações de caixa e acento como a mesma pessoa', () => {
    const list = toggleSuspect([], 'Ana Reis');
    expect(isSuspect(list, 'ana  reis')).toBe(true);
    expect(toggleSuspect(list, 'ANA REIS')).toEqual([]);
  });

  it('ignora nome vazio e respeita o limite', () => {
    expect(toggleSuspect([], '   ')).toEqual([]);
    let list: string[] = [];
    for (let i = 0; i < SUSPECT_LIMIT + 2; i++) list = toggleSuspect(list, `S${i}`);
    expect(list).toHaveLength(SUSPECT_LIMIT);
  });
});

describe('leadsFor', () => {
  it('começa com tudo pendente', () => {
    const leads = leadsFor(tables, [], 0, 0);
    expect(leads.every(l => !l.done)).toBe(true);
    expect(leadsProgress(leads)).toBe(0);
  });

  it('só conta tabelas de consultas que rodaram sem erro', () => {
    const log = [
      entry('SELECT * FROM alas', null, 1),
      entry('SELECT * FROM funcionarios', 'no such column', 2),
    ];
    const files = leadsFor(tables, log, 0, 0).find(l => l.id === 'files')!;
    expect(files.done).toBe(false);
    expect(files.detail).toBe('1/3 tabelas consultadas');
  });

  it('fecha todas as linhas quando o trabalho foi feito', () => {
    const log = [
      entry('SELECT * FROM alas', null, 1),
      entry(
        'SELECT f.nome FROM funcionarios f JOIN acessos a ON a.func_id = f.id WHERE a.log_hora = "23:00"',
        null,
        2
      ),
    ];
    const leads = leadsFor(tables, log, 1, 1);
    expect(leads.every(l => l.done)).toBe(true);
    expect(leadsProgress(leads)).toBe(100);
  });

  it('não exige JOIN em banco de uma tabela só', () => {
    const single = parseSchema('CREATE TABLE agentes (codigo TEXT, nome TEXT);');
    expect(leadsFor(single, [], 0, 0).some(l => l.id === 'join')).toBe(false);
  });
});

describe('inferRelations', () => {
  it('liga id às chaves estrangeiras pelo nome', () => {
    const relations = inferRelations(tables);
    expect(relations).toContainEqual({ tableA: 'alas', colA: 'id', tableB: 'funcionarios', colB: 'ala_id' });
    expect(relations).toContainEqual({ tableA: 'funcionarios', colA: 'id', tableB: 'acessos', colB: 'func_id' });
  });

  it('liga colunas *_id homônimas', () => {
    const relations = inferRelations(
      parseSchema('CREATE TABLE a (cliente_id INTEGER); CREATE TABLE b (cliente_id INTEGER);')
    );
    expect(relations).toEqual([{ tableA: 'a', colA: 'cliente_id', tableB: 'b', colB: 'cliente_id' }]);
  });
});
