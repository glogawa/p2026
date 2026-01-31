import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonButtons } from '@ionic/react';
import { useState, useEffect, useRef } from 'react';
import { Engine, Scene, ArcRotateCamera, HemisphericLight, Vector3, MeshBuilder, Color3 } from '@babylonjs/core';
import { GridMaterial } from '@babylonjs/materials/grid';
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
      const camera = new ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 3, new Vector3(0, 0, 0), scene);
      camera.attachControl(canvasRef.current, true);
      const light = new HemisphericLight("light", new Vector3(1, 1, 0), scene);
      const plane = MeshBuilder.CreateGround("ground", { width: GRID_SIZE, height: GRID_SIZE }, scene);
      const gridMaterial = new GridMaterial("grid", scene);
      gridMaterial.gridRatio = 1;
      gridMaterial.mainColor = new Color3(1, 1, 1);
      gridMaterial.lineColor = new Color3(0, 0, 0);
      plane.material = gridMaterial;
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
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <IonButton onClick={startGame}>Start Game</IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
