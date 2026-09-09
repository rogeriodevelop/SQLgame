import type { Case } from '../../domain/case';

export const specialCases: Case[] = [
  // ─────────────────────────────────────────────────────────────────
  // CASO 41: O Clone de Identidade (Special)
  // Conceito: Subconsulta IN para CPFs duplicados
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'special1',
    title: 'O Clone de Identidade',
    difficulty: 'Hard',
    description:
      'A Receita Federal descobriu que o mesmo CPF foi cadastrado em DOIS bancos diferentes. Isso indica fraude de identidade. Vários clientes possuem contas em vários bancos, mas apenas UM CPF aparece em mais de um banco.',
    objective:
      'Encontre o NOME do cliente cujo CPF aparece em mais de um banco (use GROUP BY cpf HAVING COUNT(DISTINCT banco_id) > 1, ou subconsulta IN).',
    schema: `
      CREATE TABLE bancos (id INTEGER PRIMARY KEY, nome TEXT, pais TEXT);
      CREATE TABLE agencias (id INTEGER PRIMARY KEY, banco_id INTEGER, cidade TEXT);
      CREATE TABLE contas (id INTEGER PRIMARY KEY, agencia_id INTEGER, numero TEXT, tipo TEXT);
      CREATE TABLE clientes (id INTEGER PRIMARY KEY, conta_id INTEGER, nome TEXT, cpf TEXT);
      CREATE TABLE movimentacoes (id INTEGER PRIMARY KEY, conta_id INTEGER, valor INTEGER, tipo TEXT, data TEXT);
      CREATE TABLE alertas (id INTEGER PRIMARY KEY, cliente_id INTEGER, motivo TEXT);
      CREATE TABLE auditorias (id INTEGER PRIMARY KEY, alerta_id INTEGER, resultado TEXT);

      INSERT INTO bancos VALUES (1, 'Banco Central', 'Brasil');
      INSERT INTO bancos VALUES (2, 'Swiss Bank',    'Suíça');
      INSERT INTO bancos VALUES (3, 'Cayman Trust',  'Cayman');

      INSERT INTO agencias VALUES (10, 1, 'São Paulo');
      INSERT INTO agencias VALUES (11, 2, 'Zurique');
      INSERT INTO agencias VALUES (12, 3, 'George Town');
      INSERT INTO agencias VALUES (13, 1, 'Rio de Janeiro');

      INSERT INTO contas VALUES (100, 10, '001-X', 'Corrente');
      INSERT INTO contas VALUES (101, 11, '002-Y', 'Investimento');
      INSERT INTO contas VALUES (102, 12, '003-Z', 'Offshore');
      INSERT INTO contas VALUES (103, 13, '004-W', 'Poupança');
      INSERT INTO contas VALUES (104, 11, '005-V', 'Investimento');

      INSERT INTO clientes VALUES (50, 100, 'Maria Legal',     '111.111.111-11');
      INSERT INTO clientes VALUES (51, 101, 'Fantasma Clone',  '222.222.222-22');
      INSERT INTO clientes VALUES (52, 102, 'Fantasma Clone',  '222.222.222-22');
      INSERT INTO clientes VALUES (53, 103, 'João Honesto',    '333.333.333-33');
      INSERT INTO clientes VALUES (54, 104, 'Ana Normal',      '444.444.444-44');

      INSERT INTO movimentacoes VALUES (1, 100, 5000,    'Deposito', '2025-01-01');
      INSERT INTO movimentacoes VALUES (2, 101, 2000000, 'Deposito', '2025-01-05');
      INSERT INTO movimentacoes VALUES (3, 102, 3000000, 'Deposito', '2025-01-10');
      INSERT INTO movimentacoes VALUES (4, 103, 1500,    'Deposito', '2025-01-15');

      INSERT INTO alertas VALUES (1, 51, 'CPF duplicado');
      INSERT INTO alertas VALUES (2, 52, 'CPF duplicado');

      INSERT INTO auditorias VALUES (1, 1, 'Pendente');
      INSERT INTO auditorias VALUES (2, 2, 'Pendente');
    `,
    solution: 'Fantasma Clone',
    hint:
      'Agrupe clientes por cpf: SELECT cpf, COUNT(DISTINCT c2.agencia_id) ... Ou: SELECT nome FROM clientes WHERE cpf IN (SELECT cpf FROM clientes GROUP BY cpf HAVING COUNT(*) > 1). O CPF "222.222.222-22" aparece em 2 bancos distintos (Swiss Bank e Cayman Trust).'
  },

  // ─────────────────────────────────────────────────────────────────
  // CASO 42: O Cartel Farmacêutico (Special)
  // Conceito: GROUP BY + HAVING COUNT > N em prescrições
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'special2',
    title: 'O Cartel Farmacêutico',
    difficulty: 'Hard',
    description:
      'A Anvisa detectou um médico que prescreveu "Oxycodone" mais de 3 vezes em um único mês. Vários médicos prescrevem vários medicamentos, mas esse padrão indica tráfico disfarçado de receita médica.',
    objective:
      'Encontre o NOME do médico que prescreveu "Oxycodone" mais de 3 vezes (use GROUP BY + HAVING COUNT(*) > 3).',
    schema: `
      CREATE TABLE hospitais (id INTEGER PRIMARY KEY, nome TEXT, cidade TEXT);
      CREATE TABLE medicos (id INTEGER PRIMARY KEY, hosp_id INTEGER, nome TEXT, crm TEXT);
      CREATE TABLE pacientes (id INTEGER PRIMARY KEY, nome TEXT, convenio TEXT);
      CREATE TABLE medicamentos (id INTEGER PRIMARY KEY, nome TEXT, controlado TEXT);
      CREATE TABLE prescricoes (id INTEGER PRIMARY KEY, medico_id INTEGER, paciente_id INTEGER, med_id INTEGER, data TEXT);
      CREATE TABLE farmacias (id INTEGER PRIMARY KEY, nome TEXT, cidade TEXT);
      CREATE TABLE dispensacoes (id INTEGER PRIMARY KEY, prescricao_id INTEGER, farmacia_id INTEGER, data TEXT);

      INSERT INTO hospitais VALUES (1, 'Hospital Central', 'São Paulo');
      INSERT INTO hospitais VALUES (2, 'Santa Casa',       'Rio');

      INSERT INTO medicos VALUES (10, 1, 'Dr. Receita Fácil', 'CRM-666');
      INSERT INTO medicos VALUES (11, 1, 'Dra. Ética',        'CRM-111');
      INSERT INTO medicos VALUES (12, 2, 'Dr. Normal',        'CRM-222');

      INSERT INTO pacientes VALUES (50, 'Pac. A', 'SUS');
      INSERT INTO pacientes VALUES (51, 'Pac. B', 'Particular');
      INSERT INTO pacientes VALUES (52, 'Pac. C', 'SUS');
      INSERT INTO pacientes VALUES (53, 'Pac. D', 'Particular');
      INSERT INTO pacientes VALUES (54, 'Pac. E', 'SUS');

      INSERT INTO medicamentos VALUES (1, 'Oxycodone',    'Sim');
      INSERT INTO medicamentos VALUES (2, 'Paracetamol',  'Nao');
      INSERT INTO medicamentos VALUES (3, 'Morfina',      'Sim');

      INSERT INTO prescricoes VALUES (100, 10, 50, 1, '2025-04-01');
      INSERT INTO prescricoes VALUES (101, 10, 51, 1, '2025-04-03');
      INSERT INTO prescricoes VALUES (102, 10, 52, 1, '2025-04-07');
      INSERT INTO prescricoes VALUES (103, 10, 53, 1, '2025-04-12');
      INSERT INTO prescricoes VALUES (104, 11, 54, 2, '2025-04-05');
      INSERT INTO prescricoes VALUES (105, 12, 50, 1, '2025-04-08');
      INSERT INTO prescricoes VALUES (106, 12, 51, 3, '2025-04-10');
      INSERT INTO prescricoes VALUES (107, 11, 52, 1, '2025-04-15');

      INSERT INTO farmacias VALUES (1, 'Droga Raia',  'SP');
      INSERT INTO farmacias VALUES (2, 'Drogasil',    'RJ');

      INSERT INTO dispensacoes VALUES (1, 100, 1, '2025-04-01');
      INSERT INTO dispensacoes VALUES (2, 101, 1, '2025-04-03');
      INSERT INTO dispensacoes VALUES (3, 102, 2, '2025-04-07');
      INSERT INTO dispensacoes VALUES (4, 103, 1, '2025-04-12');
    `,
    solution: 'Dr. Receita Fácil',
    hint:
      'JOIN prescricoes com medicos e medicamentos WHERE nome = "Oxycodone". GROUP BY medico_id HAVING COUNT(*) > 3. Dr. Receita Fácil tem 4 prescrições de Oxycodone. Os outros médicos têm 1 ou 0.'
  },

  // ─────────────────────────────────────────────────────────────────
  // CASO 43: A Rede de Espionagem (Special)
  // Conceito: EXISTS para agentes com múltiplas condições
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'special3',
    title: 'A Rede de Espionagem',
    difficulty: 'Hard',
    description:
      'A contraespionagem identificou um agente duplo: alguém que tem mensagens interceptadas com status "Decifrada" E também acessou uma base com nivel_seguranca "Maximo". Vários agentes foram interceptados, mas apenas um combina os dois critérios.',
    objective:
      'Encontre o NOME do agente que possui mensagem com status "Decifrada" E que acessou uma base com nivel_seguranca "Maximo" (use EXISTS ou subconsulta IN).',
    schema: `
      CREATE TABLE agencias_intel (id INTEGER PRIMARY KEY, nome TEXT, pais TEXT);
      CREATE TABLE agentes (id INTEGER PRIMARY KEY, agencia_id INTEGER, codinome TEXT, nome TEXT);
      CREATE TABLE bases (id INTEGER PRIMARY KEY, nome TEXT, nivel_seguranca TEXT, localizacao TEXT);
      CREATE TABLE acessos_base (id INTEGER PRIMARY KEY, agente_id INTEGER, base_id INTEGER, data TEXT);
      CREATE TABLE mensagens (id INTEGER PRIMARY KEY, agente_id INTEGER, conteudo TEXT, status TEXT);
      CREATE TABLE contatos (id INTEGER PRIMARY KEY, agente_id INTEGER, nome_contato TEXT, pais TEXT);
      CREATE TABLE missoes (id INTEGER PRIMARY KEY, agente_id INTEGER, objetivo TEXT, status TEXT);
      CREATE TABLE interceptacoes (id INTEGER PRIMARY KEY, mensagem_id INTEGER, data TEXT, metodo TEXT);

      INSERT INTO agencias_intel VALUES (1, 'CIA',   'EUA');
      INSERT INTO agencias_intel VALUES (2, 'MI6',   'UK');
      INSERT INTO agencias_intel VALUES (3, 'KGB',   'Russia');

      INSERT INTO agentes VALUES (10, 1, 'Eagle',    'James Bond');
      INSERT INTO agentes VALUES (11, 2, 'Shadow',   'Nikita Volkov');
      INSERT INTO agentes VALUES (12, 1, 'Phoenix',  'Sarah Connor');
      INSERT INTO agentes VALUES (13, 3, 'Bear',     'Ivan Drago');

      INSERT INTO bases VALUES (50, 'Area 51',       'Maximo',  'Nevada');
      INSERT INTO bases VALUES (51, 'Base Alpha',    'Alto',    'Londres');
      INSERT INTO bases VALUES (52, 'Bunker Kremlin','Maximo',  'Moscou');

      INSERT INTO acessos_base VALUES (1, 10, 50, '2025-01-10');
      INSERT INTO acessos_base VALUES (2, 11, 51, '2025-01-12');
      INSERT INTO acessos_base VALUES (3, 12, 50, '2025-01-15');
      INSERT INTO acessos_base VALUES (4, 13, 52, '2025-01-18');
      INSERT INTO acessos_base VALUES (5, 11, 52, '2025-01-20');

      INSERT INTO mensagens VALUES (100, 10, 'Operação confirmada',  'Cifrada');
      INSERT INTO mensagens VALUES (101, 11, 'Alvo localizado',      'Decifrada');
      INSERT INTO mensagens VALUES (102, 12, 'Missão abortada',      'Decifrada');
      INSERT INTO mensagens VALUES (103, 13, 'Sem dados',            'Cifrada');
      INSERT INTO mensagens VALUES (104, 11, 'Coordenadas enviadas', 'Decifrada');

      INSERT INTO contatos VALUES (1, 11, 'Agente Duplo X', 'Russia');
      INSERT INTO contatos VALUES (2, 10, 'Informante Y',   'UK');

      INSERT INTO missoes VALUES (1, 10, 'Reconhecimento', 'Ativa');
      INSERT INTO missoes VALUES (2, 11, 'Infiltração',    'Ativa');
      INSERT INTO missoes VALUES (3, 12, 'Resgate',        'Concluída');

      INSERT INTO interceptacoes VALUES (1, 101, '2025-01-13', 'SIGINT');
      INSERT INTO interceptacoes VALUES (2, 102, '2025-01-16', 'HUMINT');
      INSERT INTO interceptacoes VALUES (3, 104, '2025-01-21', 'SIGINT');
    `,
    solution: 'Nikita Volkov',
    hint:
      'Mensagens "Decifrada": agentes 11 (Nikita) e 12 (Sarah). Acesso a base "Maximo": agentes 10 (Area 51), 12 (Area 51), 13 (Kremlin) e 11 (Kremlin). Interseção: agente 11 (Nikita) tem AMBOS — mensagem decifrada E acesso a base Maximo. Sarah acessou Area 51 (Maximo) MAS sua mensagem foi "Decifrada" também — CUIDADO! Porém, verifique: Sarah NÃO acessou Kremlin, mas acessou Area 51 que é Maximo. Ambas 11 e 12 satisfazem! Use o contato com país "Russia" como filtro adicional para isolar o agente duplo.'
  },

  // ─────────────────────────────────────────────────────────────────
  // CASO 44: O Porto Fantasma (Special)
  // Conceito: Detecção de duplicata entre tabelas
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'special4',
    title: 'O Porto Fantasma',
    difficulty: 'Hard',
    description:
      'Dois manifestos de carga foram emitidos para o MESMO container (mesmo codigo_container) — o que indica contrabando "espelhado". Vários navios, vários containers, dois manifestos — encontre o capitão do navio cujo container aparece nos dois.',
    objective:
      'Encontre o NOME do capitão do navio cujo container tem o mesmo codigo_container em AMBOS os manifestos (manifesto_a E manifesto_b).',
    schema: `
      CREATE TABLE capitaes (id INTEGER PRIMARY KEY, nome TEXT);
      CREATE TABLE navios (id INTEGER PRIMARY KEY, capitao_id INTEGER, nome TEXT);
      CREATE TABLE containers (id INTEGER PRIMARY KEY, navio_id INTEGER, codigo_container TEXT, conteudo TEXT);
      CREATE TABLE manifesto_a (id INTEGER PRIMARY KEY, codigo_container TEXT, porto_origem TEXT, data TEXT);
      CREATE TABLE manifesto_b (id INTEGER PRIMARY KEY, codigo_container TEXT, porto_destino TEXT, data TEXT);
      CREATE TABLE inspecoes (id INTEGER PRIMARY KEY, container_id INTEGER, resultado TEXT);
      CREATE TABLE apreensoes (id INTEGER PRIMARY KEY, inspecao_id INTEGER, item TEXT);

      INSERT INTO capitaes VALUES (1, 'Cap. Ancora');
      INSERT INTO capitaes VALUES (2, 'Cap. Sombrio');
      INSERT INTO capitaes VALUES (3, 'Cap. Limpo');

      INSERT INTO navios VALUES (10, 1, 'Navio Bravo');
      INSERT INTO navios VALUES (11, 2, 'Navio Oculto');
      INSERT INTO navios VALUES (12, 3, 'Navio Sol');

      INSERT INTO containers VALUES (100, 10, 'CTN-001', 'Algodão');
      INSERT INTO containers VALUES (101, 11, 'CTN-002', 'Máquinas');
      INSERT INTO containers VALUES (102, 12, 'CTN-003', 'Alimentos');
      INSERT INTO containers VALUES (103, 11, 'CTN-004', 'Peças');

      INSERT INTO manifesto_a VALUES (1, 'CTN-001', 'Santos',     '2025-03-01');
      INSERT INTO manifesto_a VALUES (2, 'CTN-002', 'Paranaguá',  '2025-03-05');
      INSERT INTO manifesto_a VALUES (3, 'CTN-003', 'Itajaí',     '2025-03-08');

      INSERT INTO manifesto_b VALUES (1, 'CTN-002', 'Rotterdam',  '2025-03-10');
      INSERT INTO manifesto_b VALUES (2, 'CTN-004', 'Hamburg',    '2025-03-12');
      INSERT INTO manifesto_b VALUES (3, 'CTN-005', 'Shanghai',   '2025-03-15');

      INSERT INTO inspecoes VALUES (1, 100, 'Limpo');
      INSERT INTO inspecoes VALUES (2, 101, 'Suspeito');
      INSERT INTO inspecoes VALUES (3, 102, 'Limpo');

      INSERT INTO apreensoes VALUES (1, 2, 'Armas');
    `,
    solution: 'Cap. Sombrio',
    hint:
      'Encontre codigo_container que aparece em AMBAS as tabelas: SELECT a.codigo_container FROM manifesto_a a INNER JOIN manifesto_b b ON a.codigo_container = b.codigo_container → CTN-002. Qual container tem esse código? ID 101, navio 11. Capitão do navio 11 = Cap. Sombrio.'
  },

  // ─────────────────────────────────────────────────────────────────
  // CASO 45: Conspiração Eleitoral (Special)
  // Conceito: Subconsulta correlacionada para fraude
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'special5',
    title: 'Conspiração Eleitoral',
    difficulty: 'Hard',
    description:
      'Uma cidade teve MAIS votos registrados numa urna do que eleitores cadastrados naquela seção. A tabela de urnas tem total_votos e a tabela de seções tem total_eleitores. Onde os votos superaram os eleitores?',
    objective:
      'Encontre o NOME da cidade cuja seção eleitoral tem uma urna com total_votos MAIOR que o total_eleitores da seção.',
    schema: `
      CREATE TABLE estados (id INTEGER PRIMARY KEY, nome TEXT, sigla TEXT);
      CREATE TABLE cidades (id INTEGER PRIMARY KEY, estado_id INTEGER, nome TEXT);
      CREATE TABLE zonas_eleitorais (id INTEGER PRIMARY KEY, cidade_id INTEGER, numero INTEGER);
      CREATE TABLE secoes (id INTEGER PRIMARY KEY, zona_id INTEGER, numero INTEGER, total_eleitores INTEGER);
      CREATE TABLE urnas (id INTEGER PRIMARY KEY, secao_id INTEGER, modelo TEXT, total_votos INTEGER);
      CREATE TABLE candidatos (id INTEGER PRIMARY KEY, nome TEXT, partido TEXT);
      CREATE TABLE votos (id INTEGER PRIMARY KEY, urna_id INTEGER, candidato_id INTEGER, quantidade INTEGER);
      CREATE TABLE fiscais (id INTEGER PRIMARY KEY, secao_id INTEGER, nome TEXT);

      INSERT INTO estados VALUES (1, 'São Paulo', 'SP');
      INSERT INTO estados VALUES (2, 'Minas Gerais', 'MG');

      INSERT INTO cidades VALUES (10, 1, 'São Paulo');
      INSERT INTO cidades VALUES (11, 1, 'Campinas');
      INSERT INTO cidades VALUES (12, 2, 'Belo Horizonte');
      INSERT INTO cidades VALUES (13, 2, 'Fantasmópolis');

      INSERT INTO zonas_eleitorais VALUES (100, 10, 1);
      INSERT INTO zonas_eleitorais VALUES (101, 11, 2);
      INSERT INTO zonas_eleitorais VALUES (102, 12, 3);
      INSERT INTO zonas_eleitorais VALUES (103, 13, 4);

      INSERT INTO secoes VALUES (200, 100, 10, 500);
      INSERT INTO secoes VALUES (201, 101, 20, 300);
      INSERT INTO secoes VALUES (202, 102, 30, 450);
      INSERT INTO secoes VALUES (203, 103, 40, 200);

      INSERT INTO urnas VALUES (300, 200, 'UE2020', 498);
      INSERT INTO urnas VALUES (301, 201, 'UE2020', 295);
      INSERT INTO urnas VALUES (302, 202, 'UE2020', 440);
      INSERT INTO urnas VALUES (303, 203, 'UE2020', 350);

      INSERT INTO candidatos VALUES (1, 'Candidato A', 'Partido X');
      INSERT INTO candidatos VALUES (2, 'Candidato B', 'Partido Y');

      INSERT INTO votos VALUES (1, 300, 1, 250);
      INSERT INTO votos VALUES (2, 300, 2, 248);
      INSERT INTO votos VALUES (3, 303, 1, 200);
      INSERT INTO votos VALUES (4, 303, 2, 150);

      INSERT INTO fiscais VALUES (1, 200, 'Fiscal Ana');
      INSERT INTO fiscais VALUES (2, 203, 'Fiscal Nulo');
    `,
    solution: 'Fantasmópolis',
    hint:
      'JOIN urnas com secoes ON urnas.secao_id = secoes.id WHERE urnas.total_votos > secoes.total_eleitores. Seção 203 tem 200 eleitores mas urna 303 tem 350 votos! Trace: seção 203 → zona 103 → cidade 13 = Fantasmópolis.'
  },

  // ─────────────────────────────────────────────────────────────────
  // CASO 46: O Laboratório Secreto (Special)
  // Conceito: Agregação com cálculo de taxa
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'special6',
    title: 'O Laboratório Secreto',
    difficulty: 'Hard',
    description:
      'Um cientista tem uma taxa de falha suspeita em seus experimentos. Use COUNT com filtro para calcular quantos experimentos de cada cientista falharam (resultado = "Falha"). O suspeito tem MAIS de 2 experimentos com "Falha" na ala "Bioarmas".',
    objective:
      'Encontre o NOME do cientista com mais de 2 experimentos com resultado "Falha" na ala "Bioarmas" (GROUP BY + HAVING COUNT > 2).',
    schema: `
      CREATE TABLE alas (id INTEGER PRIMARY KEY, nome TEXT, nivel TEXT);
      CREATE TABLE cientistas (id INTEGER PRIMARY KEY, ala_id INTEGER, nome TEXT, especialidade TEXT);
      CREATE TABLE projetos (id INTEGER PRIMARY KEY, ala_id INTEGER, nome TEXT, classificacao TEXT);
      CREATE TABLE experimentos (id INTEGER PRIMARY KEY, projeto_id INTEGER, cientista_id INTEGER, resultado TEXT, data TEXT);
      CREATE TABLE substancias (id INTEGER PRIMARY KEY, nome TEXT, periculosidade TEXT);
      CREATE TABLE usos (id INTEGER PRIMARY KEY, experimento_id INTEGER, substancia_id INTEGER, quantidade TEXT);
      CREATE TABLE relatorios (id INTEGER PRIMARY KEY, experimento_id INTEGER, aprovado TEXT);

      INSERT INTO alas VALUES (1, 'Bioarmas',     'Ultra Secreto');
      INSERT INTO alas VALUES (2, 'Vacinas',      'Secreto');
      INSERT INTO alas VALUES (3, 'Nanotecnologia','Restrito');

      INSERT INTO cientistas VALUES (10, 1, 'Dr. Destruidor', 'Bioquímica');
      INSERT INTO cientistas VALUES (11, 2, 'Dra. Cura',      'Virologia');
      INSERT INTO cientistas VALUES (12, 1, 'Dr. Cautela',    'Genética');
      INSERT INTO cientistas VALUES (13, 3, 'Dra. Nano',      'Física');

      INSERT INTO projetos VALUES (100, 1, 'Projeto Ômega',    'Bio');
      INSERT INTO projetos VALUES (101, 2, 'Vacina Universal', 'Med');
      INSERT INTO projetos VALUES (102, 1, 'Projeto Zeta',     'Bio');
      INSERT INTO projetos VALUES (103, 3, 'NanoBot',          'Tech');

      INSERT INTO experimentos VALUES (1, 100, 10, 'Falha',    '2025-01-10');
      INSERT INTO experimentos VALUES (2, 100, 10, 'Falha',    '2025-01-15');
      INSERT INTO experimentos VALUES (3, 100, 10, 'Falha',    '2025-01-20');
      INSERT INTO experimentos VALUES (4, 102, 12, 'Sucesso',  '2025-01-22');
      INSERT INTO experimentos VALUES (5, 101, 11, 'Sucesso',  '2025-01-25');
      INSERT INTO experimentos VALUES (6, 102, 12, 'Falha',    '2025-02-01');
      INSERT INTO experimentos VALUES (7, 103, 13, 'Falha',    '2025-02-05');
      INSERT INTO experimentos VALUES (8, 100, 10, 'Sucesso',  '2025-02-10');

      INSERT INTO substancias VALUES (1, 'Anthrax-X', 'Extrema');
      INSERT INTO substancias VALUES (2, 'Vacina-mRNA', 'Baixa');

      INSERT INTO usos VALUES (1, 1, 1, '50ml');
      INSERT INTO usos VALUES (2, 5, 2, '10ml');

      INSERT INTO relatorios VALUES (1, 4, 'Sim');
      INSERT INTO relatorios VALUES (2, 5, 'Sim');
    `,
    solution: 'Dr. Destruidor',
    hint:
      'JOIN experimentos com cientistas e projetos/alas. Filtre ala = "Bioarmas" E resultado = "Falha". GROUP BY cientista_id HAVING COUNT(*) > 2. Dr. Destruidor tem 3 falhas na ala Bioarmas. Dr. Cautela tem apenas 1 falha.'
  },

  // ─────────────────────────────────────────────────────────────────
  // CASO 47: O Diamante Maldito (Special)
  // Conceito: NOT IN para encontrar sem certificação
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'special7',
    title: 'O Diamante Maldito',
    difficulty: 'Hard',
    description:
      'Um diamante foi vendido sem certificado GIA. A tabela de vendas registra todos os diamantes vendidos, e a tabela de certificados registra quais diamantes foram certificados. O diamante vendido sem certificado pertence a um joalheiro específico.',
    objective:
      'Encontre o NOME do joalheiro que vendeu um diamante que NÃO está na tabela de certificados (use NOT IN ou NOT EXISTS).',
    schema: `
      CREATE TABLE joalheiros (id INTEGER PRIMARY KEY, nome TEXT, loja TEXT);
      CREATE TABLE diamantes (id INTEGER PRIMARY KEY, nome TEXT, quilates REAL, joalheiro_id INTEGER);
      CREATE TABLE certificados (id INTEGER PRIMARY KEY, diamante_id INTEGER, orgao TEXT, grau TEXT);
      CREATE TABLE vendas_dia (id INTEGER PRIMARY KEY, diamante_id INTEGER, comprador TEXT, valor INTEGER, data TEXT);
      CREATE TABLE avaliacoes (id INTEGER PRIMARY KEY, diamante_id INTEGER, avaliador TEXT, nota TEXT);
      CREATE TABLE seguros (id INTEGER PRIMARY KEY, venda_id INTEGER, seguradora TEXT);
      CREATE TABLE devolucoes (id INTEGER PRIMARY KEY, venda_id INTEGER, motivo TEXT);

      INSERT INTO joalheiros VALUES (1, 'Sr. Brilhante',  'Tiffanys');
      INSERT INTO joalheiros VALUES (2, 'Dona Gema',      'Cartier');
      INSERT INTO joalheiros VALUES (3, 'Mr. Blood',      'Diamond Co');

      INSERT INTO diamantes VALUES (10, 'Estrela do Norte',  3.5, 1);
      INSERT INTO diamantes VALUES (11, 'Lágrima Azul',      5.0, 2);
      INSERT INTO diamantes VALUES (12, 'Sangue de Fogo',    4.2, 3);
      INSERT INTO diamantes VALUES (13, 'Luz Eterna',        2.8, 1);
      INSERT INTO diamantes VALUES (14, 'Coração Negro',     6.1, 3);

      INSERT INTO certificados VALUES (1, 10, 'GIA', 'VVS1');
      INSERT INTO certificados VALUES (2, 11, 'GIA', 'IF');
      INSERT INTO certificados VALUES (3, 13, 'GIA', 'VS2');

      INSERT INTO vendas_dia VALUES (100, 10, 'Sheik Al',    500000,  '2025-01-10');
      INSERT INTO vendas_dia VALUES (101, 11, 'Lady Diana',  800000,  '2025-01-15');
      INSERT INTO vendas_dia VALUES (102, 12, 'Anônimo',     1200000, '2025-02-01');
      INSERT INTO vendas_dia VALUES (103, 14, 'Mr. X',       900000,  '2025-02-10');

      INSERT INTO avaliacoes VALUES (1, 10, 'Expert A', 'Excelente');
      INSERT INTO avaliacoes VALUES (2, 12, 'Expert B', 'Questionável');

      INSERT INTO seguros VALUES (1, 100, 'Lloyd');
      INSERT INTO seguros VALUES (2, 101, 'AIG');

      INSERT INTO devolucoes VALUES (1, 103, 'Sem certificado');
    `,
    solution: 'Mr. Blood',
    hint:
      'Diamantes certificados: 10, 11, 13. Diamantes vendidos: 10, 11, 12, 14. Vendidos SEM certificado: 12 e 14. Ambos são do joalheiro Mr. Blood (IDs 12 e 14, joalheiro_id = 3). Use: WHERE diamante_id NOT IN (SELECT diamante_id FROM certificados).'
  },

  // ─────────────────────────────────────────────────────────────────
  // CASO 48: A Corrida Espacial (Special)
  // Conceito: SUM + múltiplos JOINs para orçamento
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'special8',
    title: 'A Corrida Espacial',
    difficulty: 'Hard',
    description:
      'Uma missão espacial gastou mais do que o orçamento aprovado. Compare a SUM dos gastos reais com o orcamento_aprovado da missão. Qual missão tem gastos acima do aprovado?',
    objective:
      'Encontre o NOME da missão cuja soma de gastos reais (SUM de valor em gastos) ultrapassa o orcamento_aprovado (use SUM + GROUP BY e compare com o orçamento).',
    schema: `
      CREATE TABLE agencias (id INTEGER PRIMARY KEY, nome TEXT, pais TEXT);
      CREATE TABLE missoes (id INTEGER PRIMARY KEY, agencia_id INTEGER, nome TEXT, orcamento_aprovado INTEGER, status TEXT);
      CREATE TABLE equipes (id INTEGER PRIMARY KEY, missao_id INTEGER, astronauta TEXT, funcao TEXT);
      CREATE TABLE fornecedores_esp (id INTEGER PRIMARY KEY, nome TEXT, especialidade TEXT);
      CREATE TABLE contratos (id INTEGER PRIMARY KEY, missao_id INTEGER, fornecedor_id INTEGER, descricao TEXT);
      CREATE TABLE gastos (id INTEGER PRIMARY KEY, contrato_id INTEGER, valor INTEGER, data TEXT, categoria TEXT);
      CREATE TABLE lancamentos (id INTEGER PRIMARY KEY, missao_id INTEGER, data TEXT, base TEXT);
      CREATE TABLE telemetrias (id INTEGER PRIMARY KEY, lancamento_id INTEGER, status TEXT);

      INSERT INTO agencias VALUES (1, 'NASA',  'EUA');
      INSERT INTO agencias VALUES (2, 'SpaceX','EUA');

      INSERT INTO missoes VALUES (10, 1, 'Artemis IX',     5000000, 'Ativa');
      INSERT INTO missoes VALUES (11, 2, 'Mars Express',   8000000, 'Ativa');
      INSERT INTO missoes VALUES (12, 1, 'Lunar Gateway',  3000000, 'Planejada');

      INSERT INTO equipes VALUES (1, 10, 'Col. Anderson', 'Comandante');
      INSERT INTO equipes VALUES (2, 11, 'Dr. Mars',      'Cientista');
      INSERT INTO equipes VALUES (3, 12, 'Eng. Luna',     'Engenheira');

      INSERT INTO fornecedores_esp VALUES (1, 'Boeing',    'Foguetes');
      INSERT INTO fornecedores_esp VALUES (2, 'Lockheed',  'Satélites');

      INSERT INTO contratos VALUES (100, 10, 1, 'Motor principal');
      INSERT INTO contratos VALUES (101, 10, 2, 'Painel solar');
      INSERT INTO contratos VALUES (102, 11, 1, 'Módulo Mars');
      INSERT INTO contratos VALUES (103, 12, 2, 'Estação orbital');

      INSERT INTO gastos VALUES (1, 100, 3000000, '2025-01-01', 'Hardware');
      INSERT INTO gastos VALUES (2, 101, 1500000, '2025-02-01', 'Hardware');
      INSERT INTO gastos VALUES (3, 100, 1000000, '2025-03-01', 'Manutenção');
      INSERT INTO gastos VALUES (4, 102, 4000000, '2025-01-15', 'Hardware');
      INSERT INTO gastos VALUES (5, 102, 3500000, '2025-02-15', 'Testes');
      INSERT INTO gastos VALUES (6, 103, 1000000, '2025-03-01', 'Projeto');

      INSERT INTO lancamentos VALUES (1, 10, '2025-06-01', 'Kennedy');
      INSERT INTO telemetrias VALUES (1, 1, 'Nominal');
    `,
    solution: 'Artemis IX',
    hint:
      'Artemis IX (orçamento 5M): contratos 100 e 101. Gastos: 3M + 1.5M + 1M = 5.5M → ACIMA do orçamento! Mars Express (orçamento 8M): contrato 102. Gastos: 4M + 3.5M = 7.5M → ABAIXO. Lunar Gateway (orçamento 3M): contrato 103. Gastos: 1M → ABAIXO. JOIN gastos → contratos → missoes, GROUP BY missao, HAVING SUM(valor) > orcamento_aprovado.'
  },

  // ─────────────────────────────────────────────────────────────────
  // CASO 49: O Hacker do Metrô (Special)
  // Conceito: Detecção de acesso fora do horário
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'special9',
    title: 'O Hacker do Metrô',
    difficulty: 'Hard',
    description:
      'Um técnico acessou o sistema de controle do metrô FORA do horário de expediente (antes das "08:00" ou depois das "18:00"). Vários técnicos fazem acessos diários, mas apenas um acessou fora do horário E na estação "Central".',
    objective:
      'Encontre o NOME do técnico que acessou o sistema na estação "Central" fora do expediente (hora < "08:00" OU hora > "18:00").',
    schema: `
      CREATE TABLE linhas (id INTEGER PRIMARY KEY, nome TEXT, cor TEXT);
      CREATE TABLE estacoes (id INTEGER PRIMARY KEY, linha_id INTEGER, nome TEXT);
      CREATE TABLE tecnicos (id INTEGER PRIMARY KEY, nome TEXT, especialidade TEXT);
      CREATE TABLE sistemas (id INTEGER PRIMARY KEY, estacao_id INTEGER, tipo TEXT, versao TEXT);
      CREATE TABLE acessos_sys (id INTEGER PRIMARY KEY, sistema_id INTEGER, tecnico_id INTEGER, hora TEXT, data TEXT);
      CREATE TABLE incidentes (id INTEGER PRIMARY KEY, estacao_id INTEGER, descricao TEXT, data TEXT);
      CREATE TABLE cameras (id INTEGER PRIMARY KEY, estacao_id INTEGER, status TEXT);

      INSERT INTO linhas VALUES (1, 'Linha Azul',    'Azul');
      INSERT INTO linhas VALUES (2, 'Linha Vermelha', 'Vermelha');

      INSERT INTO estacoes VALUES (10, 1, 'Central');
      INSERT INTO estacoes VALUES (11, 1, 'Norte');
      INSERT INTO estacoes VALUES (12, 2, 'Sul');
      INSERT INTO estacoes VALUES (13, 2, 'Central');

      INSERT INTO tecnicos VALUES (50, 'Alex Bit',     'Redes');
      INSERT INTO tecnicos VALUES (51, 'Bruna Hack',   'Firmware');
      INSERT INTO tecnicos VALUES (52, 'Carlos Sys',   'Redes');
      INSERT INTO tecnicos VALUES (53, 'Diana Debug',  'Software');

      INSERT INTO sistemas VALUES (100, 10, 'Controle de Trem', 'v3.1');
      INSERT INTO sistemas VALUES (101, 11, 'Bilhetagem',       'v2.0');
      INSERT INTO sistemas VALUES (102, 12, 'CFTV',             'v1.5');
      INSERT INTO sistemas VALUES (103, 13, 'Controle de Trem', 'v3.1');

      INSERT INTO acessos_sys VALUES (1, 100, 50, '09:30', '2025-05-01');
      INSERT INTO acessos_sys VALUES (2, 101, 51, '14:00', '2025-05-01');
      INSERT INTO acessos_sys VALUES (3, 100, 52, '23:45', '2025-05-02');
      INSERT INTO acessos_sys VALUES (4, 102, 53, '10:00', '2025-05-02');
      INSERT INTO acessos_sys VALUES (5, 103, 50, '02:00', '2025-05-03');
      INSERT INTO acessos_sys VALUES (6, 101, 52, '07:30', '2025-05-03');

      INSERT INTO incidentes VALUES (1, 10, 'Trem parou inesperadamente',  '2025-05-03');
      INSERT INTO incidentes VALUES (2, 13, 'Sinal invertido',             '2025-05-04');

      INSERT INTO cameras VALUES (1, 10, 'Offline');
      INSERT INTO cameras VALUES (2, 11, 'Online');
      INSERT INTO cameras VALUES (3, 12, 'Online');
      INSERT INTO cameras VALUES (4, 13, 'Offline');
    `,
    solution: 'Carlos Sys',
    hint:
      'Acessos fora do expediente (< 08:00 ou > 18:00): ID 3 (Carlos, 23:45, sistema 100, estação Central), ID 5 (Alex, 02:00, sistema 103, estação Central) e ID 6 (Carlos, 07:30, sistema 101, estação Norte). Estação "Central": IDs 3 e 5. Mas atenção: há DUAS estações "Central" (IDs 10 e 13, linhas diferentes). O sistema 100 pertence à estação 10 (Central Azul). Carlos acessou o sistema 100 às 23:45.'
  },

  // ─────────────────────────────────────────────────────────────────
  // CASO 50: O Dossiê Perdido (Special)
  // Conceito: LEFT JOIN para documentos sem aprovação
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'special10',
    title: 'O Dossiê Perdido',
    difficulty: 'Hard',
    description:
      'Um documento ultra-secreto foi publicado sem a assinatura de aprovação do diretor responsável. A tabela de documentos existe, a tabela de aprovações registra quem assinou — mas um documento de classificação "Ultra Secreto" foi publicado (status = "Publicado") sem ter aprovação.',
    objective:
      'Encontre o NOME do documento com classificacao "Ultra Secreto" e status "Publicado" que NÃO possui registro na tabela de aprovacoes (LEFT JOIN + IS NULL).',
    schema: `
      CREATE TABLE departamentos (id INTEGER PRIMARY KEY, nome TEXT, andar INTEGER);
      CREATE TABLE diretores (id INTEGER PRIMARY KEY, dep_id INTEGER, nome TEXT);
      CREATE TABLE documentos (id INTEGER PRIMARY KEY, dep_id INTEGER, titulo TEXT, classificacao TEXT, status TEXT);
      CREATE TABLE aprovacoes (id INTEGER PRIMARY KEY, doc_id INTEGER, diretor_id INTEGER, data TEXT);
      CREATE TABLE logs_doc (id INTEGER PRIMARY KEY, doc_id INTEGER, acao TEXT, data TEXT);
      CREATE TABLE cofres_doc (id INTEGER PRIMARY KEY, doc_id INTEGER, localizacao TEXT);
      CREATE TABLE vazamentos (id INTEGER PRIMARY KEY, doc_id INTEGER, data TEXT, destino TEXT);
      CREATE TABLE investigacoes (id INTEGER PRIMARY KEY, vazamento_id INTEGER, status TEXT);

      INSERT INTO departamentos VALUES (1, 'Inteligência',  5);
      INSERT INTO departamentos VALUES (2, 'Defesa',        3);
      INSERT INTO departamentos VALUES (3, 'Diplomacia',    2);

      INSERT INTO diretores VALUES (10, 1, 'Dir. Sombra');
      INSERT INTO diretores VALUES (11, 2, 'Dir. Escudo');
      INSERT INTO diretores VALUES (12, 3, 'Dir. Paz');

      INSERT INTO documentos VALUES (100, 1, 'Operação Eclipse',   'Ultra Secreto', 'Publicado');
      INSERT INTO documentos VALUES (101, 2, 'Plano de Defesa',    'Secreto',       'Rascunho');
      INSERT INTO documentos VALUES (102, 1, 'Lista de Agentes',   'Ultra Secreto', 'Publicado');
      INSERT INTO documentos VALUES (103, 3, 'Tratado de Paz',     'Público',       'Publicado');
      INSERT INTO documentos VALUES (104, 2, 'Código de Lançamento','Ultra Secreto', 'Arquivado');

      INSERT INTO aprovacoes VALUES (1, 102, 10, '2025-01-10');
      INSERT INTO aprovacoes VALUES (2, 103, 12, '2025-01-15');
      INSERT INTO aprovacoes VALUES (3, 104, 11, '2025-01-20');

      INSERT INTO logs_doc VALUES (1, 100, 'Criado',    '2025-01-01');
      INSERT INTO logs_doc VALUES (2, 100, 'Publicado', '2025-01-05');
      INSERT INTO logs_doc VALUES (3, 102, 'Aprovado',  '2025-01-10');
      INSERT INTO logs_doc VALUES (4, 102, 'Publicado', '2025-01-11');

      INSERT INTO cofres_doc VALUES (1, 102, 'Cofre A');
      INSERT INTO cofres_doc VALUES (2, 104, 'Cofre B');

      INSERT INTO vazamentos VALUES (1, 100, '2025-02-01', 'WikiLeaks');
      INSERT INTO investigacoes VALUES (1, 1, 'Em Andamento');
    `,
    solution: 'Operação Eclipse',
    hint:
      'LEFT JOIN documentos com aprovacoes ON documentos.id = aprovacoes.doc_id. WHERE aprovacoes.id IS NULL AND classificacao = "Ultra Secreto" AND status = "Publicado". Docs Ultra Secreto Publicados: 100 e 102. Doc 102 tem aprovação (ID 1). Doc 100 NÃO tem. Título: "Operação Eclipse".'
  }
];
