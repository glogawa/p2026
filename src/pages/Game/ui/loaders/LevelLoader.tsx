import { IonCard, IonCardContent, IonButton, IonItem, IonLabel, IonTextarea } from '@ionic/react';
import '../ui.css';

interface LevelLoaderProps {
  pastedJson: string;
  onJsonChange: (json: string) => void;
  onLoadLevels: () => void;
  loadedLevels: any[] | null;
}

export function LevelLoader({
  pastedJson,
  onJsonChange,
  onLoadLevels,
  loadedLevels,
}: LevelLoaderProps) {
  return (
    <>
      <IonItem>
        <IonLabel position="stacked">Paste Levels JSON (tambah lagi)</IonLabel>
        <IonTextarea
          value={pastedJson}
          onIonChange={(e) => onJsonChange(e.detail.value!)}
          rows={5}
          placeholder="Paste the JSON from the Builder here"
        />
      </IonItem>
      <IonButton className="glass-button" onClick={onLoadLevels} style={{ margin: '10px' }}>
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
    </>
  );
}
