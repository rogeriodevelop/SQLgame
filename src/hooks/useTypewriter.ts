import { useEffect, useState } from 'react';
import { playSound } from '../utils/sound';

function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

/**
 * Revela um texto caractere a caractere, como datilografado.
 *
 * Devolve o trecho visível e uma função para pular direto ao fim. Quem pediu
 * menos movimento no sistema recebe o texto inteiro de imediato. O texto é
 * fixo durante a vida do componente (quem usa é remontado a cada caso).
 */
export function useTypewriter(text: string, charsPerSecond = 90) {
  const [shown, setShown] = useState(() => (prefersReducedMotion() ? text.length : 0));
  const done = shown >= text.length;

  useEffect(() => {
    if (done) return;
    let ticks = 0;
    const timer = setInterval(() => {
      ticks++;
      if (ticks % 3 === 0) playSound('type');
      setShown(current => Math.min(text.length, current + 2));
    }, 2000 / charsPerSecond);
    return () => clearInterval(timer);
  }, [done, text.length, charsPerSecond]);

  return {
    visible: text.slice(0, shown),
    done,
    skip: () => setShown(text.length),
  };
}
