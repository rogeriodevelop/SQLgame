import React from 'react';
import { User, Eye, ShieldAlert } from 'lucide-react';
import type { Case } from '../types';

interface SuspectDossierProps {
  currentCase: Case;
}

// Gerador de número pseudo-aleatório baseado em seed (ID do Caso)
const getSeededRandom = (seed: string) => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return () => {
    let t = h += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const INNOCENT_POOL = [
  { name: 'Lucas Lima', role: 'Engenheiro de Banco de Dados', alibi: 'Estava offline desde as 18:00, mas possui privilégios de ROOT não auditados no servidor.' },
  { name: 'Renata Costa', role: 'Administradora de Sistemas Sênior', alibi: 'Assinatura criptográfica detectada em outra filial no exato momento da intrusão.' },
  { name: 'Marcos Rocha', role: 'Analista de Infraestrutura', alibi: 'Diz que o crachá de acesso foi clonado na véspera do incidente.' },
  { name: 'Amanda Souza', role: 'Desenvolvedora de Software', alibi: 'Estava em chamada de suporte remoto documentada com outro cliente.' },
  { name: 'Thiago Silva', role: 'Auditor de Segurança Interno', alibi: 'Afirma que estava realizando testes de intrusão autorizados em outro segmento.' },
  { name: 'Carolina Dias', role: 'Gerente de Contas Cloud', alibi: 'Estava em trânsito no aeroporto, mas seu token MFA foi ativado remotamente.' }
];

export const SuspectDossier: React.FC<SuspectDossierProps> = ({ currentCase }) => {
  const culpritName = currentCase.solution;
  const rand = getSeededRandom(currentCase.id);

  // Seleciona inocentes que não tenham o mesmo nome do culpado
  const innocentCandidates = INNOCENT_POOL.filter(
    i => i.name.toLowerCase() !== culpritName.toLowerCase()
  );

  // Pega 2 inocentes determinísticos baseados na seed do caso
  const idx1 = Math.floor(rand() * innocentCandidates.length);
  let idx2 = Math.floor(rand() * innocentCandidates.length);
  while (idx2 === idx1 && innocentCandidates.length > 1) {
    idx2 = Math.floor(rand() * innocentCandidates.length);
  }

  const innocent1 = innocentCandidates[idx1];
  const innocent2 = innocentCandidates[idx2] || innocentCandidates[(idx1 + 1) % innocentCandidates.length];

  // Cria a lista de suspeitos
  // O culpado não é necessariamente o "Suspeito Principal" e nem tem sempre a maior barra de suspeita!
  const rawSuspects = [
    {
      name: culpritName,
      role: 'Especialista de Segurança da Rede',
      suspicionLevel: Math.floor(rand() * 35) + 40, // 40% a 75%
      alibi: 'Alega que suas chaves SSH privadas foram roubadas em um ataque hacker de phishing direcionado.',
      threat: rand() > 0.5 ? 'CRÍTICO' : 'MÉDIO',
      color: '#f43f5e'
    },
    {
      name: innocent1.name,
      role: innocent1.role,
      suspicionLevel: Math.floor(rand() * 35) + 35, // 35% a 70%
      alibi: innocent1.alibi,
      threat: rand() > 0.5 ? 'MÉDIO' : 'BAIXO',
      color: '#f59e0b'
    },
    {
      name: innocent2.name,
      role: innocent2.role,
      suspicionLevel: Math.floor(rand() * 35) + 30, // 30% a 65%
      alibi: innocent2.alibi,
      threat: rand() > 0.5 ? 'BAIXO' : 'CRÍTICO',
      color: '#10b981'
    }
  ];

  // Embaralha deterministicamente os suspeitos usando a seed
  const shuffledSuspects = [...rawSuspects];
  for (let i = shuffledSuspects.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const temp = shuffledSuspects[i];
    shuffledSuspects[i] = shuffledSuspects[j];
    shuffledSuspects[j] = temp;
  }

  // Atribui cores de ameaça dinâmicas baseadas no nível de ameaça sorteado
  const finalSuspects = shuffledSuspects.map(s => {
    let color = '#10b981'; // Baixo
    if (s.threat === 'CRÍTICO') color = '#f43f5e';
    else if (s.threat === 'MÉDIO') color = '#f59e0b';
    return { ...s, color };
  });

  return (
    <div 
      className="glass-morphism" 
      style={{ 
        padding: '1.25rem', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '0.75rem',
        background: 'rgba(14, 17, 23, 0.75)',
        border: '1px solid rgba(244, 63, 94, 0.15)',
      }}
    >
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          color: 'var(--hard-color)', 
          fontSize: '0.72rem', 
          fontWeight: 700, 
          letterSpacing: '1px',
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldAlert size={14} />
          DOSSIÊ DE SUSPEITOS
        </div>
        <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.2)' }}>BANCO DE DADOS ATIVO</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', maxHeight: '250px', paddingRight: '0.2rem' }}>
        {finalSuspects.map((s, idx) => (
          <div 
            key={idx} 
            style={{ 
              background: 'rgba(0,0,0,0.25)', 
              borderRadius: '10px', 
              padding: '0.75rem', 
              border: `1px solid ${s.name === culpritName ? 'rgba(244, 63, 94, 0.2)' : 'rgba(255,255,255,0.03)'}`,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Indicador sutil de ameaça no topo */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.65rem', color: s.color, fontWeight: 700, letterSpacing: '0.5px' }}>
                RISCO: {s.threat}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'white', fontWeight: 800 }}>
                {s.suspicionLevel}% suspeita
              </span>
            </div>

            {/* Avatar + Nome */}
            <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div 
                style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '6px', 
                  background: `${s.color}15`, 
                  border: `1px solid ${s.color}50`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: s.color,
                  flexShrink: 0
                }}
              >
                <User size={16} />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <h4 style={{ fontSize: '0.8rem', color: 'white', margin: 0, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {s.name}
                </h4>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', margin: 0 }}>
                  {s.role}
                </p>
              </div>
            </div>

            {/* Álibi / Pistas */}
            <div style={{ background: 'rgba(0,0,0,0.15)', padding: '0.45rem', borderRadius: '6px', fontSize: '0.68rem', lineHeight: '1.4', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'white', fontWeight: 600, marginBottom: '2px' }}>
                <Eye size={10} style={{ color: s.color }} /> Álibi Auditado:
              </div>
              {s.alibi}
            </div>

            {/* Barra de suspeição */}
            <div style={{ height: '3px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', marginTop: '0.5rem', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${s.suspicionLevel}%`, background: s.color, borderRadius: '99px' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

