import type { Case } from '../../domain/case';

export const mediumCases: Case[] = [
  // ─────────────────────────────────────────────────────────────────
  // CASO 11: O Cartel de Medicamentos (Medium)
  // Solução: Beto Rota
  // Caminho: farmacos -> lotes -> entregas -> motoristas
  // Distratores: outro motorista fez entregas, outro lote de fentanil foi entregue
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'medium1',
    title: 'O Cartel de Medicamentos',
    difficulty: 'Medium',
    description:
      'Um lote de "Fentanil" fabricado pela "BioGen" nunca chegou ao destino — status "Desaparecido". Vários motoristas fazem múltiplas entregas, inclusive de Fentanil de outros laboratórios. Você precisa rastrear o lote específico pelo laboratório correto.',
    objective:
      'Descubra o NOME do motorista que estava entregando o lote de Fentanil fabricado pela "BioGen" cujo status é "Desaparecido".',
    schema: `
      CREATE TABLE laboratorios (id INTEGER PRIMARY KEY, nome TEXT, pais TEXT);
      CREATE TABLE farmacos (id INTEGER PRIMARY KEY, lab_id INTEGER, substancia TEXT);
      CREATE TABLE lotes (id INTEGER PRIMARY KEY, farmaco_id INTEGER, numero_serie TEXT);
      CREATE TABLE distribuidoras (id INTEGER PRIMARY KEY, nome TEXT, estado TEXT);
      CREATE TABLE motoristas (id INTEGER PRIMARY KEY, dist_id INTEGER, nome TEXT);
      CREATE TABLE entregas (id INTEGER PRIMARY KEY, lote_id INTEGER, motorista_id INTEGER, status TEXT);

      INSERT INTO laboratorios VALUES (1, 'Vitamax',  'Brasil');
      INSERT INTO laboratorios VALUES (2, 'BioGen',   'Colômbia');
      INSERT INTO laboratorios VALUES (3, 'FarmaPlus','México');

      INSERT INTO farmacos VALUES (10, 1, 'Paracetamol');
      INSERT INTO farmacos VALUES (11, 2, 'Fentanil');
      INSERT INTO farmacos VALUES (12, 3, 'Fentanil');
      INSERT INTO farmacos VALUES (13, 1, 'Morfina');
      INSERT INTO farmacos VALUES (14, 3, 'Ketamina');

      INSERT INTO lotes VALUES (100, 10, 'A1');
      INSERT INTO lotes VALUES (101, 11, 'B9');
      INSERT INTO lotes VALUES (102, 11, 'B10');
      INSERT INTO lotes VALUES (103, 12, 'M7');
      INSERT INTO lotes VALUES (104, 13, 'C2');
      INSERT INTO lotes VALUES (105, 14, 'K5');

      INSERT INTO distribuidoras VALUES (5, 'LogExpress', 'SP');
      INSERT INTO distribuidoras VALUES (6, 'RapidLog',   'RJ');

      INSERT INTO motoristas VALUES (50, 5, 'João Silva');
      INSERT INTO motoristas VALUES (51, 5, 'Beto Rota');
      INSERT INTO motoristas VALUES (52, 6, 'Carlos Via');
      INSERT INTO motoristas VALUES (53, 6, 'Marina Fast');

      INSERT INTO entregas VALUES (1, 100, 50, 'Entregue');
      INSERT INTO entregas VALUES (2, 101, 51, 'Entregue');
      INSERT INTO entregas VALUES (3, 102, 51, 'Desaparecido');
      INSERT INTO entregas VALUES (4, 103, 52, 'Desaparecido');
      INSERT INTO entregas VALUES (5, 104, 50, 'Entregue');
      INSERT INTO entregas VALUES (6, 105, 53, 'Desaparecido');
    `,
    solution: 'Beto Rota',
    hint:
      'Três entregas "Desaparecidas"! Mas apenas a de Fentanil da "BioGen" é o alvo. Trace: lab_id=2 -> farmaco_id -> lote -> entrega -> motorista.'
  },

  // ─────────────────────────────────────────────────────────────────
  // CASO 12: Tráfico Aéreo (Medium)
  // Solução: Pablo E.
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'medium2',
    title: 'Tráfico Aéreo',
    difficulty: 'Medium',
    description:
      'Uma mala suspeita embarcou num voo partindo de "Bogota" com destino a "Miami". Vários passageiros e vários voos da mesma companhia saíram de Bogota naquele dia, mas apenas UM embarcou no portão "Gate 7" nesse voo específico.',
    objective:
      'Descubra o NOME do passageiro que embarcou em um voo de "Bogota" para "Miami" pelo portão "Gate 7".',
    schema: `
      CREATE TABLE companhias (id INTEGER PRIMARY KEY, nome TEXT, pais TEXT);
      CREATE TABLE aeronaves (id INTEGER PRIMARY KEY, comp_id INTEGER, modelo TEXT, capacidade INTEGER);
      CREATE TABLE voos (id INTEGER PRIMARY KEY, aeronave_id INTEGER, origem TEXT, destino TEXT, codigo TEXT);
      CREATE TABLE passageiros (id INTEGER PRIMARY KEY, nome TEXT, passaporte TEXT, nacionalidade TEXT);
      CREATE TABLE embarques (id INTEGER PRIMARY KEY, voo_id INTEGER, pass_id INTEGER, portao TEXT);

      INSERT INTO companhias VALUES (1, 'Air Global',  'EUA');
      INSERT INTO companhias VALUES (2, 'Cartel Air',  'Colômbia');

      INSERT INTO aeronaves VALUES (10, 1, 'Boeing 737',  180);
      INSERT INTO aeronaves VALUES (11, 2, 'Cessna 172',  4);
      INSERT INTO aeronaves VALUES (12, 1, 'Airbus A320', 200);

      INSERT INTO voos VALUES (100, 10, 'Bogota',      'Miami',      'AG-101');
      INSERT INTO voos VALUES (101, 11, 'Bogota',      'Mexico',     'CA-002');
      INSERT INTO voos VALUES (102, 12, 'Bogota',      'Miami',      'AG-305');
      INSERT INTO voos VALUES (103, 10, 'Lima',        'Miami',      'AG-210');
      INSERT INTO voos VALUES (104, 11, 'Bogota',      'Havana',     'CA-009');

      INSERT INTO passageiros VALUES (50, 'Pablo E.',     'PASS1', 'Colombiano');
      INSERT INTO passageiros VALUES (51, 'Ricardo T.',   'PASS2', 'Mexicano');
      INSERT INTO passageiros VALUES (52, 'Ana Neves',    'PASS3', 'Brasileiro');
      INSERT INTO passageiros VALUES (53, 'Hector Lima',  'PASS4', 'Colombiano');
      INSERT INTO passageiros VALUES (54, 'John Smith',   'PASS5', 'Americano');

      INSERT INTO embarques VALUES (1, 100, 50, 'Gate 7');
      INSERT INTO embarques VALUES (2, 101, 51, 'Gate 3');
      INSERT INTO embarques VALUES (3, 102, 52, 'Gate 4');
      INSERT INTO embarques VALUES (4, 103, 53, 'Gate 12');
      INSERT INTO embarques VALUES (5, 100, 54, 'Gate 2');
      INSERT INTO embarques VALUES (6, 104, 51, 'Gate 7');
    `,
    solution: 'Pablo E.',
    hint:
      'Gate 7 aparece em 3 voos diferentes! Você precisa filtrar origem = "Bogota" AND destino = "Miami" AND portao = "Gate 7". Itere voos, embarques e passageiros.'
  },

  // ─────────────────────────────────────────────────────────────────
  // CASO 13: Fraude na Bolsa (Medium)
  // Solução: Gordon Gekko
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'medium3',
    title: 'Fraude na Bolsa',
    difficulty: 'Medium',
    description:
      'A CVM detectou ordens de "Compra" em ativos de risco "Alto" com auditoria "Pendente". Vários investidores fizeram compras de ativos diferentes. Você precisa cruzar: tipo da ordem + risco do ativo + status da auditoria.',
    objective:
      'Encontre o NOME do investidor que realizou uma ordem do tipo "Compra" em ativo de risco "Alto" cuja auditoria está "Pendente".',
    schema: `
      CREATE TABLE corretoras (id INTEGER PRIMARY KEY, nome TEXT);
      CREATE TABLE investidores (id INTEGER PRIMARY KEY, corr_id INTEGER, nome TEXT, perfil TEXT);
      CREATE TABLE ativos (id INTEGER PRIMARY KEY, codigo_ticker TEXT, risco TEXT, setor TEXT);
      CREATE TABLE ordens (id INTEGER PRIMARY KEY, inv_id INTEGER, ativo_id INTEGER, tipo TEXT, quantidade INTEGER);
      CREATE TABLE auditorias (id INTEGER PRIMARY KEY, ordem_id INTEGER, status TEXT, data_revisao TEXT);

      INSERT INTO corretoras VALUES (1, 'Rico');
      INSERT INTO corretoras VALUES (2, 'XP');

      INSERT INTO investidores VALUES (10, 1, 'Gordon Gekko', 'Agressivo');
      INSERT INTO investidores VALUES (11, 1, 'Bob M.',        'Conservador');
      INSERT INTO investidores VALUES (12, 2, 'Mary Lynch',    'Agressivo');
      INSERT INTO investidores VALUES (13, 2, 'Ted Weston',    'Moderado');

      INSERT INTO ativos VALUES (50, 'PETR4', 'Baixo',  'Energia');
      INSERT INTO ativos VALUES (51, 'XPT00', 'Alto',   'Derivativos');
      INSERT INTO ativos VALUES (52, 'CRYP1', 'Alto',   'Cripto');
      INSERT INTO ativos VALUES (53, 'SELIC', 'Baixo',  'Renda Fixa');

      INSERT INTO ordens VALUES (100, 10, 51, 'Compra', 5000);
      INSERT INTO ordens VALUES (101, 11, 50, 'Compra', 1000);
      INSERT INTO ordens VALUES (102, 12, 52, 'Compra', 2000);
      INSERT INTO ordens VALUES (103, 13, 51, 'Venda',  3000);
      INSERT INTO ordens VALUES (104, 10, 53, 'Compra', 500);

      INSERT INTO auditorias VALUES (1, 100, 'Pendente',  '2025-03-01');
      INSERT INTO auditorias VALUES (2, 101, 'Aprovada',  '2025-03-01');
      INSERT INTO auditorias VALUES (3, 102, 'Aprovada',  '2025-03-02');
      INSERT INTO auditorias VALUES (4, 103, 'Pendente',  '2025-03-03');
      INSERT INTO auditorias VALUES (5, 104, 'Pendente',  '2025-03-03');
    `,
    solution: 'Gordon Gekko',
    hint:
      'Ordem "Pendente" aparece em 3 registros (100, 103, 104). Ordem de "Compra" em ativo "Alto" com "Pendente" — apenas a ordem 100. Quem é o investidor 10?'
  },

  // ─────────────────────────────────────────────────────────────────
  // CASO 14: O Colecionador de Arte (Medium)
  // Solução: SafeGuard Corp
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'medium4',
    title: 'O Colecionador de Arte',
    difficulty: 'Medium',
    description:
      'Após um blecaute suspeito, obras da galeria "Renascentista" foram trocadas por réplicas. A seguradora de uma obra renascentista no valor acima de 40 milhões foi acionada suspeita de cumplicidade.',
    objective:
      'Encontre o NOME da seguradora que cobre uma obra da galeria "Renascentista" com valor_cobertura ACIMA de 40 (milhões).',
    schema: `
      CREATE TABLE museus (id INTEGER PRIMARY KEY, nome TEXT, cidade TEXT);
      CREATE TABLE galerias (id INTEGER PRIMARY KEY, mus_id INTEGER, setor TEXT);
      CREATE TABLE obras (id INTEGER PRIMARY KEY, gal_id INTEGER, titulo TEXT, avaliacao INTEGER);
      CREATE TABLE seguradoras (id INTEGER PRIMARY KEY, nome TEXT, pais TEXT);
      CREATE TABLE apolices (id INTEGER PRIMARY KEY, obra_id INTEGER, seg_id INTEGER, valor_cobertura INTEGER);

      INSERT INTO museus VALUES (1, 'Louvre',       'Paris');
      INSERT INTO museus VALUES (2, 'Prado',        'Madri');

      INSERT INTO galerias VALUES (10, 1, 'Modernista');
      INSERT INTO galerias VALUES (11, 1, 'Renascentista');
      INSERT INTO galerias VALUES (12, 2, 'Renascentista');
      INSERT INTO galerias VALUES (13, 2, 'Barroca');

      INSERT INTO obras VALUES (100, 10, 'A Cadeira Azul',      15);
      INSERT INTO obras VALUES (101, 11, 'A Última Ceia Falsa', 50);
      INSERT INTO obras VALUES (102, 12, 'Vênus de Pedra',      35);
      INSERT INTO obras VALUES (103, 11, 'Anjo Caído',          22);
      INSERT INTO obras VALUES (104, 13, 'Batalha de Sousa',    45);

      INSERT INTO seguradoras VALUES (5, 'SafeGuard Corp',    'EUA');
      INSERT INTO seguradoras VALUES (6, 'Cheap Life Seguros','Brasil');
      INSERT INTO seguradoras VALUES (7, 'EuroSafe',          'França');

      INSERT INTO apolices VALUES (1, 100, 6, 15);
      INSERT INTO apolices VALUES (2, 101, 5, 50);
      INSERT INTO apolices VALUES (3, 102, 7, 35);
      INSERT INTO apolices VALUES (4, 103, 6, 22);
      INSERT INTO apolices VALUES (5, 104, 5, 45);
    `,
    solution: 'SafeGuard Corp',
    hint:
      'Duas galerias "Renascentistas" (Louvre e Prado). Obra com valor > 40: obras 101 (50) e 104 (45). Apenas 101 é "Renascentista" do Louvre. Quem a assegura?'
  },

  // ─────────────────────────────────────────────────────────────────
  // CASO 15: O Dossiê do Governo (Medium)
  // Solução: Arthur Sombra
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'medium5',
    title: 'O Dossiê do Governo',
    difficulty: 'Medium',
    description:
      'O log biométrico foi "Violado" por um funcionário de um projeto "Ultra Secreto". Há vários funcionários, vários projetos e vários logs — mas apenas um cruzamento fecha a culpa.',
    objective:
      'Identifique o NOME do funcionário cujo acesso biométrico foi "Violado" e que pertence a um projeto de nível "Ultra Secreto".',
    schema: `
      CREATE TABLE ministerios (id INTEGER PRIMARY KEY, nome TEXT);
      CREATE TABLE departamentos (id INTEGER PRIMARY KEY, min_id INTEGER, nome TEXT);
      CREATE TABLE projetos (id INTEGER PRIMARY KEY, dep_id INTEGER, nivel_sigilo TEXT, nome_projeto TEXT);
      CREATE TABLE funcionarios (id INTEGER PRIMARY KEY, nome TEXT, proj_id INTEGER, cargo TEXT);
      CREATE TABLE acessos_biometricos (id INTEGER PRIMARY KEY, func_id INTEGER, data TEXT, status_log TEXT);

      INSERT INTO ministerios VALUES (1, 'Defesa');
      INSERT INTO ministerios VALUES (2, 'Inteligência');

      INSERT INTO departamentos VALUES (10, 1, 'Armamentos');
      INSERT INTO departamentos VALUES (11, 2, 'Contra-espionagem');
      INSERT INTO departamentos VALUES (12, 2, 'Análise');

      INSERT INTO projetos VALUES (100, 11, 'Ultra Secreto', 'Operação Sombra');
      INSERT INTO projetos VALUES (101, 11, 'Publico',       'Relatório Anual');
      INSERT INTO projetos VALUES (102, 12, 'Ultra Secreto', 'Projeto Fênix');
      INSERT INTO projetos VALUES (103, 10, 'Restrito',      'Defesa Orbital');

      INSERT INTO funcionarios VALUES (50, 'Arthur Sombra', 100, 'Analista');
      INSERT INTO funcionarios VALUES (51, 'Laura Lima',    101, 'Secretária');
      INSERT INTO funcionarios VALUES (52, 'Bruno Pires',   102, 'Engenheiro');
      INSERT INTO funcionarios VALUES (53, 'Carla Vega',    103, 'Técnica');
      INSERT INTO funcionarios VALUES (54, 'Diego Motta',   100, 'Diretor');

      INSERT INTO acessos_biometricos VALUES (9,  51, '2025-01-10', 'Aprovado');
      INSERT INTO acessos_biometricos VALUES (10, 50, '2025-01-11', 'Violado');
      INSERT INTO acessos_biometricos VALUES (11, 52, '2025-01-11', 'Violado');
      INSERT INTO acessos_biometricos VALUES (12, 53, '2025-01-12', 'Aprovado');
      INSERT INTO acessos_biometricos VALUES (13, 54, '2025-01-13', 'Aprovado');
    `,
    solution: 'Arthur Sombra',
    hint:
      'Dois acessos "Violados" (funcs 50 e 52). Func 52 é de Projeto Fênix (id 102, Ultra Secreto mas no depto Análise). Func 50 é de Operação Sombra (id 100). Apenas o func_id que está em projeto "Ultra Secreto" do depto "Contra-espionagem" (11) resolve o crime.'
  },

  // ─────────────────────────────────────────────────────────────────
  // CASO 16: O Hacker Bancário (Medium) - Agregação
  // Solução: Sr. Pink
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'medium6',
    title: 'O Hacker Bancário',
    difficulty: 'Medium',
    description:
      'Transações suspeitas de "Entrada" foram detectadas em contas do Swiss Bank na agência de "Zurique". Vários clientes receberam dinheiro, mas apenas um ultrapassou 1.000.000 em soma total.',
    objective:
      'Encontre o NOME do cliente do Swiss Bank em Zurique cuja SOMA de transações do tipo "Entrada" supera 1.000.000.',
    schema: `
      CREATE TABLE bancos (id INTEGER PRIMARY KEY, nome TEXT, sede TEXT);
      CREATE TABLE agencias (id INTEGER PRIMARY KEY, banco_id INTEGER, cidade TEXT, codigo TEXT);
      CREATE TABLE contas (id INTEGER PRIMARY KEY, ag_id INTEGER, numero TEXT);
      CREATE TABLE clientes (id INTEGER PRIMARY KEY, conta_id INTEGER, nome TEXT, perfil TEXT);
      CREATE TABLE transacoes (id INTEGER PRIMARY KEY, conta_id INTEGER, valor INTEGER, tipo TEXT, data TEXT);

      INSERT INTO bancos VALUES (1, 'Swiss Bank',  'Zurique');
      INSERT INTO bancos VALUES (2, 'Cayman Trust','Cayman');

      INSERT INTO agencias VALUES (10, 1, 'Zurique',  'ZRH-1');
      INSERT INTO agencias VALUES (11, 1, 'Genebra',  'GVA-1');
      INSERT INTO agencias VALUES (12, 2, 'Cayman',   'CAY-1');

      INSERT INTO contas VALUES (100, 10, '001-9');
      INSERT INTO contas VALUES (101, 10, '002-8');
      INSERT INTO contas VALUES (102, 11, '003-1');
      INSERT INTO contas VALUES (103, 12, '004-8');

      INSERT INTO clientes VALUES (50, 100, 'Sr. Pink',   'Privado');
      INSERT INTO clientes VALUES (51, 101, 'Sr. White',  'Privado');
      INSERT INTO clientes VALUES (52, 102, 'Sr. Blue',   'Corporativo');
      INSERT INTO clientes VALUES (53, 103, 'Sr. Black',  'Privado');

      INSERT INTO transacoes VALUES (1, 100, 500000, 'Entrada', '2025-01-01');
      INSERT INTO transacoes VALUES (2, 100, 600000, 'Entrada', '2025-01-02');
      INSERT INTO transacoes VALUES (3, 100, 200000, 'Saída',   '2025-01-03');
      INSERT INTO transacoes VALUES (4, 101, 800000, 'Entrada', '2025-01-03');
      INSERT INTO transacoes VALUES (5, 101, 100000, 'Entrada', '2025-01-04');
      INSERT INTO transacoes VALUES (6, 102, 300000, 'Entrada', '2025-01-05');
      INSERT INTO transacoes VALUES (7, 103, 999999, 'Entrada', '2025-01-05');
    `,
    solution: 'Sr. Pink',
    hint:
      'Filtre banco = "Swiss Bank" AND agencia = "Zurique" AND tipo = "Entrada". Agrupe por cliente e use HAVING SUM(valor) > 1000000. Apenas Sr. Pink soma 1.100.000.'
  },

  // ─────────────────────────────────────────────────────────────────
  // CASO 17: O Espião Militar (Medium)
  // Solução: Sgt. Hartman
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'medium7',
    title: 'O Espião Militar',
    difficulty: 'Medium',
    description:
      'Um carregamento de C4 sumiu. Apenas soldados da "Base Delta" são suspeitos. Vários soldados de várias bases sacaram armamentos diferentes. Você precisa unir: base -> pelotao -> soldado -> saque -> arma.',
    objective:
      'Encontre o NOME do soldado lotado na "Base Delta" que foi o PRIMEIRO a sacar o armamento do tipo "C4" (data mais antiga).',
    schema: `
      CREATE TABLE bases (id INTEGER PRIMARY KEY, nome TEXT, pais TEXT);
      CREATE TABLE pelotoes (id INTEGER PRIMARY KEY, base_id INTEGER, regiao TEXT, especialidade TEXT);
      CREATE TABLE soldados (id INTEGER PRIMARY KEY, pelotao_id INTEGER, nome TEXT, patente TEXT);
      CREATE TABLE armamento (id INTEGER PRIMARY KEY, tipo TEXT, fabricante TEXT);
      CREATE TABLE saques_armas (id INTEGER PRIMARY KEY, soldado_id INTEGER, arma_id INTEGER, data TEXT);

      INSERT INTO bases VALUES (1, 'Base Charlie', 'Brasil');
      INSERT INTO bases VALUES (2, 'Base Delta',   'Brasil');
      INSERT INTO bases VALUES (3, 'Base Echo',    'Brasil');

      INSERT INTO pelotoes VALUES (10, 1, 'Norte',  'Infantaria');
      INSERT INTO pelotoes VALUES (11, 2, 'Oeste',  'Explosivos');
      INSERT INTO pelotoes VALUES (12, 2, 'Leste',  'Infiltração');
      INSERT INTO pelotoes VALUES (13, 3, 'Sul',    'Artilharia');

      INSERT INTO soldados VALUES (50, 10, 'Cap. Torres',   'Capitão');
      INSERT INTO soldados VALUES (51, 11, 'Sgt. Hartman',  'Sargento');
      INSERT INTO soldados VALUES (52, 12, 'Pvt. Pyle',     'Recruta');
      INSERT INTO soldados VALUES (53, 13, 'Ten. Branco',   'Tenente');
      INSERT INTO soldados VALUES (54, 11, 'Sgt. Kubriko',  'Sargento');

      INSERT INTO armamento VALUES (1, 'M16',  'Colt');
      INSERT INTO armamento VALUES (2, 'C4',   'DuPont');
      INSERT INTO armamento VALUES (3, 'RPG',  'Soviet');
      INSERT INTO armamento VALUES (4, 'C4',   'Militar BR');

      INSERT INTO saques_armas VALUES (1, 50,  1, '2025-02-01');
      INSERT INTO saques_armas VALUES (2, 51,  2, '2025-02-02');
      INSERT INTO saques_armas VALUES (3, 51,  1, '2025-02-03');
      INSERT INTO saques_armas VALUES (4, 52,  3, '2025-02-03');
      INSERT INTO saques_armas VALUES (5, 53,  4, '2025-02-04');
      INSERT INTO saques_armas VALUES (6, 54,  2, '2025-02-04');
    `,
    solution: 'Sgt. Hartman',
    hint:
      'Dois soldados sacaram C4 (Hartman e Kubriko), ambos da Base Delta! Mas o C4 de tipo "C4" foi sacado pelos dois. O crime envolve o primeiro a sacar (2025-02-02). Você pode usar GROUP BY, MIN(data) ou simplesmente filtrar o arma_id = 2 mais antigo.'
  },

  // ─────────────────────────────────────────────────────────────────
  // CASO 18: Fantasmas no Hospital (Medium)
  // Solução: Dr. Lecter
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'medium8',
    title: 'Fantasmas no Hospital',
    difficulty: 'Medium',
    description:
      'Um paciente morreu e o laudo forense diz "Asfixia" — mas ele estava na "Ala Psiquiátrica". Vários médicos em várias alas assinaram laudos de óbito. Apenas um fechou o atestado dessa ala com essa causa.',
    objective:
      'Encontre o NOME do médico que assinou o laudo do óbito com causa "Asfixia" de um paciente da "Ala Psiquiatrica".',
    schema: `
      CREATE TABLE hospitais (id INTEGER PRIMARY KEY, nome TEXT);
      CREATE TABLE alas (id INTEGER PRIMARY KEY, hosp_id INTEGER, nome_ala TEXT);
      CREATE TABLE medicos (id INTEGER PRIMARY KEY, ala_id INTEGER, nome TEXT, crm TEXT);
      CREATE TABLE pacientes (id INTEGER PRIMARY KEY, nome TEXT, ala_id INTEGER);
      CREATE TABLE obitos (id INTEGER PRIMARY KEY, paciente_id INTEGER, causa TEXT, data TEXT);
      CREATE TABLE laudos (id INTEGER PRIMARY KEY, obito_id INTEGER, medico_id INTEGER, data TEXT);

      INSERT INTO hospitais VALUES (1, 'St. Jude');
      INSERT INTO hospitais VALUES (2, 'Santa Casa');

      INSERT INTO alas VALUES (10, 1, 'UTI');
      INSERT INTO alas VALUES (11, 1, 'Ala Psiquiatrica');
      INSERT INTO alas VALUES (12, 2, 'Ala Psiquiatrica');
      INSERT INTO alas VALUES (13, 2, 'Oncologia');

      INSERT INTO medicos VALUES (50, 11, 'Dr. Lecter',  'CRM-1234');
      INSERT INTO medicos VALUES (51, 10, 'Dr. House',   'CRM-5678');
      INSERT INTO medicos VALUES (52, 12, 'Dra. Mente',  'CRM-9012');
      INSERT INTO medicos VALUES (53, 13, 'Dr. Chase',   'CRM-3456');

      INSERT INTO pacientes VALUES (100, 'Zeca L.',     11);
      INSERT INTO pacientes VALUES (101, 'Pedro M.',    10);
      INSERT INTO pacientes VALUES (102, 'Sara B.',     12);
      INSERT INTO pacientes VALUES (103, 'Tomas R.',    11);

      INSERT INTO obitos VALUES (9,  100, 'Asfixia',       '2025-04-01');
      INSERT INTO obitos VALUES (10, 101, 'Parada Cardíaca','2025-04-02');
      INSERT INTO obitos VALUES (11, 102, 'Asfixia',       '2025-04-02');
      INSERT INTO obitos VALUES (12, 103, 'AVC',           '2025-04-03');

      INSERT INTO laudos VALUES (1, 9,  50, '2025-04-01');
      INSERT INTO laudos VALUES (2, 10, 51, '2025-04-02');
      INSERT INTO laudos VALUES (3, 11, 52, '2025-04-02');
      INSERT INTO laudos VALUES (4, 12, 50, '2025-04-03');
    `,
    solution: 'Dr. Lecter',
    hint:
      'Dois óbitos por "Asfixia" (pacientes 100 e 102). Mas apenas o paciente 100 estava na "Ala Psiquiatrica" do St. Jude (ala_id=11). Quem assinou o laudo 9?'
  },

  // ─────────────────────────────────────────────────────────────────
  // CASO 19: O Esquema de Apostas (Medium)
  // Solução: Juiz Ligeiro
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'medium9',
    title: 'O Esquema de Apostas',
    difficulty: 'Medium',
    description:
      'A liga de futebol detectou partidas com apostas "Manipuladas". Vários árbitros apitaram várias partidas. Você precisa unir: aposta -> partida -> árbitro — mas filtrando pela liga "Série D" onde a manipulação é mais fácil.',
    objective:
      'Encontre o NOME do árbitro que apitou a partida da liga "Série D" cuja aposta tem classificação "Manipulada".',
    schema: `
      CREATE TABLE ligas (id INTEGER PRIMARY KEY, nome TEXT, divisao TEXT);
      CREATE TABLE times (id INTEGER PRIMARY KEY, liga_id INTEGER, nome TEXT, cidade TEXT);
      CREATE TABLE arbitros (id INTEGER PRIMARY KEY, nome TEXT, licenca TEXT);
      CREATE TABLE partidas (id INTEGER PRIMARY KEY, liga_id INTEGER, time_casa INTEGER, time_fora INTEGER, arbitro_id INTEGER, data TEXT);
      CREATE TABLE apostas (id INTEGER PRIMARY KEY, partida_id INTEGER, casa_apostas TEXT, classificacao TEXT, valor_total INTEGER);

      INSERT INTO ligas VALUES (1, 'Série A', 'Nacional');
      INSERT INTO ligas VALUES (2, 'Série D', 'Regional');
      INSERT INTO ligas VALUES (3, 'Copa',    'Nacional');

      INSERT INTO times VALUES (10, 2, 'Os Bravos',   'Xique-Xique');
      INSERT INTO times VALUES (11, 2, 'Remo Virado', 'Manaus');
      INSERT INTO times VALUES (12, 1, 'Grêmio',      'Porto Alegre');

      INSERT INTO arbitros VALUES (5, 'Juiz Ligeiro',    'ATP-001');
      INSERT INTO arbitros VALUES (6, 'Juiz Confiavel',  'ATP-002');
      INSERT INTO arbitros VALUES (7, 'Árbitro Falcão',  'ATP-003');

      INSERT INTO partidas VALUES (100, 2, 10, 11, 5, '2025-05-10');
      INSERT INTO partidas VALUES (101, 2, 10, 11, 6, '2025-05-17');
      INSERT INTO partidas VALUES (102, 1, 12, 12, 7, '2025-05-18');
      INSERT INTO partidas VALUES (103, 3, 10, 12, 5, '2025-05-20');

      INSERT INTO apostas VALUES (50, 100, 'BetCrim',    'Manipulada', 500000);
      INSERT INTO apostas VALUES (51, 101, 'LegaBet',    'Limpa',      200000);
      INSERT INTO apostas VALUES (52, 102, 'BetCrim',    'Limpa',      100000);
      INSERT INTO apostas VALUES (53, 103, 'BetCrim',    'Manipulada', 350000);
    `,
    solution: 'Juiz Ligeiro',
    hint:
      'Duas apostas "Manipuladas" (partidas 100 e 103). Mas você quer a da liga "Série D" — apenas a partida 100. Árbitro da partida 100 = Juiz Ligeiro.'
  },

  // ─────────────────────────────────────────────────────────────────
  // CASO 20: Testemunha de Fachada (Medium)
  // Solução: Mauro Oculto
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'medium10',
    title: 'Testemunha de Fachada',
    difficulty: 'Medium',
    description:
      'A prefeitura assinou contratos com imóveis classificados como "Fantasma" na "Zona Leste". Vários corretores, imóveis e inquilinos coexistem. O suspeito assinou o contrato do único imóvel "Fantasma" da "Zona Leste".',
    objective:
      'Encontre o NOME do corretor que assinou o contrato do imóvel "Fantasma" localizado na "Zona Leste".',
    schema: `
      CREATE TABLE imobiliarias (id INTEGER PRIMARY KEY, nome TEXT, cidade TEXT);
      CREATE TABLE corretores (id INTEGER PRIMARY KEY, imob_id INTEGER, nome TEXT, registro TEXT);
      CREATE TABLE imoveis (id INTEGER PRIMARY KEY, classificacao TEXT, bairro TEXT, tipo TEXT);
      CREATE TABLE inquilinos (id INTEGER PRIMARY KEY, nome TEXT, cpf TEXT);
      CREATE TABLE contratos (id INTEGER PRIMARY KEY, imovel_id INTEGER, corretor_id INTEGER, inq_id INTEGER, data TEXT);

      INSERT INTO imobiliarias VALUES (1, 'TopHouse',   'São Paulo');
      INSERT INTO imobiliarias VALUES (2, 'CasaFácil',  'Rio');

      INSERT INTO corretores VALUES (10, 1, 'Mauro Oculto', 'CRECI-111');
      INSERT INTO corretores VALUES (11, 1, 'Bruno Claro',  'CRECI-222');
      INSERT INTO corretores VALUES (12, 2, 'Paula Ética',  'CRECI-333');
      INSERT INTO corretores VALUES (13, 2, 'Leandro K.',   'CRECI-444');

      INSERT INTO imoveis VALUES (50, 'Fantasma',    'Zona Leste',  'Comercial');
      INSERT INTO imoveis VALUES (51, 'Residencial', 'Zona Oeste',  'Residencial');
      INSERT INTO imoveis VALUES (52, 'Fantasma',    'Zona Sul',    'Comercial');
      INSERT INTO imoveis VALUES (53, 'Residencial', 'Zona Leste',  'Residencial');
      INSERT INTO imoveis VALUES (54, 'Fantasma',    'Zona Norte',  'Industrial');

      INSERT INTO inquilinos VALUES (9,  'Sem Teto Ltda', '000.000.000-00');
      INSERT INTO inquilinos VALUES (10, 'Maria P.',      '111.111.111-11');
      INSERT INTO inquilinos VALUES (11, 'Carlos A.',     '222.222.222-22');

      INSERT INTO contratos VALUES (1, 50, 10, 9,  '2025-01-10');
      INSERT INTO contratos VALUES (2, 51, 11, 10, '2025-01-15');
      INSERT INTO contratos VALUES (3, 52, 13, 9,  '2025-02-01');
      INSERT INTO contratos VALUES (4, 53, 12, 11, '2025-02-10');
      INSERT INTO contratos VALUES (5, 54, 10, 9,  '2025-03-01');
    `,
    solution: 'Mauro Oculto',
    hint:
      'Três imóveis "Fantasma" (50, 52, 54). Mas apenas o imóvel 50 está na "Zona Leste". Quem assinou o contrato do imóvel 50?'
  }
];
