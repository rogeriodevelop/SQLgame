import type { Case } from '../../domain/case';

export const cases: Case[] = [
  // ─────────────────────────────────────────────────────────────────
  // CASO 1: O Roubo na Mansão (Easy)
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'easy1',
    title: 'O Roubo na Mansão',
    difficulty: 'Easy',
    description:
      'Um artefato valioso sumiu da Ala Leste da mansão. O sistema de acesso registrou todos os movimentos da noite. Cada funcionário só pode estar em UMA ala, mas vários deles fizeram acessos. A pista: o ladrão entrou às 23:00 exatamente na Ala Leste.',
    objective:
      'Encontre o NOME do funcionário que acessou a Ala Leste às 23:00.',
    schema: `
      CREATE TABLE alas (id INTEGER PRIMARY KEY, nome_ala TEXT);
      CREATE TABLE funcionarios (id INTEGER PRIMARY KEY, nome TEXT, cargo TEXT, ala_id INTEGER);
      CREATE TABLE acessos (id INTEGER PRIMARY KEY, func_id INTEGER, log_hora TEXT);

      INSERT INTO alas VALUES (1, 'Ala Oeste');
      INSERT INTO alas VALUES (2, 'Ala Leste');
      INSERT INTO alas VALUES (3, 'Ala Sul');
      INSERT INTO alas VALUES (4, 'Ala Norte');

      INSERT INTO funcionarios VALUES (101, 'Marcos Silva',   'Segurança',  1);
      INSERT INTO funcionarios VALUES (102, 'Carlos Mendes',  'Mordomo',    2);
      INSERT INTO funcionarios VALUES (103, 'Aline Bruna',    'Faxineira',  1);
      INSERT INTO funcionarios VALUES (104, 'Jorge Ramos',    'Jardineiro', 3);
      INSERT INTO funcionarios VALUES (105, 'Patricia Leal',  'Cozinheira', 4);
      INSERT INTO funcionarios VALUES (106, 'Renato Sombra',  'Motorista',  2);
      INSERT INTO funcionarios VALUES (107, 'Silvia Gomes',   'Segurança',  3);

      INSERT INTO acessos VALUES (1001, 101, '20:00');
      INSERT INTO acessos VALUES (1002, 101, '22:00');
      INSERT INTO acessos VALUES (1003, 102, '23:00');
      INSERT INTO acessos VALUES (1004, 103, '19:00');
      INSERT INTO acessos VALUES (1005, 104, '23:00');
      INSERT INTO acessos VALUES (1006, 106, '22:15');
      INSERT INTO acessos VALUES (1007, 107, '22:45');
      INSERT INTO acessos VALUES (1008, 105, '23:15');
    `,
    solution: 'Carlos Mendes',
    hint:
      'JOIN alas, funcionarios, acessos. Filtre: nome_ala = "Ala Leste" AND log_hora = "23:00".'
  },

  // ─────────────────────────────────────────────────────────────────
  // CASO 2: Sabotagem no Restaurante (Easy)
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'easy2',
    title: 'Sabotagem no Restaurante',
    difficulty: 'Easy',
    description:
      'Um cliente VIP passou mal após o jantar. Vários garçons atendem várias mesas, mas só um garçom atendeu a mesa do cliente que reclamou de "Gosto de amêndoas". O setor VIP tem várias mesas.',
    objective:
      'Qual o NOME do garçom que atendeu o cliente que reclamou de "Gosto de amêndoas" no setor "VIP"?',
    schema: `
      CREATE TABLE garcons (id INTEGER PRIMARY KEY, nome TEXT, turno TEXT);
      CREATE TABLE mesas (id INTEGER PRIMARY KEY, garcom_id INTEGER, setor TEXT);
      CREATE TABLE clientes (id INTEGER PRIMARY KEY, nome TEXT, mesa_id INTEGER, reclamacao TEXT);

      INSERT INTO garcons VALUES (1,  'Jonas Dark',     'Noite');
      INSERT INTO garcons VALUES (2,  'Mauro Bello',    'Noite');
      INSERT INTO garcons VALUES (3,  'Carla Luz',      'Tarde');
      INSERT INTO garcons VALUES (4,  'Fernando Reis',  'Noite');
      INSERT INTO garcons VALUES (5,  'Bia Campos',     'Tarde');

      INSERT INTO mesas VALUES (10, 1, 'Comum');
      INSERT INTO mesas VALUES (11, 2, 'VIP');
      INSERT INTO mesas VALUES (12, 3, 'VIP');
      INSERT INTO mesas VALUES (13, 4, 'Comum');
      INSERT INTO mesas VALUES (14, 5, 'VIP');
      INSERT INTO mesas VALUES (15, 1, 'VIP');

      INSERT INTO clientes VALUES (100, 'Sr. Dinheiro',  11, 'Gosto de amêndoas');
      INSERT INTO clientes VALUES (101, 'Madame Rosa',   12, 'Sopa fria');
      INSERT INTO clientes VALUES (102, 'João Ninguém',  10, 'Gosto de amêndoas');
      INSERT INTO clientes VALUES (103, 'Lady X',        14, 'Garfo sujo');
      INSERT INTO clientes VALUES (104, 'Duque W.',      15, 'Carne passada');
      INSERT INTO clientes VALUES (105, 'Chef Rival',    11, 'Sem reclamação');
    `,
    solution: 'Mauro Bello',
    hint:
      'JOIN clientes, mesas, garcons. Filtre: setor = "VIP" AND reclamacao = "Gosto de amêndoas".'
  },

  // ─────────────────────────────────────────────────────────────────
  // CASO 3: Fuga do Presídio (Easy)
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'easy3',
    title: 'Fuga do Presídio',
    difficulty: 'Easy',
    description:
      'Um detento fugiu do bloco "Isolamento". Vários guardas vigiam vários blocos. O detento em fuga tem status "Fugitivo" e estava especificamente no bloco cujo setor é "Isolamento".',
    objective:
      'Descubra o NOME do guarda responsável pelo bloco "Isolamento" de onde o detento com status "Fugitivo" escapou.',
    schema: `
      CREATE TABLE guardas (id INTEGER PRIMARY KEY, nome TEXT, patente TEXT);
      CREATE TABLE blocos (id INTEGER PRIMARY KEY, setor TEXT, guarda_id INTEGER);
      CREATE TABLE detentos (id INTEGER PRIMARY KEY, nome TEXT, bloco_id INTEGER, status TEXT);

      INSERT INTO guardas VALUES (1, 'Alves',       'Cabo');
      INSERT INTO guardas VALUES (2, 'Brutus',      'Sargento');
      INSERT INTO guardas VALUES (3, 'Fernanda K.', 'Tenente');
      INSERT INTO guardas VALUES (4, 'Roque Lima',  'Cabo');

      INSERT INTO blocos VALUES (10, 'Prisão Baixa', 1);
      INSERT INTO blocos VALUES (20, 'Isolamento',   2);
      INSERT INTO blocos VALUES (30, 'Máxima',        3);
      INSERT INTO blocos VALUES (40, 'Triagem',       4);

      INSERT INTO detentos VALUES (900, 'Zeca Liso',     10, 'Preso');
      INSERT INTO detentos VALUES (901, 'Fantasma',      20, 'Fugitivo');
      INSERT INTO detentos VALUES (902, 'Cobra Negra',   20, 'Preso');
      INSERT INTO detentos VALUES (903, 'Miro Faca',     30, 'Preso');
      INSERT INTO detentos VALUES (904, 'Leandro Gato',  40, 'Preso');
      INSERT INTO detentos VALUES (905, 'Rato Frito',    40, 'Fugitivo');
    `,
    solution: 'Brutus',
    hint:
      'Dois fugitivos! Mas só um vem do bloco "Isolamento". JOIN detentos, blocos, guardas filtrando setor = "Isolamento" AND status = "Fugitivo".'
  },

  // ─────────────────────────────────────────────────────────────────
  // CASO 4: Assassinato na Biblioteca (Easy)
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'easy4',
    title: 'Assassinato na Biblioteca',
    difficulty: 'Easy',
    description:
      'O corpo foi encontrado no andar 2. A arma do crime foi um livro pesado da seção "Ocultismo". Vários leitores fizeram empréstimos naquela noite.',
    objective:
      'Encontre o NOME do leitor que pegou emprestado um livro da seção "Ocultismo" às exatas "15:00".',
    schema: `
      CREATE TABLE secoes (id INTEGER PRIMARY KEY, nome TEXT, andar INTEGER);
      CREATE TABLE livros (id INTEGER PRIMARY KEY, titulo TEXT, secao_id INTEGER);
      CREATE TABLE emprestimos (id INTEGER PRIMARY KEY, livro_id INTEGER, leitor TEXT, hora TEXT);

      INSERT INTO secoes VALUES (1, 'Ficção',     1);
      INSERT INTO secoes VALUES (2, 'Ocultismo',  2);
      INSERT INTO secoes VALUES (3, 'Ciências',   1);
      INSERT INTO secoes VALUES (4, 'Historia',   2);

      INSERT INTO livros VALUES (50, 'Magia Negra Prática',  2);
      INSERT INTO livros VALUES (51, 'Peter Pan',            1);
      INSERT INTO livros VALUES (52, 'Física Quântica',      3);
      INSERT INTO livros VALUES (53, 'Rituais Antigos',      2);
      INSERT INTO livros VALUES (54, 'A Queda de Roma',      4);
      INSERT INTO livros VALUES (55, 'Sortilégios Vol. 2',   2);

      INSERT INTO emprestimos VALUES (800, 50, 'Damien V.',    '15:00');
      INSERT INTO emprestimos VALUES (801, 51, 'Laura G.',     '16:00');
      INSERT INTO emprestimos VALUES (802, 52, 'Carlos Bravo', '15:00');
      INSERT INTO emprestimos VALUES (803, 53, 'Helena C.',    '14:30');
      INSERT INTO emprestimos VALUES (804, 54, 'Damien V.',    '16:30');
      INSERT INTO emprestimos VALUES (805, 55, 'Rogério M.',   '16:15');
    `,
    solution: 'Damien V.',
    hint:
      'Três leitores pegaram livros às 15:00! Mas apenas um deles pegou um livro da seção "Ocultismo". JOIN emprestimos, livros, secoes filtrando nome = "Ocultismo" AND hora = "15:00".'
  },

  // ─────────────────────────────────────────────────────────────────
  // CASO 5: Roubo no Banco Central (Easy)
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'easy5',
    title: 'Roubo no Banco Central',
    difficulty: 'Easy',
    description:
      'O cofre 999 foi acessado às 22:00 com autorização "Falsa". Vários gerentes são responsáveis por vários cofres. Você precisa cruzar o acesso suspeito com o gerente responsável.',
    objective:
      'Qual o NOME do gerente responsável pelo cofre que teve acesso com autorização "Falsa" às "22:00"?',
    schema: `
      CREATE TABLE gerentes (id INTEGER PRIMARY KEY, nome TEXT, turno TEXT);
      CREATE TABLE cofres (id INTEGER PRIMARY KEY, numero INTEGER, gerente_id INTEGER);
      CREATE TABLE acessos (id INTEGER PRIMARY KEY, cofre_id INTEGER, hora TEXT, autorizacao TEXT);

      INSERT INTO gerentes VALUES (1, 'Dr. Roberto',   'Diurno');
      INSERT INTO gerentes VALUES (2, 'Srta. Helena',  'Noturno');
      INSERT INTO gerentes VALUES (3, 'Marcos P.',     'Diurno');
      INSERT INTO gerentes VALUES (4, 'Renata S.',     'Noturno');

      INSERT INTO cofres VALUES (700, 101, 1);
      INSERT INTO cofres VALUES (701, 202, 2);
      INSERT INTO cofres VALUES (702, 303, 3);
      INSERT INTO cofres VALUES (703, 999, 4);
      INSERT INTO cofres VALUES (704, 404, 3);

      INSERT INTO acessos VALUES (1,  700, '09:00', 'Verdadeira');
      INSERT INTO acessos VALUES (2,  703, '22:00', 'Falsa');
      INSERT INTO acessos VALUES (3,  701, '22:30', 'Verdadeira');
      INSERT INTO acessos VALUES (4,  702, '08:00', 'Verdadeira');
      INSERT INTO acessos VALUES (5,  703, '14:00', 'Verdadeira');
      INSERT INTO acessos VALUES (6,  704, '22:00', 'Verdadeira');
    `,
    solution: 'Renata S.',
    hint:
      'Atenção: cofre 703 teve dois acessos mas só um com "Falsa" às 22:00. JOIN acessos, cofres, gerentes filtrando autorizacao = "Falsa" AND hora = "22:00".'
  },

  // ─────────────────────────────────────────────────────────────────
  // CASO 6: O Hacker da Empresa (Easy)
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'easy6',
    title: 'O Hacker da Empresa',
    difficulty: 'Easy',
    description:
      'Um ransomware atacou os servidores corporativos. A origem foi rastreada para um computador interno do setor "Marketing". Vários computadores foram infectados, mas apenas UM pertence a alguém de Marketing.',
    objective:
      'Encontre o NOME do empregado do departamento "Marketing" cujo computador tem virus_detectado = "Sim".',
    schema: `
      CREATE TABLE departamentos (id INTEGER PRIMARY KEY, nome_dep TEXT);
      CREATE TABLE empregados (id INTEGER PRIMARY KEY, nome TEXT, departamento_id INTEGER);
      CREATE TABLE computadores (id INTEGER PRIMARY KEY, ip TEXT, emp_id INTEGER, virus_detectado TEXT);

      INSERT INTO departamentos VALUES (1, 'Recursos Humanos');
      INSERT INTO departamentos VALUES (2, 'Marketing');
      INSERT INTO departamentos VALUES (3, 'TI');
      INSERT INTO departamentos VALUES (4, 'Juridico');

      INSERT INTO empregados VALUES (11, 'Juliana Reis',  1);
      INSERT INTO empregados VALUES (12, 'Pedro Virus',   2);
      INSERT INTO empregados VALUES (13, 'Tiago Hacker',  3);
      INSERT INTO empregados VALUES (14, 'Ana Souza',     2);
      INSERT INTO empregados VALUES (15, 'Rafael Lima',   4);
      INSERT INTO empregados VALUES (16, 'Camila Porto',  3);

      INSERT INTO computadores VALUES (90, '192.168.1.5',  11, 'Nao');
      INSERT INTO computadores VALUES (91, '192.168.1.10', 12, 'Sim');
      INSERT INTO computadores VALUES (92, '192.168.1.15', 13, 'Sim');
      INSERT INTO computadores VALUES (93, '192.168.1.20', 14, 'Nao');
      INSERT INTO computadores VALUES (94, '192.168.1.25', 15, 'Nao');
      INSERT INTO computadores VALUES (95, '192.168.1.30', 16, 'Sim');
    `,
    solution: 'Pedro Virus',
    hint:
      'Três computadores têm virus! Mas apenas UM pertence ao departamento "Marketing". JOIN empregados, departamentos, computadores.'
  },

  // ─────────────────────────────────────────────────────────────────
  // CASO 7: O Carro de Fuga (Easy)
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'easy7',
    title: 'O Carro de Fuga',
    difficulty: 'Easy',
    description:
      'Câmeras da "Ponte Sul" registraram vários carros em excesso de velocidade naquela madrugada. Vários donos, vários carros, várias multas — mas apenas uma é da Ponte Sul com marca "Camaro".',
    objective:
      'Qual o NOME do dono do carro do modelo "Camaro" que levou multa na "Ponte Sul"?',
    schema: `
      CREATE TABLE donos (id INTEGER PRIMARY KEY, nome TEXT, cidade TEXT);
      CREATE TABLE carros (id INTEGER PRIMARY KEY, modelo TEXT, placa TEXT, dono_id INTEGER);
      CREATE TABLE multas (id INTEGER PRIMARY KEY, carro_id INTEGER, local TEXT, valor INTEGER);

      INSERT INTO donos VALUES (1, 'Vinn Diesel',   'São Paulo');
      INSERT INTO donos VALUES (2, 'Beto Walker',   'Rio de Janeiro');
      INSERT INTO donos VALUES (3, 'Sandra Santos', 'Curitiba');
      INSERT INTO donos VALUES (4, 'Luiz Veloz',    'São Paulo');

      INSERT INTO carros VALUES (55, 'Civic',    'BRA-1234', 1);
      INSERT INTO carros VALUES (56, 'Camaro',   'EUA-9999', 2);
      INSERT INTO carros VALUES (57, 'Fusca',    'ANT-0001', 3);
      INSERT INTO carros VALUES (58, 'Camaro',   'ZZZ-5555', 4);
      INSERT INTO carros VALUES (59, 'Corolla',  'RIO-2222', 1);

      INSERT INTO multas VALUES (1, 55, 'Rua das Flores', 200);
      INSERT INTO multas VALUES (2, 56, 'Ponte Sul',       800);
      INSERT INTO multas VALUES (3, 57, 'Ponte Sul',       200);
      INSERT INTO multas VALUES (4, 58, 'Av. Principal',   500);
      INSERT INTO multas VALUES (5, 59, 'Ponte Sul',       200);
    `,
    solution: 'Beto Walker',
    hint:
      'Três multas na Ponte Sul, mas apenas um carro é "Camaro". JOIN multas, carros, donos.'
  },

  // ─────────────────────────────────────────────────────────────────
  // CASO 8: Tesouro Afundado (Easy)
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'easy8',
    title: 'O Tesouro Afundado',
    difficulty: 'Easy',
    description:
      'Uma carga com status "Extraviado" contendo "Ouro" sumiu do mar. Vários navios com vários capitães fazem rotas diferentes. Você precisa cruzar as três tabelas para acusar o capitão responsável.',
    objective:
      'Encontre o NOME do capitão do navio que transportava a carga de conteúdo "Ouro" com status "Extraviado".',
    schema: `
      CREATE TABLE capitaes (id INTEGER PRIMARY KEY, nome TEXT, nacionalidade TEXT);
      CREATE TABLE navios (id INTEGER PRIMARY KEY, nome TEXT, capitao_id INTEGER, bandeira TEXT);
      CREATE TABLE cargas (id INTEGER PRIMARY KEY, navio_id INTEGER, conteudo TEXT, status TEXT);

      INSERT INTO capitaes VALUES (1, 'Jack Sparrow',  'Inglês');
      INSERT INTO capitaes VALUES (2, 'Barba Branca',  'Português');
      INSERT INTO capitaes VALUES (3, 'Davy Jones',    'Holandês');
      INSERT INTO capitaes VALUES (4, 'Calico Jack',   'Inglês');

      INSERT INTO navios VALUES (10, 'Pérola Negra', 1, 'Inglesa');
      INSERT INTO navios VALUES (11, 'Moby Dick',    2, 'Portuguesa');
      INSERT INTO navios VALUES (12, 'Holandês',     3, 'Holandesa');
      INSERT INTO navios VALUES (13, 'Revenge',      4, 'Inglesa');

      INSERT INTO cargas VALUES (500, 10, 'Peixes',      'Entregue');
      INSERT INTO cargas VALUES (501, 11, 'Ouro',        'Extraviado');
      INSERT INTO cargas VALUES (502, 12, 'Especiarias', 'Entregue');
      INSERT INTO cargas VALUES (503, 13, 'Ouro',        'Entregue');
      INSERT INTO cargas VALUES (504, 11, 'Prata',       'Extraviado');
    `,
    solution: 'Barba Branca',
    hint:
      'Dois navios têm "Ouro" e dois têm cargas extraviadas! Filtre exatamente conteudo = "Ouro" AND status = "Extraviado". Isso isola apenas um navio.'
  },

  // ─────────────────────────────────────────────────────────────────
  // CASO 9: Suborno no Hospital (Easy)
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'easy9',
    title: 'Suborno no Hospital',
    difficulty: 'Easy',
    description:
      'Uma cirurgia do tipo "Transplante" foi realizada deliberadamente numa sala com equipamentos com defeito. Vários médicos, várias salas, várias cirurgias — filtre tudo.',
    objective:
      'Encontre o NOME do médico que realizou a cirurgia de tipo "Transplante" numa sala com equipamento_com_defeito = "Sim".',
    schema: `
      CREATE TABLE medicos (id INTEGER PRIMARY KEY, nome TEXT, especialidade TEXT);
      CREATE TABLE salas (id INTEGER PRIMARY KEY, numero INTEGER, equipamento_com_defeito TEXT);
      CREATE TABLE cirurgias (id INTEGER PRIMARY KEY, tipo TEXT, medico_id INTEGER, sala_id INTEGER);

      INSERT INTO medicos VALUES (1, 'Dr. Arcanjo',  'Cardiologia');
      INSERT INTO medicos VALUES (2, 'Dr. Lâmina',   'Transplante');
      INSERT INTO medicos VALUES (3, 'Dra. Frias',   'Neurologia');
      INSERT INTO medicos VALUES (4, 'Dr. Malco',    'Transplante');

      INSERT INTO salas VALUES (5, 909, 'Nao');
      INSERT INTO salas VALUES (6, 503, 'Sim');
      INSERT INTO salas VALUES (7, 707, 'Nao');
      INSERT INTO salas VALUES (8, 101, 'Sim');

      INSERT INTO cirurgias VALUES (1, 'Cardíaca',    1, 5);
      INSERT INTO cirurgias VALUES (2, 'Transplante', 2, 6);
      INSERT INTO cirurgias VALUES (3, 'Transplante', 4, 5);
      INSERT INTO cirurgias VALUES (4, 'Neurológica', 3, 8);
    `,
    solution: 'Dr. Lâmina',
    hint:
      'Dois médicos fazem Transplante! Mas apenas um deles operou numa sala com defeito. JOIN cirurgias, salas, medicos.'
  },

  // ─────────────────────────────────────────────────────────────────
  // CASO 10: Extorsão no Cassino (Easy)
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'easy10',
    title: 'Extorsão no Cassino',
    difficulty: 'Easy',
    description:
      'Uma aposta fraudulenta de valor "9999" foi feita no jogo "Pôquer" por um jogador usando o apelido "Fantasma 04". Vários crupiers trabalham em várias mesas — descubra quem estava encarregado.',
    objective:
      'Qual o NOME do crupier que estava na mesa de "Pôquer" onde a aposta de valor "9999" foi feita?',
    schema: `
      CREATE TABLE crupiers (id INTEGER PRIMARY KEY, nome TEXT, turno TEXT);
      CREATE TABLE mesas (id INTEGER PRIMARY KEY, jogo TEXT, crupier_id INTEGER);
      CREATE TABLE apostas (id INTEGER PRIMARY KEY, mesa_id INTEGER, valor INTEGER, jogador TEXT);

      INSERT INTO crupiers VALUES (1, 'Sara Blefe',    'Tarde');
      INSERT INTO crupiers VALUES (2, 'Rocco Azarado', 'Noite');
      INSERT INTO crupiers VALUES (3, 'Diana Dark',    'Noite');
      INSERT INTO crupiers VALUES (4, 'Gino Asso',     'Tarde');

      INSERT INTO mesas VALUES (10, 'Roleta',    1);
      INSERT INTO mesas VALUES (20, 'Pôquer',    2);
      INSERT INTO mesas VALUES (30, 'Blackjack', 3);
      INSERT INTO mesas VALUES (40, 'Pôquer',    4);
      INSERT INTO mesas VALUES (50, 'Roleta',    3);

      INSERT INTO apostas VALUES (500, 10, 5000,  'Turista');
      INSERT INTO apostas VALUES (501, 20, 9999,  'Fantasma 04');
      INSERT INTO apostas VALUES (502, 30, 200,   'Maria N.');
      INSERT INTO apostas VALUES (503, 40, 9999,  'LaranjaVIP');
      INSERT INTO apostas VALUES (504, 50, 10000, 'Sr. X');
    `,
    solution: 'Rocco Azarado',
    hint:
      'Dois mesas de Pôquer e duas apostas de 9999! O "Fantasma 04" apostou especificamente na mesa 20. JOIN apostas, mesas, crupiers filtrando jogador = "Fantasma 04".'
  }
];
