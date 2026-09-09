/**
 * Teste de fumaça: joga o primeiro caso de ponta a ponta num navegador real,
 * contra o build de produção servido como SPA (igual à Vercel).
 *
 * Existe porque a falha mais cara deste projeto até agora não aparecia em
 * tsc, eslint, testes de unidade nem na verificação estática do build: o
 * caminho do WebAssembly era montado em tempo de execução, apontava para um
 * arquivo ausente, o servidor de SPA devolvia index.html com status 200 e o
 * emscripten abortava com "expected magic word". Só um navegador pega isso.
 *
 * Uso:
 *   npm run build && npm run smoke
 *
 * Requer o Chromium do Playwright:
 *   npx playwright install chromium
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, resolve } from 'node:path';
import { chromium } from 'playwright-core';

const DIST = resolve(process.cwd(), 'dist');
const PORT = 4199;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.wasm': 'application/wasm',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
};

/** Servidor estático com fallback de SPA — reproduz o comportamento da Vercel. */
function serve() {
  return new Promise(resolveServer => {
    const server = createServer(async (req, res) => {
      const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      let file = join(DIST, path === '/' ? 'index.html' : path);
      try {
        if (!(await stat(file)).isFile()) throw new Error('dir');
      } catch {
        file = join(DIST, 'index.html'); // fallback de SPA, de propósito
      }
      const body = await readFile(file);
      res.writeHead(200, { 'Content-Type': MIME[extname(file)] ?? 'application/octet-stream' });
      res.end(body);
    });
    server.listen(PORT, () => resolveServer(server));
  });
}

const checks = [];
const record = (name, ok, detail = '') => {
  checks.push({ name, ok, detail });
  console.log(`${ok ? '  ok  ' : ' FALHA'} ${name}${detail ? ` :: ${detail}` : ''}`);
};

const server = await serve();
const browser = await chromium.launch({ channel: 'chromium-headless-shell' });
const page = await browser.newPage();
// Sem isso, um passo que não encontra o elemento estoura como stack trace do
// Playwright em vez de virar uma linha de falha legível.
page.setDefaultTimeout(8000);

/** Executa um passo; se ele estourar, vira falha registrada em vez de exceção. */
async function step(name, action) {
  try {
    const detail = await action();
    record(name, true, typeof detail === 'string' ? detail : '');
    return true;
  } catch (error) {
    record(name, false, String(error.message).split('\n')[0]);
    return false;
  }
}

const pageErrors = [];
page.on('pageerror', error => pageErrors.push(error.message));
page.on('requestfailed', request =>
  pageErrors.push(`${request.url()} -> ${request.failure()?.errorText}`)
);

const bodyText = () => page.evaluate(() => document.body.innerText.replace(/\s+/g, ' '));

try {
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'load', timeout: 30000 });
  await page.getByRole('button', { name: /treinamento/i }).first().click();
  await page.waitForTimeout(4000);

  const opening = await bodyText();
  const dbUp = !/CONECTANDO|Falha ao montar/i.test(opening);
  record('banco do caso carrega (WASM instancia)', dbUp, dbUp ? '' : opening.slice(0, 110));
  record('esquema do caso e exibido', /agentes/i.test(opening));

  // Sem o banco não há jogo; seguir daqui só produziria timeouts em cascata.
  if (dbUp) {
    // Acusar sem prova precisa ser barrado — é a regra central do jogo.
    await step('acusacao sem prova e barrada', async () => {
      await page.locator('#answer-input').fill('Ana Reis');
      await page.getByRole('button', { name: /enviar dossi/i }).click();
      await page.waitForTimeout(600);
      if (!/sem provas/i.test(await bodyText())) throw new Error('acusacao passou sem prova');
    });

    await step('consulta executa e retorna linhas', async () => {
      await page.locator('.cm-content').click();
      await page.keyboard.type('SELECT * FROM agentes;');
      await page.keyboard.press('Control+Enter');
      await page.waitForTimeout(1200);
      if (!/Ana Reis/.test(await bodyText())) throw new Error('resultado nao apareceu');
    });

    await step('caso fecha quando ha prova e pontua', async () => {
      await page.locator('#answer-input').fill('Ana Reis');
      await page.getByRole('button', { name: /enviar dossi/i }).click();
      await page.waitForTimeout(1000);
      const final = await bodyText();
      if (!/Caso resolvido/i.test(final)) throw new Error('caso nao fechou');
      if (!/pts/i.test(final)) throw new Error('pontuacao nao exibida');
    });
  }

  record('sem erros de pagina ou rede', pageErrors.length === 0, pageErrors.slice(0, 2).join(' | '));
} catch (error) {
  record('execucao do teste', false, String(error.message).split('\n')[0]);
} finally {
  await browser.close();
  server.close();
}

const failed = checks.filter(c => !c.ok);
console.log(`\n${checks.length - failed.length}/${checks.length} verificacoes passaram.`);
process.exit(failed.length ? 1 : 0);
