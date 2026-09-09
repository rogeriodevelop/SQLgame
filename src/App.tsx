import { useState, useEffect } from 'react';
import { Target, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';

// Componentes
import { Header } from './components/Header';
import { SkillTreeMap } from './components/SkillTreeMap';
import { BriefingCard } from './components/BriefingCard';
import { SmartTerminal } from './components/SmartTerminal';
import { ResultsTable } from './components/ResultsTable';
import { ERDiagram } from './components/ERDiagram';
import { SchemaViewer } from './components/SchemaViewer';
import { RpgCharacterSheet } from './components/RpgCharacterSheet';

// Hooks
import { useAppData } from './hooks/useAppData';
import { useSqlDatabase } from './hooks/useSqlDatabase';

// Tipos
import type { QueryResult } from './types';

// Normaliza texto para comparação tolerante (caixa, acentos, espaços)
const normalize = (s: string) =>
  s.trim()
   .toLowerCase()
   .normalize('NFD')
   .replace(/[\u0300-\u036f]/g, '')
   .replace(/\s+/g, ' ');

// Feedback tátil de erro no campo de acusação
const shakeAnswerInput = () => {
  const input = document.getElementById('answer-input');
  if (!input) return;
  input.classList.add('shake');
  setTimeout(() => input.classList.remove('shake'), 450);
};

// Utilitário de Efeitos Sonoros Retro (Web Audio API)
const playRetroSound = (type: 'success' | 'error' | 'click') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } else if (type === 'success') {
      osc.type = 'triangle';
      // Arpejo de C Maior feliz de RPG (Level Up feel)
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
      osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.24); // C6
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } else if (type === 'error') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(70, ctx.currentTime + 0.22);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    }
  } catch (e) {
    // Silencia erros se áudio for bloqueado pelo navegador
  }
};

