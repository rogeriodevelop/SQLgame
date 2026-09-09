import { useCallback, useState } from 'react';

import { Header } from './components/Header';
import { SkillTreeMap } from './components/SkillTreeMap';
import { TitleScreen } from './components/TitleScreen';
import { CaseWorkspace } from './components/CaseWorkspace';

import { useProgress } from './hooks/useProgress';
import { caseAt, caseCount } from './data/caseRepository';
import { browserStore, STORAGE_KEYS } from './data/storage';
import { playSound } from './utils/sound';

/**
 * Casca da aplicação: decide qual tela mostrar e liga a progressão ao
 * tabuleiro. Nenhuma regra de jogo mora aqui — elas estão em `domain/`.
 */
export default function App() {
  const progress = useProgress();
  const [showTitleScreen, setShowTitleScreen] = useState(
    () => !browserStore.read<boolean>(STORAGE_KEYS.onboardingSeen, false)
  );
  const [isMapOpen, setIsMapOpen] = useState(false);

  // O índice salvo pode vir de uma versão com outra quantidade de casos;
  // cair no primeiro é melhor que renderizar undefined.
  const currentCase = caseAt(progress.currentCaseIndex) ?? caseAt(0)!;

  const dismissTitleScreen = useCallback(
    (fromBeginning: boolean) => {
      browserStore.write(STORAGE_KEYS.onboardingSeen, true);
      if (fromBeginning) progress.setCurrentCaseIndex(0);
      setShowTitleScreen(false);
      playSound('click');
    },
    [progress]
  );

  const goToCase = useCallback(
    (index: number) => {
      playSound('click');
      progress.setCurrentCaseIndex(index);
    },
    [progress]
  );

  if (showTitleScreen) {
    return (
      <TitleScreen
        hasProgress={progress.totalSolved > 0}
        onStart={() => dismissTitleScreen(true)}
        onContinue={() => dismissTitleScreen(false)}
      />
    );
  }

  return (
    <div
      className="container crt-container crt-flicker"
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
    >
      <Header
        rank={progress.rank}
        upcomingRank={progress.upcomingRank}
        totalScore={progress.totalScore}
        totalSolved={progress.totalSolved}
        casesCount={progress.casesCount}
        progressPercentage={progress.progressPercentage}
        onOpenMap={() => {
          playSound('click');
          setIsMapOpen(true);
        }}
        onResetProgress={() => {
          if (!window.confirm('Apagar todo o seu progresso de detetive?')) return;
          playSound('error');
          progress.resetAllProgress();
        }}
      />

      {/* A key remonta o tabuleiro a cada troca de caso: banco, consulta,
          tentativas e cronômetro nascem zerados sem efeito de sincronização. */}
      <CaseWorkspace
        key={currentCase.id}
        currentCase={currentCase}
        caseNumber={progress.currentCaseIndex + 1}
        alreadySolved={progress.hasSolved(currentCase.id)}
        hasNextCase={progress.currentCaseIndex < caseCount() - 1}
        onNextCase={() => goToCase(progress.currentCaseIndex + 1)}
        onSolved={progress.recordSolved}
        totalScore={progress.totalScore}
        totalSolved={progress.totalSolved}
        casesCount={progress.casesCount}
        rank={progress.rank}
        upcomingRank={progress.upcomingRank}
      />

      <SkillTreeMap
        isOpen={isMapOpen}
        onClose={() => {
          playSound('click');
          setIsMapOpen(false);
        }}
        currentCaseIndex={progress.currentCaseIndex}
        onSelectCase={goToCase}
        solvedIds={progress.solvedIds}
        starsForCase={progress.starsForCase}
      />
    </div>
  );
}
