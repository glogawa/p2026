import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonButtons, IonCard, IonCardContent } from '@ionic/react';
import { useState, useEffect, useRef } from 'react';
import { Engine, Scene, ArcRotateCamera, HemisphericLight, Vector3 } from '@babylonjs/core';
import { createGround } from './assets/ground';
import { createCamera } from './assets/camera';
import { createLight } from './assets/light';
import ExploreContainer from '../components/ExploreContainer';
import './Home.css';

const Home: React.FC = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const GRID_SIZE = 20;

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
            <IonButtons slot="end">
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
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Game</IonTitle>
          </IonToolbar>
        </IonHeader>
        <div style={{ margin: '20px auto', maxWidth: '400px' }}>
          <IonCard>
            <IonCardContent>
              <p>The game is about wearing a mask to blend with crowds and find the exit. Movement is WASD.</p>
              <IonButton onClick={startGame}>Start Game</IonButton>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
