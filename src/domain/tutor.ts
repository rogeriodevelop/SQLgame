import type { Difficulty } from './case';
import type { Relation, TableModel } from './schemaModel';
import { techniquesIn, type Technique } from './casefile';

/**
 * O instrutor do jogo: ensina SQL a partir do banco do caso aberto.
 *
 * Três frentes, todas puras e sem acesso à solução:
 * - lições passo a passo com exemplos montados sobre as tabelas reais do caso;
 * - leitura de uma consulta na ordem em que o banco de fato a executa;
 * - tradução das mensagens de erro do SQLite, com causa e correção.
 */

// ── Lições ─────────────────────────────────────────────────────────────────

export type Lesson = {
  id: string;
  title: string;
  /** Técnica que, usada numa consulta sem erro, marca a lição como praticada. */
  technique: Technique | 'columns' | 'like' | 'having';
  /** Instruções numeradas, na ordem em que o jogador deve seguir. */
  steps: string[];
  /** O porquê: o modelo mental que faz a técnica funcionar. */
  why: string;
  /** Consulta pronta, montada com nomes do caso atual. */
  example: string;
  /** Sugerida para o nível do caso atual. */
  recommended: boolean;
};

/** Um valor real do banco, usado para que o exemplo devolva linhas. */
export type SampleValues = Record<string, string | undefined>;

const LEVEL: Record<Difficulty, number> = { Tutorial: 0, Easy: 1, Medium: 2, Hard: 3, Expert: 4 };

