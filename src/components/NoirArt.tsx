import { useId, type CSSProperties } from 'react';

/**
 * Ilustrações vetoriais do jogo: espiões, digitais, cartões perfurados e
 * fitas de dados. Tudo em SVG desenhado aqui — nenhum arquivo baixado.
 *
 * Os retratos são gerados a partir de uma semente (nome do suspeito, id do
 * caso): a mesma pessoa tem sempre o mesmo rosto, e pessoas diferentes
 * raramente se repetem.
 */

/** Hash FNV-1a de 32 bits: estável entre execuções e navegadores. */
function hash(seed: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Sorteio determinístico: devolve um item de `options` a partir do hash e de um canal. */
function pick<T>(h: number, channel: number, options: readonly T[]): T {
  return options[((h >>> (channel * 3)) ^ (h >>> 17)) % options.length];
}

type ArtProps = { style?: CSSProperties; className?: string };

// ── Retrato de ficha policial ────────────────────────────────────────────

const HATS = ['fedora', 'fedora', 'none', 'beret', 'trilby'] as const;
const GLASSES = ['none', 'none', 'dark', 'round'] as const;
const FACIAL = ['none', 'none', 'mustache', 'beard'] as const;
const HAIR = ['short', 'long', 'bald', 'slick'] as const;
const COATS = ['trench', 'suit', 'turtleneck'] as const;
const SKIN = ['#c9bfb0', '#b3a795', '#9c8f7c', '#d8cfc1', '#857866'] as const;

/**
 * Retrato em preto e branco no estilo de foto de arquivo: fundo com régua de
 * altura, chapéu, óculos e casaco variando conforme a semente.
 */
export function SpyPortrait({ seed, style, className, lineup = false }: ArtProps & { seed: string; lineup?: boolean }) {
  const id = useId().replace(/:/g, '');
  const h = hash(seed);
  const hat = pick(h, 0, HATS);
  const glasses = pick(h, 1, GLASSES);
  const facial = pick(h, 2, FACIAL);
  const hair = hat === 'none' ? pick(h, 3, HAIR) : 'short';
  const coat = pick(h, 4, COATS);
  const skin = pick(h, 5, SKIN);
  const tilt = ((h >>> 9) % 7) - 3;

  return (
    <svg viewBox="0 0 60 70" className={className} style={{ display: 'block', width: '100%', height: '100%', ...style }} aria-hidden>
      <defs>
        <radialGradient id={`bg${id}`} cx="0.3" cy="0.2" r="1">
          <stop offset="0" stopColor="#8c877e" />
          <stop offset="1" stopColor="#35322d" />
        </radialGradient>
        <linearGradient id={`face${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0.35" stopColor={skin} />
          <stop offset="1" stopColor="#4a443b" />
        </linearGradient>
        <filter id={`grain${id}`}>
          <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="1" result="n" />
          <feColorMatrix in="n" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.35 0" result="a" />
          <feComposite in="a" in2="SourceGraphic" operator="in" />
          <feBlend in="SourceGraphic" mode="multiply" />
        </filter>
      </defs>

      <g filter={`url(#grain${id})`}>
        <rect width="60" height="70" fill={`url(#bg${id})`} />
        {lineup &&
          [14, 24, 34, 44, 54].map(y => (
            <g key={y}>
              <line x1="0" x2="60" y1={y} y2={y} stroke="rgba(255,255,255,0.28)" strokeWidth="0.5" />
              <text x="2" y={y - 1} fontSize="3.2" fill="rgba(255,255,255,0.5)" fontFamily="monospace">
                {(7 - y / 10).toFixed(1)}
              </text>
            </g>
          ))}

        <g transform={`rotate(${tilt} 30 40)`}>
          {/* Corpo */}
          {coat === 'trench' && (
            <>
              <path d="M6 70 C8 54 16 48 30 47 C44 48 52 54 54 70 Z" fill="#2b2824" />
              <path d="M22 48 L30 62 L38 48 L34 47 L30 55 L26 47 Z" fill="#bdb5a8" />
              <path d="M14 52 L24 47 L30 60 L20 70 Z M46 52 L36 47 L30 60 L40 70 Z" fill="#3a3630" />
            </>
          )}
          {coat === 'suit' && (
            <>
              <path d="M6 70 C8 54 16 48 30 47 C44 48 52 54 54 70 Z" fill="#1f1d1a" />
              <path d="M25 47 L30 58 L35 47 Z" fill="#e3ddd2" />
              <path d="M29 50 L31 50 L32 62 L30 64 L28 62 Z" fill="#6b1f1a" />
            </>
          )}
          {coat === 'turtleneck' && (
            <>
              <path d="M6 70 C8 54 16 49 30 48 C44 49 52 54 54 70 Z" fill="#23211e" />
              <rect x="23" y="43" width="14" height="8" rx="3" fill="#2f2c27" />
            </>
          )}

          {/* Pescoço e cabeça */}
          <rect x="26" y="38" width="8" height="10" fill={skin} opacity="0.85" />
          {hair === 'long' && <path d="M17 28 C16 44 20 50 24 50 L36 50 C40 50 44 44 43 28 Z" fill="#1c1a17" />}
          <ellipse cx="30" cy="30" rx="10" ry="12.5" fill={`url(#face${id})`} />
          <path d="M22 36 C25 42 35 42 38 36 C36 44 24 44 22 36 Z" fill="#000" opacity="0.18" />

          {/* Cabelo */}
          {hair === 'short' && <path d="M20 27 C20 17 40 17 40 27 C37 21 23 21 20 27 Z" fill="#1c1a17" />}
          {hair === 'slick' && <path d="M19.5 28 C19 15 41 15 40.5 28 C38 19 25 18 19.5 28 Z" fill="#0f0e0c" />}
          {hair === 'long' && <path d="M19 30 C18 14 42 14 41 30 C38 20 22 20 19 30 Z" fill="#1c1a17" />}

          {/* Olhos, nariz, boca */}
          <ellipse cx="26" cy="29" rx="1.4" ry="0.9" fill="#1a1815" />
          <ellipse cx="34" cy="29" rx="1.4" ry="0.9" fill="#1a1815" />
          <path d="M26 26 L28.5 25.5 M31.5 25.5 L34 26" stroke="#1a1815" strokeWidth="0.8" />
          <path d="M30 29 L29 34 L31 34" stroke="#3b362f" strokeWidth="0.7" fill="none" />
          <path d="M27 37.5 Q30 38.5 33 37.5" stroke="#3b362f" strokeWidth="0.8" fill="none" />

          {facial === 'mustache' && <path d="M26 35.5 Q30 33.5 34 35.5 Q30 36.5 26 35.5 Z" fill="#1c1a17" />}
          {facial === 'beard' && <path d="M21 31 C21 44 39 44 39 31 C37 40 23 40 21 31 Z M26 35.5 Q30 34 34 35.5 L33 37.5 Q30 39 27 37.5 Z" fill="#1c1a17" />}

          {glasses === 'dark' && (
            <g>
              <rect x="22" y="26.5" width="7" height="4.5" rx="1.5" fill="#0a0a09" />
              <rect x="31" y="26.5" width="7" height="4.5" rx="1.5" fill="#0a0a09" />
              <line x1="29" y1="28" x2="31" y2="28" stroke="#0a0a09" strokeWidth="0.8" />
              <line x1="23" y1="27.3" x2="25" y2="27.3" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
            </g>
          )}
          {glasses === 'round' && (
            <g fill="none" stroke="#12110f" strokeWidth="0.9">
              <circle cx="26" cy="29" r="3" />
              <circle cx="34" cy="29" r="3" />
              <line x1="29" y1="29" x2="31" y2="29" />
            </g>
          )}

          {/* Chapéus — a aba lança sombra sobre os olhos. */}
          {(hat === 'fedora' || hat === 'trilby') && (
            <g>
              <ellipse cx="30" cy="29" rx="11" ry="4.5" fill="#000" opacity="0.35" />
              <path
                d={hat === 'fedora' ? 'M12 23.5 Q30 17 48 23.5 Q30 21.5 12 23.5 Z' : 'M16 23 Q30 18 44 23 Q30 21.5 16 23 Z'}
                fill="#141210"
                stroke="#141210"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path d="M20.5 22 C20 14 22 9 30 9.5 C38 9 40 14 39.5 22 Q30 20 20.5 22 Z" fill="#221f1b" />
              <path d="M25 10.5 Q30 14 35 10.5" stroke="#0d0c0b" strokeWidth="1.1" fill="none" />
              <path d="M20.6 19 Q30 17.2 39.4 19 L39.5 21.8 Q30 20 20.5 21.8 Z" fill="#0a0908" />
            </g>
          )}
          {hat === 'beret' && <path d="M18 23 C17 13 41 11 43 20 C40 23 24 24 18 23 Z" fill="#171513" />}
        </g>
      </g>
    </svg>
  );
}

// ── Silhueta de corpo inteiro sob o poste ────────────────────────────────

/** Espião de sobretudo e chapéu sob a luz de um poste, numa rua molhada. */
export function SpyUnderStreetlamp({ style, className }: ArtProps) {
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 220 420" className={className} style={{ display: 'block', ...style }} aria-hidden>
      <defs>
        <linearGradient id={`cone${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgba(255, 214, 150, 0.55)" />
          <stop offset="1" stopColor="rgba(255, 214, 150, 0)" />
        </linearGradient>
        <radialGradient id={`pool${id}`}>
          <stop offset="0" stopColor="rgba(255, 210, 140, 0.35)" />
          <stop offset="1" stopColor="rgba(255, 210, 140, 0)" />
        </radialGradient>
      </defs>

      {/* Poste */}
      <rect x="40" y="40" width="6" height="370" fill="#0d0b09" />
      <path d="M43 40 Q43 22 70 22 L96 22" stroke="#0d0b09" strokeWidth="5" fill="none" />
      <path d="M86 20 L106 20 L112 34 L80 34 Z" fill="#0d0b09" />
      <ellipse cx="96" cy="35" rx="12" ry="3" fill="#ffe0a8" />

      {/* Luz e poça no chão */}
      <path d="M84 35 L108 35 L200 402 L0 402 Z" fill={`url(#cone${id})`} />
      <ellipse cx="110" cy="404" rx="100" ry="12" fill={`url(#pool${id})`} />

      {/* Espião: silhueta com contorno fraco da luz do poste. */}
      <g fill="#0b0908" stroke="rgba(255, 214, 150, 0.28)" strokeWidth="1.2" strokeLinejoin="round">
        {/* Pernas e sapatos */}
        <path d="M110 330 L111 396 L124 396 L125 330 Z" />
        <path d="M132 330 L133 396 L146 396 L147 330 Z" />
        <ellipse cx="116" cy="398" rx="10" ry="3.5" />
        <ellipse cx="141" cy="398" rx="10" ry="3.5" />
        {/* Sobretudo: ombros caídos, cinto e barra abrindo */}
        <path d="M112 219 C101 222 96 232 95 246 L91 336 C104 342 118 338 128 334 C138 338 152 342 165 336 L161 246 C160 232 155 222 144 219 L136 216 L128 226 L120 216 Z" />
        {/* Braço com maleta */}
        <path d="M157 232 C168 252 170 288 166 312 L158 312 C160 290 158 258 150 242 Z" />
        <rect x="149" y="309" width="30" height="22" rx="2" />
        <path d="M157 309 Q164 301 171 309" fill="none" strokeWidth="2.5" />
        {/* Cabeça e gola levantada */}
        <ellipse cx="128" cy="203" rx="10.5" ry="13" />
        <path d="M114 222 L119 206 L128 219 L137 206 L142 222 Z" />
        {/* Fedora */}
        <path d="M103 192 Q128 183 153 192 Q128 188 103 192 Z" strokeWidth="2" />
        <path d="M114 190 C113 178 117 170 128 171 C139 170 143 178 142 190 Q128 186 114 190 Z" />
      </g>
      <path d="M114 173 Q128 178 142 173" stroke="rgba(255, 214, 150, 0.2)" strokeWidth="1" fill="none" />
      {/* Brasa do cigarro e fumaça */}
      <circle cx="118" cy="210" r="1.6" fill="#ff7a3c" />
      <path d="M117 207 C112 198 120 192 114 182 C110 174 118 168 114 158" stroke="rgba(230,225,215,0.28)" strokeWidth="2" fill="none" />
    </svg>
  );
}

// ── Objetos de dados ─────────────────────────────────────────────────────

/** Cartão perfurado de 80 colunas, com furos derivados da semente. */
export function PunchCard({ seed = 'delegacia', style, className }: ArtProps & { seed?: string }) {
  const h = hash(seed);
  const holes: { x: number; y: number }[] = [];
  for (let col = 0; col < 40; col++) {
    const v = hash(`${seed}:${col}:${h}`);
    const count = 1 + (v % 3);
    for (let k = 0; k < count; k++) holes.push({ x: 10 + col * 4.4, y: 18 + ((v >>> (k * 4)) % 10) * 6.2 });
  }
  return (
    <svg viewBox="0 0 196 86" className={className} style={{ display: 'block', ...style }} aria-hidden>
      <path d="M8 2 L194 2 L194 84 L2 84 L2 8 Z" fill="#efe1bd" stroke="#b8a57a" strokeWidth="0.8" />
      <text x="12" y="11" fontSize="5" fontFamily="monospace" fill="#8a5a3a" letterSpacing="0.5">
        DELEGACIA DE DADOS · FICHA 80 COLUNAS
      </text>
      {Array.from({ length: 10 }, (_, row) => (
        <text key={row} x="4.5" y={21 + row * 6.2} fontSize="3.4" fontFamily="monospace" fill="#b39673">
          {row}
        </text>
      ))}
      {holes.map((hole, i) => (
        <rect key={i} x={hole.x} y={hole.y} width="2.2" height="4" fill="#2a1d12" />
      ))}
    </svg>
  );
}

/** Rolo de fita magnética de computador. `spinning` gira devagar. */
export function TapeReel({ style, className, spinning = false }: ArtProps & { spinning?: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className={className} style={{ display: 'block', ...style }} aria-hidden>
      <g style={spinning ? { transformOrigin: '50px 50px', animation: 'spin 3s linear infinite' } : undefined}>
        <circle cx="50" cy="50" r="47" fill="#2b2620" stroke="#8a7c63" strokeWidth="2" />
        <circle cx="50" cy="50" r="38" fill="#3b2a1a" />
        <circle cx="50" cy="50" r="38" fill="none" stroke="#5a412a" strokeWidth="0.6" strokeDasharray="1 2" />
        <circle cx="50" cy="50" r="20" fill="#bfb3a0" stroke="#6f6553" strokeWidth="1.5" />
        {[0, 120, 240].map(a => (
          <path key={a} d="M50 50 L50 33 A17 17 0 0 1 64.7 41.5 Z" fill="#2b2620" transform={`rotate(${a} 50 50)`} />
        ))}
        <circle cx="50" cy="50" r="5" fill="#2b2620" />
      </g>
    </svg>
  );
}

/** Impressão digital em tinta: sulcos em redemoinho, com falhas de tinta. */
export function Fingerprint({ style, className, color = 'currentColor' }: ArtProps & { color?: string }) {
  const id = useId().replace(/:/g, '');
  const ridges = Array.from({ length: 10 }, (_, i) => i);
  return (
    <svg viewBox="0 0 60 72" className={className} style={{ display: 'block', ...style }} aria-hidden>
      <defs>
        <clipPath id={`tip${id}`}>
          <ellipse cx="30" cy="37" rx="25" ry="32" />
        </clipPath>
      </defs>
      <g clipPath={`url(#tip${id})`} fill="none" stroke={color} strokeWidth="1.9" strokeLinecap="round" opacity="0.88">
        {ridges.map(i => {
          const r = 2.5 + i * 3.1;
          return (
            <ellipse
              key={i}
              cx={30 + i * 0.25}
              cy={38 - i * 0.55}
              rx={r}
              ry={r * 1.28}
              strokeDasharray={i % 3 === 0 ? undefined : i % 3 === 1 ? `${14 + i * 3} 2.5` : `${9 + i * 2} 3 ${22 + i} 2`}
              transform={`rotate(${i * 4 - 8} 30 38)`}
            />
          );
        })}
        <path d="M5 60 Q30 50 55 60 M5 66 Q30 57 55 66" />
      </g>
    </svg>
  );
}

/** Clipe de papel, para prender a foto na pasta. */
export function PaperClip({ style, className }: ArtProps) {
  return (
    <svg viewBox="0 0 16 44" className={className} style={{ display: 'block', ...style }} aria-hidden>
      <path d="M11 12 L11 34 C11 40 3 40 3 34 L3 8 C3 2 13 2 13 8 L13 30 C13 33 7 33 7 30 L7 12" fill="none" stroke="#9aa0a4" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
