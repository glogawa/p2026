import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonButtons, IonCard, IonCardContent, IonMenuToggle, IonTextarea, IonItem, IonLabel } from '@ionic/react';
import { useState, useEffect, useRef } from 'react';
import { Engine, Scene, ArcRotateCamera, HemisphericLight, Vector3 } from '@babylonjs/core';
import { createGround } from '../assets/ground';
import { createCamera } from '../assets/camera';
import { createLight } from '../assets/light';
import './Game.css';
import ToggleLightDark from '../../components/utils/toggleLightDark';

interface Level {
    id: number;
    gridSize: number;
    positions: { [key: string]: 'start' | 'end' | 'objective' | null };
}

const Game: React.FC = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [pastedJson, setPastedJson] = useState<string>('');
  const [loadedLevels, setLoadedLevels] = useState<Level[] | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const GRID_SIZE = 20;

  const loadLevels = () => {
    try {
      const levels: Level[] = JSON.parse(pastedJson);
      setLoadedLevels(levels);
    } catch (e) {
      alert('Invalid JSON. Please paste valid levels JSON.');
    }
  };

  useEffect(() => {
    if (gameStarted && canvasRef.current) {
      const engine = new Engine(canvasRef.current, true);
      const scene = new Scene(engine);
      const camera = createCamera(scene, canvasRef.current);
      const light = createLight(scene);
      createGround(scene, GRID_SIZE);
      engine.runRenderLoop(() => {
        scene.render();
      });
      return () => {
        engine.dispose();
      };
    }
  }, [gameStarted]);

  const startGame = () => {
    setGameStarted(true);
  };

  if (gameStarted) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Game</IonTitle>
            <IonButtons slot="start">
              <IonMenuToggle />
            </IonButtons>
            <IonButtons slot="end">
              <ToggleLightDark />
              <IonButton onClick={() => setGameStarted(false)}>Leave Game</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <canvas ref={canvasRef} style={{ width: '100%', height: 'calc(100vh - 56px)' }} />
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Game</IonTitle>
          <IonButtons slot="end">
            <ToggleLightDark />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Game</IonTitle>
          </IonToolbar>
        </IonHeader>
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
        <div style={{ margin: '20px auto', maxWidth: '400px' }}>
          <IonCard className="glass-card">
            <IonCardContent>
              <p>The game is about wearing a mask to blend with crowds and find the exit. Movement is WASD.</p>
              <IonButton className="glass-button" onClick={startGame}>Start Game</IonButton>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Game;
