import { useState, useCallback } from 'react';

interface Level {
  id: number;
  gridSize: number;
  positions: { [key: string]: 'start' | 'end' | 'objective' | 'fence' | 'npc' | null };
}

interface UseGameStateReturn {
  gameStarted: boolean;
  currentLevel: Level | null;
  currentLevelIndex: number;
  gameWon: boolean;
  gameLost: boolean;
  loadedLevels: Level[] | null;
  collectedObjectives: Set<string>;
  score: number;
  startGame: (levels: Level[]) => void;
  nextLevel: (allLevels: Level[]) => void;
  endGame: () => void;
  loseGame: () => void;
  setLoadedLevels: (levels: Level[]) => void;
  resetGame: () => void;
  collectObjective: (objectivePos: string) => void;
  loseObjective: (objectivePos: string) => void;
  resetCollectedObjectives: () => void;
  addScore: (points: number) => void;
  resetScore: () => void;
}

export function useGameState(): UseGameStateReturn {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);
  const [loadedLevels, setLoadedLevels] = useState<Level[] | null>(null);
  const [collectedObjectives, setCollectedObjectives] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);

  const startGame = useCallback((levels: Level[]) => {
    if (levels.length > 0) {
      setCurrentLevel(levels[0]);
      setCurrentLevelIndex(0);
      setGameWon(false);
      setGameLost(false);
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

  const loseGame = useCallback(() => {
    setGameLost(true);
    setGameStarted(false);
  }, []);

  const resetGame = useCallback(() => {
    setGameStarted(false);
    setCurrentLevel(null);
    setCurrentLevelIndex(0);
    setGameWon(false);
    setGameLost(false);
    setCollectedObjectives(new Set());
  }, []);

  const collectObjective = useCallback((objectivePos: string) => {
    setCollectedObjectives((prev) => new Set(prev).add(objectivePos));
  }, []);

  const loseObjective = useCallback((objectivePos: string) => {
    setCollectedObjectives((prev) => {
      const updated = new Set(prev);
      updated.delete(objectivePos);
      return updated;
    });
  }, []);

  const resetCollectedObjectives = useCallback(() => {
    setCollectedObjectives(new Set());
  }, []);

  const addScore = useCallback((points: number) => {
    setScore((prev) => prev + points);
  }, []);

  const resetScore = useCallback(() => {
    setScore(0);
  }, []);

  return {
    gameStarted,
    currentLevel,
    currentLevelIndex,
    gameWon,
    gameLost,
    loadedLevels,
    collectedObjectives,
    score,
    startGame,
    nextLevel,
    endGame,
    loseGame,
    setLoadedLevels,
    resetGame,
    collectObjective,
    loseObjective,
    resetCollectedObjectives,
    addScore,
    resetScore,
  };
}
