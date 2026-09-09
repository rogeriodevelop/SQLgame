import type { ReactElement } from 'react';

type AvatarProps = { strokeColor: string };

const renderNetrunner = ({ strokeColor }: AvatarProps) => (
  <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }} aria-hidden>
    <circle cx="50" cy="50" r="46" fill="rgba(10,12,18,0.9)" stroke={strokeColor} strokeWidth="2.5" />
    <path d="M28,78 C28,58 38,44 50,44 C62,44 72,58 72,78 Z" fill={strokeColor} opacity="0.15" />
    <path d="M35,35 L40,15 L48,26 L55,14 L62,26 L66,16 L65,36 L50,38 Z" fill={strokeColor} />
    <circle cx="50" cy="46" r="16" fill="rgba(255,255,255,0.06)" />
    <rect x="33" y="38" width="34" height="12" rx="3" fill={strokeColor} opacity="0.9" />
    <rect x="36" y="43" width="28" height="2" fill="#fff" opacity="0.9" />
    <circle cx="50" cy="41" r="1.5" fill="#fff" />
  </svg>
);

const renderCyborg = ({ strokeColor }: AvatarProps) => (
  <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }} aria-hidden>
    <circle cx="50" cy="50" r="46" fill="rgba(10,12,18,0.9)" stroke={strokeColor} strokeWidth="2.5" />
    <path d="M28,78 C28,58 38,44 50,44 C62,44 72,58 72,78 Z" fill={strokeColor} opacity="0.15" />
    <path d="M32,46 L40,34 L50,34 L50,58 L40,58 L32,50 Z" fill="rgba(156,163,175,0.3)" />
    <line x1="50" y1="34" x2="50" y2="58" stroke={strokeColor} strokeWidth="1.5" />
    <circle cx="43" cy="46" r="4" fill="#000" stroke={strokeColor} strokeWidth="1" />
    <circle cx="43" cy="46" r="1.5" fill="#5eead4" />
    <circle cx="57" cy="46" r="3" fill="rgba(255,255,255,0.2)" />
    <rect x="26" y="42" width="6" height="12" rx="2" fill={strokeColor} />
  </svg>
);

const renderDetective = ({ strokeColor }: AvatarProps) => (
  <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }} aria-hidden>
    <circle cx="50" cy="50" r="46" fill="rgba(10,12,18,0.9)" stroke={strokeColor} strokeWidth="2.5" />
    <path d="M26,80 L35,60 L40,65 L50,55 L60,65 L65,60 L74,80 Z" fill={strokeColor} opacity="0.15" stroke={strokeColor} strokeWidth="1" />
    <path d="M35,60 L24,78 L76,78 L65,60 Z" fill="rgba(15,23,42,0.8)" />
    <path d="M30,38 L70,38 L65,22 L35,22 Z" fill="#1e293b" />
    <rect x="24" y="35" width="52" height="4" rx="1" fill={strokeColor} />
    <rect x="36" y="44" width="28" height="8" rx="2" fill={strokeColor} opacity="0.8" />
    <circle cx="42" cy="48" r="1.5" fill="#fff" />
    <circle cx="58" cy="48" r="1.5" fill="#fff" />
  </svg>
);

const renderNeuralAi = ({ strokeColor }: AvatarProps) => (
  <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }} aria-hidden>
    <circle cx="50" cy="50" r="46" fill="rgba(10,12,18,0.95)" stroke={strokeColor} strokeWidth="2.5" />
    <path d="M50,15 L50,30 M30,50 L45,50 M55,50 L70,50 M50,70 L50,85" stroke={strokeColor} strokeWidth="1.5" opacity="0.25" />
    <circle cx="50" cy="48" r="18" fill="none" stroke={strokeColor} strokeWidth="1" strokeDasharray="2 2" />
    <ellipse cx="50" cy="48" rx="12" ry="18" fill="none" stroke={strokeColor} strokeWidth="0.75" />
    <circle cx="44" cy="46" r="2.5" fill="none" stroke={strokeColor} strokeWidth="1.5" />
    <circle cx="44" cy="46" r="1" fill="#fff" />
    <circle cx="56" cy="46" r="2.5" fill="none" stroke={strokeColor} strokeWidth="1.5" />
    <circle cx="56" cy="46" r="1" fill="#fff" />
    <line x1="44" y1="46" x2="56" y2="46" stroke={strokeColor} strokeWidth="0.5" />
    <circle cx="50" cy="60" r="1.5" fill={strokeColor} />
  </svg>
);

