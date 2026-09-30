/** Uma coluna de tabela, como declarada no CREATE TABLE do caso. */
export type ColumnModel = { name: string; type: string };

/** Uma tabela do banco do caso. */
export type TableModel = { name: string; columns: ColumnModel[] };

/**
 * Lê o schema SQL de um caso e devolve o modelo de tabelas/colunas.
 *
 * Três componentes precisavam disso (visualizador, diagrama e agora o
 * autocomplete do editor) e cada um reimplementava o parse com uma regex
 * ligeiramente diferente. Um único parser evita que divirjam.
 */
export function parseSchema(schema: string): TableModel[] {
  return schema
    .split(';')
    .map(statement => statement.trim())
    .filter(statement => /^create\s+table/i.test(statement))
    .map(parseCreateTable)
    .filter((table): table is TableModel => table !== null);
}

function parseCreateTable(statement: string): TableModel | null {
  const match = statement.match(/CREATE\s+TABLE\s+(\w+)\s*\(([\s\S]+)\)/i);
  if (!match) return null;

  const [, name, body] = match;
  const columns = splitTopLevel(body)
    .map(part => part.trim())
    .filter(Boolean)
    // Descarta restrições de tabela (PRIMARY KEY (a, b), FOREIGN KEY ...)
    .filter(part => !/^(primary|foreign|unique|check|constraint)\b/i.test(part))
    .map(part => {
      const [columnName, ...rest] = part.split(/\s+/);
      return { name: columnName, type: rest.join(' ') || 'TEXT' };
    });

  return { name, columns };
}

/**
 * Divide por vírgulas ignorando as que estão dentro de parênteses, para não
 * quebrar declarações como `valor DECIMAL(10, 2)` no meio.
 */
function splitTopLevel(body: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';

  for (const char of body) {
    if (char === '(') depth++;
    if (char === ')') depth--;
    if (char === ',' && depth === 0) {
      parts.push(current);
      current = '';
      continue;
    }
    current += char;
  }
  parts.push(current);
  return parts;
}

/** Ligação provável entre duas colunas de tabelas diferentes. */
export type Relation = { tableA: string; colA: string; tableB: string; colB: string };

/**
 * Se `column` (ex.: `ala_id`, `func_id`, `garcom_id`) parece chave
 * estrangeira para `table` (ex.: `alas`, `funcionarios`, `garcons`).
 * Os schemas dos casos não declaram FOREIGN KEY, então a ligação é deduzida
 * pelo nome, com as pluralizações do português que aparecem nos casos.
 */
function isForeignKeyOf(column: string, table: string): boolean {
  const col = column.toLowerCase();
  const tab = table.toLowerCase();
  if (!col.endsWith('_id')) return false;

  const prefix = col.slice(0, -3);
  if (!prefix) return false;
  return (
    tab.startsWith(prefix) ||
    prefix.startsWith(tab) ||
    tab.replace(/s$/, '') === prefix ||
    tab.replace(/ns$/, 'm') === prefix ||
    prefix.replace(/m$/, 'ns') === tab ||
    (prefix.length >= 3 && tab.startsWith(prefix.slice(0, 3)))
  );
}

/**
 * Relações prováveis entre as tabelas: mesma coluna `*_id` nas duas pontas,
 * ou `id` de uma tabela casando com a chave estrangeira da outra.
 */
export function inferRelations(tables: readonly TableModel[]): Relation[] {
  const relations: Relation[] = [];

  for (let i = 0; i < tables.length; i++) {
    for (let j = i + 1; j < tables.length; j++) {
      const x = tables[i];
      const y = tables[j];
      for (const colX of x.columns) {
        for (const colY of y.columns) {
          const sameKey = colX.name === colY.name && colX.name.toLowerCase().endsWith('_id');
          const xToY = colX.name.toLowerCase() === 'id' && isForeignKeyOf(colY.name, x.name);
          const yToX = colY.name.toLowerCase() === 'id' && isForeignKeyOf(colX.name, y.name);
          if (sameKey || xToY || yToX) {
            relations.push({ tableA: x.name, colA: colX.name, tableB: y.name, colB: colY.name });
          }
        }
      }
    }
  }

  return relations;
}

/** Estrutura consumida pelo autocomplete do CodeMirror: tabela -> colunas. */
export function toCompletionSchema(tables: TableModel[]): Record<string, string[]> {
  return Object.fromEntries(tables.map(t => [t.name, t.columns.map(c => c.name)]));
}
