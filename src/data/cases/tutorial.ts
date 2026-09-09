import type { Case } from '../../domain/case';

/**
 * Trilha de treinamento: ensina SELECT, WHERE e JOIN um de cada vez, com
 * bancos minúsculos, antes que o jogador enfrente o primeiro caso real de
 * três tabelas. Cada caso aqui introduz exatamente uma ideia nova.
 */
export const tutorialCases: Case[] = [
  {
    id: 'tut1',
    title: 'Treinamento 01: Ler uma Tabela',
    difficulty: 'Tutorial',
    description:
      'Bem-vindo à Central. Antes de sair a campo você precisa saber ler um banco de dados. ' +
      'Uma tabela é uma lista: cada linha é um registro, cada coluna é uma informação. ' +
      'O comando SELECT mostra o conteúdo de uma tabela.',
    objective:
      'Rode `SELECT * FROM agentes;` para ver todos os agentes, e informe o NOME do agente de código "A-01".',
    schema: `
      CREATE TABLE agentes (codigo TEXT, nome TEXT, setor TEXT);

      INSERT INTO agentes VALUES ('A-01', 'Ana Reis',     'Campo');
      INSERT INTO agentes VALUES ('A-02', 'Bruno Tavares', 'Analise');
      INSERT INTO agentes VALUES ('A-03', 'Célia Moraes',  'Campo');
    `,
    solution: 'Ana Reis',
    hint: 'O asterisco (*) significa "todas as colunas". Digite: SELECT * FROM agentes;',
  },
  {
    id: 'tut2',
    title: 'Treinamento 02: Filtrar com WHERE',
    difficulty: 'Tutorial',
    description:
      'Listar tudo funciona com 3 linhas, não com 3 milhões. O WHERE descarta as linhas ' +
      'que não interessam e deixa só as que atendem a uma condição.',
    objective:
      'Encontre o NOME do único agente lotado no setor "Cripto".',
    schema: `
      CREATE TABLE agentes (codigo TEXT, nome TEXT, setor TEXT);

      INSERT INTO agentes VALUES ('A-01', 'Ana Reis',      'Campo');
      INSERT INTO agentes VALUES ('A-02', 'Bruno Tavares', 'Analise');
      INSERT INTO agentes VALUES ('A-03', 'Célia Moraes',  'Campo');
      INSERT INTO agentes VALUES ('A-04', 'Davi Nunes',    'Cripto');
      INSERT INTO agentes VALUES ('A-05', 'Elis Prado',    'Analise');
    `,
    solution: 'Davi Nunes',
    hint: "Compare texto entre aspas simples: SELECT nome FROM agentes WHERE setor = 'Cripto';",
  },
  {
    id: 'tut3',
    title: 'Treinamento 03: Cruzar Tabelas com JOIN',
    difficulty: 'Tutorial',
    description:
      'Bancos reais espalham a informação. Aqui os agentes estão numa tabela e as missões ' +
      'em outra; a coluna agente_codigo liga as duas. O JOIN remonta essa ligação, casando ' +
      'a chave de um lado com a do outro.',
    objective:
      'Descubra o NOME do agente responsável pela missão "Porto Fantasma".',
    schema: `
      CREATE TABLE agentes (codigo TEXT, nome TEXT, setor TEXT);
      CREATE TABLE missoes (id INTEGER PRIMARY KEY, titulo TEXT, agente_codigo TEXT);

      INSERT INTO agentes VALUES ('A-01', 'Ana Reis',      'Campo');
      INSERT INTO agentes VALUES ('A-02', 'Bruno Tavares', 'Analise');
      INSERT INTO agentes VALUES ('A-03', 'Célia Moraes',  'Campo');
      INSERT INTO agentes VALUES ('A-04', 'Davi Nunes',    'Cripto');

      INSERT INTO missoes VALUES (1, 'Rota Seca',       'A-01');
      INSERT INTO missoes VALUES (2, 'Porto Fantasma',  'A-03');
      INSERT INTO missoes VALUES (3, 'Sinal Cortado',   'A-04');
      INSERT INTO missoes VALUES (4, 'Cofre Aberto',    'A-01');
    `,
    solution: 'Célia Moraes',
    hint:
      "Junte pela chave e filtre pelo título: SELECT a.nome FROM agentes a " +
      "JOIN missoes m ON m.agente_codigo = a.codigo WHERE m.titulo = 'Porto Fantasma';",
  },
];
