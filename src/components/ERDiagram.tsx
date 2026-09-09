import React, { useState, useRef, useEffect } from 'react';
import { parseSchema } from '../domain/schemaModel';
import { Database, Link2, GitCommit, Info, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Case } from '../domain/case';

interface ERDiagramProps {
  currentCase: Case;
}

interface HoveredNode {
  tableName: string;
  colName: string;
}

export const ERDiagram: React.FC<ERDiagramProps> = ({ currentCase }) => {
  const [hoveredNode, setHoveredNode] = useState<HoveredNode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number } | null>(null);

  // Modelo de tabelas/colunas vem do parser compartilhado (domain/schemaModel).
  const tables = React.useMemo(() => parseSchema(currentCase.schema), [currentCase.schema]);

  // Interface para conexões de relacionamento inteligentes
  interface SmartConnection {
    tableA: string;
    colA: string;
    tableB: string;
    colB: string;
  }

  // Mapeia inteligentemente relacionamentos baseados em chaves primárias e estrangeiras
  const smartConnections = React.useMemo(() => {
    const list: SmartConnection[] = [];
    
    const isForeignKeyOf = (colName: string, tableName: string) => {
      const colLower = colName.toLowerCase();
      const tabLower = tableName.toLowerCase();
      
      // ex: ala_id ou alas_id na tabela funcionarios aponta para a tabela alas
      if (colLower.endsWith('_id')) {
        const prefix = colLower.substring(0, colLower.length - 3); // remove o '_id'
        
        // Regras de pluralização/singularização em Português
        const tabSingularPT = tabLower.replace(/ns$/, 'm');  // garcons -> garcom
        const prefixPluralPT = prefix.replace(/m$/, 'ns');   // garcom -> garcons
        const tabSingularRegular = tabLower.replace(/s$/, ''); // alas -> ala
        
        if (
          tabLower.startsWith(prefix) || 
          prefix.startsWith(tabLower) || 
          tabSingularRegular === prefix ||
          tabSingularPT === prefix ||
          prefixPluralPT === tabLower ||
          (prefix.length >= 3 && tabLower.startsWith(prefix.substring(0, 3))) // ex: func_id -> funcionarios (func)
        ) {
          return true;
        }
      }
      return false;
    };

    // Compara cada par de tabelas e mapeia relações
    for (let i = 0; i < tables.length; i++) {
      for (let j = i + 1; j < tables.length; j++) {
        const tabX = tables[i];
        const tabY = tables[j];
        
        tabX.columns.forEach(colX => {
          tabY.columns.forEach(colY => {
            // Regra 1: Nomes de coluna idênticos que terminam com _id (ex: cliente_id em ambas)
            if (colX.name === colY.name && colX.name.toLowerCase().endsWith('_id')) {
              list.push({
                tableA: tabX.name,
                colA: colX.name,
                tableB: tabY.name,
                colB: colY.name
              });
            }
            // Regra 2: colX é 'id' na tabX e colY é chave estrangeira para tabX na tabY (ex: alas.id -> funcionarios.ala_id)
            else if (colX.name.toLowerCase() === 'id' && isForeignKeyOf(colY.name, tabX.name)) {
              list.push({
                tableA: tabX.name,
                colA: colX.name,
                tableB: tabY.name,
                colB: colY.name
              });
            }
            // Regra 3: colY é 'id' na tabY e colX é chave estrangeira para tabY na tabX (ex: funcionarios.ala_id -> alas.id)
            else if (colY.name.toLowerCase() === 'id' && isForeignKeyOf(colX.name, tabY.name)) {
              list.push({
                tableA: tabX.name,
                colA: colX.name,
                tableB: tabY.name,
                colB: colY.name
              });
            }
          });
        });
      }
    }
    return list;
  }, [tables]);

  // Retorna conexões ativas para a coluna sob o mouse
  const getActiveConnections = () => {
    if (!hoveredNode) return [];
    return smartConnections.filter(c => 
      (c.tableA === hoveredNode.tableName && c.colA === hoveredNode.colName) ||
      (c.tableB === hoveredNode.tableName && c.colB === hoveredNode.colName)
    );
  };

  const activeConnections = getActiveConnections();
  const hasConnections = activeConnections.length > 0;

  // Lista de tabelas conectadas para destaque no painel
  const getConnectedTables = () => {
    if (!hoveredNode) return [];
    const connected: string[] = [];
    activeConnections.forEach(c => {
      if (c.tableA !== hoveredNode.tableName) connected.push(c.tableA);
      if (c.tableB !== hoveredNode.tableName) connected.push(c.tableB);
    });
    return Array.from(new Set(connected));
  };

  const connectedTables = getConnectedTables();

  // Efeito de escuta de redimensionamento e scroll para ajustar posicionamento fixed
  useEffect(() => {
    const updatePosition = () => {
      if (hoveredNode && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const popoverWidth = 320;
        const gap = 15;
        
        // Posiciona à esquerda por padrão
        let computedLeft = rect.left - popoverWidth - gap;
        
        // Se bater no lado esquerdo da viewport, tenta colocar à direita
        if (computedLeft < 10) {
          computedLeft = rect.right + gap;
        }
        
        // Se bater no lado direito da viewport, centraliza
        if (computedLeft + popoverWidth > window.innerWidth) {
          computedLeft = (window.innerWidth - popoverWidth) / 2;
        }

        setPopoverPos({
          top: rect.top + 20,
          left: computedLeft
        });
      }
    };

    updatePosition();

    if (hoveredNode) {
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
    }

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [hoveredNode]);

  return (
    <div 
      ref={containerRef}
      className="glass-morphism" 
      style={{ 
        padding: '1.25rem', 
        flex: 1, 
        overflow: 'visible', // Permite que o popover flutue sem ser cortado pelos limites internos do ERDiagram
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: 0,
        background: 'rgba(14, 17, 23, 0.7)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        position: 'relative'
      }}
    >
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          color: 'var(--accent-primary)', 
          fontSize: '0.72rem', 
          fontWeight: 700, 
          letterSpacing: '1px', 
          marginBottom: '0.75rem',
          flexShrink: 0 
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Database size={13} />
          DIAGRAMA ER INTERATIVO
        </div>
        <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
          <Info size={10} style={{ color: 'var(--accent-secondary)' }} /> PARE O MOUSE SOBRE AS CHAVES
        </span>
      </div>

      {/* Grid de Nós de Tabelas */}
      <div 
        style={{ 
          overflow: 'auto', 
          flex: 1, 
          paddingRight: '0.25rem', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '0.85rem' 
        }} 
        className="cyber-grid"
      >
        {tables.map((table, tIdx) => (
          <div 
            key={tIdx} 
            style={{ 
              background: 'rgba(10, 11, 15, 0.85)', 
              borderRadius: '12px', 
              border: hoveredNode && connectedTables.includes(table.name)
                ? '1px solid rgba(59, 130, 246, 0.4)'
                : (hoveredNode && hoveredNode.tableName === table.name
                  ? '1px solid rgba(245, 158, 11, 0.4)'
                  : '1px solid rgba(255,255,255,0.04)'),
              overflow: 'hidden',
              boxShadow: hoveredNode && (connectedTables.includes(table.name) || hoveredNode.tableName === table.name)
                ? `0 0 15px rgba(59,130,246,0.08)`
                : '0 4px 12px rgba(0,0,0,0.2)',
              transition: 'all 0.25s ease'
            }}
          >
            {/* Header da Tabela */}
            <div 
              style={{ 
                background: hoveredNode && hoveredNode.tableName === table.name
                  ? 'rgba(245,158,11,0.08)'
                  : (hoveredNode && connectedTables.includes(table.name)
                    ? 'rgba(59,130,246,0.08)'
                    : 'rgba(59,130,246,0.06)'),
                padding: '0.5rem 0.75rem', 
                borderBottom: '1px solid rgba(255,255,255,0.03)',
                fontSize: '0.76rem',
                fontWeight: 700,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontFamily: "'JetBrains Mono', monospace",
                transition: 'all 0.25s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span 
                  style={{ 
                    width: '6px', 
                    height: '6px', 
                    borderRadius: '50%', 
                    background: hoveredNode && hoveredNode.tableName === table.name ? '#f59e0b' : 'var(--accent-primary)', 
                    boxShadow: hoveredNode && hoveredNode.tableName === table.name ? '0 0 6px #f59e0b' : '0 0 6px var(--accent-primary)' 
                  }} 
                />
                {table.name}
              </div>
              {hoveredNode && connectedTables.includes(table.name) && (
                <span style={{ fontSize: '0.58rem', color: 'var(--accent-primary)', background: 'rgba(59,130,246,0.15)', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>
                  CONECTADA
                </span>
              )}
            </div>

            {/* Listagem de Colunas com Hover interativo */}
            <div style={{ display: 'flex', flexDirection: 'column', padding: '0.35rem 0.5rem' }}>
              {table.columns.map((col, cIdx) => {
                const hasRelations = smartConnections.some(c => 
                  (c.tableA === table.name && c.colA === col.name) ||
                  (c.tableB === table.name && c.colB === col.name)
                );
                
                const isDirectlyHovered = hoveredNode !== null && 
                  hoveredNode.tableName === table.name && 
                  hoveredNode.colName === col.name;
                  
                const isConnected = hoveredNode !== null && 
                  (hoveredNode.tableName !== table.name || hoveredNode.colName !== col.name) &&
                  activeConnections.some(c => 
                    (c.tableA === table.name && c.colA === col.name) ||
                    (c.tableB === table.name && c.colB === col.name)
                  );
                  
                const isOtherFocussed = hoveredNode !== null && 
                  !isDirectlyHovered && 
                  !isConnected;

                // Estilo dinâmico baseado no foco de JOIN
                let bgColor = 'transparent';
                let colColor = 'var(--text-main)';
                let borderColor = 'transparent';
                let glowShadow = 'none';
                
                if (hasRelations) {
                  if (isDirectlyHovered) {
                    bgColor = 'rgba(245, 158, 11, 0.15)';
                    colColor = '#f59e0b';
                    borderColor = 'rgba(245, 158, 11, 0.4)';
                    glowShadow = '0 0 8px rgba(245, 158, 11, 0.2)';
                  } else if (isConnected) {
                    bgColor = 'rgba(59, 130, 246, 0.15)';
                    colColor = 'var(--accent-primary)';
                    borderColor = 'rgba(59, 130, 246, 0.4)';
                    glowShadow = '0 0 8px rgba(59, 130, 246, 0.2)';
                  } else if (isOtherFocussed) {
                    colColor = 'rgba(255,255,255,0.15)';
                  } else {
                    colColor = '#f1f5f9';
                  }
                } else if (isOtherFocussed) {
                  colColor = 'rgba(255,255,255,0.15)';
                }

                return (
                  <div
                    key={cIdx}
                    onMouseEnter={() => {
                      if (hasRelations) {
                        setHoveredNode({ tableName: table.name, colName: col.name });
                      }
                    }}
                    onMouseLeave={() => setHoveredNode(null)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.35rem 0.5rem',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      fontFamily: "'JetBrains Mono', monospace",
                      background: bgColor,
                      border: `1px solid ${borderColor}`,
                      boxShadow: glowShadow,
                      cursor: hasRelations ? 'pointer' : 'default',
                      transition: 'all 0.15s ease',
                      marginBottom: '2px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: colColor }}>
                      {hasRelations ? (
                        <Link2 
                          size={11} 
                          style={{ 
                            color: isDirectlyHovered ? '#f59e0b' : 'var(--accent-primary)',
                            opacity: isOtherFocussed ? 0.15 : 1,
                            animation: isConnected ? 'pulse 1.5s infinite' : 'none'
                          }} 
                        />
                      ) : (
                        <GitCommit size={11} style={{ opacity: isOtherFocussed ? 0.15 : 0.4 }} />
                      )}
                      <span style={{ fontWeight: isDirectlyHovered || isConnected ? 700 : 400 }}>
                        {col.name}
                      </span>
                    </div>

                    <span 
                      style={{ 
                        fontSize: '0.62rem', 
                        color: isOtherFocussed ? 'rgba(255,255,255,0.05)' : 'var(--text-muted)'
                      }}
                    >
                      {col.type.toLowerCase()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Popover RPG Holográfico de JOIN - Flutua por cima com posição fixa reativa */}
      <AnimatePresence>
        {hoveredNode && hasConnections && popoverPos && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ duration: 0.2, type: 'spring', damping: 20 }}
            style={{ 
              position: 'fixed',
              top: `${popoverPos.top}px`,
              left: `${popoverPos.left}px`,
              width: '320px',
              padding: '1rem', 
              background: 'rgba(10, 12, 16, 0.98)', 
              border: '2px solid rgba(59, 130, 246, 0.6)', 
              borderRadius: '12px', 
              fontSize: '0.78rem', 
              fontFamily: "'JetBrains Mono', monospace", 
              color: 'white',
              zIndex: 9999, // Fica sobreposto a tudo
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.95), 0 0 30px rgba(59, 130, 246, 0.4)',
              overflow: 'hidden',
              backdropFilter: 'blur(12px)',
              pointerEvents: 'none' // Impede tremor ao passar o mouse por cima acidentalmente
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800, marginBottom: '0.5rem', color: '#f59e0b', fontSize: '0.8rem', letterSpacing: '0.5px' }}>
              <HelpCircle size={14} />
              ⚡ RPG ASSISTENTE DE JOIN:
            </div>
            <div style={{ color: 'var(--text-main)', lineHeight: '1.6', fontSize: '0.74rem' }}>
              <span style={{ color: '#f472b6' }}>FROM</span> {hoveredNode.tableName}<br />
              {activeConnections.map((c, idx) => {
                const isHoveredA = c.tableA === hoveredNode.tableName && c.colA === hoveredNode.colName;
                const sourceTab = isHoveredA ? c.tableA : c.tableB;
                const sourceCol = isHoveredA ? c.colA : c.colB;
                const targetTab = isHoveredA ? c.tableB : c.tableA;
                const targetCol = isHoveredA ? c.colB : c.colA;
                
                return (
                  <React.Fragment key={idx}>
                    <span style={{ color: '#f472b6' }}>JOIN</span> {targetTab} <span style={{ color: '#f472b6' }}>ON</span> <span style={{ color: 'white' }}>{sourceTab}.{sourceCol}</span> = <span style={{ color: 'var(--accent-primary)' }}>{targetTab}.{targetCol}</span>
                    {idx < activeConnections.length - 1 && <br />}
                  </React.Fragment>
                );
              })}
            </div>
            
            {/* Bloco didático explicativo adicional */}
            <div style={{ 
              marginTop: '0.75rem', 
              paddingTop: '0.75rem', 
              borderTop: '1px solid rgba(255,255,255,0.08)', 
              fontSize: '0.66rem', 
              color: 'rgba(255,255,255,0.5)', 
              lineHeight: '1.45' 
            }}>
              💡 <span style={{ color: 'var(--accent-secondary)', fontWeight: 800, letterSpacing: '0.5px' }}>GUIA RÁPIDO DE JOIN:</span><br />
              Use a cláusula <span style={{ color: 'white', fontWeight: 600 }}>JOIN</span> para mesclar dados relacionados. Esta conexão liga a chave primária <span style={{ color: '#f59e0b' }}>{hoveredNode.colName}</span> à chave estrangeira equivalente para reconstruir a associação de dados.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

