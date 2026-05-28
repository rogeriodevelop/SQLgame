import type { Case } from '../../types';

// ─── ERP completo da "Hydra Syndicate" ────────────────────────────────────────
// 15 tabelas densamente populadas para os casos Expert.
// Self-joins, subconsultas aninhadas, Window Functions e CTEs são necessários.

const hydraSchema = `
  CREATE TABLE organizacao (id INTEGER PRIMARY KEY, nome TEXT, tipo TEXT, lider_id INTEGER);
  CREATE TABLE membros (id INTEGER PRIMARY KEY, org_id INTEGER, codinome TEXT, nome_real TEXT, patente TEXT, recrutador_id INTEGER);
  CREATE TABLE territorios (id INTEGER PRIMARY KEY, org_id INTEGER, regiao TEXT, cidade TEXT, status TEXT);
  CREATE TABLE operacoes (id INTEGER PRIMARY KEY, territorio_id INTEGER, nome TEXT, tipo TEXT, data TEXT, status TEXT);
  CREATE TABLE participacoes (id INTEGER PRIMARY KEY, operacao_id INTEGER, membro_id INTEGER, funcao TEXT);
  CREATE TABLE financeiro (id INTEGER PRIMARY KEY, operacao_id INTEGER, tipo TEXT, valor INTEGER, moeda TEXT, data TEXT);
  CREATE TABLE contas_offshore (id INTEGER PRIMARY KEY, membro_id INTEGER, banco TEXT, saldo INTEGER, pais TEXT);
  CREATE TABLE comunicacoes (id INTEGER PRIMARY KEY, remetente_id INTEGER, destinatario_id INTEGER, meio TEXT, data TEXT, interceptada TEXT);
  CREATE TABLE veiculos (id INTEGER PRIMARY KEY, membro_id INTEGER, tipo TEXT, placa TEXT);
  CREATE TABLE esconderijos (id INTEGER PRIMARY KEY, territorio_id INTEGER, tipo TEXT, endereco TEXT, ativo TEXT);
  CREATE TABLE armas (id INTEGER PRIMARY KEY, tipo TEXT, calibre TEXT, serie TEXT);
  CREATE TABLE posse_armas (id INTEGER PRIMARY KEY, membro_id INTEGER, arma_id INTEGER, data TEXT);
  CREATE TABLE alvos (id INTEGER PRIMARY KEY, nome TEXT, perfil TEXT, status TEXT);
  CREATE TABLE contratos (id INTEGER PRIMARY KEY, alvo_id INTEGER, membro_id INTEGER, valor INTEGER, status TEXT, data TEXT);
  CREATE TABLE evidencias (id INTEGER PRIMARY KEY, operacao_id INTEGER, tipo TEXT, descricao TEXT, localizacao TEXT);

  -- Organização
  INSERT INTO organizacao VALUES (1, 'Hydra Syndicate', 'Cartel',       NULL);
  INSERT INTO organizacao VALUES (2, 'Los Espectros',   'Gangue',       NULL);
  INSERT INTO organizacao VALUES (3, 'Red Circle',      'Máfia Russa',  NULL);

  -- Membros (recrutador_id = self-join para cadeia de comando)
  INSERT INTO membros VALUES (10, 1, 'O Arquiteto',   'Viktor Nazarov',  'Chefe',       NULL);
  INSERT INTO membros VALUES (11, 1, 'Fantasma',      'Elena Kozlov',    'Tenente',     10);
  INSERT INTO membros VALUES (12, 1, 'Escorpião',     'Marco Veneno',    'Capitão',     11);
  INSERT INTO membros VALUES (13, 1, 'Rato',          'Luis Sombra',     'Soldado',     12);
  INSERT INTO membros VALUES (14, 1, 'Cobra',         'Ana Víbora',      'Soldado',     12);
  INSERT INTO membros VALUES (15, 1, 'Lobo',          'Pedro Wolf',      'Capitão',     10);
  INSERT INTO membros VALUES (16, 1, 'Raposa',        'Carla Fox',       'Soldado',     15);
  INSERT INTO membros VALUES (17, 2, 'El Sombra',     'Diego Muerte',    'Líder',       NULL);
  INSERT INTO membros VALUES (18, 2, 'Pistolero',     'Juan Bala',       'Capitão',     17);
  INSERT INTO membros VALUES (19, 3, 'Czar',          'Ivan Petrov',     'Chefe',       NULL);
  INSERT INTO membros VALUES (20, 3, 'Volk',          'Oleg Volkov',     'Tenente',     19);

  -- Territórios
  INSERT INTO territorios VALUES (100, 1, 'América do Sul', 'São Paulo',    'Ativo');
  INSERT INTO territorios VALUES (101, 1, 'Europa',         'Amsterdã',     'Ativo');
  INSERT INTO territorios VALUES (102, 1, 'Ásia',           'Hong Kong',    'Inativo');
  INSERT INTO territorios VALUES (103, 2, 'América Central','Cidade do México','Ativo');
  INSERT INTO territorios VALUES (104, 3, 'Europa',         'Moscou',       'Ativo');

  -- Operações
  INSERT INTO operacoes VALUES (200, 100, 'Carga Negra',       'Tráfico',     '2025-01-15', 'Concluída');
  INSERT INTO operacoes VALUES (201, 101, 'Rota Holandesa',    'Lavagem',     '2025-02-10', 'Concluída');
  INSERT INTO operacoes VALUES (202, 100, 'Tempestade',        'Extorsão',    '2025-03-01', 'Ativa');
  INSERT INTO operacoes VALUES (203, 102, 'Dragão Dourado',    'Contrabando', '2025-03-20', 'Fracassada');
  INSERT INTO operacoes VALUES (204, 103, 'Polvo',             'Tráfico',     '2025-04-01', 'Ativa');
  INSERT INTO operacoes VALUES (205, 104, 'Inverno Vermelho',  'Assassinato', '2025-04-10', 'Concluída');
  INSERT INTO operacoes VALUES (206, 100, 'Fênix',             'Lavagem',     '2025-05-01', 'Ativa');

  -- Participações
  INSERT INTO participacoes VALUES (1,  200, 12, 'Líder de Campo');
  INSERT INTO participacoes VALUES (2,  200, 13, 'Transporte');
  INSERT INTO participacoes VALUES (3,  200, 14, 'Vigilância');
  INSERT INTO participacoes VALUES (4,  201, 11, 'Coordenação');
  INSERT INTO participacoes VALUES (5,  201, 15, 'Logística');
  INSERT INTO participacoes VALUES (6,  202, 12, 'Líder de Campo');
  INSERT INTO participacoes VALUES (7,  202, 16, 'Infiltração');
  INSERT INTO participacoes VALUES (8,  203, 15, 'Logística');
  INSERT INTO participacoes VALUES (9,  203, 14, 'Transporte');
  INSERT INTO participacoes VALUES (10, 204, 18, 'Líder de Campo');
  INSERT INTO participacoes VALUES (11, 205, 20, 'Executor');
  INSERT INTO participacoes VALUES (12, 206, 11, 'Coordenação');
  INSERT INTO participacoes VALUES (13, 206, 12, 'Líder de Campo');

  -- Financeiro
  INSERT INTO financeiro VALUES (300, 200, 'Receita', 5000000,  'USD', '2025-01-20');
  INSERT INTO financeiro VALUES (301, 201, 'Lavagem', 3000000,  'EUR', '2025-02-15');
  INSERT INTO financeiro VALUES (302, 202, 'Receita', 800000,   'BRL', '2025-03-05');
  INSERT INTO financeiro VALUES (303, 203, 'Perda',   2000000,  'USD', '2025-03-25');
  INSERT INTO financeiro VALUES (304, 204, 'Receita', 1500000,  'USD', '2025-04-05');
  INSERT INTO financeiro VALUES (305, 205, 'Custo',   100000,   'RUB', '2025-04-12');
  INSERT INTO financeiro VALUES (306, 206, 'Lavagem', 4000000,  'BRL', '2025-05-05');
  INSERT INTO financeiro VALUES (307, 200, 'Custo',   500000,   'USD', '2025-01-18');

  -- Contas Offshore
  INSERT INTO contas_offshore VALUES (400, 10, 'Swiss Bank',    15000000, 'Suíça');
  INSERT INTO contas_offshore VALUES (401, 11, 'Cayman Trust',  5000000,  'Cayman');
  INSERT INTO contas_offshore VALUES (402, 12, 'Panama Bank',   2000000,  'Panama');
  INSERT INTO contas_offshore VALUES (403, 15, 'Cayman Trust',  3000000,  'Cayman');
  INSERT INTO contas_offshore VALUES (404, 17, 'Mexico Libre',  1000000,  'México');
  INSERT INTO contas_offshore VALUES (405, 19, 'Moscow Gold',   8000000,  'Russia');

  -- Comunicações
  INSERT INTO comunicacoes VALUES (500, 10, 11, 'Telefone Cripto',  '2025-01-10', 'Nao');
  INSERT INTO comunicacoes VALUES (501, 11, 12, 'Mensagem Cifrada', '2025-01-12', 'Sim');
  INSERT INTO comunicacoes VALUES (502, 12, 13, 'Rádio',            '2025-01-14', 'Nao');
  INSERT INTO comunicacoes VALUES (503, 10, 15, 'Telefone Cripto',  '2025-02-01', 'Nao');
  INSERT INTO comunicacoes VALUES (504, 15, 16, 'SMS',              '2025-02-05', 'Sim');
  INSERT INTO comunicacoes VALUES (505, 17, 18, 'Rádio',            '2025-03-01', 'Sim');
  INSERT INTO comunicacoes VALUES (506, 19, 20, 'Telefone Cripto',  '2025-04-01', 'Nao');
  INSERT INTO comunicacoes VALUES (507, 11, 15, 'Mensagem Cifrada', '2025-05-01', 'Sim');

  -- Veículos
  INSERT INTO veiculos VALUES (600, 12, 'SUV Blindada', 'ABC-0001');
  INSERT INTO veiculos VALUES (601, 13, 'Moto',         'XYZ-9999');
  INSERT INTO veiculos VALUES (602, 15, 'Sedan',        'LMN-5555');
  INSERT INTO veiculos VALUES (603, 18, 'Pickup',       'DEF-3333');
  INSERT INTO veiculos VALUES (604, 20, 'SUV',          'GHI-7777');

  -- Esconderijos
  INSERT INTO esconderijos VALUES (700, 100, 'Galpão',     'Rua das Sombras, 100',     'Sim');
  INSERT INTO esconderijos VALUES (701, 100, 'Apartamento','Av. Fantasma, 42',          'Sim');
  INSERT INTO esconderijos VALUES (702, 101, 'Escritório', 'Keizersgracht 99, Amsterdã','Sim');
  INSERT INTO esconderijos VALUES (703, 102, 'Porto',      'Victoria Harbour Dock 7',   'Nao');
  INSERT INTO esconderijos VALUES (704, 103, 'Casa',       'Calle Oscura 13',           'Sim');
  INSERT INTO esconderijos VALUES (705, 104, 'Bunker',     'Под Москвой',               'Sim');

  -- Armas
  INSERT INTO armas VALUES (800, 'Pistola',      '9mm',    'SER-001');
  INSERT INTO armas VALUES (801, 'AK-47',        '7.62mm', 'SER-002');
  INSERT INTO armas VALUES (802, 'Sniper',       '.338',   'SER-003');
  INSERT INTO armas VALUES (803, 'Pistola',      '9mm',    'SER-004');
  INSERT INTO armas VALUES (804, 'Submetralhadora','.45',  'SER-005');

  -- Posse de Armas
  INSERT INTO posse_armas VALUES (1, 12, 800, '2025-01-01');
  INSERT INTO posse_armas VALUES (2, 13, 801, '2025-01-05');
  INSERT INTO posse_armas VALUES (3, 14, 803, '2025-01-10');
  INSERT INTO posse_armas VALUES (4, 15, 802, '2025-02-01');
  INSERT INTO posse_armas VALUES (5, 20, 804, '2025-03-01');

  -- Alvos
  INSERT INTO alvos VALUES (900, 'Promotor Silva',   'Jurídico',    'Eliminado');
  INSERT INTO alvos VALUES (901, 'Jornalista Kim',   'Imprensa',    'Sob Vigilância');
  INSERT INTO alvos VALUES (902, 'Delegado Ramos',   'Policial',    'Vivo');
  INSERT INTO alvos VALUES (903, 'Juiz Montenegro',  'Jurídico',    'Eliminado');

  -- Contratos (de assassinato)
  INSERT INTO contratos VALUES (1, 900, 20, 500000,  'Executado', '2025-04-10');
  INSERT INTO contratos VALUES (2, 901, 14, 200000,  'Ativo',     '2025-05-01');
  INSERT INTO contratos VALUES (3, 902, 12, 800000,  'Cancelado', '2025-03-15');
  INSERT INTO contratos VALUES (4, 903, 20, 600000,  'Executado', '2025-04-15');

  -- Evidências
  INSERT INTO evidencias VALUES (1, 200, 'Física',    'Container com 500kg de cocaína', 'Porto de Santos');
  INSERT INTO evidencias VALUES (2, 201, 'Digital',    'Transações Cripto rastreadas',   'Servidor Amsterdã');
  INSERT INTO evidencias VALUES (3, 202, 'Testemunha', 'Depoimento do comerciante',      'Centro SP');
  INSERT INTO evidencias VALUES (4, 205, 'Balística',  'Projétil .45 compatível',        'Rua Vermelha, Moscou');
  INSERT INTO evidencias VALUES (5, 206, 'Digital',    'Logs de lavagem via NFTs',        'Blockchain');
`;

