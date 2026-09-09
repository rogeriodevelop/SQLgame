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

/** Estrutura consumida pelo autocomplete do CodeMirror: tabela -> colunas. */
export function toCompletionSchema(tables: TableModel[]): Record<string, string[]> {
  return Object.fromEntries(tables.map(t => [t.name, t.columns.map(c => c.name)]));
}
