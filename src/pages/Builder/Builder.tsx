import React, { useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonInput, IonLabel, IonItem, IonButton, IonButtons, IonCard, IonCardContent, IonMenuToggle, IonTextarea, IonIcon, IonGrid, IonRow, IonCol, IonCardHeader, IonCardTitle } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { clipboardOutline } from 'ionicons/icons';
import ToggleLightDark from '../../components/utils/toggleLightDark';

interface Level {
  id: number;
  gridSize: number;
}

const Builder: React.FC = () => {
  const [numLevels, setNumLevels] = useState<number>(1);
  const [levels, setLevels] = useState<Level[]>([{ id: 1, gridSize: 20 }]);
  const [generatedCode, setGeneratedCode] = useState<string>('');
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
    const code = `const levels = ${JSON.stringify(levels, null, 2)};`;
    setGeneratedCode(code);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
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
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Level Builder</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonGrid style={{ padding: '20px' }}>
          <IonRow>
            <IonCol size="12" sizeMd="8" offsetMd="2" sizeLg="6" offsetLg="3">
              <IonCard className="glass-card">
                <IonCardHeader>
                  <IonCardTitle>Design Your Levels</IonCardTitle>
                </IonCardHeader>
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
                  {levels.map((level) => {
                    const displaySize = Math.min(level.gridSize, 20);
                    return (
                      <div key={level.id}>
                        <IonItem>
                          <IonLabel position="stacked">Level {level.id} Grid Size</IonLabel>
                          <IonInput
                            type="number"
                            value={level.gridSize}
                            onIonChange={(e) => handleGridSizeChange(level.id, e.detail.value!)}
                            min="5"
                            max="100"
                          />
                        </IonItem>
                        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${displaySize}, 1fr)`, gap: '0px', width: '300px', height: '300px', margin: '10px auto', backgroundColor: 'var(--glass-background)', padding: '5px' }}>
                          {Array.from({ length: displaySize * displaySize }, (_, i) => (
                            <div key={i} style={{ backgroundColor: '#666', border: '1px solid var(--glass-border)' }}></div>
                          ))}
                        </div>
                        {level.gridSize > 20 && <p style={{ textAlign: 'center', fontSize: '12px', color: 'gray' }}>Preview limited to 20x20</p>}
                      </div>
                    );
                  })}
                  <IonButton className="glass-button" onClick={saveDesign} expand="block" style={{ marginTop: '20px' }}>
                    Save Design
                  </IonButton>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
          {generatedCode && (
            <IonRow>
              <IonCol size="12" sizeMd="8" offsetMd="2" sizeLg="6" offsetLg="3">
                <IonCard className="glass-card">
                  <IonCardHeader>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <IonCardTitle>Generated Code</IonCardTitle>
                      <IonButton fill="clear" onClick={copyToClipboard}>
                        <IonIcon icon={clipboardOutline} slot="start" />
                        Copy
                      </IonButton>
                    </div>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonTextarea
                      value={generatedCode}
                      readonly
                      rows={10}
                      placeholder="Copy this code to use in Game.tsx"
                    />
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          )}
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Builder;