function sqlString(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

function isKey(column: string): boolean {
  const c = column.toLowerCase();
  return c === 'id' || c.endsWith('_id');
}

function textColumn(table: TableModel): string | undefined {
  return (
    table.columns.find(c => /text|char|clob/i.test(c.type) && !isKey(c.name))?.name ??
    table.columns.find(c => !isKey(c.name))?.name
  );
}

/** Chave de SampleValues para uma coluna. */
export function sampleKey(table: string, column: string): string {
  return `${table}.${column}`;
}

/**
 * Colunas das quais vale buscar um valor de exemplo: uma coluna de texto por
 * tabela. A interface consulta o banco e devolve os valores em SampleValues.
 */
export function sampleTargets(tables: readonly TableModel[]): { table: string; column: string }[] {
  return tables
    .map(t => ({ table: t.name, column: textColumn(t) }))
    .filter((t): t is { table: string; column: string } => t.column !== undefined);
}

/**
 * Lições aplicáveis ao banco do caso. O cruzamento só aparece quando há
 * relação entre tabelas; agregação e subconsulta são recomendadas a partir
 * dos níveis em que os casos passam a exigi-las.
 */
export function lessonsFor(
  tables: readonly TableModel[],
  relations: readonly Relation[],
  difficulty: Difficulty,
  samples: SampleValues = {}
): Lesson[] {
  const main = tables[0];
  if (!main) return [];

  const level = LEVEL[difficulty];
  const text = textColumn(main) ?? main.columns[0]?.name ?? '*';
  const sample = samples[sampleKey(main.name, text)];
  const literal = sqlString(sample ?? 'valor');
  const fragment = sample ? sample.slice(0, Math.max(3, Math.ceil(sample.length / 2))) : 'parte';
  const shown = main.columns.slice(0, 2).map(c => c.name).join(', ') || '*';

  const lessons: Lesson[] = [
    {
      id: 'select',
      title: 'Ler uma tabela',
      technique: 'select',
      steps: [
        `Comece por SELECT: é o verbo que pede dados ao banco.`,
        `Escreva * para pedir todas as colunas.`,
        `Diga de onde vêm os dados com FROM ${main.name}.`,
        `Acrescente LIMIT 5 para ver só uma amostra e execute com Ctrl+Enter.`,
      ],
      why:
        'Uma tabela é uma lista de fichas: cada linha é um registro e cada coluna uma informação sobre ele. ' +
        'SELECT não altera nada, só lê — por isso é sempre seguro começar por ele. O LIMIT existe porque ' +
        'bancos reais têm milhões de linhas; olhar uma amostra primeiro mostra o formato dos dados antes de filtrar.',
      example: `SELECT *\nFROM ${main.name}\nLIMIT 5;`,
      recommended: true,
    },
    {
      id: 'columns',
      title: 'Escolher só as colunas úteis',
      technique: 'columns',
      steps: [
        `Troque o * pelos nomes das colunas, separados por vírgula: ${shown}.`,
        `Os nomes precisam ser idênticos aos do painel de arquivos.`,
        `Execute e compare com o resultado do SELECT *.`,
      ],
      why:
        'O resultado de uma consulta é uma tabela nova, montada na hora. Pedir só as colunas que importam ' +
        'deixa essa tabela menor e mais fácil de ler — e em casos grandes evita confundir colunas de mesmo nome.',
      example: `SELECT ${shown}\nFROM ${main.name};`,
      recommended: level <= 1,
    },
    {
      id: 'where',
      title: 'Filtrar com WHERE',
      technique: 'where',
      steps: [
        `Depois do FROM, escreva WHERE seguido de uma condição.`,
        `Compare uma coluna com um valor: ${text} = ${literal}.`,
        `Texto vai entre aspas simples; número vai sem aspas.`,
        `Para juntar condições use AND (as duas valem) ou OR (basta uma).`,
      ],
      why:
        'O banco passa por cada linha e testa a condição do WHERE: se der verdadeiro a linha fica, se der ' +
        'falso ela sai. É exatamente o que um investigador faz ao descartar quem não bate com a pista. ' +
        'A comparação com = é exata — "Ana" e "ana" são textos diferentes para o banco.',
      example: `SELECT *\nFROM ${main.name}\nWHERE ${text} = ${literal};`,
      recommended: true,
    },
    {
      id: 'like',
      title: 'Buscar parte de um texto com LIKE',
      technique: 'like',
      steps: [
        `Troque = por LIKE quando você só conhece parte do texto.`,
        `Use % como curinga: '%${fragment}%' aceita qualquer coisa antes e depois.`,
        `Execute e veja que mais linhas podem aparecer que com =.`,
      ],
      why:
        'LIKE compara por padrão em vez de igualdade: % significa "qualquer sequência de caracteres" e _ ' +
        'significa "exatamente um caractere". No SQLite o LIKE ignora maiúsculas em letras sem acento, o ' +
        'que ajuda quando a testemunha não lembra a grafia exata.',
      example: `SELECT *\nFROM ${main.name}\nWHERE ${text} LIKE ${sqlString(`%${fragment}%`)};`,
      recommended: level >= 1,
    },
  ];

  const relation = relations[0];
  if (relation) {
    const { tableA, colA, tableB, colB } = relation;
    const a = tableA.charAt(0).toLowerCase();
    const b = tableB.charAt(0).toLowerCase() === a ? `${tableB.charAt(0).toLowerCase()}2` : tableB.charAt(0).toLowerCase();
    lessons.push({
      id: 'join',
      title: 'Cruzar tabelas com JOIN',
      technique: 'join',
      steps: [
        `Encontre a coluna que liga as tabelas: ${tableA}.${colA} guarda o mesmo valor que ${tableB}.${colB}.`,
        `Escreva FROM ${tableA} ${a} — o "${a}" é um apelido para não repetir o nome inteiro.`,
        `Acrescente JOIN ${tableB} ${b} ON ${a}.${colA} = ${b}.${colB}.`,
        `Agora cada linha do resultado reúne as informações das duas tabelas.`,
      ],
      why:
        'Os bancos guardam cada assunto numa tabela separada para não repetir informação. Em vez de copiar o ' +
        'nome de uma pessoa em cada registro, a outra tabela guarda só o número de identificação dela (a ' +
        'chave estrangeira). O JOIN ... ON reconstrói a ligação: para cada linha de uma tabela, ele procura na ' +
        'outra as linhas em que as duas colunas têm o mesmo valor. Sem o ON, o banco combinaria todas as linhas ' +
        'com todas — o produto cartesiano, cheio de pares que não têm relação nenhuma.',
      example: `SELECT *\nFROM ${tableA} ${a}\nJOIN ${tableB} ${b} ON ${a}.${colA} = ${b}.${colB};`,
      recommended: level >= 1 || tables.length > 1,
    });
  }

  const groupCol = textColumn(tables[1] ?? main) ?? text;
  const groupTable = (tables[1] ?? main).name;
  lessons.push(
    {
      id: 'aggregate',
      title: 'Contar e somar com GROUP BY',
      technique: 'aggregate',
      steps: [
        `Escolha a coluna pela qual quer agrupar: ${groupCol}.`,
        `No SELECT, coloque essa coluna e uma função de agregação: COUNT(*) conta, SUM(coluna) soma.`,
        `Termine com GROUP BY ${groupCol}.`,
        `Ordene com ORDER BY 2 DESC para ver os maiores primeiro (2 é a segunda coluna do SELECT).`,
      ],
      why:
        'GROUP BY junta numa só linha todos os registros que têm o mesmo valor na coluna escolhida. A função ' +
        'de agregação resume cada grupo num número. É a forma de responder "quem aparece mais vezes" ou ' +
        '"quem movimentou mais dinheiro" — perguntas que nenhuma linha isolada responde.',
      example: `SELECT ${groupCol}, COUNT(*) AS total\nFROM ${groupTable}\nGROUP BY ${groupCol}\nORDER BY 2 DESC;`,
      recommended: level >= 2,
    },
    {
      id: 'having',
      title: 'Filtrar grupos com HAVING',
      technique: 'having',
      steps: [
        `Monte primeiro o GROUP BY da lição anterior.`,
        `Depois dele, escreva HAVING com uma condição sobre a agregação: HAVING COUNT(*) > 1.`,
        `Use WHERE para filtrar linhas antes de agrupar e HAVING para filtrar os grupos depois.`,
      ],
      why:
        'O WHERE roda antes do agrupamento, quando o COUNT ainda não existe — por isso WHERE COUNT(*) > 1 dá ' +
        'erro. O HAVING roda depois que os grupos já foram montados e contados, então pode testar o resultado ' +
        'da agregação.',
      example: `SELECT ${groupCol}, COUNT(*) AS total\nFROM ${groupTable}\nGROUP BY ${groupCol}\nHAVING COUNT(*) > 1;`,
      recommended: level >= 3,
    },
    {
      id: 'subquery',
      title: 'Consulta dentro de consulta',
      technique: 'subquery',
      steps: [
        `Escreva primeiro, sozinha, a consulta que descobre um valor intermediário e confira o resultado.`,
        `Coloque-a entre parênteses dentro do WHERE da consulta principal.`,
        `Use IN quando a subconsulta devolve vários valores e = quando devolve um só.`,
      ],
      why:
        'O banco resolve a consulta de dentro primeiro e usa o resultado como se fosse uma lista digitada à ' +
        'mão. Isso permite perguntas em duas etapas — "quem esteve no local onde o objeto sumiu?" — sem ' +
        'precisar anotar o valor intermediário.',
      example: `SELECT *\nFROM ${main.name}\nWHERE ${main.columns[0]?.name ?? 'id'} IN (\n  SELECT ${main.columns[0]?.name ?? 'id'} FROM ${main.name} LIMIT 3\n);`,
      recommended: level >= 3,
    }
  );

  return lessons;
}

/** Se uma consulta executada sem erro pratica a lição. */
export function practices(lesson: Lesson, sql: string): boolean {
  const code = sql.toUpperCase();
  switch (lesson.technique) {
    case 'columns':
      return /\bSELECT\s+(?!\*)(?!COUNT)/.test(code) && !/\bSELECT\s+\*/.test(code);
    case 'like':
      return /\bLIKE\b/.test(code);
    case 'having':
      return /\bHAVING\b/.test(code);
    default:
      return techniquesIn(sql).includes(lesson.technique);
  }
}

// ── Leitura da consulta ────────────────────────────────────────────────────

export type ClauseKind =
  | 'FROM'
  | 'JOIN'
  | 'WHERE'
  | 'GROUP BY'
  | 'HAVING'
  | 'SELECT'
  | 'ORDER BY'
  | 'LIMIT';

export type ClauseStep = { kind: ClauseKind; text: string; meaning: string };

/** Ordem lógica de execução — diferente da ordem em que se escreve. */
const EXECUTION_ORDER: ClauseKind[] = ['FROM', 'JOIN', 'WHERE', 'GROUP BY', 'HAVING', 'SELECT', 'ORDER BY', 'LIMIT'];

const MEANINGS: Record<ClauseKind, string> = {
  FROM: 'O banco começa pelo FROM: abre a tabela e considera todas as linhas dela.',
  JOIN: 'Cada JOIN cola as linhas de outra tabela às linhas atuais, só onde a condição do ON for verdadeira.',
  WHERE: 'O WHERE testa cada linha que sobrou e descarta as que não atendem à condição.',
  'GROUP BY': 'O GROUP BY junta numa linha só todos os registros com o mesmo valor nas colunas indicadas.',
  HAVING: 'O HAVING descarta grupos inteiros, depois que as contagens e somas já foram calculadas.',
  SELECT: 'Só agora o SELECT escolhe quais colunas aparecem — por isso um apelido criado aqui não vale no WHERE.',
  'ORDER BY': 'O ORDER BY ordena o resultado pronto; sem ele a ordem das linhas não é garantida.',
  LIMIT: 'Por último o LIMIT corta o resultado na quantidade pedida.',
};

const CLAUSE_PATTERN =
  /\b(SELECT|FROM|(?:NATURAL\s+)?(?:LEFT\s+(?:OUTER\s+)?|INNER\s+|CROSS\s+)?JOIN|WHERE|GROUP\s+BY|HAVING|ORDER\s+BY|LIMIT)\b/iy;

/**
 * Divide uma consulta SELECT em cláusulas de nível superior (ignorando
 * subconsultas, textos e comentários) e as devolve na ordem de execução.
 * Devolve lista vazia para o que não for SELECT simples ou para UNIONs.
 */
export function explainQuery(sql: string): ClauseStep[] {
  const code = sql.replace(/--[^\n]*/g, ' ').trim().replace(/;+\s*$/, '');
  if (!/^\s*SELECT\b/i.test(code)) return [];

  const marks: { kind: ClauseKind; start: number; bodyStart: number }[] = [];
  let depth = 0;
  let quote: string | null = null;

  for (let i = 0; i < code.length; i++) {
    const ch = code[i];
    if (quote) {
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === "'" || ch === '"') {
      quote = ch;
      continue;
    }
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (depth !== 0) continue;
    if (i > 0 && /\w/.test(code[i - 1])) continue;

    if (/^UNION\b|^INTERSECT\b|^EXCEPT\b/i.test(code.slice(i, i + 10))) return [];

    CLAUSE_PATTERN.lastIndex = i;
    const match = CLAUSE_PATTERN.exec(code);
    if (!match) continue;
    const word = match[1].toUpperCase().replace(/\s+/g, ' ');
    const kind: ClauseKind = word.endsWith('JOIN') ? 'JOIN' : (word as ClauseKind);
    marks.push({ kind, start: i, bodyStart: i + match[0].length });
    i += match[0].length - 1;
  }

  const steps = marks.map((mark, index) => {
    const end = marks[index + 1]?.start ?? code.length;
    return {
      kind: mark.kind,
      text: code.slice(mark.start, end).replace(/\s+/g, ' ').trim(),
      meaning: MEANINGS[mark.kind],
    };
  });

  return steps
    .map((step, position) => ({ step, position }))
    .sort(
      (x, y) =>
        EXECUTION_ORDER.indexOf(x.step.kind) - EXECUTION_ORDER.indexOf(y.step.kind) ||
        x.position - y.position
    )
    .map(({ step }) => step);
}

/** Dicas para quando a consulta roda mas não devolve nada. */
export function adviceForEmptyResult(sql: string): string[] {
  const code = sql.toUpperCase();
  const advice: string[] = [];

  if (/=\s*'/.test(sql)) {
    advice.push(
      'Comparações com = exigem o texto idêntico, com as mesmas maiúsculas, acentos e espaços. ' +
        "Confira a grafia num SELECT sem filtro ou troque por LIKE '%parte%'."
    );
  }
  if (/"[^"]*"/.test(sql)) {
    advice.push(
      'Aspas duplas indicam nome de coluna no SQL padrão; para texto use aspas simples. ' +
        'O SQLite às vezes aceita as duplas, mas se existir uma coluna com esse nome ele compara com a coluna.'
    );
  }
  if ((code.match(/\bAND\b/g) ?? []).length >= 2) {
    advice.push(
      'Cada AND estreita o filtro: todas as condições precisam valer na mesma linha. ' +
        'Tire uma condição por vez para descobrir qual está eliminando tudo.'
    );
  }
  if (/\bJOIN\b/.test(code)) {
    advice.push(
      'Um JOIN só mantém linhas que têm par na outra tabela. Se a condição do ON liga as colunas erradas, ' +
        'nenhuma linha casa. Confira no painel de conexões qual coluna aponta para qual.'
    );
  }
  if (advice.length === 0) {
    advice.push(
      'Nenhuma linha atendeu a todas as condições. Rode a consulta sem o WHERE para ver os dados ' +
        'disponíveis e reintroduza os filtros um por um.'
    );
  }
  return advice;
}

