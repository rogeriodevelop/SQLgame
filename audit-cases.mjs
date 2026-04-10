/**
 * audit-cases.mjs
 * Carrega todos os schemas dos casos e valida cada solução
 * executando a query esperada via sql.js (Node) e comparando com solution.
 *
 * Uso: node audit-cases.mjs
 */

import initSqlJs from 'sql.js';
import { readFileSync } from 'fs';

// ─── helpers ────────────────────────────────────────────────────────────────
const normalize = (s) =>
  String(s ?? '').trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ');

/**
 * Extrai o array de casos de um arquivo .ts sem importar TypeScript.
 * Lê o arquivo como texto, remove tipos TS e usa eval.
 */
function loadCases(filePath) {
  let src = readFileSync(filePath, 'utf-8');
  // Remove linhas de import
  src = src.replace(/^import .+;?\s*/gm, '');
  // Remove anotações de tipo TypeScript simples: `: Type`, `<Type>`, `as Type`
  src = src.replace(/:\s*(Case\[\]|Case|string|number|boolean|null|any)/g, '');
  src = src.replace(/<[A-Za-z\[\]]+>/g, '');
  // Transforma export const X = [...] em apenas [...]
  src = src.replace(/export\s+const\s+\w+\s*=\s*/g, 'return ');
  // Remove trailing export se houver
  src = src.replace(/^export\s+/gm, '');
  try {
    return new Function(src)();
  } catch (e) {
    console.error(`  [LOAD ERROR] ${filePath}: ${e.message}`);
    return [];
  }
}

/**
 * Dada uma query SQL e um db aberto, executa e retorna o primeiro valor da primeira linha.
 */
function execFirst(db, sql) {
  const clean = sql.replace(/--[^\n]*/g, '').trim().replace(/;+$/, '');
  try {
    const stmt = db.prepare(clean);
    const cols = stmt.getColumnNames();
    const rows = [];
    while (stmt.step()) rows.push(stmt.get());
    stmt.free();
    if (rows.length === 0) return { cols, rows, first: null };
    return { cols, rows, first: rows[0][0] };
  } catch (e) {
    return { cols: [], rows: [], first: null, error: e.message };
  }
}

