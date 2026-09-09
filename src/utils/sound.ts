export type SoundKind = 'success' | 'error' | 'click';

/**
 * Efeitos sonoros sintetizados na Web Audio API — sem arquivos de áudio,
 * sem custo de download.
 *
 * O contexto é único e criado sob demanda: navegadores limitam o número de
 * AudioContexts e bloqueiam a criação antes da primeira interação do usuário.
 */
let audioContext: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (audioContext) return audioContext;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  try {
    audioContext = new Ctor();
    return audioContext;
  } catch {
    return null;
  }
}

export function playSound(kind: SoundKind): void {
  const ctx = getContext();
  if (!ctx) return;

  try {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (kind === 'click') {
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.015, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
      oscillator.start(now);
      oscillator.stop(now + 0.04);
      return;
    }

    if (kind === 'success') {
      // Arpejo de dó maior — sensação de "level up".
      oscillator.type = 'triangle';
      [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
        oscillator.frequency.setValueAtTime(frequency, now + index * 0.08);
      });
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
      oscillator.start(now);
      oscillator.stop(now + 0.45);
      return;
    }

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(140, now);
    oscillator.frequency.linearRampToValueAtTime(70, now + 0.22);
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
    oscillator.start(now);
    oscillator.stop(now + 0.22);
  } catch {
    // Áudio bloqueado pelo navegador não deve interromper o jogo.
  }
}
