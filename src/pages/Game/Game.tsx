import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonCard, IonCardContent, IonIcon } from '@ionic/react';
import { useState, useRef, useEffect } from 'react';
import { arrowBack } from 'ionicons/icons';
import { useGameState } from './hooks';
import { useGameEngine } from './hooks';
import { useGameJoystick } from './hooks';
import { WinScreen, StartScreen, LevelLoader, FpsCounter, LoseScreen } from './ui';
import { LoadCustomGameModal, GameModeScreen } from './components';
import PageHeader from '../../components/PageHeader';
import { generateRandomLevels } from './utils/generateRandomLevel';
import { storyModeData } from './data/storyMode';
import gamebg from '/gamebg.jpeg';
import './Game.css';

interface Level {
  id: number;
  gridSize: number;
  positions: { [key: string]: 'start' | 'end' | 'objective' | 'fence' | 'npc' | null };
}

interface PlayerStats {
  stamina: number;
  agility: number;
}

interface NPCStats {
  stamina: number;
  staminaVariance: number;
  agility: { min: number; max: number };
}

interface LevelData {
  general: {
    fenceStaggerDurationMs: number;
    fenceBounceDistance: number;
    playerStats?: PlayerStats;
    npcStats?: NPCStats;
  };
  locations: Level[];
}