// ── Erros ──────────────────────────────────────────────────────────────────

export type ErrorExplanation = {
  title: string;
  /** Por que o banco recusou. */
  why: string;
  /** O que fazer agora. */
  fix: string;
};

/** Distância de edição, para sugerir o nome que o jogador provavelmente quis. */
function editDistance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let previous = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const current = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = current;
    }
  }
  return row[b.length];
}

function closest(name: string, options: readonly string[]): string | undefined {
  const target = name.toLowerCase();
  let best: { option: string; distance: number } | undefined;
  for (const option of options) {
    const distance = editDistance(target, option.toLowerCase());
    if (!best || distance < best.distance) best = { option, distance };
  }
  return best && best.distance <= Math.max(2, Math.floor(target.length / 3)) ? best.option : undefined;
}

/** Traduz a mensagem do SQLite numa explicação com causa e correção. */
export function explainError(message: string, tables: readonly TableModel[]): ErrorExplanation {
  const tableNames = tables.map(t => t.name);
  const allColumns = [...new Set(tables.flatMap(t => t.columns.map(c => c.name)))];

  let m = message.match(/no such table:\s*([\w.]+)/i);
  if (m) {
    const guess = closest(m[1], tableNames);
    return {
      title: `A tabela "${m[1]}" não existe neste caso`,
      why:
        'O banco só conhece as tabelas criadas para este caso. Um nome com uma letra diferente, no singular ' +
        'em vez do plural ou sem o sublinhado já é outra tabela para ele.',
      fix: guess
        ? `Você provavelmente quis dizer "${guess}". Tabelas disponíveis: ${tableNames.join(', ')}.`
        : `Tabelas disponíveis: ${tableNames.join(', ')}.`,
    };
  }

  m = message.match(/no such column:\s*([\w.]+)/i);
  if (m) {
    const [prefix, column] = m[1].includes('.') ? m[1].split('.') : [undefined, m[1]];
    const owner = prefix ? tables.find(t => t.name.toLowerCase() === prefix.toLowerCase()) : undefined;
    const guess = closest(column, owner ? owner.columns.map(c => c.name) : allColumns);
    const holders = tables.filter(t => t.columns.some(c => c.name.toLowerCase() === column.toLowerCase()));
    return {
      title: `A coluna "${m[1]}" não foi encontrada`,
      why: prefix
        ? `Antes do ponto vem a tabela (ou o apelido dela) e depois a coluna. O banco não achou "${column}" em "${prefix}" — ` +
          'ou o apelido não foi declarado no FROM/JOIN, ou a coluna pertence a outra tabela.'
        : 'A coluna precisa existir em alguma tabela citada no FROM ou nos JOINs da consulta. Também acontece ' +
          'quando um texto é escrito entre aspas duplas: o SQL entende aspas duplas como nome de coluna.',
      fix: holders.length
        ? `"${column}" existe em: ${holders.map(t => t.name).join(', ')}. Inclua essa tabela na consulta ou use o apelido certo.`
        : guess
          ? `Você provavelmente quis dizer "${guess}". Se era um texto, use aspas simples: '${column}'.`
          : `Se era um texto, use aspas simples: '${column}'. Confira os nomes no painel de arquivos.`,
    };
  }

  m = message.match(/ambiguous column name:\s*([\w.]+)/i);
  if (m) {
    const holders = tables.filter(t => t.columns.some(c => c.name.toLowerCase() === m![1].toLowerCase()));
    return {
      title: `A coluna "${m[1]}" é ambígua`,
      why:
        'Depois de um JOIN, duas tabelas da consulta têm uma coluna com esse mesmo nome e o banco não sabe de ' +
        'qual delas você está falando.',
      fix: `Escreva tabela.coluna (ou apelido.coluna)${holders.length ? `, por exemplo ${holders[0].name}.${m[1]}` : ''}.`,
    };
  }

  if (/misuse of aggregate/i.test(message)) {
    return {
      title: 'Função de agregação no lugar errado',
      why:
        'COUNT, SUM, AVG, MIN e MAX só existem depois que as linhas são agrupadas. O WHERE roda antes do ' +
        'agrupamento, então ainda não há o que contar.',
      fix: 'Mova a condição com a agregação para um HAVING, depois do GROUP BY.',
    };
  }

  if (/HAVING clause on a non-aggregate|a GROUP BY clause is required before HAVING/i.test(message)) {
    return {
      title: 'HAVING sem GROUP BY',
      why: 'HAVING filtra grupos. Sem GROUP BY não há grupos para filtrar.',
      fix: 'Acrescente GROUP BY antes do HAVING ou use WHERE para filtrar linhas comuns.',
    };
  }

  if (/incomplete input|unrecognized token/i.test(message)) {
    return {
      title: 'A consulta ficou incompleta',
      why:
        'O banco chegou ao fim do texto esperando mais alguma coisa: uma aspa que abriu e não fechou, um ' +
        'parêntese sem par ou uma cláusula sem conteúdo (como WHERE sem condição).',
      fix: "Confira se toda aspa simples tem par ('texto') e se cada ( tem seu ).",
    };
  }

  m = message.match(/near "([^"]*)": syntax error/i);
  if (m) {
    const near = m[1];
    const keyword = /^(FROM|WHERE|JOIN|ON|GROUP|ORDER|HAVING|LIMIT|SELECT|AND|OR)$/i.test(near);
    return {
      title: `Erro de sintaxe perto de "${near}"`,
      why: keyword
        ? `O banco não esperava "${near.toUpperCase()}" nesse ponto. As cláusulas têm ordem fixa: ` +
          'SELECT → FROM → JOIN → WHERE → GROUP BY → HAVING → ORDER BY → LIMIT. Também acontece quando ' +
          'falta algo logo antes, como uma vírgula entre colunas ou a condição depois de WHERE.'
        : `O banco leu até "${near}" e não conseguiu encaixar isso na gramática do SQL. Costuma ser uma vírgula ` +
          'sobrando ou faltando, texto sem aspas simples ou uma palavra-chave escrita errado.',
      fix: 'Leia o trecho logo antes do ponto indicado. Colunas separadas por vírgula, texto entre aspas simples.',
    };
  }

  if (/no such function:\s*(\w+)/i.test(message)) {
    const fn = message.match(/no such function:\s*(\w+)/i)![1];
    return {
      title: `A função ${fn} não existe no SQLite`,
      why: 'Cada banco tem seu conjunto de funções. Este jogo usa SQLite, que não tem algumas funções de outros bancos.',
      fix: 'Funções comuns aqui: COUNT, SUM, AVG, MIN, MAX, LOWER, UPPER, LENGTH, SUBSTR, REPLACE, ROUND.',
    };
  }

  return {
    title: 'O banco recusou a consulta',
    why: `Mensagem original do SQLite: ${message}`,
    fix: 'Simplifique a consulta até ela funcionar e acrescente as partes de volta uma por vez.',
  };
}
