import { describe, it, expect } from 'vitest';
import { judgeAccusation, resultContainsValue } from '../investigation';
import type { QueryResult } from '../case';

const result = (values: (string | number | null)[][]): QueryResult => ({
  columns: ['col'],
  values,
});

describe('resultContainsValue', () => {
  it('encontra o valor em qualquer coluna da grade', () => {
    expect(resultContainsValue(result([['x', 'Carlos Mendes']]), 'Carlos Mendes')).toBe(true);
  });

  it('ignora caixa, acentos e espaços repetidos', () => {
    expect(resultContainsValue(result([['DR. LÂMINA']]), 'dr.  lamina')).toBe(true);
  });

  it('compara números convertidos para texto', () => {
    expect(resultContainsValue(result([[1042]]), '1042')).toBe(true);
  });

  it('não confunde valor parcial com valor completo', () => {
    expect(resultContainsValue(result([['Carlos']]), 'Carlos Mendes')).toBe(false);
  });

  it('trata células nulas sem quebrar', () => {
    expect(resultContainsValue(result([[null]]), 'Carlos Mendes')).toBe(false);
  });

  it('sem resultado não prova nada', () => {
    expect(resultContainsValue(null, 'Carlos Mendes')).toBe(false);
  });
});

describe('judgeAccusation', () => {
  const solution = 'Carlos Mendes';

  it('rejeita campo vazio', () => {
    expect(judgeAccusation({ answer: '   ', solution, proven: true }).kind).toBe('empty');
  });

  it('resolve quando a resposta confere e há prova', () => {
    expect(judgeAccusation({ answer: 'carlos mendes', solution, proven: true }).kind).toBe('solved');
  });

  it('recusa resposta errada mesmo com prova', () => {
    expect(judgeAccusation({ answer: 'Outro Nome', solution, proven: true }).kind).toBe('incorrect');
  });

  // Esta é a garantia central do gate: o retorno não pode variar conforme o
  // palpite quando não há prova, senão a mensagem de erro confirma o chute.
  it('devolve o MESMO veredito para palpite certo e errado sem prova', () => {
    const certo = judgeAccusation({ answer: 'Carlos Mendes', solution, proven: false });
    const errado = judgeAccusation({ answer: 'Qualquer Um', solution, proven: false });
    expect(certo.kind).toBe('unproven');
    expect(errado.kind).toBe('unproven');
    expect(certo).toEqual(errado);
  });
});
