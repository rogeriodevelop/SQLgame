/**
 * Confere que todo asset referenciado pelo bundle existe de fato no dist.
 *
 * Motivo: o jogo carrega o WebAssembly do sql.js por caminho montado em
 * tempo de execução. Se esse caminho apontar para um arquivo ausente, o
 * servidor de SPA responde `index.html` com status 200 e o emscripten tenta
 * compilar HTML como WASM, abortando com "expected magic word". Nada disso
 * aparece no tsc, no eslint nem nos testes de unidade — só quando alguém
 * abre o jogo no navegador.
 *
 * Uso: node scripts/verify-build.mjs   (depois de `npm run build`)
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const DIST = resolve(process.cwd(), 'dist');

if (!existsSync(DIST)) {
  console.error('dist/ nao existe. Rode `npm run build` antes.');
  process.exit(1);
}

/** Lista recursiva de arquivos do dist, com caminho relativo à raiz servida. */
function walk(dir, base = '') {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const rel = base ? `${base}/${entry}` : entry;
    if (statSync(full).isDirectory()) out.push(...walk(full, rel));
    else out.push(rel);
  }
  return out;
}

const files = walk(DIST);
const present = new Set(files.map(f => `/${f}`));

// Procura referências a binários e mídias dentro do JS e do CSS gerados.
const ASSET_REF = /["'`](\/[A-Za-z0-9._/-]+\.(?:wasm|webp|png|jpg|svg|woff2?))["'`]/g;

const problems = [];

for (const file of files.filter(f => /\.(js|css)$/.test(f))) {
  const source = readFileSync(join(DIST, file), 'utf8');
  for (const [, ref] of source.matchAll(ASSET_REF)) {
    if (!present.has(ref)) problems.push({ file, ref });
  }
}

// O WASM do sql.js é o caso crítico: sem ele o jogo trava na tela de carregamento.
const hasWasm = files.some(f => f.endsWith('.wasm'));
if (!hasWasm) {
  problems.push({ file: '(dist)', ref: 'nenhum .wasm foi emitido — o banco nao vai carregar' });
}

if (problems.length) {
  console.error('Assets referenciados que nao existem no dist:\n');
  for (const p of problems) console.error(`  ${p.file}  ->  ${p.ref}`);
  console.error('\nO servidor de SPA responderia index.html para esses caminhos.');
  process.exit(1);
}

console.log(`Build verificado: ${files.length} arquivos, ${hasWasm ? 'WASM presente' : 'sem WASM'}, nenhuma referencia quebrada.`);