const renderBiopunk = ({ strokeColor }: AvatarProps) => (
  <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }} aria-hidden>
    <circle cx="50" cy="50" r="46" fill="rgba(10,12,18,0.9)" stroke={strokeColor} strokeWidth="2.5" />
    <path d="M28,78 C28,58 38,44 50,44 C62,44 72,58 72,78 Z" fill={strokeColor} opacity="0.15" />
    <path d="M47,15 L53,15 L53,38 L47,38 Z" fill={strokeColor} />
    <path d="M42,22 L58,22 L55,38 L45,38 Z" fill="#ca8a04" />
    <polygon points="34,40 48,40 45,49 36,49" fill="#111" stroke={strokeColor} strokeWidth="1.5" />
    <polygon points="52,40 66,40 64,49 55,49" fill="#111" stroke={strokeColor} strokeWidth="1.5" />
    <line x1="38" y1="43" x2="45" y2="43" stroke="#fff" strokeWidth="1" />
    <line x1="56" y1="43" x2="63" y2="43" stroke="#fff" strokeWidth="1" />
    <polygon points="42,52 58,52 54,68 46,68" fill="#1f2937" stroke={strokeColor} strokeWidth="1" />
    <circle cx="45" cy="60" r="2.5" fill={strokeColor} />
    <circle cx="55" cy="60" r="2.5" fill={strokeColor} />
  </svg>
);

const renderSysadmin = ({ strokeColor }: AvatarProps) => (
  <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }} aria-hidden>
    <circle cx="50" cy="50" r="46" fill="rgba(10,12,18,0.9)" stroke={strokeColor} strokeWidth="2.5" />
    <path d="M28,78 C28,52 34,34 50,34 C66,34 72,52 72,78 Z" fill="#111827" />
    <path d="M33,78 C33,56 38,40 50,40 C62,40 67,56 67,78 Z" fill="#030712" />
    <path d="M38,48 C38,45 42,42 50,42 C58,42 62,45 62,48 L60,54 C60,57 56,59 50,59 C44,59 40,57 40,54 Z" fill={strokeColor} opacity="0.9" />
    <path d="M42,48 L58,48 L56,50 L44,50 Z" fill="#fff" opacity="0.8" />
    <circle cx="50" cy="54" r="1.5" fill="#fff" />
  </svg>
);

export type AvatarOption = {
  id: string;
  name: string;
  color: string;
  description: string;
  render: (props: AvatarProps) => ReactElement;
};

/** Arquétipos disponíveis para o jogador. Puramente cosmético. */
export const AVATARS: AvatarOption[] = [
  { id: 'netrunner', name: 'Netrunner Neon', color: '#ec4899', description: 'Especialista em invasão rápida de terminais.', render: renderNetrunner },
  { id: 'cyborg', name: 'Cyborg Tático', color: '#10b981', description: 'Aumentos cibernéticos de alta performance.', render: renderCyborg },
  { id: 'detective', name: 'Detetive Cyberpunk', color: '#3b82f6', description: 'Mestre na análise de logs e evidências.', render: renderDetective },
  { id: 'neural_ai', name: 'IA Neuronal', color: '#06b6d4', description: 'Constructo virtual focado em lógica.', render: renderNeuralAi },
  { id: 'biopunk', name: 'Rebelde Biopunk', color: '#eab308', description: 'Bypass de firewalls usando biotecnologia.', render: renderBiopunk },
  { id: 'sysadmin', name: 'Sysadmin Root', color: '#ef4444', description: 'Privilégios totais e segurança máxima.', render: renderSysadmin },
];

export function findAvatar(id: string): AvatarOption {
  return AVATARS.find(avatar => avatar.id === id) ?? AVATARS[0];
}
