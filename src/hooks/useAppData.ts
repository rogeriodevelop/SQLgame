import { useState, useEffect, useMemo } from 'react';
import { cases } from '../data/cases';

export type DetectiveRank = {
  title: string;
  badge: string;
};

export const useAppData = () => {
  // Inicialização do índice do caso
  const [currentCaseIndex, setCurrentCaseIndex] = useState<number>(() => {
    const saved = localStorage.getItem('sqlgame_current_index');
    if (saved !== null) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed >= 0 && parsed < cases.length) {
        return parsed;
      }
    }
    return 0;
  });

  // Inicialização dos casos resolvidos (armazenados por ID string)
  const [solvedCases, setSolvedCases] = useState<string[]>(() => {
    const saved = localStorage.getItem('sqlgame_solved_cases');
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(item => typeof item === 'string');
        }
      } catch (e) {
        console.error('Erro ao ler casos resolvidos do localStorage:', e);
      }
    }
    return [];
  });

  // Persiste o caso atual quando muda
  useEffect(() => {
    localStorage.setItem('sqlgame_current_index', currentCaseIndex.toString());
  }, [currentCaseIndex]);

  // Persiste a lista de resolvidos quando muda
  useEffect(() => {
    localStorage.setItem('sqlgame_solved_cases', JSON.stringify(solvedCases));
  }, [solvedCases]);

  const currentCase = useMemo(() => cases[currentCaseIndex], [currentCaseIndex]);

  // Registra que o caso atual foi resolvido
  const markCurrentCaseSolved = () => {
    if (!solvedCases.includes(currentCase.id)) {
      setSolvedCases(prev => [...prev, currentCase.id]);
    }
  };

  // Reseta todo o progresso do jogador
  const resetAllProgress = () => {
    if (window.confirm('Tem certeza que deseja apagar todo o seu progresso de detetive?')) {
      setSolvedCases([]);
      setCurrentCaseIndex(0);
      localStorage.removeItem('sqlgame_solved_cases');
      localStorage.removeItem('sqlgame_current_index');
    }
  };

  // Estatísticas de progresso
  const totalSolved = solvedCases.length;
  const progressPercentage = Math.round((totalSolved / cases.length) * 100);

  // Patentes baseadas no total de casos resolvidos
  const detectiveRank = useMemo((): DetectiveRank => {
    if (totalSolved >= 51) {
      return { title: 'Lenda da Hydra Syndicate', badge: '👑' };
    } else if (totalSolved >= 31) {
      return { title: 'Detetive Chefe de Dados', badge: '🔍' };
    } else if (totalSolved >= 11) {
      return { title: 'Agente de SQL', badge: '🕵️‍♂️' };
    } else {
      return { title: 'Cadete de Dados', badge: '🔰' };
    }
  }, [totalSolved]);

  return {
    currentCaseIndex,
    setCurrentCaseIndex,
    currentCase,
    solvedCases,
    setSolvedCases,
    markCurrentCaseSolved,
    resetAllProgress,
    totalSolved,
    progressPercentage,
    detectiveRank,
    casesCount: cases.length,
  };
};