export default function App() {
  const {
    currentCaseIndex,
    setCurrentCaseIndex,
    currentCase,
    solvedCases,
    markCurrentCaseSolved,
    resetAllProgress,
    totalSolved,
    progressPercentage,
    detectiveRank,
    casesCount,
  } = useAppData();

  const { runQuery, dbError, loading } = useSqlDatabase(currentCase.schema);

  const [result, setResult] = useState<QueryResult | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [solved, setSolved] = useState(false);
  const [answerInput, setAnswerInput] = useState('');
  const [answerError, setAnswerError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [isMapOpen, setIsMapOpen] = useState(false);
  // Prova de investigação: o jogador já rodou uma query que retornou a solução?
  const [provedBySql, setProvedBySql] = useState(false);

  useEffect(() => {
    const isAlreadySolved = solvedCases.includes(currentCase.id);
    setSolved(isAlreadySolved);
    setResult(null);
    setQueryError(null);
    setShowHint(false);
    setAnswerInput('');
    setAnswerError(null);
    setAttempts(0);
    setProvedBySql(false);
  }, [currentCaseIndex, solvedCases, currentCase.id]);

  const handleExecute = (query: string) => {
    playRetroSound('click');
    const { result: res, error: err } = runQuery(query);
    setResult(res);
    setQueryError(err);

    // Marca a prova quando alguma célula do resultado bate com a solução do caso
    if (res && !provedBySql) {
      const target = normalize(currentCase.solution);
      const hit = res.values.some(row =>
        row.some(cell => cell !== null && normalize(String(cell)) === target)
      );
      if (hit) setProvedBySql(true);
    }
  };

  const handleSolve = () => {
    if (!answerInput.trim()) {
      playRetroSound('error');
      setAnswerError('Campo vazio. Digite o nome do suspeito ou evidência.');
      return;
    }

    // Gate anti-chute: sem uma consulta que tenha retornado o responsável, a acusação
    // não é avaliada. A checagem vem ANTES da comparação de propósito — assim a
    // mensagem é idêntica para palpite certo e errado e não confirma nada ao jogador.
    if (!provedBySql) {
      const next = attempts + 1;
      setAttempts(next);
      playRetroSound('error');
      setAnswerError('Acusação sem provas. Investigue no terminal SQL até que uma consulta revele o responsável.');
      shakeAnswerInput();
      return;
    }

    if (normalize(answerInput) === normalize(currentCase.solution)) {
      setSolved(true);
      setAnswerError(null);
      markCurrentCaseSolved();
      playRetroSound('success');

      confetti({
        particleCount: 160,
        spread: 80,
        origin: { y: 0.65 },
        colors: ['#0ad59e', '#3b82f6', '#f59e0b', '#a855f7'],
      });
    } else {
      const next = attempts + 1;
      setAttempts(next);
      playRetroSound('error');
      setAnswerError(`❌ Resposta incorreta. Tente novamente.${next >= 3 ? ' Precisa de uma dica?' : ''}`);
      shakeAnswerInput();
    }
  };

  if (loading || dbError) {
    return (
      <div 
        style={{ 
          height: '100vh', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          background: 'var(--bg-dark)', 
          color: dbError ? 'var(--error)' : 'var(--accent-primary)', 
          gap: '1rem' 
        }}
      >
        {dbError ? (
          <>
            <AlertTriangle size={36} />
            <p style={{ maxWidth: 450, textAlign: 'center', fontSize: '0.85rem', lineHeight: '1.6', padding: '0 1rem' }}>
              Falha ao carregar o dossiê da Hydra Syndicate:<br />
              <code style={{ background: 'rgba(0,0,0,0.3)', padding: '4px 8px', borderRadius: '4px', marginTop: '0.5rem', display: 'inline-block' }}>{dbError}</code>
            </p>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid rgba(59,130,246,0.1)', borderTopColor: '#0ad59e', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <p style={{ letterSpacing: '1.5px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--easy-color)' }}>CONECTANDO À CENTRAL CYBER-NOIR...</p>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container crt-container crt-flicker" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Cabeçalho */}
      <Header
        detectiveRank={detectiveRank}
        totalSolved={totalSolved}
        casesCount={casesCount}
        progressPercentage={progressPercentage}
        onOpenDrawer={() => {
          playRetroSound('click');
          setIsMapOpen(true);
        }}
        onResetProgress={() => {
          playRetroSound('error');
          resetAllProgress();
        }}
      />

      {/* Grid Principal de Jogo */}
      <main className="grid-layout" style={{ flex: 1, minHeight: 0 }}>
        
        {/* Coluna 1: RpgCharacterSheet, Briefing do Caso & Esquema do Banco */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', overflowY: 'auto', paddingRight: '0.25rem' }}>
          <div style={{ flexShrink: 0 }}>
            <RpgCharacterSheet
              totalSolved={totalSolved}
              casesCount={casesCount}
              attempts={attempts}
            />
          </div>
          <div style={{ flexShrink: 0 }}>
            <BriefingCard
              currentCase={currentCase}
              showHint={showHint}
              onToggleHint={() => {
                playRetroSound('click');
                setShowHint(h => !h);
              }}
            />
          </div>
          <div style={{ flex: 1, minHeight: '220px' }}>
            <SchemaViewer currentCase={currentCase} />
          </div>
        </section>

        {/* Coluna 2: Terminal de Escrita SQL + Resultados */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', minHeight: 0, minWidth: 0, overflow: 'hidden' }}>
          <div style={{ flex: '0 0 290px' }}>
            <SmartTerminal onExecute={handleExecute} queryError={queryError} />
          </div>
          <div style={{ flex: 1, minHeight: '200px', minWidth: 0, overflow: 'hidden' }}>
            <ResultsTable result={result} />
          </div>
        </section>

        {/* Coluna 3: Diagrama ER Relacional + Formulário de Resolução */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', overflow: 'hidden' }}>
          
          {/* Diagrama ER Interativo */}
          <div style={{ flex: 1, minHeight: 0 }}>
            <ERDiagram currentCase={currentCase} />
          </div>

          {/* Envio de Soluções */}
          <AnimatePresence mode="wait">
            {!solved ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="glass-morphism glow-amber"
                style={{ 
                  padding: '1.25rem', 
                  background: 'var(--bg-card)', 
                  border: '1px solid rgba(245, 158, 11, 0.2)', 
                  flexShrink: 0 
                }}
              >
                <h3 style={{ fontSize: '0.72rem', color: 'var(--accent-secondary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, letterSpacing: '1px' }}>
                  <Target size={13} /> CONCLUSÃO DO CASO
                </h3>

                <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', margin: '0 0 0.6rem', lineHeight: 1.45 }}>
                  A central só aceita acusações comprovadas por consulta SQL.
                </p>

                <input
                  id="answer-input"
                  type="text"
                  value={answerInput}
                  onChange={e => { 
                    setAnswerInput(e.target.value); 
                    setAnswerError(null); 
                  }}
                  onKeyDown={e => { 
                    if (e.key === 'Enter') handleSolve(); 
                  }}
                  placeholder="Suspeito, evidência ou culpado..."
                  style={{
                    width: '100%', 
                    padding: '0.65rem 0.9rem',
                    background: 'rgba(0,0,0,0.45)',
                    border: answerError ? '1px solid var(--error)' : '1px solid var(--border-color)',
                    borderRadius: '8px', 
                    color: 'white',
                    marginBottom: '0.75rem', 
                    outline: 'none',
                    fontFamily: "'Outfit', sans-serif", 
                    fontSize: '0.85rem',
                    boxSizing: 'border-box', 
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={e => {
                    if (!answerError) e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.4)';
                  }}
                  onBlur={e => {
                    if (!answerError) e.currentTarget.style.borderColor = 'var(--border-color)';
                  }}
                />

                {/* Feedback Inline */}
                <AnimatePresence>
                  {answerError && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ 
                        background: 'rgba(244,63,94,0.08)', 
                        border: '1px solid rgba(244,63,94,0.2)', 
                        borderRadius: '6px', 
                        padding: '0.5rem 0.75rem', 
                        marginBottom: '0.75rem', 
                        fontSize: '0.75rem', 
                        color: '#fecdd3', 
                        display: 'flex', 
                        gap: '0.4rem', 
                        alignItems: 'center' 
                      }}
                    >
                      <AlertTriangle size={12} style={{ flexShrink: 0, color: 'var(--error)' }} />
                      {answerError}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem', background: 'linear-gradient(135deg, var(--accent-secondary) 0%, #d97706 100%)', boxShadow: '0 4px 14px rgba(245, 158, 11, 0.2)' }}
                  onClick={handleSolve}
                >
                  ENVIAR DOSSIÊ
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="solved"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="glass-morphism"
                style={{ 
                  padding: '1.25rem', 
                  background: 'rgba(10,213,158,0.04)', 
                  border: '1px solid var(--easy-color)', 
                  textAlign: 'center', 
                  flexShrink: 0 
                }}
              >
                <CheckCircle2 size={32} style={{ color: 'var(--easy-color)', margin: '0 auto 0.5rem' }} />
                <h3 style={{ color: 'var(--easy-color)', margin: '0 0 0.25rem', fontSize: '1.1rem', fontWeight: 800 }}>CASO RESOLVIDO!</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: '0 0 1rem' }}>
                  Resposta registrada: <strong style={{ color: 'white' }}>{currentCase.solution}</strong>
                </p>
                {currentCaseIndex < casesCount - 1 && (
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem', background: 'linear-gradient(135deg, var(--easy-color) 0%, #059669 100%)', boxShadow: '0 4px 14px rgba(10, 213, 158, 0.2)' }}
                    onClick={() => {
                      playRetroSound('click');
                      setCurrentCaseIndex(currentCaseIndex + 1);
                    }}
                  >
                    PRÓXIMO CASO <ChevronRight size={14} />
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </aside>
      </main>

      {/* Árvore de Fases Interativa (Mapa Cibernético) */}
      <SkillTreeMap
        isOpen={isMapOpen}
        onClose={() => {
          playRetroSound('click');
          setIsMapOpen(false);
        }}
        currentCaseIndex={currentCaseIndex}
        onSelectCase={(idx) => {
          playRetroSound('click');
          setCurrentCaseIndex(idx);
        }}
        solvedCases={solvedCases}
      />
    </div>
  );
}
