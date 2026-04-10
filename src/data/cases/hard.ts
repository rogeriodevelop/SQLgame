import type { Case } from '../../types';

// ERP fictício completo da "Dark Corp" com 12 tabelas densamente populadas.
// Múltiplos vendedores, filiais, produtos, clientes e motoristas criam incontáveis distratores.
// Cada caso exige uma combinação específica de JOINs + filtros para isolar a resposta.

const erpSchema = `
  CREATE TABLE clientes (id INTEGER PRIMARY KEY, nome TEXT, cnpj TEXT, status TEXT);
  CREATE TABLE fornecedores (id INTEGER PRIMARY KEY, nome_fantasia TEXT, pais TEXT, categoria TEXT);
  CREATE TABLE produtos (id INTEGER PRIMARY KEY, forn_id INTEGER, nome TEXT, preco INTEGER, categoria TEXT);
  CREATE TABLE filiais (id INTEGER PRIMARY KEY, cidade TEXT, pais TEXT, status TEXT);
  CREATE TABLE funcionarios (id INTEGER PRIMARY KEY, filial_id INTEGER, nome TEXT, cargo TEXT, ativo INTEGER);
  CREATE TABLE vendas (id INTEGER PRIMARY KEY, func_id INTEGER, cliente_id INTEGER, data_venda TEXT, status_auditoria TEXT);
  CREATE TABLE itens_venda (id INTEGER PRIMARY KEY, venda_id INTEGER, produto_id INTEGER, qtd INTEGER, desconto_aplicado INTEGER);
  CREATE TABLE pagamentos (id INTEGER PRIMARY KEY, venda_id INTEGER, metodo TEXT, valor_pago INTEGER, data_pagto TEXT);
  CREATE TABLE contas_receber (id INTEGER PRIMARY KEY, pagto_id INTEGER, status TEXT, data_baixa TEXT);
  CREATE TABLE veiculos (id INTEGER PRIMARY KEY, placa TEXT, tipo TEXT, capacidade_kg INTEGER);
  CREATE TABLE motoristas (id INTEGER PRIMARY KEY, veiculo_id INTEGER, nome TEXT, cnh_categoria TEXT);
  CREATE TABLE entregas (id INTEGER PRIMARY KEY, venda_id INTEGER, mot_id INTEGER, status_entrega TEXT, endereco TEXT, data_entrega TEXT);

  -- Clientes
  INSERT INTO clientes VALUES (1,  'TechCorp Global',   '12.345.000/0001-00', 'Ativo');
  INSERT INTO clientes VALUES (2,  'LavaJato SIA',      '99.999.000/0001-00', 'Suspeito');
  INSERT INTO clientes VALUES (3,  'Sr. Fantasma',      '00.000.000/0001-00', 'Bloqueado');
  INSERT INTO clientes VALUES (4,  'LogicBuy Ltda',     '11.222.000/0001-00', 'Ativo');
  INSERT INTO clientes VALUES (5,  'Holding Cifrada',   '55.555.000/0001-00', 'Suspeito');

  -- Fornecedores
  INSERT INTO fornecedores VALUES (1, 'Gringo Imports',    'Panama',   'Eletronicos');
  INSERT INTO fornecedores VALUES (2, 'Nacional Peças',    'Brasil',   'Mecanica');
  INSERT INTO fornecedores VALUES (3, 'Dubai Parts',       'Emirados', 'Commodities');
  INSERT INTO fornecedores VALUES (4, 'TechSource Ltd',    'EUA',      'Eletronicos');

  -- Produtos
  INSERT INTO produtos VALUES (10, 1, 'Microchip Z',        5000,  'Eletronicos');
  INSERT INTO produtos VALUES (11, 2, 'Motor X',            12000, 'Mecanica');
  INSERT INTO produtos VALUES (12, 3, 'Ouro em Barra',      90000, 'Commodities');
  INSERT INTO produtos VALUES (13, 4, 'GPU Top',            8000,  'Eletronicos');
  INSERT INTO produtos VALUES (14, 1, 'Módulo Cripto',      15000, 'Eletronicos');
  INSERT INTO produtos VALUES (15, 2, 'Peça Inox',          3000,  'Mecanica');

  -- Filiais
  INSERT INTO filiais VALUES (50, 'São Paulo',    'Brasil',     'Ativa');
  INSERT INTO filiais VALUES (51, 'Ilhas Cayman', 'Cayman',     'Oculta');
  INSERT INTO filiais VALUES (52, 'Dubai',        'Emirados',   'Ativa');
  INSERT INTO filiais VALUES (53, 'Panama City',  'Panama',     'Oculta');

  -- Funcionários
  INSERT INTO funcionarios VALUES (100, 50, 'Alberto Carlos', 'Vendedor',  1);
  INSERT INTO funcionarios VALUES (101, 51, 'Senhor X',       'Gerente',   1);
  INSERT INTO funcionarios VALUES (102, 50, 'Ana Paula',      'Auditora',  1);
  INSERT INTO funcionarios VALUES (103, 52, 'Kareem Hassan',  'Diretor',   1);
  INSERT INTO funcionarios VALUES (104, 53, 'Nick Sombra',    'Operador',  1);
  INSERT INTO funcionarios VALUES (105, 50, 'Roberta Vaz',    'Vendedora', 1);

  -- Vendas
  INSERT INTO vendas VALUES (1000, 100, 1, '2025-01-10', 'Limpa');
  INSERT INTO vendas VALUES (1001, 101, 3, '2025-02-15', 'Fraude');
  INSERT INTO vendas VALUES (1002, 100, 2, '2025-03-01', 'Pendente');
  INSERT INTO vendas VALUES (1003, 103, 4, '2025-03-10', 'Limpa');
  INSERT INTO vendas VALUES (1004, 104, 5, '2025-04-01', 'Fraude');
  INSERT INTO vendas VALUES (1005, 105, 1, '2025-04-05', 'Limpa');

  -- Itens de venda
  INSERT INTO itens_venda VALUES (1, 1000, 10, 5,  0);
  INSERT INTO itens_venda VALUES (2, 1001, 12, 10, 99);
  INSERT INTO itens_venda VALUES (3, 1002, 11, 2,  10);
  INSERT INTO itens_venda VALUES (4, 1003, 13, 3,  0);
  INSERT INTO itens_venda VALUES (5, 1004, 14, 20, 99);
  INSERT INTO itens_venda VALUES (6, 1005, 15, 100,0);
  INSERT INTO itens_venda VALUES (7, 1001, 14, 5,  50);

  -- Pagamentos
  INSERT INTO pagamentos VALUES (500, 1000, 'Boleto',      25000,   '2025-01-12');
  INSERT INTO pagamentos VALUES (501, 1001, 'Cripto',      900000,  '2025-02-15');
  INSERT INTO pagamentos VALUES (502, 1002, 'Pix',         24000,   '2025-03-02');
  INSERT INTO pagamentos VALUES (503, 1003, 'Transferência',200000, '2025-03-12');
  INSERT INTO pagamentos VALUES (504, 1004, 'Boleto',       300000,  '2025-04-02');
  INSERT INTO pagamentos VALUES (505, 1005, 'Boleto',      300000,  '2025-04-07');

  -- Contas a receber
  INSERT INTO contas_receber VALUES (900, 500, 'Baixado',  '2025-01-15');
  INSERT INTO contas_receber VALUES (901, 501, 'Lavado',   '2025-02-20');
  INSERT INTO contas_receber VALUES (902, 502, 'Pendente', NULL);
  INSERT INTO contas_receber VALUES (903, 503, 'Baixado',  '2025-03-14');
  INSERT INTO contas_receber VALUES (904, 504, 'Lavado',   '2025-04-05');
  INSERT INTO contas_receber VALUES (905, 505, 'Baixado',  '2025-04-09');

  -- Veículos
  INSERT INTO veiculos VALUES (77, 'ABC-1234', 'Caminhao',  5000);
  INSERT INTO veiculos VALUES (88, 'XYZ-9999', 'Blindado',  2000);
  INSERT INTO veiculos VALUES (99, 'MMM-3333', 'Van',       1000);
  INSERT INTO veiculos VALUES (66, 'ZZZ-7777', 'Caminhao',  8000);

  -- Motoristas
  INSERT INTO motoristas VALUES (10, 77, 'Mario Bros',    'C');
  INSERT INTO motoristas VALUES (11, 88, 'Jack Fuga',     'E');
  INSERT INTO motoristas VALUES (12, 99, 'Helena Veloz',  'C');
  INSERT INTO motoristas VALUES (13, 66, 'Bruno Bruto',   'E');

  -- Entregas
  INSERT INTO entregas VALUES (300, 1000, 10, 'Entregue',   'Centro SP',         '2025-01-14');
  INSERT INTO entregas VALUES (301, 1001, 11, 'Desviada',   'Porto Sul',         '2025-02-16');
  INSERT INTO entregas VALUES (302, 1002, 12, 'Em Rota',    'Bairro Norte SP',   NULL);
  INSERT INTO entregas VALUES (303, 1003, 10, 'Entregue',   'Dubai Mall',        '2025-03-12');
  INSERT INTO entregas VALUES (304, 1004, 11, 'Desviada',   'Porto Sul',         '2025-04-03');
  INSERT INTO entregas VALUES (305, 1005, 13, 'Entregue',   'Zona Franca',       '2025-04-08');
`;

