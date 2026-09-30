import { describe, it, expect } from 'vitest';
import initSqlJs from 'sql.js';
import { inferRelations, parseSchema } from '../schemaModel';
import {
  adviceForEmptyResult,
  explainError,
  explainQuery,
  lessonsFor,
  practices,
  sampleKey,
  sampleTargets,
} from '../tutor';
import { listCases } from '../../data/caseRepository';

const schema = `
  CREATE TABLE alas (id INTEGER PRIMARY KEY, nome_ala TEXT);
  CREATE TABLE funcionarios (id INTEGER PRIMARY KEY, nome TEXT, ala_id INTEGER);
  INSERT INTO alas VALUES (1, 'Ala Leste');
  INSERT INTO funcionarios VALUES (10, 'Carlos', 1);
`;
const tables = parseSchema(schema);
const relations = inferRelations(tables);

describe('lessonsFor', () => {
  it('monta os exemplos com nomes reais do caso', () => {
    const lessons = lessonsFor(tables, relations, 'Easy');
    const join = lessons.find(l => l.id === 'join')!;
    expect(join.example).toContain('JOIN funcionarios');
    expect(join.example).toContain('ala_id');
    expect(lessons.find(l => l.id === 'select')!.example).toContain('FROM alas');
  });

  it('usa um valor real do banco quando fornecido', () => {
    const where = lessonsFor(tables, relations, 'Easy', {
      [sampleKey('alas', 'nome_ala')]: "Ala d'Oeste",
    }).find(l => l.id === 'where')!;
    expect(where.example).toContain("'Ala d''Oeste'");
  });

  it('só oferece JOIN quando há relação entre tabelas', () => {
    const single = parseSchema('CREATE TABLE agentes (codigo TEXT, nome TEXT);');
    expect(lessonsFor(single, [], 'Tutorial').some(l => l.id === 'join')).toBe(false);
  });

  it('recomenda agregação só a partir do nível médio', () => {
    const rec = (d: 'Easy' | 'Medium') => lessonsFor(tables, relations, d).find(l => l.id === 'aggregate')!.recommended;
    expect(rec('Easy')).toBe(false);
    expect(rec('Medium')).toBe(true);
  });

  it('escolhe colunas de texto como alvo de amostra', () => {
    expect(sampleTargets(tables)).toEqual([
      { table: 'alas', column: 'nome_ala' },
      { table: 'funcionarios', column: 'nome' },
    ]);
  });

  it('todo exemplo de todos os casos executa no banco do caso', async () => {
    const SQL = await initSqlJs();
    const failures: string[] = [];
    for (const c of listCases()) {
      const db = new SQL.Database();
      db.run(c.schema);
      const t = parseSchema(c.schema);
      for (const lesson of lessonsFor(t, inferRelations(t), c.difficulty)) {
        try {
          db.exec(lesson.example);
        } catch (error) {
          failures.push(`${c.id}/${lesson.id}: ${(error as Error).message}`);
        }
      }
      db.close();
    }
    expect(failures).toEqual([]);
  });
});

describe('practices', () => {
  const lessons = lessonsFor(tables, relations, 'Hard');
  const byId = (id: string) => lessons.find(l => l.id === id)!;

  it('reconhece cada técnica', () => {
    expect(practices(byId('select'), 'SELECT * FROM alas')).toBe(true);
    expect(practices(byId('columns'), 'SELECT nome FROM funcionarios')).toBe(true);
    expect(practices(byId('columns'), 'SELECT * FROM funcionarios')).toBe(false);
    expect(practices(byId('like'), "SELECT * FROM alas WHERE nome_ala LIKE '%L%'")).toBe(true);
    expect(practices(byId('having'), 'SELECT ala_id FROM funcionarios GROUP BY 1 HAVING COUNT(*) > 0')).toBe(true);
  });
});

describe('explainQuery', () => {
  it('reordena as cláusulas na ordem de execução', () => {
    const steps = explainQuery(
      "SELECT f.nome, COUNT(*) FROM funcionarios f JOIN alas a ON a.id = f.ala_id WHERE a.nome_ala = 'Ala Leste' GROUP BY f.nome HAVING COUNT(*) > 0 ORDER BY 2 DESC LIMIT 3;"
    );
    expect(steps.map(s => s.kind)).toEqual(['FROM', 'JOIN', 'WHERE', 'GROUP BY', 'HAVING', 'SELECT', 'ORDER BY', 'LIMIT']);
    expect(steps[1].text).toBe('JOIN alas a ON a.id = f.ala_id');
  });

  it('não se confunde com palavras-chave dentro de subconsultas e textos', () => {
    const steps = explainQuery("SELECT * FROM t WHERE x IN (SELECT y FROM u WHERE z = 'from') ORDER BY x");
    expect(steps.map(s => s.kind)).toEqual(['FROM', 'WHERE', 'SELECT', 'ORDER BY']);
  });

  it('reconhece LEFT JOIN como cruzamento', () => {
    expect(explainQuery('SELECT * FROM a LEFT JOIN b ON a.id = b.a_id').map(s => s.kind)).toEqual([
      'FROM',
      'JOIN',
      'SELECT',
    ]);
  });

  it('ignora o que não é SELECT e consultas com UNION', () => {
    expect(explainQuery('DELETE FROM alas')).toEqual([]);
    expect(explainQuery('SELECT 1 UNION SELECT 2')).toEqual([]);
  });
});

describe('adviceForEmptyResult', () => {
  it('alerta sobre igualdade exata de texto', () => {
    expect(adviceForEmptyResult("SELECT * FROM t WHERE nome = 'ana'")[0]).toMatch(/idêntico/);
  });

  it('alerta sobre aspas duplas', () => {
    expect(adviceForEmptyResult('SELECT * FROM t WHERE nome = "Ana"').join(' ')).toMatch(/aspas simples/);
  });

  it('sempre devolve ao menos um conselho', () => {
    expect(adviceForEmptyResult('SELECT * FROM t WHERE id > 99').length).toBeGreaterThan(0);
  });
});

describe('explainError', () => {
  it('sugere a tabela certa para erro de digitação', () => {
    const e = explainError('no such table: funcionario', tables);
    expect(e.fix).toContain('"funcionarios"');
  });

  it('diz em que tabela a coluna existe', () => {
    expect(explainError('no such column: nome_ala', tables).fix).toContain('alas');
  });

  it('explica apelido não declarado', () => {
    expect(explainError('no such column: x.nome', tables).why).toMatch(/apelido/);
  });

  it('explica coluna ambígua com exemplo qualificado', () => {
    expect(explainError('ambiguous column name: id', tables).fix).toMatch(/alas\.id/);
  });

  it('explica agregação no WHERE e HAVING sem GROUP BY', () => {
    expect(explainError('misuse of aggregate function COUNT()', tables).fix).toMatch(/HAVING/);
    expect(explainError('HAVING clause on a non-aggregate query', tables).fix).toMatch(/GROUP BY/);
  });

  it('explica consulta incompleta e aspa sem par', () => {
    expect(explainError('incomplete input', tables).title).toMatch(/incompleta/);
    expect(explainError(`unrecognized token: "'x"`, tables).title).toMatch(/incompleta/);
  });

  it('explica erro de sintaxe perto de palavra-chave', () => {
    expect(explainError('near "FROM": syntax error', tables).why).toMatch(/ordem fixa/);
  });

  it('nunca falha em mensagem desconhecida', () => {
    expect(explainError('disk I/O error', tables).why).toContain('disk I/O error');
  });
});
