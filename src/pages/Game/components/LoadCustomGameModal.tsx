import { IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonItem, IonLabel, IonTextarea, IonCard, IonCardContent, IonButtons } from '@ionic/react';

interface LoadCustomGameModalProps {
  isOpen: boolean;
  pastedJson: string;
  onJsonChange: (json: string) => void;
  onLoadLevels: () => void;
  onClose: () => void;
  loadedLevels: any[] | null;
}

export function LoadCustomGameModal({
  isOpen,
  pastedJson,
  onJsonChange,
  onLoadLevels,
  onClose,
  loadedLevels,
}: LoadCustomGameModalProps) {
  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Load Custom Game</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}>Close</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonItem>
          <IonLabel position="stacked">Paste Levels JSON</IonLabel>
          <IonTextarea
            value={pastedJson}
            onIonChange={(e) => onJsonChange(e.detail.value!)}
            rows={8}
            placeholder="Paste the JSON from the Builder here"
          />
        </IonItem>
        <IonButton className="glass-button" onClick={onLoadLevels} style={{ margin: '15px 0' }} expand="block">
          Load Levels
        </IonButton>
        {loadedLevels && (
          <IonCard className="glass-card" style={{ marginTop: '20px' }}>
            <IonCardContent>
              <p><strong>Loaded {loadedLevels.length} levels:</strong></p>
              {loadedLevels.map((level) => (
                <p key={level.id} style={{ fontSize: '0.9em', marginBottom: '5px' }}>
                  Level {level.id}: Grid size {level.gridSize}
                </p>
              ))}
            </IonCardContent>
          </IonCard>
        )}
      </IonContent>
    </IonModal>
  );
}
