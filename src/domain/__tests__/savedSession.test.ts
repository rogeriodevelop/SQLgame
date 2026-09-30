import { describe, it, expect } from 'vitest';
import {
  hasActivity,
  readSavedSession,
  SAVED_SESSION_LIMIT,
  withoutSavedSession,
  withSavedSession,
  type SavedSession,
} from '../savedSession';

const NOW = 1_800_000_000_000;

function session(overrides: Partial<SavedSession> = {}): SavedSession {
  return {
    sql: 'SELECT * FROM agentes',
    log: [{ id: 1, sql: 'SELECT * FROM agentes', rowCount: 3, error: null, at: NOW - 5000, techniques: ['select'], tables: ['agentes'] }],
    evidence: [{ id: 'nome=Ana', columns: ['nome'], values: ['Ana'], sql: 'SELECT nome FROM agentes' }],
    suspects: ['Ana Reis'],
    wrongAttempts: 2,
    usedHint: true,
    proven: true,
    startedAt: NOW - 60_000,
    savedAt: NOW - 1000,
    ...overrides,
  };
}

describe('readSavedSession', () => {
  it('devolve uma sessão válida intacta', () => {
    expect(readSavedSession(JSON.parse(JSON.stringify(session())), NOW)).toEqual(session());
  });

  it('preserva erros, dica e início — o que impede zerar a pontuação recarregando', () => {
    const read = readSavedSession(session(), NOW)!;
    expect(read.wrongAttempts).toBe(2);
    expect(read.usedHint).toBe(true);
    expect(read.startedAt).toBe(NOW - 60_000);
  });

  it('descarta formato quebrado em vez de travar o jogo', () => {
    expect(readSavedSession(null, NOW)).toBeNull();
    expect(readSavedSession('lixo', NOW)).toBeNull();
    expect(readSavedSession({ ...session(), wrongAttempts: -1 }, NOW)).toBeNull();
    expect(readSavedSession({ ...session(), usedHint: 'sim' }, NOW)).toBeNull();
    expect(readSavedSession({ ...session(), log: 'x' }, NOW)).toBeNull();
    expect(readSavedSession({ ...session(), proven: undefined }, NOW)).toBeNull();
  });

  it('recusa início no futuro', () => {
    expect(readSavedSession(session({ startedAt: NOW + 1000 }), NOW)).toBeNull();
  });

  it('ignora itens inválidos do diário e do quadro sem perder o resto', () => {
    const raw = { ...session(), log: [{ lixo: true }, ...session().log], evidence: [42, ...session().evidence] };
    const read = readSavedSession(raw, NOW)!;
    expect(read.log).toHaveLength(1);
    expect(read.evidence).toHaveLength(1);
  });

  it('filtra técnicas desconhecidas de versões futuras', () => {
    const raw = session();
    (raw.log[0].techniques as string[]) = ['select', 'window-function'];
    expect(readSavedSession(raw, NOW)!.log[0].techniques).toEqual(['select']);
  });
});

describe('hasActivity', () => {
  const idle = { sql: '  ', log: [], evidence: [], suspects: [], wrongAttempts: 0, usedHint: false };

  it('abrir o caso e não fazer nada não conta', () => {
    expect(hasActivity(idle)).toBe(false);
  });

  it('qualquer trabalho conta', () => {
    expect(hasActivity({ ...idle, sql: 'SELECT' })).toBe(true);
    expect(hasActivity({ ...idle, wrongAttempts: 1 })).toBe(true);
    expect(hasActivity({ ...idle, usedHint: true })).toBe(true);
  });
});

describe('withSavedSession / withoutSavedSession', () => {
  it('guarda e remove por caso', () => {
    const all = withSavedSession({}, 'easy1', session());
    expect(Object.keys(all)).toEqual(['easy1']);
    expect(withoutSavedSession(all, 'easy1')).toEqual({});
  });

  it('descarta as sessões mais antigas além do limite', () => {
    let all = {};
    for (let i = 0; i < SAVED_SESSION_LIMIT + 3; i++) all = withSavedSession(all, `c${i}`, session({ savedAt: NOW - 100_000 + i }));
    const ids = Object.keys(all);
    expect(ids).toHaveLength(SAVED_SESSION_LIMIT);
    expect(ids).not.toContain('c0');
    expect(ids).toContain(`c${SAVED_SESSION_LIMIT + 2}`);
  });
});
