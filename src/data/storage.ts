/**
 * Acesso a armazenamento local tolerante a falha.
 *
 * localStorage lança em aba anônima, com cookies bloqueados ou cota estourada.
 * Todo o jogo roda no cliente, então uma exceção aqui derrubaria a aplicação
 * inteira. Encapsular o acesso num único ponto mantém o resto do código livre
 * de try/catch e permite trocar a origem (ex.: save na nuvem) depois.
 */

export interface KeyValueStore {
  read<T>(key: string, fallback: T): T;
  write<T>(key: string, value: T): void;
  remove(key: string): void;
}

export const browserStore: KeyValueStore = {
  read<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },

  write<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Progresso não persistido é degradação aceitável; a partida continua.
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // idem
    }
  },
};

export const STORAGE_KEYS = {
  progress: 'sqlgame_progress_v2',
  currentIndex: 'sqlgame_current_index',
  avatar: 'sqlgame_hacker_avatar',
  onboardingSeen: 'sqlgame_onboarding_seen',
  locale: 'sqlgame_locale',
} as const;
