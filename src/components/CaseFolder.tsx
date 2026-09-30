import { Mail, MailOpen, ChevronsDownUp, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Case } from '../domain/case';
import { DIFFICULTY_COLOR_VARS, DIFFICULTY_LABELS } from '../domain/case';
import { HINT_PENALTY } from '../domain/scoring';
import { useTypewriter } from '../hooks/useTypewriter';

type Props = {
  currentCase: Case;
  caseNumber: number;
  alreadySolved: boolean;
  showHint: boolean;
  usedHint: boolean;
  onToggleHint: () => void;
};

/** Quem assina os memorandos da delegacia. */
export const CHIEF_NAME = 'Del. Helena Duarte';

/**
 * A pasta do caso: título, carimbo de dificuldade, memorando da delegada
 * datilografado, objetivo grifado e a dica num envelope lacrado.
 */
export function CaseFolder({ currentCase, caseNumber, alreadySolved, showHint, usedHint, onToggleHint }: Props) {
  const color = DIFFICULTY_COLOR_VARS[currentCase.difficulty];
  const memo = useTypewriter(currentCase.description);
  const number = String(caseNumber).padStart(3, '0');
  // Recolhida, a pasta mostra só título e objetivo e cede espaço às fichas.
  const [collapsed, setCollapsed] = useState(false);

  return (
    <section className="folder" aria-label="Pasta do caso" style={{ flexShrink: 0 }}>
      <div className="folder-tab">CASO Nº {number} · CONFIDENCIAL</div>

      <div style={{ padding: 'var(--sp-4)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
        <header>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--sp-2)' }}>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--ink)' }}>{currentCase.title}</h2>
            <button
              type="button"
              className="icon-btn"
              onClick={() => setCollapsed(c => !c)}
              aria-expanded={!collapsed}
              aria-label={collapsed ? 'Abrir a pasta inteira' : 'Recolher a pasta'}
              title={collapsed ? 'Abrir memorando e pista' : 'Recolher: mostrar só o objetivo'}
              style={{ flexShrink: 0 }}
            >
              {collapsed ? <ChevronsUpDown size={15} aria-hidden /> : <ChevronsDownUp size={15} aria-hidden />}
            </button>
          </div>
          <div style={{ display: 'flex', gap: 'var(--sp-3)', marginTop: 'var(--sp-2)', paddingLeft: '4px', flexWrap: 'wrap' }}>
            <span className="stamp" style={{ color, fontSize: '12px', transform: 'rotate(-3deg)' }}>
              {DIFFICULTY_LABELS[currentCase.difficulty]}
            </span>
            {alreadySolved && (
              <span className="stamp" style={{ fontSize: '12px', color: 'var(--green-ink)', transform: 'rotate(2deg)' }}>
                Arquivado
              </span>
            )}
          </div>
        </header>

        {/* Memorando datilografado. O texto completo fica disponível para
            leitores de tela desde o início; a animação é só visual. */}
        {!collapsed && (
        <div
          className="paper"
          style={{ padding: 'var(--sp-3) var(--sp-4)', transform: 'rotate(-0.4deg)', cursor: memo.done ? 'default' : 'pointer' }}
          onClick={memo.skip}
          title={memo.done ? undefined : 'Clique para ler tudo'}
        >
          <div className="type-label" style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--sp-2)', marginBottom: 'var(--sp-2)', borderBottom: '1px solid var(--paper-edge)', paddingBottom: '4px' }}>
            <span>Memorando</span>
            <span>De: {CHIEF_NAME}</span>
          </div>
          <p className="sr-only">{currentCase.description}</p>
          <p
            aria-hidden
            style={{ fontFamily: 'var(--font-type)', fontSize: 'var(--fs-md)', lineHeight: 1.6, minHeight: '4.8em', color: 'var(--ink)' }}
          >
            {memo.visible}
            {!memo.done && <span className="type-caret" />}
          </p>
          {!memo.done && (
            <button type="button" className="btn btn-ink" onClick={memo.skip} style={{ marginTop: 'var(--sp-2)', padding: '2px 10px', fontSize: 'var(--fs-xs)' }}>
              Ler tudo
            </button>
          )}
        </div>
        )}

        <div>
          <div className="type-label" style={{ marginBottom: '4px' }}>Objetivo</div>
          <p style={{ fontWeight: 600, fontSize: 'var(--fs-md)', lineHeight: 1.55 }}>
            <span className="highlighter">{currentCase.objective}</span>
          </p>
        </div>

        {!collapsed && currentCase.hint && (
          <div>
            <button
              type="button"
              onClick={onToggleHint}
              aria-expanded={showHint}
              className="btn btn-ink"
              style={{ width: '100%', justifyContent: 'space-between', background: 'rgba(255,255,255,0.25)' }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                {showHint ? <MailOpen size={15} aria-hidden /> : <Mail size={15} aria-hidden />}
                {showHint ? 'Guardar o envelope' : 'Abrir envelope com a pista'}
              </span>
              {/* O custo é anunciado antes de abrir, e some depois de já cobrado. */}
              {!usedHint && (
                <span style={{ color: 'var(--red)', fontFamily: 'var(--font-type)' }}>−{HINT_PENALTY} pts</span>
              )}
            </button>

            <AnimatePresence>
              {showHint && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: 'hidden' }}
                >
                  <p
                    className="paper"
                    style={{
                      marginTop: 'var(--sp-2)',
                      padding: 'var(--sp-3)',
                      fontFamily: 'var(--font-type)',
                      fontSize: 'var(--fs-sm)',
                      lineHeight: 1.6,
                      transform: 'rotate(0.6deg)',
                    }}
                  >
                    {currentCase.hint}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
}