const Game: React.FC = () => {
  const [pastedJson, setPastedJson] = useState<string>('');
  const [fenceConfig, setFenceConfig] = useState({ staggerDuration: 500, bounceDistance: 0.2 });
  const [playerStats, setPlayerStats] = useState<PlayerStats | undefined>(undefined);
  const [npcStats, setNPCStats] = useState<NPCStats | undefined>(undefined);
  const [fps, setFps] = useState<number>(0);
  const [showNPCGui, setShowNPCGui] = useState<boolean>(true);
  const [showLoadModal, setShowLoadModal] = useState<boolean>(false);
  const [gameMode, setGameMode] = useState<'selection' | 'story' | 'custom' | 'sandbox'>('selection');
  const [alertPhase, setAlertPhase] = useState<'high' | 'low'>('low');
  const [alertTimer, setAlertTimer] = useState<number>(10);
  const [maskActive, setMaskActive] = useState<boolean>(false);
  const [maskDestroying, setMaskDestroying] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const joystickContainerRef = useRef<HTMLDivElement>(null);
  const joystickMovementRef = useRef({ x: 0, z: 0 });
  const fpsCounterRef = useRef({ frameCount: 0, lastTime: performance.now() });
  const alertStateRef = useRef({ phase: 'low' as 'high' | 'low', timer: 10 });

  // Use modular hooks
  const gameState = useGameState();
  const {
    gameStarted,
    currentLevel,
    currentLevelIndex,
    gameWon,
    gameLost,
    loadedLevels,
    collectedObjectives,
    startGame,
    nextLevel,
    setLoadedLevels,
    collectObjective,
    loseObjective,
    resetCollectedObjectives,
    loseGame,
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

  // Alert phase cycling system
  useEffect(() => {
    if (!gameStarted) return;

    const alertInterval = setInterval(() => {
      alertStateRef.current.timer -= 1;
      
      if (alertStateRef.current.timer <= 0) {
        // Check high alert end condition
        if (alertStateRef.current.phase === 'high') {
          // High alert time is up
          if (!maskActive) {
            // No mask - game over
            loseGame();
            return;
          } else {
            // Has mask - destroy it and continue
            setMaskDestroying(true);
            // After animation completes (1s), deactivate mask and reset destroying state
            setTimeout(() => {
              setMaskActive(false);
              setMaskDestroying(false);
            }, 1000);
          }
        }
        
        // Switch phase
        if (alertStateRef.current.phase === 'low') {
          alertStateRef.current.phase = 'high';
          // High alert: 2 to 4 seconds
          alertStateRef.current.timer = Math.floor(Math.random() * 3) + 2;
        } else {
          alertStateRef.current.phase = 'low';
          // Low alert: ~20 seconds
          alertStateRef.current.timer = 20;
        }
      }
      
      // Update state with current values from ref
      setAlertPhase(alertStateRef.current.phase);
      setAlertTimer(alertStateRef.current.timer);
    }, 1000); // Update every second

    return () => clearInterval(alertInterval);
  }, [gameStarted, maskActive, loseGame]);

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
    onObjectiveLost: loseObjective,
    onGameLost: loseGame,
    onNPCCollision: (isThief) => {
      // When player collides with non-thief NPC during low alert, activate mask
      if (!isThief && alertPhase === 'low') {
        setMaskActive(true);
      }
    },
    collectedObjectives,
    enabled: gameStarted,
    fenceConfig: { staggerDuration: fenceConfig.staggerDuration, bounceDistance: fenceConfig.bounceDistance },
    showNPCGui,
    npcStats,
    playerStats,
    alertPhase,
  });

  const totalObjectives = currentLevel ? Object.values(currentLevel.positions).filter(pos => pos === 'objective').length : 0;

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
        if (data.general.playerStats) {
          setPlayerStats(data.general.playerStats);
        }
        if (data.general.npcStats) {
          setNPCStats(data.general.npcStats);
        }
        setLoadedLevels(data.locations);
      }
    } catch (e) {
      alert('Invalid JSON. Please paste valid levels JSON.');
    }
  };

  const handleStartGame = () => {
    if (gameMode === 'story') {
      setFenceConfig({
        staggerDuration: storyModeData.general.fenceStaggerDurationMs,
        bounceDistance: storyModeData.general.fenceBounceDistance,
      });
      setPlayerStats(storyModeData.general.playerStats);
      setNPCStats(storyModeData.general.npcStats);
      setLoadedLevels(storyModeData.locations as unknown as Level[]);
      startGame(storyModeData.locations as unknown as Level[]);
    } else if (gameMode === 'custom' && loadedLevels && loadedLevels.length > 0) {
      startGame(loadedLevels);
    } else if (gameMode === 'sandbox') {
      const randomData = generateRandomLevels();
      setFenceConfig({
        staggerDuration: randomData.general.fenceStaggerDurationMs,
        bounceDistance: randomData.general.fenceBounceDistance,
      });
      setPlayerStats(randomData.general.playerStats);
      setNPCStats(randomData.general.npcStats);
      setLoadedLevels(randomData.locations);
      startGame(randomData.locations);
    }
  };

  const handlePlayAgain = () => {
    if (gameMode === 'story') {
      setFenceConfig({
        staggerDuration: storyModeData.general.fenceStaggerDurationMs,
        bounceDistance: storyModeData.general.fenceBounceDistance,
      });
      setPlayerStats(storyModeData.general.playerStats);
      setNPCStats(storyModeData.general.npcStats);
      setLoadedLevels(storyModeData.locations as unknown as Level[]);
      startGame(storyModeData.locations as unknown as Level[]);
    } else if (gameMode === 'custom' && loadedLevels && loadedLevels.length > 0) {
      startGame(loadedLevels);
    } else if (gameMode === 'sandbox') {
      const randomData = generateRandomLevels();
      setFenceConfig({
        staggerDuration: randomData.general.fenceStaggerDurationMs,
        bounceDistance: randomData.general.fenceBounceDistance,
      });
      setPlayerStats(randomData.general.playerStats);
      setNPCStats(randomData.general.npcStats);
      setLoadedLevels(randomData.locations);
      startGame(randomData.locations);
    }
  };

  if (gameStarted) {
    return (
      <IonPage>
        <PageHeader title="Game">
          <IonButton onClick={() => gameState.endGame()}>Leave Game</IonButton>
        </PageHeader>
        <IonContent style={{ height: 'calc(100vh - 56px)', padding: 0, display: 'block' }}>
          <div ref={joystickContainerRef} style={{ width: '100%', height: '100%', position: 'relative', display: 'block' }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
            {/* <FpsCounter fps={fps} /> */}
            <div style={{
              position: 'absolute',
              top: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '10px',
              padding: '10px 20px',
              color: 'white',
              fontSize: '20px',
              fontWeight: 'bold',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              gap: '20px'
            }}>
              {/* Mask */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                border: maskActive ? '2px solid #9C27B0' : '2px solid rgba(156, 39, 176, 0.3)',
                boxShadow: maskActive
                  ? '0 0 15px rgba(156, 39, 176, 0.8), inset 0 0 10px rgba(156, 39, 176, 0.3)'
                  : '0 0 5px rgba(156, 39, 176, 0.2)',
                opacity: maskActive ? 1 : 0.5,
                transition: 'all 0.3s ease'
              }}>
                <img 
                  src="/assets/mask.png" 
                  alt="Mask"
                  style={{
                    width: '90%',
                    height: '90%',
                    objectFit: 'contain',
                    filter: maskActive 
                      ? 'drop-shadow(0 0 8px #9C27B0) brightness(1.2)' 
                      : 'brightness(0.6)',
                    animation: maskDestroying
                      ? 'maskDestroy 1s ease-in-out forwards'
                      : (maskActive ? 'maskGlow 1.5s ease-in-out infinite' : 'none')
                  }}
                />
              </div>

              {/* Objective Counter */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: '#2196F3',
                  borderRadius: '50%',
                  display: 'inline-block',
                  boxShadow: '0 0 8px #2196F3, 0 0 16px rgba(33, 150, 243, 0.6), inset -2px -2px 4px rgba(0, 0, 0, 0.3), inset 2px 2px 4px rgba(255, 255, 255, 0.4)',
                  animation: 'glow 2s ease-in-out infinite'
                }}></span>
                {collectedObjectives.size} / {totalObjectives}
              </div>

              {/* Alert Phase */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                background: alertPhase === 'high' 
                  ? 'rgba(255, 67, 54, 0.2)' 
                  : 'rgba(76, 175, 80, 0.2)',
                borderRadius: '8px',
                border: `1px solid ${alertPhase === 'high' ? '#FF4336' : '#4CAF50'}`,
                fontSize: '14px',
                color: alertPhase === 'high' ? '#FF4336' : '#4CAF50'
              }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: alertPhase === 'high' ? '#FF4336' : '#4CAF50',
                  borderRadius: '50%',
                  display: 'inline-block',
                  animation: alertPhase === 'high' ? 'pulse 0.5s ease-in-out infinite' : 'none'
                }}></span>
                {alertPhase === 'high' ? 'HIGH' : 'LOW'} {alertTimer}s
              </div>
            </div>
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
      {!gameStarted && <div className="game-page-background" style={{ backgroundImage: `url(${gamebg})` }}></div>}
      <PageHeader title="Game" />
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Game</IonTitle>
          </IonToolbar>
        </IonHeader>
        {gameWon && <WinScreen onPlayAgain={handlePlayAgain} />}
        {gameLost && <LoseScreen onPlayAgain={handlePlayAgain} />}
        {!gameWon && !gameLost && gameMode === 'selection' && (
          <GameModeScreen
            onStoryMode={() => setGameMode('story')}
            onCustomMode={() => setGameMode('custom')}
            onSandboxMode={() => setGameMode('sandbox')}
          />
        )}
        {!gameWon && !gameLost && gameMode === 'story' && (
          <div style={{ margin: '20px auto', maxWidth: '400px' }}>
            <IonCard className="glass-card" style={{ marginBottom: '20px' }}>
              <IonCardContent>
                <p style={{ margin: '0 0 10px 0' }}><strong>Story Mode</strong></p>
                <p style={{ margin: '0 0 15px 0', fontSize: '0.9em', color: 'rgba(255, 255, 255, 0.8)' }}>
                  Follow the narrative with carefully crafted levels
                </p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center' }}>
                  <IonButton
                    className="glass-button"
                    onClick={() => setGameMode('selection')}
                  >
                    <IonIcon icon={arrowBack} slot="start" />
                  </IonButton>
                  <StartScreen onStartGame={handleStartGame} />
                </div>
              </IonCardContent>
            </IonCard>
          </div>
        )}
        {!gameWon && !gameLost && gameMode === 'custom' && (
          <div style={{ margin: '20px auto', maxWidth: '400px' }}>
            <IonButton className="glass-button" onClick={() => setShowLoadModal(true)} expand="block" style={{ marginBottom: '20px' }}>
              Load Custom Game
            </IonButton>
            {loadedLevels && loadedLevels.length > 0 && (
              <IonCard className="glass-card" style={{ marginBottom: '20px' }}>
                <IonCardContent>
                  <p style={{ marginTop: 0, marginBottom: '10px' }}><strong>✓ Loaded {loadedLevels.length} levels</strong></p>
                  {loadedLevels.map((level) => (
                    <p key={level.id} style={{ fontSize: '0.9em', marginBottom: '5px', color: 'rgba(255, 255, 255, 0.8)' }}>
                      Level {level.id}: {level.gridSize}×{level.gridSize} grid
                    </p>
                  ))}
                </IonCardContent>
              </IonCard>
            )}
            <IonCard className="glass-card" style={{ marginBottom: '20px' }}>
              <IonCardContent>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center' }}>
                  <IonButton
                    className="glass-button"
                    onClick={() => setGameMode('selection')}
                  >
                    <IonIcon icon={arrowBack} slot="start" />
                  </IonButton>
                  <StartScreen onStartGame={handleStartGame} />
                </div>
              </IonCardContent>
            </IonCard>
          </div>
        )}
        {!gameWon && !gameLost && gameMode === 'sandbox' && (
          <div style={{ margin: '20px auto', maxWidth: '400px' }}>
            <IonCard className="glass-card" style={{ marginBottom: '20px' }}>
              <IonCardContent>
                <p style={{ margin: '0 0 10px 0' }}><strong>Sandbox Mode</strong></p>
                <p style={{ margin: '0 0 15px 0', fontSize: '0.9em', color: 'rgba(255, 255, 255, 0.8)' }}>
                  Generate random levels for endless fun
                </p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center' }}>
                  <IonButton
                    className="glass-button"
                    onClick={() => setGameMode('selection')}
                  >
                    <IonIcon icon={arrowBack} slot="start" />
                  </IonButton>
                  <StartScreen onStartGame={handleStartGame} />
                </div>
              </IonCardContent>
            </IonCard>
          </div>
        )}
      </IonContent>
      <LoadCustomGameModal
        isOpen={showLoadModal}
        pastedJson={pastedJson}
        onJsonChange={setPastedJson}
        onLoadLevels={loadLevels}
        onClose={() => setShowLoadModal(false)}
        loadedLevels={loadedLevels}
      />
    </IonPage>
  );
};

export default Game;