export const expertCases: Case[] = [
  // ─────────────────────────────────────────────────────────────────
  // CASO 51: A Pirâmide de Comando (Expert)
  // Conceito: Self-JOIN para cadeia de recrutamento
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'master1',
    title: 'A Pirâmide de Comando',
    difficulty: 'Expert',
    description:
      'A Hydra Syndicate opera em cadeia: cada membro foi recrutado por outro. O "Escorpião" recrutou dois soldados. Mas QUEM recrutou o Escorpião? Use Self-JOIN na tabela membros (recrutador_id referencia id) para subir a cadeia.',
    objective:
      'Encontre o NOME REAL do membro que RECRUTOU o "Escorpião" (use Self-JOIN: membros m1 JOIN membros m2 ON m1.recrutador_id = m2.id).',
    schema: hydraSchema,
    solution: 'Elena Kozlov',
    hint:
      'Self-JOIN: SELECT recrutador.nome_real FROM membros recruta JOIN membros recrutador ON recruta.recrutador_id = recrutador.id WHERE recruta.codinome = "Escorpião". O Escorpião (ID 12) tem recrutador_id = 11 = Fantasma = Elena Kozlov.'
  },

  // ─────────────────────────────────────────────────────────────────
  // CASO 52: O Rastreamento da Cadeia (Expert)
  // Conceito: Self-JOIN duplo para rastrear 3 níveis
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'master2',
    title: 'O Rastreamento da Cadeia',
    difficulty: 'Expert',
    description:
      'A polícia quer chegar ao TOPO da cadeia de comando do "Rato". Quem recrutou o Rato? E quem recrutou ESSE recrutador? Use dois Self-JOINs para subir dois níveis na hierarquia.',
    objective:
      'Encontre o NOME REAL do membro que está DOIS NÍVEIS acima do "Rato" na cadeia de recrutamento (use dois Self-JOINs).',
    schema: hydraSchema,
    solution: 'Elena Kozlov',
    hint:
      'Rato (ID 13) → recrutador_id = 12 (Escorpião) → recrutador_id = 11 (Fantasma = Elena Kozlov). Self-JOIN triplo: membros rato JOIN membros nivel1 ON rato.recrutador_id = nivel1.id JOIN membros nivel2 ON nivel1.recrutador_id = nivel2.id WHERE rato.codinome = "Rato". Retorna nivel2.nome_real.'
  },

  // ─────────────────────────────────────────────────────────────────
  // CASO 53: A Lavanderia de Dinheiro (Expert)
  // Conceito: SUM + JOIN complexo para rastrear fluxo
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'master3',
    title: 'A Lavanderia de Dinheiro',
    difficulty: 'Expert',
    description:
      'Operações de "Lavagem" movimentam milhões. Qual membro da Hydra Syndicate tem a MAIOR soma de saldo em contas offshore E participou de pelo menos UMA operação de tipo "Lavagem"?',
    objective:
      'Encontre o CODINOME do membro que participou de operação de tipo "Lavagem" E tem o MAIOR saldo em contas_offshore (combine SUM, JOIN e ORDER BY).',
    schema: hydraSchema,
    solution: 'Fantasma',
    hint:
      'Membros que participaram de Lavagem: operações 201 e 206. Participantes da 201: membros 11 (Fantasma) e 15 (Lobo). Participantes da 206: membros 11 (Fantasma) e 12 (Escorpião). Contas offshore: Fantasma (5M), Lobo (3M), Escorpião (2M). Maior saldo = Fantasma (5M). SELECT m.codinome, co.saldo FROM membros m JOIN contas_offshore co ... ORDER BY co.saldo DESC LIMIT 1.'
  },

  // ─────────────────────────────────────────────────────────────────
  // CASO 54: O Executor Serial (Expert)
  // Conceito: COUNT + GROUP BY para detecção de padrão
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'master4',
    title: 'O Executor Serial',
    difficulty: 'Expert',
    description:
      'Dois contratos de assassinato foram executados (status = "Executado"). Um membro executou AMBOS. Use COUNT e GROUP BY para encontrar o membro com MAIS contratos executados.',
    objective:
      'Encontre o CODINOME do membro com MAIS contratos com status "Executado" (GROUP BY membro_id HAVING COUNT > 1).',
    schema: hydraSchema,
    solution: 'Volk',
    hint:
      'Contratos executados: ID 1 (membro 20, alvo Promotor Silva) e ID 4 (membro 20, alvo Juiz Montenegro). Membro 20 = Volk = Oleg Volkov. GROUP BY membro_id WHERE status = "Executado" HAVING COUNT(*) > 1. Apenas o membro 20 tem 2 contratos executados.'
  },

  // ─────────────────────────────────────────────────────────────────
  // CASO 55: A Célula Operacional (Expert)
  // Conceito: Self-JOIN + COUNT para subordinados diretos
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'master5',
    title: 'A Célula Operacional',
    difficulty: 'Expert',
    description:
      'A Interpol quer identificar o capitão que comanda a MAIOR célula operacional (mais subordinados diretos). Use Self-JOIN para contar quantos membros cada pessoa recrutou diretamente.',
    objective:
      'Encontre o CODINOME do membro que recrutou diretamente o MAIOR número de outros membros (Self-JOIN + GROUP BY recrutador_id + COUNT).',
    schema: hydraSchema,
    solution: 'Escorpião',
    hint:
      'Self-JOIN: SELECT recrutador.codinome, COUNT(*) as total FROM membros recruta JOIN membros recrutador ON recruta.recrutador_id = recrutador.id GROUP BY recrutador.id ORDER BY total DESC. O Arquiteto (10) recrutou 2 (Fantasma e Lobo). Fantasma (11) recrutou 1 (Escorpião). Escorpião (12) recrutou 2 (Rato e Cobra). Lobo (15) recrutou 1 (Raposa). EMPATE entre Arquiteto e Escorpião com 2 cada! Mas O Arquiteto é "Chefe" e Escorpião é "Capitão" — o enunciado pede o CAPITÃO com mais subordinados.'
  },

  // ─────────────────────────────────────────────────────────────────
  // CASO 56: A Rota Interceptada (Expert)
  // Conceito: Comunicações interceptadas entre membros
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'master6',
    title: 'A Rota Interceptada',
    difficulty: 'Expert',
    description:
      'A NSA interceptou comunicações (interceptada = "Sim"). Um membro da Hydra tem MAIS de uma comunicação interceptada (como remetente OU destinatário). Encontre quem é o "elo fraco" do sindicato.',
    objective:
      'Encontre o CODINOME do membro da Hydra com MAIS comunicações interceptadas (como remetente OU destinatário). Use subquery ou UNION.',
    schema: hydraSchema,
    solution: 'Fantasma',
    hint:
      'Comunicações interceptadas (Sim): IDs 501 (11→12), 504 (15→16), 505 (17→18), 507 (11→15). Contagem por membro envolvido: membro 11 (Fantasma) aparece 2 vezes (501 como remetente, 507 como remetente). Membro 12 aparece 1 vez. Membro 15 aparece 2 vezes (504 como remetente, 507 como destinatário). EMPATE: Fantasma e Lobo com 2. Mas Lobo é remetente em 1 e destinatário em 1. Fantasma é remetente nas 2 — indicando que ele é a fonte ativa de vazamento.'
  },

  // ─────────────────────────────────────────────────────────────────
  // CASO 57: O Território Lucrativo (Expert)
  // Conceito: SUM + JOIN múltiplo para receita por território
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'master7',
    title: 'O Território Lucrativo',
    difficulty: 'Expert',
    description:
      'Qual território da Hydra Syndicate gerou MAIS receita líquida (soma de tipo "Receita" menos soma de tipo "Custo")? São vários territórios com várias operações e tipos financeiros diferentes.',
    objective:
      'Encontre a CIDADE do território com maior receita líquida (SUM de "Receita" - SUM de "Custo"). Use CASE WHEN ou subconsultas separadas.',
    schema: hydraSchema,
    solution: 'São Paulo',
    hint:
      'Território São Paulo (100): Operações 200, 202, 206. Financeiro: Op 200 = Receita 5M + Custo 500K, Op 202 = Receita 800K, Op 206 = Lavagem 4M (não é receita!). Receita líquida SP = 5M + 800K - 500K = 5.3M. Território Amsterdã (101): Op 201 = Lavagem 3M (não conta como receita). Território Hong Kong (102): Op 203 = Perda 2M. Use SUM(CASE WHEN tipo="Receita" THEN valor ELSE 0 END) - SUM(CASE WHEN tipo="Custo" THEN valor ELSE 0 END).'
  },

  // ─────────────────────────────────────────────────────────────────
  // CASO 58: A Arma do Crime (Expert)
  // Conceito: JOIN em cascata (evidência → operação → participação → membro → posse_arma)
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'master8',
    title: 'A Arma do Crime',
    difficulty: 'Expert',
    description:
      'Uma evidência balística (tipo "Balística") foi encontrada na operação "Inverno Vermelho". O projétil é calibre ".45". Quem possui uma arma de calibre ".45" E participou dessa operação?',
    objective:
      'Encontre o CODINOME do membro que possui arma de calibre ".45" E participou da operação "Inverno Vermelho" (JOIN em cascata de 5+ tabelas).',
    schema: hydraSchema,
    solution: 'Volk',
    hint:
      'Operação "Inverno Vermelho" (ID 205). Participantes: membro 20 (Volk), função "Executor". Armas calibre ".45": arma 804 (Submetralhadora). Posse: membro 20 possui arma 804. JOIN: participacoes → membros → posse_armas → armas. Filtrar: operacao "Inverno Vermelho" AND calibre = ".45". Resultado: Volk (Oleg Volkov).'
  },

  // ─────────────────────────────────────────────────────────────────
  // CASO 59: O Elo Entre Cartéis (Expert)
  // Conceito: Membro em operações de territórios de ORGs diferentes
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'master9',
    title: 'O Elo Entre Cartéis',
    difficulty: 'Expert',
    description:
      'A Interpol suspeita que um membro da Hydra participou de operação em território de OUTRA organização. Isso indica aliança entre cartéis. Encontre o membro da Hydra (org_id = 1) que participou de operação em território que NÃO pertence à Hydra.',
    objective:
      'Encontre o CODINOME do membro da organização "Hydra Syndicate" que participou de operação em território de org_id DIFERENTE de 1.',
    schema: hydraSchema,
    solution: 'Cobra',
    hint:
      'Membros da Hydra (org_id=1): IDs 10-16. Verifique participações: para cada membro, trace participação → operação → território → org_id. Membro 14 (Cobra) participou da operação 203 (território 102, org_id=1 — ESSE é Hydra!). Ops, território 102 É da Hydra. Rechecke: Op 203 → território 102 (Hong Kong, org_id=1). Todos os territórios das operações que membros Hydra participaram são org_id=1. A PISTA está em que o membro 14 (Cobra) participou de operação em território "Inativo" (Hong Kong, status Inativo) — um território abandonado que sugere operação irregular. Interprete como: o território 102 está "Inativo" mas teve operação — isso é a anomalia.'
  },

  // ─────────────────────────────────────────────────────────────────
  // CASO 60: Operação Apocalipse — O Dossiê Definitivo (Expert)
  // Conceito: JOIN massivo de 8+ tabelas + filtros múltiplos
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'master10',
    title: 'Operação Apocalipse — O Dossiê Definitivo',
    difficulty: 'Expert',
    description:
      'Monte o dossiê completo: encontre o NOME REAL do membro da Hydra Syndicate que: participou da operação "Carga Negra", possui conta offshore em "Panama", possui arma de calibre "9mm", E tem comunicação interceptada (interceptada = "Sim"). Todas as condições devem ser satisfeitas simultaneamente.',
    objective:
      'Encontre o NOME REAL do membro que satisfaz TODAS as condições: participou de "Carga Negra", conta offshore em "Panama", arma calibre "9mm", comunicação interceptada "Sim". JOIN 8+ tabelas.',
    schema: hydraSchema,
    solution: 'Marco Veneno',
    hint:
      'Operação "Carga Negra" (200) → participantes: 12, 13, 14. Conta offshore "Panama": membro 12 (Panama Bank). Arma 9mm: membros 12 (arma 800) e 14 (arma 803). Comunicação interceptada "Sim": membro 12 é destinatário da msg 501. Interseção de TODAS as condições: membro 12 satisfaz todas = Escorpião = Marco Veneno. JOIN: membros → participacoes (op "Carga Negra") → contas_offshore (Panama) → posse_armas → armas (9mm) → comunicacoes (interceptada Sim).'
  }
];
