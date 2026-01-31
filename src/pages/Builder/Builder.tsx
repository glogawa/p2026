import React, { useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonInput, IonLabel, IonItem, IonButton, IonButtons, IonCard, IonCardContent, IonMenuToggle } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import ToggleLightDark from '../../components/utils/toggleLightDark';

interface Level {
  id: number;
  gridSize: number;
}

const Builder: React.FC = () => {
  const [numLevels, setNumLevels] = useState<number>(1);
  const [levels, setLevels] = useState<Level[]>([{ id: 1, gridSize: 20 }]);
  const history = useHistory();

  const handleNumLevelsChange = (value: string) => {
    const num = parseInt(value, 10) || 1;
    setNumLevels(num);
    const newLevels = Array.from({ length: num }, (_, i) => ({
      id: i + 1,
      gridSize: levels[i]?.gridSize || 20,
    }));
    setLevels(newLevels);
  };

  const handleGridSizeChange = (id: number, value: string) => {
    const size = parseInt(value, 10) || 20;
    setLevels(levels.map(level => level.id === id ? { ...level, gridSize: size } : level));
  };

  const saveDesign = () => {
    // For now, just log the design. Later, save to localStorage or pass to Game.
    console.log('Level Design:', { numLevels, levels });
    // Navigate back to home or game
    history.push('/');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Level Builder</IonTitle>
          <IonButtons slot="start">
            <IonMenuToggle />
          </IonButtons>
          <IonButtons slot="end">
            <ToggleLightDark />
            <IonButton onClick={() => history.push('/')}>Back</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Level Builder</IonTitle>
          </IonToolbar>
        </IonHeader>
        <div style={{ margin: '20px auto', maxWidth: '400px' }}>
          <IonCard className="glass-card">
            <IonCardContent>
              <IonItem>
                <IonLabel position="stacked">Number of Levels</IonLabel>
                <IonInput
                  type="number"
                  value={numLevels}
                  onIonChange={(e) => handleNumLevelsChange(e.detail.value!)}
                  min="1"
                />
              </IonItem>
              {levels.map((level) => (
                <IonItem key={level.id}>
                  <IonLabel position="stacked">Level {level.id} Grid Size</IonLabel>
                  <IonInput
                    type="number"
                    value={level.gridSize}
                    onIonChange={(e) => handleGridSizeChange(level.id, e.detail.value!)}
                    min="5"
                    max="100"
                  />
                </IonItem>
              ))}
              <IonButton className="glass-button" onClick={saveDesign} expand="block">
                Save Design
              </IonButton>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Builder;