// ─── queries de validação por caso ─────────────────────────────────────────
// Mapeamento: id do caso → query SQL que deve retornar a solução na col 0, row 0
const validationQueries = {
  // Easy
  easy1:  `SELECT f.nome FROM alas a JOIN funcionarios f ON a.id = f.ala_id JOIN acessos ac ON f.id = ac.func_id WHERE a.nome_ala = 'Ala Leste' AND ac.log_hora = '23:00'`,
  easy2:  `SELECT g.nome FROM mesas m JOIN garcons g ON g.id = m.garcom_id JOIN clientes c ON c.mesa_id = m.id WHERE m.setor = 'VIP' AND c.reclamacao = 'Gosto de amêndoas'`,
  easy3:  `SELECT g.nome FROM detentos d JOIN blocos b ON b.id = d.bloco_id JOIN guardas g ON g.id = b.guarda_id WHERE b.setor = 'Isolamento' AND d.status = 'Fugitivo'`,
  easy4:  `SELECT e.leitor FROM emprestimos e JOIN livros l ON l.id = e.livro_id JOIN secoes s ON s.id = l.secao_id WHERE s.nome = 'Ocultismo' AND e.hora = '15:00'`,
  easy5:  `SELECT g.nome FROM acessos a JOIN cofres c ON c.id = a.cofre_id JOIN gerentes g ON g.id = c.gerente_id WHERE a.autorizacao = 'Falsa' AND a.hora = '22:00'`,
  easy6:  `SELECT e.nome FROM empregados e JOIN departamentos d ON d.id = e.departamento_id JOIN computadores c ON c.emp_id = e.id WHERE d.nome_dep = 'Marketing' AND c.virus_detectado = 'Sim'`,
  easy7:  `SELECT d.nome FROM multas m JOIN carros c ON c.id = m.carro_id JOIN donos d ON d.id = c.dono_id WHERE m.local = 'Ponte Sul' AND c.modelo = 'Camaro'`,
  easy8:  `SELECT cap.nome FROM cargas c JOIN navios n ON n.id = c.navio_id JOIN capitaes cap ON cap.id = n.capitao_id WHERE c.conteudo = 'Ouro' AND c.status = 'Extraviado'`,
  easy9:  `SELECT m.nome FROM cirurgias ci JOIN salas s ON s.id = ci.sala_id JOIN medicos m ON m.id = ci.medico_id WHERE ci.tipo = 'Transplante' AND s.equipamento_com_defeito = 'Sim'`,
  easy10: `SELECT cr.nome FROM apostas a JOIN mesas m ON m.id = a.mesa_id JOIN crupiers cr ON cr.id = m.crupier_id WHERE a.jogador = 'Fantasma 04'`,
  // Medium
  medium1: `SELECT m.nome FROM laboratorios l JOIN farmacos f ON l.id = f.lab_id JOIN lotes lo ON f.id = lo.farmaco_id JOIN entregas e ON lo.id = e.lote_id JOIN motoristas m ON m.id = e.motorista_id WHERE l.nome = 'BioGen' AND e.status = 'Desaparecido'`,
  medium2: `SELECT p.nome FROM voos v JOIN embarques em ON em.voo_id = v.id JOIN passageiros p ON p.id = em.pass_id WHERE v.origem = 'Bogota' AND v.destino = 'Miami' AND em.portao = 'Gate 7'`,
  medium3: `SELECT i.nome FROM ordens o JOIN investidores i ON i.id = o.inv_id JOIN ativos at ON at.id = o.ativo_id JOIN auditorias au ON au.ordem_id = o.id WHERE o.tipo = 'Compra' AND at.risco = 'Alto' AND au.status = 'Pendente'`,
  medium4: `SELECT seg.nome FROM obras o JOIN galerias g ON g.id = o.gal_id JOIN apolices ap ON ap.obra_id = o.id JOIN seguradoras seg ON seg.id = ap.seg_id WHERE g.setor = 'Renascentista' AND ap.valor_cobertura > 40`,
  medium5: `SELECT f.nome FROM acessos_biometricos ab JOIN funcionarios f ON f.id = ab.func_id JOIN projetos p ON p.id = f.proj_id WHERE ab.status_log = 'Violado' AND p.nivel_sigilo = 'Ultra Secreto' AND p.dep_id = 11`,
  medium6: `SELECT cl.nome FROM clientes cl JOIN contas co ON co.id = cl.conta_id JOIN agencias ag ON ag.id = co.ag_id JOIN bancos b ON b.id = ag.banco_id JOIN transacoes t ON t.conta_id = co.id WHERE b.nome = 'Swiss Bank' AND ag.cidade = 'Zurique' AND t.tipo = 'Entrada' GROUP BY cl.nome HAVING SUM(t.valor) > 1000000`,
  medium7: `SELECT s.nome FROM bases ba JOIN pelotoes pe ON pe.base_id = ba.id JOIN soldados s ON s.pelotao_id = pe.id JOIN saques_armas sa ON sa.soldado_id = s.id JOIN armamento ar ON ar.id = sa.arma_id WHERE ba.nome = 'Base Delta' AND ar.tipo = 'C4' ORDER BY sa.data ASC LIMIT 1`,
  medium8: `SELECT m.nome FROM pacientes p JOIN obitos o ON o.paciente_id = p.id JOIN laudos l ON l.obito_id = o.id JOIN medicos m ON m.id = l.medico_id JOIN alas a ON a.id = p.ala_id WHERE o.causa = 'Asfixia' AND a.nome_ala = 'Ala Psiquiatrica' AND a.hosp_id = 1`,
  medium9: `SELECT ar.nome FROM apostas ap JOIN partidas pt ON pt.id = ap.partida_id JOIN arbitros ar ON ar.id = pt.arbitro_id JOIN ligas li ON li.id = pt.liga_id WHERE li.nome = 'Série D' AND ap.classificacao = 'Manipulada'`,
  medium10:`SELECT co.nome FROM imoveis im JOIN contratos ct ON ct.imovel_id = im.id JOIN corretores co ON co.id = ct.corretor_id WHERE im.classificacao = 'Fantasma' AND im.bairro = 'Zona Leste'`,
  // Hard/Expert (all share same erpSchema)
  hard1:   `SELECT f.nome FROM funcionarios f JOIN vendas v ON v.func_id = f.id JOIN pagamentos p ON p.venda_id = v.id WHERE p.metodo = 'Cripto' AND v.status_auditoria = 'Fraude'`,
  hard2:   `SELECT pr.nome FROM produtos pr JOIN fornecedores fo ON fo.id = pr.forn_id WHERE fo.pais = 'Panama' AND pr.categoria = 'Eletronicos' LIMIT 1`,
  hard3:   `SELECT cl.nome FROM clientes cl JOIN vendas v ON v.cliente_id = cl.id WHERE cl.status = 'Bloqueado' AND v.status_auditoria = 'Fraude' LIMIT 1`,
  hard4:   `SELECT f.nome FROM filiais fi JOIN funcionarios f ON f.filial_id = fi.id WHERE fi.cidade = 'Ilhas Cayman' AND f.cargo = 'Gerente'`,
  hard5:   `SELECT pr.nome FROM itens_venda iv JOIN vendas v ON v.id = iv.venda_id JOIN funcionarios f ON f.id = v.func_id JOIN filiais fi ON fi.id = f.filial_id JOIN produtos pr ON pr.id = iv.produto_id WHERE iv.desconto_aplicado = 99 AND v.status_auditoria = 'Fraude' AND fi.status = 'Oculta' AND fi.cidade = 'Ilhas Cayman'`,
  hard6:   `SELECT m.nome FROM motoristas m JOIN veiculos v ON v.id = m.veiculo_id JOIN entregas e ON e.mot_id = m.id WHERE e.status_entrega = 'Desviada' GROUP BY m.nome HAVING COUNT(*) > 1`,
  hard7:   `SELECT m.nome FROM motoristas m JOIN entregas e ON e.mot_id = m.id WHERE e.endereco = 'Porto Sul' GROUP BY m.nome ORDER BY COUNT(*) DESC LIMIT 1`,
  hard8:   `SELECT cl.nome FROM clientes cl JOIN vendas v ON v.cliente_id = cl.id JOIN itens_venda iv ON iv.venda_id = v.id JOIN produtos pr ON pr.id = iv.produto_id JOIN funcionarios f ON f.id = v.func_id JOIN filiais fi ON fi.id = f.filial_id WHERE pr.nome = 'Ouro em Barra' AND fi.status = 'Oculta'`,
  hard9:   `SELECT cl.nome FROM contas_receber cr JOIN pagamentos p ON p.id = cr.pagto_id JOIN vendas v ON v.id = p.venda_id JOIN clientes cl ON cl.id = v.cliente_id WHERE cr.status = 'Lavado' ORDER BY p.valor_pago DESC LIMIT 1`,
  hard10:  `SELECT cl.nome FROM clientes cl JOIN vendas v ON v.cliente_id = cl.id JOIN itens_venda iv ON iv.venda_id = v.id JOIN produtos pr ON pr.id = iv.produto_id JOIN entregas e ON e.venda_id = v.id JOIN motoristas m ON m.id = e.mot_id JOIN pagamentos p ON p.venda_id = v.id JOIN contas_receber cr ON cr.pagto_id = p.id WHERE m.nome = 'Jack Fuga' AND pr.nome = 'Ouro em Barra' AND p.metodo = 'Cripto' AND cr.status = 'Lavado'`,
};

