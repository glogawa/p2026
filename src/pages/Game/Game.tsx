import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton } from '@ionic/react';
import { useState, useRef } from 'react';
import { useGameState } from '../../hooks/useGameState';
import { useGameEngine } from '../../hooks/useGameEngine';
import { useGameJoystick } from '../../hooks/useGameJoystick';
import { WinScreen } from './components/WinScreen';
import { LevelLoader } from './components/LevelLoader';
import { StartScreen } from './components/StartScreen';
import PageHeader from '../../components/PageHeader';
import './Game.css';

interface Level {
  id: number;
  gridSize: number;
  positions: { [key: string]: 'start' | 'end' | 'objective' | null };
}

const Game: React.FC = () => {
  const [pastedJson, setPastedJson] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const joystickContainerRef = useRef<HTMLDivElement>(null);
  const joystickMovementRef = useRef({ x: 0, z: 0 });

  // Use modular hooks
  const gameState = useGameState();
  const {
    gameStarted,
    currentLevel,
    currentLevelIndex,
    gameWon,
    loadedLevels,
    startGame,
    nextLevel,
    setLoadedLevels,
  } = gameState;

  // Setup joystick
  useGameJoystick({
    isGameActive: gameStarted,
    containerRef: joystickContainerRef,
    onMove: (x, z) => {
      joystickMovementRef.current = { x, z };
    },
  });

  // Setup game engine
  useGameEngine({
    canvasRef,
    currentLevel,
    joystickMovement: joystickMovementRef.current,
    onLevelComplete: () => {
      if (loadedLevels) {
        nextLevel(loadedLevels);
      }
    },
    enabled: gameStarted,
  });

  const loadLevels = () => {
    try {
      const levels: Level[] = JSON.parse(pastedJson);
      setLoadedLevels(levels);
    } catch (e) {
      alert('Invalid JSON. Please paste valid levels JSON.');
    }
  };

  const handleStartGame = () => {
    if (loadedLevels && loadedLevels.length > 0) {
      startGame(loadedLevels);
    }
  };

  const handlePlayAgain = () => {
    if (loadedLevels && loadedLevels.length > 0) {
      startGame(loadedLevels);
    }
  };

  if (gameStarted) {
    return (
      <IonPage>
        <PageHeader title="Game">
          <IonButton onClick={() => gameState.endGame()}>Leave Game</IonButton>
        </PageHeader>
        <IonContent style={{ height: 'calc(100vh - 56px)', padding: 0 }}>
          <div ref={joystickContainerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <PageHeader title="Game" />
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Game</IonTitle>
          </IonToolbar>
        </IonHeader>
        {gameWon && <WinScreen onPlayAgain={handlePlayAgain} />}
        <LevelLoader
          pastedJson={pastedJson}
          onJsonChange={setPastedJson}
          onLoadLevels={loadLevels}
          loadedLevels={loadedLevels}
        />
        {!gameWon && <StartScreen onStartGame={handleStartGame} />}
      </IonContent>
    </IonPage>
  );
};

export default Game;
