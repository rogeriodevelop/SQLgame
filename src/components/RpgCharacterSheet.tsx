import React, { useState } from 'react';
import { Key, ShieldAlert, Cpu, Award, Radio, FileCode, Shield, Settings, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RpgCharacterSheetProps {
  totalSolved: number;
  casesCount: number;
  attempts: number;
}

// ── Renderizadores de Avatares SVG Cibernéticos em Alta Fidelidade ─────

const NetrunnerSvg = ({ strokeColor = '#ec4899' }) => (
  <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
    <circle cx="50" cy="50" r="46" fill="rgba(10,12,18,0.9)" stroke={strokeColor} strokeWidth="2.5" />
    <path d="M28,78 C28,58 38,44 50,44 C62,44 72,58 72,78 Z" fill="rgba(236,72,153,0.15)" />
    {/* Cabelo */}
    <path d="M35,35 L40,15 L48,26 L55,14 L62,26 L66,16 L65,36 L50,38 Z" fill={strokeColor} />
    {/* Rosto */}
    <circle cx="50" cy="46" r="16" fill="rgba(255,255,255,0.06)" />
    {/* Visor holográfico */}
    <rect x="33" y="38" width="34" height="12" rx="3" fill={strokeColor} opacity="0.9" />
    <rect x="36" y="43" width="28" height="2" fill="#fff" opacity="0.9" />
    <circle cx="50" cy="41" r="1.5" fill="#fff" />
  </svg>
);

const CyborgSvg = ({ strokeColor = '#10b981' }) => (
  <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
    <circle cx="50" cy="50" r="46" fill="rgba(10,12,18,0.9)" stroke={strokeColor} strokeWidth="2.5" />
    <path d="M28,78 C28,58 38,44 50,44 C62,44 72,58 72,78 Z" fill="rgba(16,185,129,0.15)" />
    {/* Lado esquerdo cibernético metálico */}
    <path d="M32,46 L40,34 L50,34 L50,58 L40,58 L32,50 Z" fill="rgba(156,163,175,0.3)" />
    <line x1="50" y1="34" x2="50" y2="58" stroke={strokeColor} strokeWidth="1.5" />
    {/* Olho biônico verde brilhante */}
    <circle cx="43" cy="46" r="4" fill="#000" stroke={strokeColor} strokeWidth="1" />
    <circle cx="43" cy="46" r="1.5" fill="#5eead4" />
    {/* Olho humano */}
    <circle cx="57" cy="46" r="3" fill="rgba(255,255,255,0.2)" />
    {/* Fone cibernético na orelha */}
    <rect x="26" y="42" width="6" height="12" rx="2" fill={strokeColor} />
  </svg>
);

const DetectiveSvg = ({ strokeColor = '#3b82f6' }) => (
  <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
    <circle cx="50" cy="50" r="46" fill="rgba(10,12,18,0.9)" stroke={strokeColor} strokeWidth="2.5" />
    {/* Sobretudo com gola alta */}
    <path d="M26,80 L35,60 L40,65 L50,55 L60,65 L65,60 L74,80 Z" fill="rgba(59,130,246,0.15)" stroke={strokeColor} strokeWidth="1" />
    <path d="M35,60 L24,78 L76,78 L65,60 Z" fill="rgba(15,23,42,0.8)" />
    {/* Chapéu Fedora Cyber */}
    <path d="M30,38 L70,38 L65,22 L35,22 Z" fill="#1e293b" />
    <rect x="24" y="35" width="52" height="4" rx="1" fill={strokeColor} />
    {/* Visor azul neon de análise de pistas */}
    <rect x="36" y="44" width="28" height="8" rx="2" fill={strokeColor} opacity="0.8" />
    <circle cx="42" cy="48" r="1.5" fill="#fff" />
    <circle cx="58" cy="48" r="1.5" fill="#fff" />
  </svg>
);

const NeuralAiSvg = ({ strokeColor = '#06b6d4' }) => (
  <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
    <circle cx="50" cy="50" r="46" fill="rgba(10,12,18,0.95)" stroke={strokeColor} strokeWidth="2.5" />
    {/* Circuitos integrados no fundo */}
    <path d="M50,15 L50,30 M30,50 L45,50 M55,50 L70,50 M50,70 L50,85" stroke="rgba(6,182,212,0.2)" strokeWidth="1.5" />
    {/* Rosto holográfico feito de malha de linhas */}
    <circle cx="50" cy="48" r="18" fill="none" stroke={strokeColor} strokeWidth="1" strokeDasharray="2 2" />
    <ellipse cx="50" cy="48" rx="12" ry="18" fill="none" stroke={strokeColor} strokeWidth="0.75" />
    {/* Olhos cibernéticos */}
    <circle cx="44" cy="46" r="2.5" fill="none" stroke={strokeColor} strokeWidth="1.5" />
    <circle cx="44" cy="46" r="1" fill="#fff" />
    <circle cx="56" cy="46" r="2.5" fill="none" stroke={strokeColor} strokeWidth="1.5" />
    <circle cx="56" cy="46" r="1" fill="#fff" />
    <line x1="44" y1="46" x2="56" y2="46" stroke={strokeColor} strokeWidth="0.5" />
    <circle cx="50" cy="60" r="1.5" fill={strokeColor} />
  </svg>
);

const BiopunkSvg = ({ strokeColor = '#eab308' }) => (
  <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
    <circle cx="50" cy="50" r="46" fill="rgba(10,12,18,0.9)" stroke={strokeColor} strokeWidth="2.5" />
    <path d="M28,78 C28,58 38,44 50,44 C62,44 72,58 72,78 Z" fill="rgba(234,179,8,0.15)" />
    {/* Cabelo moicano rebelde */}
    <path d="M47,15 L53,15 L53,38 L47,38 Z" fill={strokeColor} />
    <path d="M42,22 L58,22 L55,38 L45,38 Z" fill="#ca8a04" />
    {/* Óculos escuros com reflexo amarelo */}
    <polygon points="34,40 48,40 45,49 36,49" fill="#111" stroke={strokeColor} strokeWidth="1.5" />
    <polygon points="52,40 66,40 64,49 55,49" fill="#111" stroke={strokeColor} strokeWidth="1.5" />
    <line x1="38" y1="43" x2="45" y2="43" stroke="#fff" strokeWidth="1" />
    <line x1="56" y1="43" x2="63" y2="43" stroke="#fff" strokeWidth="1" />
    {/* Máscara de respiração cibernética */}
    <polygon points="42,52 58,52 54,68 46,68" fill="#1f2937" stroke={strokeColor} strokeWidth="1" />
    <circle cx="45" cy="60" r="2.5" fill={strokeColor} />
    <circle cx="55" cy="60" r="2.5" fill={strokeColor} />
  </svg>
);

const SysadminSvg = ({ strokeColor = '#ef4444' }) => (
  <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
    <circle cx="50" cy="50" r="46" fill="rgba(10,12,18,0.9)" stroke={strokeColor} strokeWidth="2.5" />
    {/* Capuz preto de hacker */}
    <path d="M28,78 C28,52 34,34 50,34 C66,34 72,52 72,78 Z" fill="#111827" />
    <path d="M33,78 C33,56 38,40 50,40 C62,40 67,56 67,78 Z" fill="#030712" />
    {/* Visor blindado vermelho */}
    <path d="M38,48 C38,45 42,42 50,42 C58,42 62,45 62,48 L60,54 C60,57 56,59 50,59 C44,59 40,57 40,54 Z" fill={strokeColor} opacity="0.9" />
    <path d="M42,48 L58,48 L56,50 L44,50 Z" fill="#fff" opacity="0.8" />
    <circle cx="50" cy="54" r="1.5" fill="#fff" />
  </svg>
);

export const RpgCharacterSheet: React.FC<RpgCharacterSheetProps> = ({
  totalSolved,
  casesCount,
  attempts,
}) => {
  // Controle de Estado do Avatar com Persistência no localStorage
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>(() => {
    return localStorage.getItem('sqlgame_hacker_avatar') || 'netrunner';
  });
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Lista de Opções de Avatares RPG Cibernéticos
  const avatars = [
    {
      id: 'netrunner',
      name: 'Netrunner Neon',
      color: '#ec4899',
      desc: 'Especialista em invasão rápida de terminais.',
      svg: <NetrunnerSvg />
    },
    {
      id: 'cyborg',
      name: 'Cyborg Tático',
      color: '#10b981',
      desc: 'Aumentos cibernéticos de alta performance.',
      svg: <CyborgSvg />
    },
    {
      id: 'detective',
      name: 'Detetive Cyberpunk',
      color: '#3b82f6',
      desc: 'Mestre na análise de logs e evidências.',
      svg: <DetectiveSvg />
    },
    {
      id: 'neural_ai',
      name: 'IA Neuronal',
      color: '#06b6d4',
      desc: 'Constructo virtual puro focado em lógica.',
      svg: <NeuralAiSvg />
    },
    {
      id: 'biopunk',
      name: 'Rebelde Biopunk',
      color: '#eab308',
      desc: 'Bypass de firewalls usando biotecnologia.',
      svg: <BiopunkSvg />
    },
    {
      id: 'sysadmin',
      name: 'Sysadmin Root',
      color: '#ef4444',
      desc: 'Privilégios totais e segurança de rede máxima.',
      svg: <SysadminSvg />
    }
  ];

  const currentAvatar = avatars.find(a => a.id === selectedAvatarId) || avatars[0];

  // Cálculos de Status do RPG
  const level = Math.floor(totalSolved / 5) + 1;
  const hp = Math.max(Math.round((totalSolved / casesCount) * 100), 5); // Integridade geral do sistema
  const mp = Math.max(100 - (attempts * 15), 10); // CPU Performance
  const xpCurrent = (totalSolved % 5) * 100;
  const xpNeeded = 500;
  const xpPercent = Math.round((xpCurrent / xpNeeded) * 100);

  // Lista de Itens do Inventário baseados no total resolvido
  const inventoryItems = [
    {
      name: 'Chave SSH Hydra',
      req: 5,
      icon: <Key size={14} />,
      desc: 'Privilégios iniciais de descriptografia.'
    },
    {
      name: 'Rastreador de Rede',
      req: 12,
      icon: <Radio size={14} />,
      desc: 'Detecta localizações físicas de pacotes de dados.'
    },
    {
      name: 'Certificado Root',
      req: 22,
      icon: <FileCode size={14} />,
      desc: 'Assinatura digital para forjar identidades.'
    },
    {
      name: 'Decodificador Quântico',
      req: 35,
      icon: <Cpu size={14} />,
      desc: 'Quebra senhas baseadas em hashes MD5/SHA256.'
    },
    {
      name: 'SQL Injetor Bypass',
      req: 50,
      icon: <ShieldAlert size={14} />,
      desc: 'Ignora firewalls de bancos de dados legados.'
    },
    {
      name: 'Manto do Admin Root',
      req: 58,
      icon: <Shield size={14} />,
      desc: 'Privilégio total e invisibilidade de rede.'
    }
  ];

  return (
    <div 
      className="glass-morphism" 
      style={{ 
        overflow: 'hidden', 
        display: 'flex', 
        flexDirection: 'column', 
        background: 'rgba(14, 17, 23, 0.8)',
        border: '1px solid rgba(168, 85, 247, 0.2)',
        borderRadius: '16px'
      }}
    >
      {/* Banner Superior Cyberpunk City */}
      <div 
        style={{ 
          height: '90px', 
          width: '100%', 
          backgroundImage: "url('/cyberpunk_city.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-end',
          padding: '0.65rem 1rem'
        }}
      >
        {/* Overlay Escuro para Legibilidade */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(7, 8, 10, 0.95) 0%, rgba(7, 8, 10, 0.3) 100%)', zIndex: 1 }} />
        
        {/* Informações de Nível do Detetive */}
        <div style={{ zIndex: 2, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          
          {/* Avatar Interativo do Jogador */}
          <div 
            onClick={() => setIsModalOpen(true)}
            style={{ 
              width: '44px', 
              height: '44px', 
              cursor: 'pointer',
              position: 'relative',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: `0 0 12px ${currentAvatar.color}50`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(10,11,15,0.7)',
              border: `1.5px solid ${currentAvatar.color}80`
            }}
            className="rpg-avatar-hover"
            title="Clique para escolher seu Avatar Hacker"
          >
            {React.cloneElement(currentAvatar.svg, { strokeColor: currentAvatar.color })}
            
            <div 
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0,
                transition: 'opacity 0.25s ease'
              }}
              className="rpg-avatar-overlay"
            >
              <Settings size={14} style={{ color: 'white' }} />
            </div>
          </div>

          <div>
            <h4 style={{ color: 'white', fontSize: '0.85rem', margin: 0, fontWeight: 800, letterSpacing: '0.5px' }}>
              Level {level} <span style={{ color: currentAvatar.color }}>{currentAvatar.name.split(' ')[0]}</span>
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.68rem', margin: 0 }}>
              XP: {xpCurrent}/{xpNeeded}
            </p>
          </div>
        </div>
      </div>

      {/* Status Bars e Inventário */}
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        
        {/* Barras de Status RPG */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          
          {/* HP Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 700, marginBottom: '2px', color: 'var(--easy-color)' }}>
              <span>INTEGRIDADE SISTEMA (HP)</span>
              <span>{hp}%</span>
            </div>
            <div className="rpg-bar-container">
              <div 
                className="rpg-bar-fill" 
                style={{ width: `${hp}%`, background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)', boxShadow: '0 0 8px rgba(16, 185, 129, 0.4)' }}
              />
            </div>
          </div>

          {/* MP Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 700, marginBottom: '2px', color: 'var(--accent-primary)' }}>
              <span>CPU PERFORMANCE (MP)</span>
              <span>{mp}%</span>
            </div>
            <div className="rpg-bar-container">
              <div 
                className="rpg-bar-fill" 
                style={{ width: `${mp}%`, background: 'linear-gradient(90deg, #06b6d4 0%, #3b82f6 100%)', boxShadow: '0 0 8px rgba(6, 182, 212, 0.4)' }}
              />
            </div>
          </div>

          {/* XP Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', fontWeight: 700, marginBottom: '2px', color: '#a855f7' }}>
              <span>XP DE PROGRESÃO</span>
              <span>{xpPercent}%</span>
            </div>
            <div className="rpg-bar-container" style={{ height: '6px' }}>
              <div 
                className="rpg-bar-fill" 
                style={{ width: `${xpPercent}%`, background: 'linear-gradient(90deg, #c084fc 0%, #a855f7 100%)', boxShadow: '0 0 6px rgba(168, 85, 247, 0.4)' }}
              />
            </div>
          </div>

        </div>

        {/* Separador */}
        <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)' }} />

        {/* Inventário */}
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Award size={12} style={{ color: 'var(--accent-secondary)' }} />
            INVENTÁRIO DE HACKS
          </div>

          <div className="rpg-inventory-grid">
            {inventoryItems.map((item, idx) => {
              const isUnlocked = totalSolved >= item.req;
              return (
                <div 
                  key={idx}
                  className={`rpg-item-slot ${isUnlocked ? 'active' : 'locked'}`}
                  title={isUnlocked ? `${item.name}: ${item.desc}` : `Bloqueado. Requer ${item.req} casos resolvidos.`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isUnlocked ? '#f59e0b' : 'rgba(255,255,255,0.1)'
                  }}
                >
                  {item.icon}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Modal Cyberpunk de Seleção de Avatar */}
      <AnimatePresence>
        {isModalOpen && (
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(5, 7, 10, 0.85)',
              backdropFilter: 'blur(8px)',
              padding: '1rem'
            }}
          >
            {/* Card do Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.25, type: 'spring', damping: 25 }}
              className="glass-morphism"
              style={{
                width: '100%',
                maxWidth: '460px',
                background: 'rgba(14, 17, 23, 0.96)',
                border: '2px solid rgba(168, 85, 247, 0.4)',
                borderRadius: '16px',
                padding: '1.5rem',
                boxShadow: '0 20px 50px rgba(0,0,0,0.9), 0 0 30px rgba(168, 85, 247, 0.15)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
                position: 'relative'
              }}
            >
              {/* Botão de Fechar */}
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.4)',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.2s, background-color 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <X size={16} />
              </button>

              {/* Título do Modal */}
              <div>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'white', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Award size={16} style={{ color: '#a855f7' }} />
                  SELECIONE SEU AVATAR DE INVESTIGADOR
                </h3>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Escolha o retrato que representa sua identidade na rede cyberpunk.
                </p>
              </div>

              {/* Grid de Opções de Avatares */}
              <div 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(3, 1fr)', 
                  gap: '0.85rem' 
                }}
              >
                {avatars.map((avatar) => {
                  const isSelected = avatar.id === selectedAvatarId;
                  return (
                    <div 
                      key={avatar.id}
                      onClick={() => {
                        setSelectedAvatarId(avatar.id);
                        localStorage.setItem('sqlgame_hacker_avatar', avatar.id);
                        setIsModalOpen(false);
                      }}
                      style={{
                        background: isSelected ? 'rgba(168, 85, 247, 0.08)' : 'rgba(0,0,0,0.25)',
                        border: isSelected 
                          ? `2px solid ${avatar.color}` 
                          : '2px solid rgba(255,255,255,0.04)',
                        borderRadius: '12px',
                        padding: '0.65rem 0.5rem',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.45rem',
                        position: 'relative'
                      }}
                      className="rpg-avatar-select-card"
                      title={`${avatar.name}: ${avatar.desc}`}
                    >
                      {/* Avatar SVG */}
                      <div style={{ width: '48px', height: '48px' }}>
                        {React.cloneElement(avatar.svg, { strokeColor: avatar.color })}
                      </div>

                      {/* Nome do Arquétipo */}
                      <span 
                        style={{ 
                          fontSize: '0.6rem', 
                          fontWeight: 700, 
                          color: isSelected ? 'white' : 'var(--text-muted)',
                          textAlign: 'center',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          width: '100%'
                        }}
                      >
                        {avatar.name.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