// ─── main ────────────────────────────────────────────────────────────────────
const SQL = await initSqlJs();

const files = {
  easy:   './src/data/cases/easy.ts',
  medium: './src/data/cases/medium.ts',
  hard:   './src/data/cases/hard.ts',
};

let allCases = [];
for (const [_level, file] of Object.entries(files)) {
  const loaded = loadCases(file);
  if (Array.isArray(loaded)) allCases = allCases.concat(loaded);
}

console.log(`\n${'='.repeat(72)}`);
console.log(` AUDITORIA DE CONSISTÊNCIA — SQL NOIR (${allCases.length} casos)`);
console.log(`${'='.repeat(72)}\n`);

let passed = 0, failed = 0, skipped = 0;

for (const c of allCases) {
  const query = validationQueries[c.id];
  if (!query) {
    console.log(`⬜ [${c.id.padEnd(10)}] ${c.title} — sem query de validação`);
    skipped++;
    continue;
  }

  // Monta banco em memória com o schema do caso
  const db = new SQL.Database();
  try {
    db.run(c.schema);
  } catch (e) {
    console.log(`🔴 [${c.id.padEnd(10)}] ${c.title}`);
    console.log(`   SCHEMA ERROR: ${e.message}\n`);
    failed++;
    db.close();
    continue;
  }

  const { first, rows, error } = execFirst(db, query);
  db.close();

  const normalizedFirst = normalize(first);
  const normalizedSolution = normalize(c.solution);
  const ok = normalizedFirst === normalizedSolution;

  if (ok) {
    console.log(`✅ [${c.id.padEnd(10)}] ${c.title}`);
    console.log(`   Solução: "${c.solution}" — query retornou: "${first}"`);
    passed++;
  } else {
    console.log(`❌ [${c.id.padEnd(10)}] ${c.title}`);
    console.log(`   ESPERADO : "${c.solution}"`);
    console.log(`   RETORNOU : "${first ?? 'nenhum resultado'}"${error ? ` (ERRO: ${error})` : ''}`);
    if (rows.length > 1) {
      console.log(`   Outros resultados: ${rows.slice(0,5).map(r=>r[0]).join(', ')}`);
    }
    failed++;
  }
  console.log('');
}

console.log(`${'─'.repeat(72)}`);
console.log(` RESULTADO: ${passed} ✅ corretos | ${failed} ❌ com erro | ${skipped} ⬜ sem query`);
console.log(`${'─'.repeat(72)}\n`);

if (failed > 0) process.exit(1);
