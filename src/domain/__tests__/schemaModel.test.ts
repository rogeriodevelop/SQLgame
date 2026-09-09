import { describe, it, expect } from 'vitest';
import { parseSchema, toCompletionSchema } from '../schemaModel';

describe('parseSchema', () => {
  it('extrai tabelas e colunas', () => {
    const tables = parseSchema(`
      CREATE TABLE agentes (codigo TEXT, nome TEXT);
      CREATE TABLE missoes (id INTEGER PRIMARY KEY, titulo TEXT);
    `);
    expect(tables.map(t => t.name)).toEqual(['agentes', 'missoes']);
    expect(tables[0].columns.map(c => c.name)).toEqual(['codigo', 'nome']);
  });

  it('ignora INSERTs e comentários', () => {
    const tables = parseSchema(`
      CREATE TABLE t (a TEXT);
      -- comentario
      INSERT INTO t VALUES ('x');
    `);
    expect(tables).toHaveLength(1);
  });

  it('não quebra em tipos com vírgula dentro de parênteses', () => {
    const tables = parseSchema('CREATE TABLE p (id INTEGER, valor DECIMAL(10, 2), nome TEXT);');
    expect(tables[0].columns.map(c => c.name)).toEqual(['id', 'valor', 'nome']);
  });

  it('descarta restrições de tabela em vez de tratá-las como coluna', () => {
    const tables = parseSchema(
      'CREATE TABLE v (a INTEGER, b INTEGER, PRIMARY KEY (a, b), FOREIGN KEY (a) REFERENCES t(id));'
    );
    expect(tables[0].columns.map(c => c.name)).toEqual(['a', 'b']);
  });

  it('devolve lista vazia para schema sem CREATE TABLE', () => {
    expect(parseSchema('SELECT 1;')).toEqual([]);
  });
});

describe('toCompletionSchema', () => {
  it('mapeia tabela para nomes de coluna', () => {
    const tables = parseSchema('CREATE TABLE t (a TEXT, b INTEGER);');
    expect(toCompletionSchema(tables)).toEqual({ t: ['a', 'b'] });
  });
});
