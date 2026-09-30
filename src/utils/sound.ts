export type SoundKind = 'success' | 'error' | 'click' | 'stamp' | 'paper' | 'pin' | 'type';

/**
 * Efeitos sonoros sintetizados na Web Audio API — sem arquivos de áudio,
 * sem custo de download.
 *
 * O contexto é único e criado sob demanda: navegadores limitam o número de
 * AudioContexts e bloqueiam a criação antes da primeira interação do usuário.
 */
let audioContext: AudioContext | null = null;
let noiseBuffer: AudioBuffer | null = null;
let muted = false;

export function setMuted(value: boolean): void {
  muted = value;
}

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

/** Meio segundo de ruído branco, reaproveitado por papel, carimbo e teclas. */
function getNoise(ctx: AudioContext): AudioBuffer {
  if (noiseBuffer) return noiseBuffer;
  const buffer = ctx.createBuffer(1, ctx.sampleRate / 2, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  noiseBuffer = buffer;
  return buffer;
}

/** Rajada de ruído filtrado: a base de todos os sons de objeto físico. */
function burst(ctx: AudioContext, options: { freq: number; q: number; gain: number; duration: number; type?: BiquadFilterType }) {
  const now = ctx.currentTime;
  const source = ctx.createBufferSource();
  source.buffer = getNoise(ctx);
  const filter = ctx.createBiquadFilter();
  filter.type = options.type ?? 'bandpass';
  filter.frequency.value = options.freq;
  filter.Q.value = options.q;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(options.gain, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + options.duration);
  source.connect(filter).connect(gain).connect(ctx.destination);
  source.start(now);
  source.stop(now + options.duration);
}

function tone(ctx: AudioContext, options: { type: OscillatorType; freqs: number[]; step: number; gain: number; duration: number }) {
  const now = ctx.currentTime;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = options.type;
  options.freqs.forEach((f, i) => oscillator.frequency.setValueAtTime(f, now + i * options.step));
  gain.gain.setValueAtTime(options.gain, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + options.duration);
  oscillator.connect(gain).connect(ctx.destination);
  oscillator.start(now);
  oscillator.stop(now + options.duration);
}

export function playSound(kind: SoundKind): void {
  if (muted) return;
  const ctx = getContext();
  if (!ctx) return;

  try {
    switch (kind) {
      case 'click':
        burst(ctx, { freq: 2400, q: 3, gain: 0.05, duration: 0.03 });
        return;
      case 'type':
        // Tecla de máquina de escrever: estalo agudo e curto.
        burst(ctx, { freq: 3200 + Math.random() * 900, q: 6, gain: 0.035, duration: 0.025 });
        return;
      case 'paper':
        burst(ctx, { freq: 5200, q: 0.7, gain: 0.05, duration: 0.18, type: 'highpass' });
        return;
      case 'pin':
        burst(ctx, { freq: 1800, q: 8, gain: 0.08, duration: 0.05 });
        return;
      case 'stamp':
        // Carimbo: pancada grave com ruído de borracha.
        tone(ctx, { type: 'sine', freqs: [120, 60], step: 0.05, gain: 0.25, duration: 0.18 });
        burst(ctx, { freq: 400, q: 1, gain: 0.18, duration: 0.12, type: 'lowpass' });
        return;
      case 'success':
        // Acorde menor que resolve em maior: fecho de caso de filme noir.
        tone(ctx, { type: 'triangle', freqs: [220, 261.63, 329.63, 440], step: 0.11, gain: 0.07, duration: 0.8 });
        return;
      case 'error':
        tone(ctx, { type: 'sawtooth', freqs: [140, 70], step: 0.1, gain: 0.05, duration: 0.22 });
        return;
    }
  } catch {
    // Áudio bloqueado pelo navegador não deve interromper o jogo.
  }
}
