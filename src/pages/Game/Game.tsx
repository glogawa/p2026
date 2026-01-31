import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonButtons, IonCard, IonCardContent, IonMenuToggle, IonTextarea, IonItem, IonLabel, IonIcon } from '@ionic/react';
import { useState, useEffect, useRef } from 'react';
import { Engine, Scene, ArcRotateCamera, HemisphericLight, Vector3, MeshBuilder, KeyboardEventTypes } from '@babylonjs/core';
import { createGround } from '../assets/ground';
import { createCamera } from '../assets/camera';
import { createLight } from '../assets/light';
import { useGameJoystick } from '../../hooks/useGameJoystick';
import './Game.css';
import PageHeader from '../../components/PageHeader';

interface Level {
    id: number;
    gridSize: number;
    positions: { [key: string]: 'start' | 'end' | 'objective' | null };
}

const Game: React.FC = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [pastedJson, setPastedJson] = useState<string>('');
  const [loadedLevels, setLoadedLevels] = useState<Level[] | null>(null);
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const joystickContainerRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<any>(null);
  const joystickMovementRef = useRef({ x: 0, z: 0 });

  const GRID_SIZE = 20;

  // Setup joystick
  useGameJoystick({
    isGameActive: gameStarted,
    containerRef: joystickContainerRef,
    onMove: (x, z) => {
      joystickMovementRef.current = { x, z };
    },
  });

  const loadLevels = () => {
    try {
      const levels: Level[] = JSON.parse(pastedJson);
      setLoadedLevels(levels);
    } catch (e) {
      alert('Invalid JSON. Please paste valid levels JSON.');
    }
  };

  useEffect(() => {
    if (gameStarted && canvasRef.current && currentLevel) {
      const engine = new Engine(canvasRef.current, true);
      const scene = new Scene(engine);
      const camera = createCamera(scene, canvasRef.current);
      const light = createLight(scene);
      const gridSize = currentLevel.gridSize;
      createGround(scene, gridSize, currentLevel.positions);

      // Ensure canvas is focusable and focused for keyboard input
      canvasRef.current.tabIndex = 0;
      canvasRef.current.focus();

      // Find start position
      const startEntry = Object.entries(currentLevel.positions).find(([_, type]) => type === 'start');
      let box: any = null;
      if (startEntry) {
        const [pos] = startEntry;
        const [x, y] = pos.split(',').map(Number);
        // Map to ground coordinates: ground is centered, from -gridSize/2 to gridSize/2
        const worldX = x - gridSize / 2 + 0.5;
        const worldZ = y - gridSize / 2 + 0.5;
        box = MeshBuilder.CreateBox("player", { size: 1 }, scene);
        box.position = new Vector3(worldX, 0.5, worldZ);
      }

      // Find end position
      const endEntry = Object.entries(currentLevel.positions).find(([_, type]) => type === 'end');
      let endPos: Vector3 | null = null;
      if (endEntry) {
        const [pos] = endEntry;
        const [x, y] = pos.split(',').map(Number);
        const worldX = x - gridSize / 2 + 0.5;
        const worldZ = y - gridSize / 2 + 0.5;
        endPos = new Vector3(worldX, 0.5, worldZ);
      }

      // Keyboard input
      const inputMap: { [key: string]: boolean } = {};
      scene.onKeyboardObservable.add((kbInfo) => {
        switch (kbInfo.type) {
          case KeyboardEventTypes.KEYDOWN:
            inputMap[kbInfo.event.key.toLowerCase()] = true;
            break;
          case KeyboardEventTypes.KEYUP:
            inputMap[kbInfo.event.key.toLowerCase()] = false;
            break;
        }
      });

      engine.runRenderLoop(() => {
        if (box) {
          // Keyboard movement
          if (inputMap["w"]) box.position.z += 0.1;
          if (inputMap["s"]) box.position.z -= 0.1;
          if (inputMap["a"]) box.position.x -= 0.1;
          if (inputMap["d"]) box.position.x += 0.1;
          // Joystick movement
          box.position.x += joystickMovementRef.current.x;
          box.position.z += joystickMovementRef.current.z;

          // Check if reached end
          if (endPos && Vector3.Distance(box.position, endPos) < 0.5) {
            if (currentLevelIndex + 1 < loadedLevels!.length) {
              setCurrentLevelIndex(currentLevelIndex + 1);
              setCurrentLevel(loadedLevels![currentLevelIndex + 1]);
            } else {
              setGameWon(true);
              setGameStarted(false);
            }
          }
        }
        scene.render();
      });

      return () => {
        engine.dispose();
      };
    }
  }, [gameStarted, currentLevel, currentLevelIndex, loadedLevels]);

  const startGame = () => {
    if (loadedLevels && loadedLevels.length > 0) {
      setCurrentLevel(loadedLevels[0]);
      setCurrentLevelIndex(0);
      setGameWon(false);
    }
    setGameStarted(true);
  };

  if (gameStarted) {
    return (
      <IonPage>
        <PageHeader title="Game">
          <IonButton onClick={() => setGameStarted(false)}>Leave Game</IonButton>
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
        {gameWon && (
          <div style={{ margin: '20px auto', maxWidth: '400px' }}>
            <IonCard className="glass-card">
              <IonCardContent>
                <p>You Win!</p>
                <IonButton className="glass-button" onClick={startGame}>Play Again</IonButton>
              </IonCardContent>
            </IonCard>
          </div>
        )}
        <IonItem>
          <IonLabel position="stacked">Paste Levels JSON</IonLabel>
          <IonTextarea
            value={pastedJson}
            onIonChange={(e) => setPastedJson(e.detail.value!)}
            rows={5}
            placeholder="Paste the JSON from the Builder here"
          />
        </IonItem>
        <IonButton className="glass-button" onClick={loadLevels} style={{ margin: '10px' }}>
          Load Levels
        </IonButton>
        {loadedLevels && (
          <IonCard className="glass-card" style={{ margin: '20px auto', maxWidth: '400px' }}>
            <IonCardContent>
              <p>Loaded {loadedLevels.length} levels:</p>
              {loadedLevels.map((level) => (
                <p key={level.id}>Level {level.id}: Grid size {level.gridSize}</p>
              ))}
            </IonCardContent>
          </IonCard>
        )}
        {!gameWon && (
          <div style={{ margin: '20px auto', maxWidth: '400px' }}>
            <IonCard className="glass-card">
              <IonCardContent>
                <p>The game is about wearing a mask to blend with crowds and find the exit. Movement is WASD.</p>
                <IonButton className="glass-button" onClick={startGame}>Start Game</IonButton>
              </IonCardContent>
            </IonCard>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Game;
