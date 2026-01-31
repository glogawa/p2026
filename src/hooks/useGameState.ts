import { useState, useCallback } from 'react';

interface Level {
  id: number;
  gridSize: number;
  positions: { [key: string]: 'start' | 'end' | 'objective' | null };
}

interface UseGameStateReturn {
  gameStarted: boolean;
  currentLevel: Level | null;
  currentLevelIndex: number;
  gameWon: boolean;
  loadedLevels: Level[] | null;
  startGame: (levels: Level[]) => void;
  nextLevel: (allLevels: Level[]) => void;
  endGame: () => void;
  setLoadedLevels: (levels: Level[]) => void;
  resetGame: () => void;
}

export function useGameState(): UseGameStateReturn {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [loadedLevels, setLoadedLevels] = useState<Level[] | null>(null);

  const startGame = useCallback((levels: Level[]) => {
    if (levels.length > 0) {
      setCurrentLevel(levels[0]);
      setCurrentLevelIndex(0);
      setGameWon(false);
      setGameStarted(true);
    }
  }, []);

  const nextLevel = useCallback((allLevels: Level[]) => {
    if (currentLevelIndex + 1 < allLevels.length) {
      setCurrentLevelIndex(currentLevelIndex + 1);
      setCurrentLevel(allLevels[currentLevelIndex + 1]);
    } else {
      setGameWon(true);
      setGameStarted(false);
    }
  }, [currentLevelIndex]);

  const endGame = useCallback(() => {
    setGameStarted(false);
  }, []);

  const resetGame = useCallback(() => {
    setGameStarted(false);
    setCurrentLevel(null);
    setCurrentLevelIndex(0);
    setGameWon(false);
  }, []);

  return {
    gameStarted,
    currentLevel,
    currentLevelIndex,
    gameWon,
    loadedLevels,
    startGame,
    nextLevel,
    endGame,
    setLoadedLevels,
    resetGame,
  };
}
