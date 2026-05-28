import type { Case } from '../../types';

export const seniorCases: Case[] = [
  // ─────────────────────────────────────────────────────────────────
  // CASO 31: O Paciente Zero (Senior)
  // Conceito: LEFT JOIN + IS NULL
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'senior1',
    title: 'O Paciente Zero',
    difficulty: 'Medium',
    description:
      'Um surto de vírus atingiu a "Zona Norte" do hospital. Todos os moradores deveriam ter sido vacinados, mas um deles NÃO tem registro de vacinação. O sistema de saúde possui a lista de moradores e de vacinações — quem ficou de fora?',
    objective:
      'Encontre o NOME do morador da "Zona Norte" que NÃO possui registro algum na tabela de vacinações (use LEFT JOIN e IS NULL).',
    schema: `
      CREATE TABLE zonas (id INTEGER PRIMARY KEY, nome TEXT, risco TEXT);
      CREATE TABLE postos (id INTEGER PRIMARY KEY, zona_id INTEGER, nome TEXT);
      CREATE TABLE moradores (id INTEGER PRIMARY KEY, nome TEXT, zona_id INTEGER, idade INTEGER);
      CREATE TABLE enfermeiros (id INTEGER PRIMARY KEY, nome TEXT, posto_id INTEGER);
      CREATE TABLE vacinacoes (id INTEGER PRIMARY KEY, morador_id INTEGER, enfermeiro_id INTEGER, data TEXT);

      INSERT INTO zonas VALUES (1, 'Zona Norte', 'Alto');
      INSERT INTO zonas VALUES (2, 'Zona Sul',   'Baixo');
      INSERT INTO zonas VALUES (3, 'Centro',     'Medio');

      INSERT INTO postos VALUES (10, 1, 'Posto Central Norte');
      INSERT INTO postos VALUES (11, 2, 'Posto Sul');
      INSERT INTO postos VALUES (12, 3, 'Posto Centro');

      INSERT INTO moradores VALUES (100, 'Elena Souza',   1, 34);
      INSERT INTO moradores VALUES (101, 'Davi Motta',    1, 28);
      INSERT INTO moradores VALUES (102, 'Camila Reis',   1, 45);
      INSERT INTO moradores VALUES (103, 'Bruno Alves',   2, 31);
      INSERT INTO moradores VALUES (104, 'Renata Farias', 2, 50);
      INSERT INTO moradores VALUES (105, 'Igor Lemos',    3, 22);

      INSERT INTO enfermeiros VALUES (50, 'Enf. Clara',  10);
      INSERT INTO enfermeiros VALUES (51, 'Enf. Pedro',  11);
      INSERT INTO enfermeiros VALUES (52, 'Enf. Marta',  12);

      INSERT INTO vacinacoes VALUES (1, 100, 50, '2025-03-01');
      INSERT INTO vacinacoes VALUES (2, 102, 50, '2025-03-01');
      INSERT INTO vacinacoes VALUES (3, 103, 51, '2025-03-02');
      INSERT INTO vacinacoes VALUES (4, 104, 51, '2025-03-02');
      INSERT INTO vacinacoes VALUES (5, 105, 52, '2025-03-03');
    `,
    solution: 'Davi Motta',
    hint:
      'Use LEFT JOIN moradores com vacinacoes ON moradores.id = vacinacoes.morador_id. Filtre WHERE vacinacoes.id IS NULL AND zona_id = 1 (Zona Norte). Quem não foi vacinado?'
  },

  // ─────────────────────────────────────────────────────────────────
  // CASO 32: A Herança Envenenada (Senior)
  // Conceito: LEFT JOIN + IS NULL para encontrar quem NÃO tem álibi
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'senior2',
    title: 'A Herança Envenenada',
    difficulty: 'Medium',
    description:
      'O patriarca da família Monteiro morreu envenenado. Cinco herdeiros disputam a fortuna. Na noite do crime, quatro deles registraram álibis verificáveis em câmeras de segurança. Um herdeiro NÃO tem álibi registrado.',
    objective:
      'Encontre o NOME do herdeiro que NÃO possui nenhum registro na tabela de álibis (use LEFT JOIN e IS NULL).',
    schema: `
      CREATE TABLE familias (id INTEGER PRIMARY KEY, sobrenome TEXT, patrimonio INTEGER);
      CREATE TABLE herdeiros (id INTEGER PRIMARY KEY, familia_id INTEGER, nome TEXT, parentesco TEXT);
      CREATE TABLE alibis (id INTEGER PRIMARY KEY, herdeiro_id INTEGER, local TEXT, hora TEXT, verificado TEXT);
      CREATE TABLE camaras (id INTEGER PRIMARY KEY, local TEXT, status TEXT);
      CREATE TABLE testamentos (id INTEGER PRIMARY KEY, familia_id INTEGER, beneficiario_id INTEGER, percentual INTEGER);

      INSERT INTO familias VALUES (1, 'Monteiro', 50000000);

      INSERT INTO herdeiros VALUES (10, 1, 'Ricardo Monteiro',  'Filho');
      INSERT INTO herdeiros VALUES (11, 1, 'Valentina Monteiro','Filha');
      INSERT INTO herdeiros VALUES (12, 1, 'Hugo Monteiro',     'Sobrinho');
      INSERT INTO herdeiros VALUES (13, 1, 'Cecilia Monteiro',  'Esposa');
      INSERT INTO herdeiros VALUES (14, 1, 'Diego Monteiro',    'Irmão');

      INSERT INTO camaras VALUES (1, 'Sala de Estar',  'Ativa');
      INSERT INTO camaras VALUES (2, 'Jardim',         'Ativa');
      INSERT INTO camaras VALUES (3, 'Garagem',        'Desligada');

      INSERT INTO alibis VALUES (100, 10, 'Restaurante Lux', '21:00', 'Sim');
      INSERT INTO alibis VALUES (101, 11, 'Cinema Central',  '20:30', 'Sim');
      INSERT INTO alibis VALUES (102, 13, 'Sala de Estar',   '22:00', 'Sim');
      INSERT INTO alibis VALUES (103, 14, 'Academia VIP',    '21:30', 'Sim');

      INSERT INTO testamentos VALUES (1, 1, 10, 20);
      INSERT INTO testamentos VALUES (2, 1, 11, 20);
      INSERT INTO testamentos VALUES (3, 1, 12, 40);
      INSERT INTO testamentos VALUES (4, 1, 13, 10);
      INSERT INTO testamentos VALUES (5, 1, 14, 10);
    `,
    solution: 'Hugo Monteiro',
    hint:
      'LEFT JOIN herdeiros com alibis ON herdeiros.id = alibis.herdeiro_id. Filtre WHERE alibis.id IS NULL. Quem não tem álibi? Bônus: ele herda 40% — o maior percentual!'
  },

  // ─────────────────────────────────────────────────────────────────
  // CASO 33: Vazamento de Dados (Senior)
  // Conceito: LIKE com wildcards
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'senior3',
    title: 'Vazamento de Dados',
    difficulty: 'Medium',
    description:
      'O firewall da empresa detectou um acesso externo vindo de um IP que começa com "192.168.99". Vários funcionários acessaram o sistema naquela noite, mas o log suspeito contém um padrão específico no campo de ação: a palavra "EXPORT" em algum lugar do texto.',
    objective:
      'Encontre o NOME do funcionário cujo log de acesso contém a palavra "EXPORT" (use LIKE) e cujo IP começa com "192.168.99".',
    schema: `
      CREATE TABLE setores (id INTEGER PRIMARY KEY, nome TEXT);
      CREATE TABLE funcionarios (id INTEGER PRIMARY KEY, setor_id INTEGER, nome TEXT, cargo TEXT);
      CREATE TABLE computadores (id INTEGER PRIMARY KEY, func_id INTEGER, ip TEXT, hostname TEXT);
      CREATE TABLE logs_acesso (id INTEGER PRIMARY KEY, comp_id INTEGER, acao TEXT, data TEXT);
      CREATE TABLE alertas (id INTEGER PRIMARY KEY, log_id INTEGER, severidade TEXT);

      INSERT INTO setores VALUES (1, 'Engenharia');
      INSERT INTO setores VALUES (2, 'Financeiro');
      INSERT INTO setores VALUES (3, 'RH');

      INSERT INTO funcionarios VALUES (10, 1, 'Tiago Hacker',  'Dev Sr');
      INSERT INTO funcionarios VALUES (11, 2, 'Marina Fiscal', 'Contadora');
      INSERT INTO funcionarios VALUES (12, 1, 'Luana Code',    'Dev Jr');
      INSERT INTO funcionarios VALUES (13, 3, 'Paulo Gente',   'Analista RH');
      INSERT INTO funcionarios VALUES (14, 2, 'Rafael Cifra',  'Gerente Fin');

      INSERT INTO computadores VALUES (50, 10, '192.168.99.10', 'ENG-PC01');
      INSERT INTO computadores VALUES (51, 11, '192.168.1.20',  'FIN-PC01');
      INSERT INTO computadores VALUES (52, 12, '192.168.99.15', 'ENG-PC02');
      INSERT INTO computadores VALUES (53, 13, '192.168.1.30',  'RH-PC01');
      INSERT INTO computadores VALUES (54, 14, '192.168.99.5',  'FIN-PC02');

      INSERT INTO logs_acesso VALUES (1, 50, 'LOGIN sistema interno',        '2025-06-10 23:01');
      INSERT INTO logs_acesso VALUES (2, 50, 'EXPORT_DATABASE clientes.csv', '2025-06-10 23:15');
      INSERT INTO logs_acesso VALUES (3, 51, 'LOGIN sistema interno',        '2025-06-10 22:00');
      INSERT INTO logs_acesso VALUES (4, 52, 'COMPILE projeto X',            '2025-06-10 23:30');
      INSERT INTO logs_acesso VALUES (5, 54, 'EXPORT relatorio fiscal.pdf',  '2025-06-10 23:45');
      INSERT INTO logs_acesso VALUES (6, 53, 'VIEW folha pagamento',         '2025-06-10 20:00');

      INSERT INTO alertas VALUES (1, 2, 'Critico');
      INSERT INTO alertas VALUES (2, 5, 'Medio');
    `,
    solution: 'Tiago Hacker',
    hint:
      'Dois logs contêm "EXPORT" (IDs 2 e 5). Dois IPs começam com "192.168.99" e têm EXPORT. Mas o alerta "Critico" só aparece no log 2. Use LIKE "%EXPORT%" e LIKE "192.168.99%". JOIN logs_acesso, computadores, funcionarios.'
  },

  // ─────────────────────────────────────────────────────────────────
  // CASO 34: O Contrabando Marítimo (Senior)
  // Conceito: BETWEEN para faixas de peso e datas
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'senior4',
    title: 'O Contrabando Marítimo',
    difficulty: 'Medium',
    description:
      'A alfândega suspeita que containers com peso ENTRE 4000 e 6000 kg que chegaram ENTRE "2025-03-01" e "2025-03-15" contêm contrabando. Vários navios atracaram no período, mas apenas um container se encaixa exatamente nessa faixa.',
    objective:
      'Encontre o NOME do capitão do navio cujo container tem peso BETWEEN 4000 AND 6000 e data_chegada BETWEEN "2025-03-01" AND "2025-03-15".',
    schema: `
      CREATE TABLE portos (id INTEGER PRIMARY KEY, nome TEXT, pais TEXT);
      CREATE TABLE capitaes (id INTEGER PRIMARY KEY, nome TEXT, nacionalidade TEXT);
      CREATE TABLE navios (id INTEGER PRIMARY KEY, capitao_id INTEGER, nome TEXT, bandeira TEXT);
      CREATE TABLE containers (id INTEGER PRIMARY KEY, navio_id INTEGER, peso_kg INTEGER, conteudo TEXT);
      CREATE TABLE chegadas (id INTEGER PRIMARY KEY, container_id INTEGER, porto_id INTEGER, data_chegada TEXT);

      INSERT INTO portos VALUES (1, 'Porto de Santos',  'Brasil');
      INSERT INTO portos VALUES (2, 'Porto de Lisboa',  'Portugal');

      INSERT INTO capitaes VALUES (10, 'Cap. Rodrigo',  'Brasileiro');
      INSERT INTO capitaes VALUES (11, 'Cap. Nemo',     'Francês');
      INSERT INTO capitaes VALUES (12, 'Cap. Ahab',     'Americano');
      INSERT INTO capitaes VALUES (13, 'Cap. Sombra',   'Panamenho');

      INSERT INTO navios VALUES (50, 10, 'Estrela do Mar', 'Brasil');
      INSERT INTO navios VALUES (51, 11, 'Nautilus',       'França');
      INSERT INTO navios VALUES (52, 12, 'Pequod',         'EUA');
      INSERT INTO navios VALUES (53, 13, 'Fantasma Negro', 'Panama');

      INSERT INTO containers VALUES (100, 50, 3000, 'Café');
      INSERT INTO containers VALUES (101, 51, 7000, 'Maquinário');
      INSERT INTO containers VALUES (102, 52, 2000, 'Tecidos');
      INSERT INTO containers VALUES (103, 53, 5200, 'Peças Industriais');
      INSERT INTO containers VALUES (104, 50, 4500, 'Soja');
      INSERT INTO containers VALUES (105, 53, 1000, 'Livros');

      INSERT INTO chegadas VALUES (1, 100, 1, '2025-02-28');
      INSERT INTO chegadas VALUES (2, 101, 1, '2025-03-05');
      INSERT INTO chegadas VALUES (3, 102, 2, '2025-03-10');
      INSERT INTO chegadas VALUES (4, 103, 1, '2025-03-12');
      INSERT INTO chegadas VALUES (5, 104, 1, '2025-03-20');
      INSERT INTO chegadas VALUES (6, 105, 2, '2025-03-08');
    `,
    solution: 'Cap. Sombra',
    hint:
      'Filtre containers com peso BETWEEN 4000 AND 6000 → IDs 103 (5200) e 104 (4500). Agora filtre chegadas com data BETWEEN "2025-03-01" AND "2025-03-15" → container 103 chegou dia 12 (dentro!), container 104 chegou dia 20 (fora!). Quem é o capitão do navio do container 103?'
  },

  // ─────────────────────────────────────────────────────────────────
  // CASO 35: A Escola do Crime (Senior)
  // Conceito: CASE WHEN para categorizar
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'senior5',
    title: 'A Escola do Crime',
    difficulty: 'Medium',
    description:
      'Uma investigação revelou que um professor inflou notas de alunos específicos. Use CASE WHEN para categorizar notas: acima de 95 é "Suspeita", entre 70 e 95 é "Normal", abaixo de 70 é "Reprovado". O professor suspeito tem MAIS alunos com notas "Suspeitas" (>95) na disciplina "Cálculo".',
    objective:
      'Encontre o NOME do professor com MAIS alunos com nota acima de 95 na disciplina "Cálculo" (use COUNT + GROUP BY + HAVING ou CASE WHEN).',
    schema: `
      CREATE TABLE disciplinas (id INTEGER PRIMARY KEY, nome TEXT, semestre TEXT);
      CREATE TABLE professores (id INTEGER PRIMARY KEY, nome TEXT, departamento TEXT);
      CREATE TABLE turmas (id INTEGER PRIMARY KEY, disc_id INTEGER, prof_id INTEGER);
      CREATE TABLE alunos (id INTEGER PRIMARY KEY, nome TEXT, matricula TEXT);
      CREATE TABLE notas (id INTEGER PRIMARY KEY, turma_id INTEGER, aluno_id INTEGER, valor INTEGER);

      INSERT INTO disciplinas VALUES (1, 'Cálculo',        '2025.1');
      INSERT INTO disciplinas VALUES (2, 'Física',         '2025.1');
      INSERT INTO disciplinas VALUES (3, 'Programação',    '2025.1');

      INSERT INTO professores VALUES (10, 'Prof. Honesto',    'Exatas');
      INSERT INTO professores VALUES (11, 'Prof. Corrupto',   'Exatas');
      INSERT INTO professores VALUES (12, 'Prof. Rigoroso',   'Exatas');

      INSERT INTO turmas VALUES (100, 1, 10);
      INSERT INTO turmas VALUES (101, 1, 11);
      INSERT INTO turmas VALUES (102, 2, 12);
      INSERT INTO turmas VALUES (103, 3, 10);

      INSERT INTO alunos VALUES (50, 'Ana',    'MAT-001');
      INSERT INTO alunos VALUES (51, 'Bruno',  'MAT-002');
      INSERT INTO alunos VALUES (52, 'Carla',  'MAT-003');
      INSERT INTO alunos VALUES (53, 'Diego',  'MAT-004');
      INSERT INTO alunos VALUES (54, 'Eva',    'MAT-005');
      INSERT INTO alunos VALUES (55, 'Fabio',  'MAT-006');

      INSERT INTO notas VALUES (1, 100, 50, 85);
      INSERT INTO notas VALUES (2, 100, 51, 72);
      INSERT INTO notas VALUES (3, 101, 52, 98);
      INSERT INTO notas VALUES (4, 101, 53, 99);
      INSERT INTO notas VALUES (5, 101, 54, 97);
      INSERT INTO notas VALUES (6, 100, 55, 96);
      INSERT INTO notas VALUES (7, 102, 50, 60);
      INSERT INTO notas VALUES (8, 103, 51, 88);
    `,
    solution: 'Prof. Corrupto',
    hint:
      'Filtre notas > 95 em turmas de Cálculo (disc_id=1). Prof. Honesto (turma 100) tem 1 nota > 95 (Fabio=96). Prof. Corrupto (turma 101) tem 3 notas > 95 (Carla=98, Diego=99, Eva=97). GROUP BY prof_id + HAVING COUNT(*) para achar quem tem mais.'
  },

  // ─────────────────────────────────────────────────────────────────
  // CASO 36: Operação Gelo Negro (Senior)
  // Conceito: COALESCE + IS NULL em inspeções omitidas
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'senior6',
    title: 'Operação Gelo Negro',
    difficulty: 'Medium',
    description:
      'Uma plataforma de petróleo explodiu. A investigação aponta que um inspetor NUNCA registrou nenhuma vistoria na plataforma "Atlântico-7". Use LEFT JOIN para encontrar quem deveria ter inspecionado mas não o fez.',
    objective:
      'Encontre o NOME do inspetor designado para a plataforma "Atlântico-7" que NÃO possui nenhum registro na tabela de vistorias (LEFT JOIN + IS NULL).',
    schema: `
      CREATE TABLE empresas (id INTEGER PRIMARY KEY, nome TEXT, setor TEXT);
      CREATE TABLE plataformas (id INTEGER PRIMARY KEY, empresa_id INTEGER, nome TEXT, regiao TEXT);
      CREATE TABLE inspetores (id INTEGER PRIMARY KEY, nome TEXT, certificacao TEXT);
      CREATE TABLE designacoes (id INTEGER PRIMARY KEY, inspetor_id INTEGER, plataforma_id INTEGER, periodo TEXT);
      CREATE TABLE vistorias (id INTEGER PRIMARY KEY, designacao_id INTEGER, data TEXT, resultado TEXT);

      INSERT INTO empresas VALUES (1, 'PetroBras',    'Petróleo');
      INSERT INTO empresas VALUES (2, 'ShellMar',     'Petróleo');

      INSERT INTO plataformas VALUES (10, 1, 'Atlântico-7',   'Sudeste');
      INSERT INTO plataformas VALUES (11, 1, 'Pacífico-3',    'Sul');
      INSERT INTO plataformas VALUES (12, 2, 'Atlântico-7',   'Nordeste');

      INSERT INTO inspetores VALUES (50, 'Marcos Fiel',     'ISO-9001');
      INSERT INTO inspetores VALUES (51, 'Sandra Omissa',   'ISO-9001');
      INSERT INTO inspetores VALUES (52, 'Carlos Check',    'ISO-14001');
      INSERT INTO inspetores VALUES (53, 'Lucia Rigor',     'ISO-9001');

      INSERT INTO designacoes VALUES (1, 50, 11, '2025-Q1');
      INSERT INTO designacoes VALUES (2, 51, 10, '2025-Q1');
      INSERT INTO designacoes VALUES (3, 52, 10, '2025-Q1');
      INSERT INTO designacoes VALUES (4, 53, 12, '2025-Q1');

      INSERT INTO vistorias VALUES (100, 1, '2025-01-15', 'Aprovado');
      INSERT INTO vistorias VALUES (101, 3, '2025-01-20', 'Aprovado');
      INSERT INTO vistorias VALUES (102, 4, '2025-02-01', 'Reprovado');
      INSERT INTO vistorias VALUES (103, 3, '2025-02-15', 'Aprovado');
    `,
    solution: 'Sandra Omissa',
    hint:
      'Dois inspetores estão designados para plataformas chamadas "Atlântico-7" (designações 2 e 3, plataformas 10 e 12). A designação 3 (Carlos Check, plat 10) tem vistorias. A designação 2 (Sandra Omissa, plat 10) NÃO tem nenhuma. LEFT JOIN designacoes com vistorias WHERE vistorias.id IS NULL e plataforma = "Atlântico-7".'
  },

  // ─────────────────────────────────────────────────────────────────
  // CASO 37: O Falsificador de Vinhos (Senior)
  // Conceito: LEFT JOIN + filtros combinados
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'senior7',
    title: 'O Falsificador de Vinhos',
    difficulty: 'Medium',
    description:
      'Um sommelier aprovou um lote de vinho da safra "2015" da vinícola "Château Noir" que NÃO possuía certificado de origem. Todos os lotes aprovados deveriam ter certificado, mas um deles passou sem.',
    objective:
      'Encontre o NOME do sommelier que aprovou o lote de vinho da vinícola "Château Noir" (safra "2015") que NÃO tem certificado de origem (LEFT JOIN certificados IS NULL).',
    schema: `
      CREATE TABLE vinicolas (id INTEGER PRIMARY KEY, nome TEXT, pais TEXT);
      CREATE TABLE lotes (id INTEGER PRIMARY KEY, vinicola_id INTEGER, safra TEXT, tipo TEXT);
      CREATE TABLE sommeliers (id INTEGER PRIMARY KEY, nome TEXT, especialidade TEXT);
      CREATE TABLE aprovacoes (id INTEGER PRIMARY KEY, lote_id INTEGER, sommelier_id INTEGER, data TEXT);
      CREATE TABLE certificados (id INTEGER PRIMARY KEY, lote_id INTEGER, orgao TEXT, validade TEXT);

      INSERT INTO vinicolas VALUES (1, 'Château Noir',   'França');
      INSERT INTO vinicolas VALUES (2, 'Villa Toscana',  'Itália');
      INSERT INTO vinicolas VALUES (3, 'Bodega del Sol', 'Argentina');

      INSERT INTO lotes VALUES (10, 1, '2015', 'Tinto Reserva');
      INSERT INTO lotes VALUES (11, 1, '2018', 'Branco');
      INSERT INTO lotes VALUES (12, 2, '2015', 'Chianti');
      INSERT INTO lotes VALUES (13, 3, '2020', 'Malbec');
      INSERT INTO lotes VALUES (14, 1, '2015', 'Rosé');

      INSERT INTO sommeliers VALUES (50, 'Jean Pierre',    'Tintos');
      INSERT INTO sommeliers VALUES (51, 'Maria Vinhas',   'Brancos');
      INSERT INTO sommeliers VALUES (52, 'Carlos Barril',  'Tintos');

      INSERT INTO aprovacoes VALUES (1, 10, 50, '2025-01-10');
      INSERT INTO aprovacoes VALUES (2, 11, 51, '2025-01-15');
      INSERT INTO aprovacoes VALUES (3, 12, 52, '2025-01-20');
      INSERT INTO aprovacoes VALUES (4, 13, 50, '2025-02-01');
      INSERT INTO aprovacoes VALUES (5, 14, 52, '2025-02-05');

      INSERT INTO certificados VALUES (1, 11, 'AOC França',   '2026-01-01');
      INSERT INTO certificados VALUES (2, 12, 'DOC Itália',   '2026-06-01');
      INSERT INTO certificados VALUES (3, 13, 'INV Argentina','2026-03-01');
      INSERT INTO certificados VALUES (4, 14, 'AOC França',   '2026-01-01');
    `,
    solution: 'Jean Pierre',
    hint:
      'Dois lotes da Château Noir safra 2015: IDs 10 e 14. LEFT JOIN lotes com certificados: lote 10 NÃO tem certificado (IS NULL), lote 14 tem. Quem aprovou o lote 10? Sommelier Jean Pierre.'
  },

  // ─────────────────────────────────────────────────────────────────
  // CASO 38: O Cofre Digital (Senior)
  // Conceito: LIKE 'BTC%' + BETWEEN em valores
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'senior8',
    title: 'O Cofre Digital',
    difficulty: 'Medium',
    description:
      'A polícia federal detectou transações de criptomoedas suspeitas. Carteiras cujo código começa com "BTC" movimentaram valores ENTRE 500000 e 2000000 no período de "2025-04". Apenas uma carteira se encaixa em todos os critérios.',
    objective:
      'Encontre o NOME do proprietário da carteira cujo codigo começa com "BTC" (LIKE) e que tem transação com valor BETWEEN 500000 AND 2000000 no mês "2025-04" (LIKE "2025-04%").',
    schema: `
      CREATE TABLE exchanges (id INTEGER PRIMARY KEY, nome TEXT, pais TEXT);
      CREATE TABLE proprietarios (id INTEGER PRIMARY KEY, nome TEXT, verificado TEXT);
      CREATE TABLE carteiras (id INTEGER PRIMARY KEY, prop_id INTEGER, exchange_id INTEGER, codigo TEXT);
      CREATE TABLE transacoes (id INTEGER PRIMARY KEY, carteira_id INTEGER, valor INTEGER, tipo TEXT, data TEXT);
      CREATE TABLE alertas_bc (id INTEGER PRIMARY KEY, transacao_id INTEGER, motivo TEXT);

      INSERT INTO exchanges VALUES (1, 'CoinBase', 'EUA');
      INSERT INTO exchanges VALUES (2, 'Binance',  'Cayman');

      INSERT INTO proprietarios VALUES (10, 'Satoshi Noir',  'Nao');
      INSERT INTO proprietarios VALUES (11, 'Alice Cripto',  'Sim');
      INSERT INTO proprietarios VALUES (12, 'Bob Chain',     'Sim');
      INSERT INTO proprietarios VALUES (13, 'Eva Hash',      'Nao');

      INSERT INTO carteiras VALUES (50, 10, 2, 'BTC-DARK-001');
      INSERT INTO carteiras VALUES (51, 11, 1, 'ETH-SAFE-002');
      INSERT INTO carteiras VALUES (52, 12, 1, 'BTC-OPEN-003');
      INSERT INTO carteiras VALUES (53, 13, 2, 'BTC-ANON-004');

      INSERT INTO transacoes VALUES (1, 50, 1500000, 'Envio',    '2025-04-10');
      INSERT INTO transacoes VALUES (2, 51, 300000,  'Recebido', '2025-04-11');
      INSERT INTO transacoes VALUES (3, 52, 100000,  'Envio',    '2025-04-12');
      INSERT INTO transacoes VALUES (4, 53, 800000,  'Envio',    '2025-03-15');
      INSERT INTO transacoes VALUES (5, 50, 200000,  'Recebido', '2025-05-01');
      INSERT INTO transacoes VALUES (6, 53, 450000,  'Envio',    '2025-04-20');
    `,
    solution: 'Satoshi Noir',
    hint:
      'Carteiras BTC: 50, 52, 53. Transações BETWEEN 500000 AND 2000000: IDs 1 (1.5M, carteira 50, 2025-04) e 4 (800K, carteira 53, 2025-03). Filtre data LIKE "2025-04%": apenas transação 1 (carteira 50). Proprietário = Satoshi Noir.'
  },

  // ─────────────────────────────────────────────────────────────────
  // CASO 39: A Máfia do Leilão (Senior)
  // Conceito: Comparação de valores + GROUP BY
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'senior9',
    title: 'A Máfia do Leilão',
    difficulty: 'Medium',
    description:
      'Um leilão de arte foi manipulado. O lance vencedor do quadro "Noite Estrelada Falsa" foi MAIS QUE o dobro da avaliação da obra. Vários participantes deram lances em várias obras — descubra quem deu esse lance absurdo.',
    objective:
      'Encontre o NOME do participante cujo lance na obra "Noite Estrelada Falsa" foi maior que o DOBRO da avaliação (lance > avaliacao * 2).',
    schema: `
      CREATE TABLE casas_leilao (id INTEGER PRIMARY KEY, nome TEXT, cidade TEXT);
      CREATE TABLE obras (id INTEGER PRIMARY KEY, titulo TEXT, avaliacao INTEGER, casa_id INTEGER);
      CREATE TABLE participantes (id INTEGER PRIMARY KEY, nome TEXT, tipo TEXT);
      CREATE TABLE lances (id INTEGER PRIMARY KEY, obra_id INTEGER, part_id INTEGER, valor INTEGER, data TEXT);
      CREATE TABLE resultados (id INTEGER PRIMARY KEY, lance_id INTEGER, status TEXT);

      INSERT INTO casas_leilao VALUES (1, 'Sothebys',   'Londres');
      INSERT INTO casas_leilao VALUES (2, 'Christies',  'NY');

      INSERT INTO obras VALUES (10, 'Noite Estrelada Falsa', 500000,  1);
      INSERT INTO obras VALUES (11, 'Mona Lisa Réplica',     800000,  1);
      INSERT INTO obras VALUES (12, 'O Grito do Silêncio',   300000,  2);

      INSERT INTO participantes VALUES (50, 'Lord Oculto',     'Anônimo');
      INSERT INTO participantes VALUES (51, 'Baronesa Von X',  'VIP');
      INSERT INTO participantes VALUES (52, 'Sr. Legítimo',    'Regular');
      INSERT INTO participantes VALUES (53, 'Fantasma Leilão', 'Anônimo');

      INSERT INTO lances VALUES (1, 10, 50, 1200000, '2025-05-01');
      INSERT INTO lances VALUES (2, 10, 51, 600000,  '2025-05-01');
      INSERT INTO lances VALUES (3, 10, 52, 550000,  '2025-05-01');
      INSERT INTO lances VALUES (4, 11, 53, 1700000, '2025-05-02');
      INSERT INTO lances VALUES (5, 12, 50, 250000,  '2025-05-03');
      INSERT INTO lances VALUES (6, 11, 51, 900000,  '2025-05-02');

      INSERT INTO resultados VALUES (1, 1, 'Vencedor');
      INSERT INTO resultados VALUES (2, 4, 'Vencedor');
      INSERT INTO resultados VALUES (3, 5, 'Vencedor');
    `,
    solution: 'Lord Oculto',
    hint:
      'Avaliação da "Noite Estrelada Falsa" = 500000. Dobro = 1000000. Quais lances na obra 10 são > 1000000? Apenas lance 1 (1.200.000) do participante 50 = Lord Oculto.'
  },

  // ─────────────────────────────────────────────────────────────────
  // CASO 40: O Juiz Comprado (Senior)
  // Conceito: LEFT JOIN + IS NULL para processos sem defesa
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'senior10',
    title: 'O Juiz Comprado',
    difficulty: 'Medium',
    description:
      'Um juiz condenou réus sem que eles tivessem defensor público designado. A tabela de designações de defensores está incompleta — processos sem defensor são claramente irregulares. Encontre o juiz que presidiu um processo da vara "Criminal" SEM defensor designado.',
    objective:
      'Encontre o NOME do juiz que presidiu um processo da vara "Criminal" que NÃO possui defensor na tabela de designações (LEFT JOIN + IS NULL).',
    schema: `
      CREATE TABLE varas (id INTEGER PRIMARY KEY, nome TEXT, comarca TEXT);
      CREATE TABLE juizes (id INTEGER PRIMARY KEY, nome TEXT, vara_id INTEGER);
      CREATE TABLE processos (id INTEGER PRIMARY KEY, vara_id INTEGER, juiz_id INTEGER, reu TEXT, data_abertura TEXT);
      CREATE TABLE defensores (id INTEGER PRIMARY KEY, nome TEXT, oab TEXT);
      CREATE TABLE designacoes (id INTEGER PRIMARY KEY, processo_id INTEGER, defensor_id INTEGER, data TEXT);
      CREATE TABLE sentencas (id INTEGER PRIMARY KEY, processo_id INTEGER, resultado TEXT, data TEXT);

      INSERT INTO varas VALUES (1, 'Criminal',   'Capital');
      INSERT INTO varas VALUES (2, 'Cível',      'Capital');
      INSERT INTO varas VALUES (3, 'Criminal',   'Interior');

      INSERT INTO juizes VALUES (10, 'Juiz Severo',    1);
      INSERT INTO juizes VALUES (11, 'Juíza Justa',    2);
      INSERT INTO juizes VALUES (12, 'Juiz Fantasma',  3);

      INSERT INTO processos VALUES (100, 1, 10, 'Carlos R.',  '2025-01-10');
      INSERT INTO processos VALUES (101, 2, 11, 'Maria S.',   '2025-01-15');
      INSERT INTO processos VALUES (102, 1, 10, 'Zeca L.',    '2025-02-01');
      INSERT INTO processos VALUES (103, 3, 12, 'Paulo M.',   '2025-02-10');
      INSERT INTO processos VALUES (104, 3, 12, 'Ana K.',     '2025-02-15');

      INSERT INTO defensores VALUES (50, 'Dr. Defesa',    'OAB-111');
      INSERT INTO defensores VALUES (51, 'Dra. Justiça',  'OAB-222');

      INSERT INTO designacoes VALUES (1, 100, 50, '2025-01-11');
      INSERT INTO designacoes VALUES (2, 101, 51, '2025-01-16');
      INSERT INTO designacoes VALUES (3, 104, 50, '2025-02-16');

      INSERT INTO sentencas VALUES (1, 100, 'Condenado', '2025-03-01');
      INSERT INTO sentencas VALUES (2, 101, 'Absolvido', '2025-03-05');
      INSERT INTO sentencas VALUES (3, 102, 'Condenado', '2025-03-10');
      INSERT INTO sentencas VALUES (4, 103, 'Condenado', '2025-03-15');
    `,
    solution: 'Juiz Fantasma',
    hint:
      'LEFT JOIN processos com designacoes ON processos.id = designacoes.processo_id. WHERE designacoes.id IS NULL AND vara = "Criminal". Processos sem defensor: 102 (vara 1, Criminal Capital, Juiz Severo) e 103 (vara 3, Criminal Interior, Juiz Fantasma). Ambos são da vara Criminal! Mas o processo 103 foi CONDENADO sem defensor pelo Juiz Fantasma da vara do Interior.'
  }
];
