import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton } from '@ionic/react';
import { useState, useRef, useEffect } from 'react';
import { useGameState } from './hooks';
import { useGameEngine } from './hooks';
import { useGameJoystick } from './hooks';
import { WinScreen, StartScreen, LevelLoader, FpsCounter } from './ui';
import PageHeader from '../../components/PageHeader';
import { generateRandomLevels } from './utils/generateRandomLevel';
import './Game.css';

interface Level {
  id: number;
  gridSize: number;
  positions: { [key: string]: 'start' | 'end' | 'objective' | 'fence' | 'npc' | null };
}

interface LevelData {
  general: {
    fenceStaggerDurationMs: number;
    fenceBounceDistance: number;
  };
  locations: Level[];
}

const Game: React.FC = () => {
  const [pastedJson, setPastedJson] = useState<string>('');
  const [fenceConfig, setFenceConfig] = useState({ staggerDuration: 500, bounceDistance: 0.2 });
  const [fps, setFps] = useState<number>(0);
  const [showNPCGui, setShowNPCGui] = useState<boolean>(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const joystickContainerRef = useRef<HTMLDivElement>(null);
  const joystickMovementRef = useRef({ x: 0, z: 0 });
  const fpsCounterRef = useRef({ frameCount: 0, lastTime: performance.now() });

  // Use modular hooks
  const gameState = useGameState();
  const {
    gameStarted,
    currentLevel,
    currentLevelIndex,
    gameWon,
    loadedLevels,
    collectedObjectives,
    startGame,
    nextLevel,
    setLoadedLevels,
    collectObjective,
    resetCollectedObjectives,
  } = gameState;

  // Setup FPS counter
  useEffect(() => {
    const fpsInterval = setInterval(() => {
      const now = performance.now();
      const deltaTime = now - fpsCounterRef.current.lastTime;
      if (deltaTime > 0) {
        const calculatedFps = Math.round((fpsCounterRef.current.frameCount * 1000) / deltaTime);
        setFps(calculatedFps);
        fpsCounterRef.current.frameCount = 0;
        fpsCounterRef.current.lastTime = now;
      }
    }, 1000); // Update every second

    return () => {
      clearInterval(fpsInterval);
      // Reset FPS counter when game ends
      if (!gameStarted) {
        setFps(0);
        fpsCounterRef.current.frameCount = 0;
        fpsCounterRef.current.lastTime = performance.now();
      }
    };
  }, [gameStarted]);

  // Increment frame counter on each animation frame
  useEffect(() => {
    if (!gameStarted) return;

    const frameCounter = () => {
      fpsCounterRef.current.frameCount++;
      requestAnimationFrame(frameCounter);
    };

    const animationId = requestAnimationFrame(frameCounter);
    return () => cancelAnimationFrame(animationId);
  }, [gameStarted]);

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
        resetCollectedObjectives();
        nextLevel(loadedLevels);
      }
    },
    onObjectiveCollected: collectObjective,
    collectedObjectives,
    enabled: gameStarted,
    fenceConfig: { staggerDuration: fenceConfig.staggerDuration, bounceDistance: fenceConfig.bounceDistance },
    showNPCGui,
  });

  const loadLevels = () => {
    try {
      const data: LevelData = JSON.parse(pastedJson);
      // Handle both old format (array) and new format (object with general + locations)
      if (Array.isArray(data)) {
        setLoadedLevels(data as Level[]);
      } else if (data.locations && data.general) {
        setFenceConfig({
          staggerDuration: data.general.fenceStaggerDurationMs,
          bounceDistance: data.general.fenceBounceDistance,
        });
        setLoadedLevels(data.locations);
      }
    } catch (e) {
      alert('Invalid JSON. Please paste valid levels JSON.');
    }
  };

  const handleStartGame = () => {
    if (loadedLevels && loadedLevels.length > 0) {
      startGame(loadedLevels);
    } else {
      // Generate random levels if none are loaded
      const randomLevels = generateRandomLevels();
      setLoadedLevels(randomLevels);
      startGame(randomLevels);
    }
  };

  const handlePlayAgain = () => {
    if (loadedLevels && loadedLevels.length > 0) {
      startGame(loadedLevels);
    } else {
      // Generate random levels if none are loaded
      const randomLevels = generateRandomLevels();
      setLoadedLevels(randomLevels);
      startGame(randomLevels);
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
            <FpsCounter fps={fps} />
            <button 
              onClick={() => setShowNPCGui(!showNPCGui)}
              style={{
                position: 'absolute',
                bottom: '20px',
                left: '20px',
                padding: '8px 16px',
                backgroundColor: showNPCGui ? 'rgba(76, 175, 80, 0.8)' : 'rgba(244, 67, 54, 0.8)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 'bold',
                zIndex: 1000,
                transition: 'background-color 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = showNPCGui ? 'rgba(76, 175, 80, 1)' : 'rgba(244, 67, 54, 1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = showNPCGui ? 'rgba(76, 175, 80, 0.8)' : 'rgba(244, 67, 54, 0.8)';
              }}
            >
              {showNPCGui ? 'Hide NPC GUI' : 'Show NPC GUI'}
            </button>
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
