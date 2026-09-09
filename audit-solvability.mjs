/**
 * Audita se a solução de cada caso é alcançável por SQL.
 *
 * O gate anti-chute (App.tsx) só libera a acusação quando alguma célula
 * retornada por uma query do jogador bate com `case.solution`. Se a solução
 * não existir como valor no banco do caso, o caso fica insolúvel.
 *
 * Uso: node audit-solvability.mjs
 */
import initSqlJs from 'sql.js';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const normalize = (s) =>
  String(s)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ');

// Coleta schemas declarados como const no topo do arquivo (ex: `const erpSchema = \`...\`;`),
// usados por vários casos via `schema: erpSchema`.
function collectSharedSchemas(src) {
  const map = new Map();
  const re = /const\s+(\w+)\s*=\s*`([\s\S]*?)`\s*;/g;
  let m;
  while ((m = re.exec(src)) !== null) map.set(m[1], m[2]);
  return map;
}

// Extrai os casos dos arquivos .ts sem precisar compilar TypeScript:
// cada caso é um objeto literal com id/title/schema/solution.
function parseCases(src) {
  const shared = collectSharedSchemas(src);
  const cases = [];
  const idRe = /id:\s*'([^']+)'/g;
  let m;
  const positions = [];
  while ((m = idRe.exec(src)) !== null) positions.push({ id: m[1], at: m.index });

  for (let i = 0; i < positions.length; i++) {
    const start = positions[i].at;
    const end = i + 1 < positions.length ? positions[i + 1].at : src.length;
    const block = src.slice(start, end);

    const title = block.match(/title:\s*'((?:[^'\\]|\\.)*)'/)?.[1] ?? '(sem título)';
    const solution = block.match(/solution:\s*'((?:[^'\\]|\\.)*)'/)?.[1];
    // `schema` pode ser um template literal inline ou uma referência a const compartilhada
    const schema =
      block.match(/schema:\s*`([\s\S]*?)`/)?.[1] ??
      shared.get(block.match(/schema:\s*(\w+)\s*,/)?.[1]);

    if (solution && schema) {
      cases.push({ id: positions[i].id, title, solution, schema });
    } else {
      cases.push({ id: positions[i].id, title, solution, schema, incomplete: true });
    }
  }
  return cases;
}

const dir = join(process.cwd(), 'src', 'data', 'cases');
const files = readdirSync(dir).filter((f) => f.endsWith('.ts'));

const all = [];
for (const f of files) {
  const src = readFileSync(join(dir, f), 'utf8');
  for (const c of parseCases(src)) all.push({ ...c, file: f });
}

const SQL = await initSqlJs();

const broken = [];
const failedSchemas = [];

for (const c of all) {
  if (c.incomplete) {
    broken.push({ ...c, reason: 'não consegui extrair schema/solution do arquivo' });
    continue;
  }

  let db;
  try {
    db = new SQL.Database();
    db.run(c.schema);
  } catch (e) {
    failedSchemas.push({ ...c, reason: `schema não executa: ${e.message}` });
    db?.close();
    continue;
  }

  // Varre todas as colunas de todas as tabelas procurando a solução
  const target = normalize(c.solution);
  let found = false;
  try {
    const tabs = db.exec("SELECT name FROM sqlite_master WHERE type='table'");
    const names = tabs.length ? tabs[0].values.map((r) => r[0]) : [];
    for (const t of names) {
      const res = db.exec(`SELECT * FROM "${t}"`);
      if (!res.length) continue;
      for (const row of res[0].values) {
        for (const cell of row) {
          if (cell !== null && normalize(cell) === target) {
            found = true;
            break;
          }
        }
        if (found) break;
      }
      if (found) break;
    }
  } catch (e) {
    failedSchemas.push({ ...c, reason: `varredura falhou: ${e.message}` });
  }
  db.close();

  if (!found) {
    broken.push({ ...c, reason: `solução '${c.solution}' não existe como valor em nenhuma tabela` });
  }
}

console.log(`Casos analisados: ${all.length}`);
console.log(`Schemas que não executam: ${failedSchemas.length}`);
console.log(`Soluções inalcançáveis por SQL: ${broken.length}`);

if (failedSchemas.length) {
  console.log('\n--- SCHEMAS QUEBRADOS ---');
  for (const b of failedSchemas) console.log(`  [${b.file}] ${b.id} "${b.title}": ${b.reason}`);
}

if (broken.length) {
  console.log('\n--- SOLUÇÕES INALCANÇÁVEIS ---');
  for (const b of broken) console.log(`  [${b.file}] ${b.id} "${b.title}": ${b.reason}`);
}

process.exit(broken.length || failedSchemas.length ? 1 : 0);