export const hardCases: Case[] = [
  {
    id: 'hard1',
    title: 'ERP Noir: O Pagamento Suspeito',
    difficulty: 'Hard',
    description:
      'Dois pagamentos foram feitos em "Cripto" no ERP da Dark Corp. Apenas um deles está vinculado a uma venda com status_auditoria "Fraude". Você precisa rastrear o funcionário responsável por essa venda.',
    objective:
      'Descubra o NOME do funcionário que realizou a venda paga em "Cripto" cujo status_auditoria é "Fraude".',
    schema: erpSchema,
    solution: 'Senhor X',
    hint: 'Dois pagamentos "Cripto" (vendas 1001 e 1004). Filtre vendas com status_auditoria = "Fraude" E pagamentos.metodo = "Cripto". JOIN: funcionarios -> vendas -> pagamentos.'
  },
  {
    id: 'hard2',
    title: 'ERP Noir: Produto Proibido do Panama',
    difficulty: 'Hard',
    description:
      'Um fornecedor do "Panama" vendeu itens da categoria "Eletronicos" para a Dark Corp. Vários fornecedores de vários países cadastram produtos similares — mas apenas um fornecedor panamenho atua em Eletronicos.',
    objective:
      'Informe o NOME do produto da categoria "Eletronicos" fornecido por uma empresa do "Panama".',
    schema: erpSchema,
    solution: 'Microchip Z',
    hint: 'Dois fornecedores de Eletronicos (ids 1 e 4). Filtre fornecedores.pais = "Panama". Isso isola o fornecedor 1 (Gringo Imports). Qual produto ele fornece na categoria "Eletronicos"? Atenção: ele tem dois!'
  },
  {
    id: 'hard3',
    title: 'ERP Noir: O Cliente Bloqueado',
    difficulty: 'Hard',
    description:
      'Dois clientes têm status "Suspeito" e um tem "Bloqueado". Uma venda foi registrada como "Fraude" para um cliente "Bloqueado". Identifique-o.',
    objective:
      'Encontre o NOME do cliente com status "Bloqueado" que tem ao menos uma venda com status_auditoria = "Fraude".',
    schema: erpSchema,
    solution: 'Sr. Fantasma',
    hint: 'Dois clientes suspeitos, um bloqueado. Mas "Fraude" só aparece nas vendas 1001 e 1004. Qual desses tem cliente com status "Bloqueado"? JOIN clientes -> vendas filtrando os dois campos.'
  },
  {
    id: 'hard4',
    title: 'ERP Noir: A Filial Fantasma',
    difficulty: 'Hard',
    description:
      'Duas filiais têm status "Oculta" (Cayman e Panama). Apenas a filial de "Ilhas Cayman" possui um gerente ativo. Encontre esse gerente.',
    objective:
      'Encontre o NOME do funcionário com cargo "Gerente" lotado na filial da cidade "Ilhas Cayman".',
    schema: erpSchema,
    solution: 'Senhor X',
    hint: 'Duas filiais ocultas. Filtre filiais.cidade = "Ilhas Cayman" e junte com funcionarios. Qual o cargo do funcionário desta filial?'
  },
  {
    id: 'hard5',
    title: 'ERP Noir: O Desconto Criminoso',
    difficulty: 'Hard',
    description:
      'Dois itens de venda têm desconto_aplicado = 99 (desvio máximo). Eles pertencem a vendas diferentes. O alvo é o item que pertence a uma venda com status_auditoria "Fraude" realizada por funcionário de filial "Oculta".',
    objective:
      'Qual o NOME do produto vendido com desconto_aplicado = 99 em uma venda de status_auditoria "Fraude" feita por funcionário de filial "Oculta"?',
    schema: erpSchema,
    solution: 'Ouro em Barra',
    hint: 'Itens com desconto 99: ids 2 (venda 1001, produto 12) e 5 (venda 1004, produto 14). Venda 1001 = Fraude, func 101, filial 51 (Oculta). Venda 1004 = Fraude, func 104, filial 53 (também Oculta). Mas apenas a venda 1001 tem produto "Commodities" (Ouro em Barra) — use isso como filtro adicional ou trace a filial pelo nome "Ilhas Cayman".'
  },
  {
    id: 'hard6',
    title: 'ERP Noir: O Blindado das Sombras',
    difficulty: 'Hard',
    description:
      'Dois motoristas usam veículos do tipo "Blindado" ou "Caminhao" com CNH categoria "E". Apenas UM deles fez entrega com status "Desviada" duas vezes consecutivas.',
    objective:
      'Encontre o NOME do motorista que fez MAIS DE UMA entrega com status_entrega = "Desviada".',
    schema: erpSchema,
    solution: 'Jack Fuga',
    hint: 'Use GROUP BY mot_id filtrando status_entrega = "Desviada" e HAVING COUNT(*) > 1. Relacione com motoristas para obter o nome.'
  },
  {
    id: 'hard7',
    title: 'ERP Noir: Porto Sul Recorrente',
    difficulty: 'Hard',
    description:
      'O endereço "Porto Sul" aparece em mais de uma entrega desviada. Qual motorista entregou para lá mais vezes? Este dado é chave para conectá-lo ao cartel.',
    objective:
      'Qual o NOME do motorista que mais vezes entregou para o endereço "Porto Sul"? (Use COUNT e ORDER BY)',
    schema: erpSchema,
    solution: 'Jack Fuga',
    hint: 'SELECT m.nome, COUNT(*) as total FROM motoristas m JOIN entregas e ON m.id = e.mot_id WHERE e.endereco = "Porto Sul" GROUP BY m.nome ORDER BY total DESC LIMIT 1.'
  },
  {
    id: 'hard8',
    title: 'ERP Noir: A Cadeia do Ouro',
    difficulty: 'Hard',
    description:
      'O "Ouro em Barra" veio de um fornecedor em "Emirados". Precisa-se provar que esse produto chegou até um cliente via um funcionário de filial oculta — construindo toda a cadeia de prova judicial.',
    objective:
      'Qual o NOME do cliente que comprou o produto "Ouro em Barra" numa venda feita por funcionário de filial com status "Oculta"?',
    schema: erpSchema,
    solution: 'Sr. Fantasma',
    hint: 'JOIN em cascata: clientes -> vendas -> funcionarios -> filiais (status Oculta) E vendas -> itens_venda -> produtos (nome = "Ouro em Barra"). Ambos os filtros precisam ser satisfeitos ao mesmo tempo.'
  },
  {
    id: 'hard9',
    title: 'ERP Noir: O Dinheiro Lavado',
    difficulty: 'Hard',
    description:
      'Duas contas_receber têm status "Lavado". Elas correspondem a pagamentos distintos. Você precisa identificar qual cliente está por trás do pagamento "Lavado" de maior valor.',
    objective:
      'Forneça o NOME do cliente cuja conta_receber tem status "Lavado" e o valor_pago do pagamento associado é o MAIOR entre todos os lavados.',
    schema: erpSchema,
    solution: 'Sr. Fantasma',
    hint: 'Dois registros "Lavados" (pagtos 501 e 504, valores 900000 e 300000). O maior é 900000 (pagto 501, venda 1001). Quem comprou na venda 1001? JOIN: contas_receber -> pagamentos -> vendas -> clientes filtrando status = "Lavado" ORDER BY valor_pago DESC LIMIT 1.'
  },
  {
    id: 'hard10',
    title: 'ERP Noir: Operação Final — Feche o Dossiê',
    difficulty: 'Expert',
    description:
      'O dossiê final precisa ligar o motorista "Jack Fuga" ao cliente que recebeu "Ouro em Barra", passando pela filial "Oculta" onde o funcionário foi registrado, e confirmando que o pagamento foi em "Cripto" com conta_receber "Lavado". São 12 tabelas em jogo.',
    objective:
      'O cliente final da operação: encontre o NOME do cliente cuja venda tem entrega feita por "Jack Fuga", item "Ouro em Barra", pagamento em "Cripto" e conta_receber = "Lavado".',
    schema: erpSchema,
    solution: 'Sr. Fantasma',
    hint: 'A sentença perfeita: JOIN clientes, vendas, itens_venda, produtos, entregas, motoristas, pagamentos, contas_receber. Filtre: motoristas.nome = "Jack Fuga", produtos.nome = "Ouro em Barra", pagamentos.metodo = "Cripto", contas_receber.status = "Lavado". Todas condições apontam para uma única venda (1001) e um único cliente.'
  }
];
