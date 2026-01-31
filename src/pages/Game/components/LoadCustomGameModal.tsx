import { IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonItem, IonLabel, IonTextarea, IonButtons } from '@ionic/react';
import { useEffect } from 'react';

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
  // Close modal when levels are successfully loaded
  useEffect(() => {
    if (loadedLevels && loadedLevels.length > 0) {
      // Small delay to let the user see the feedback
      const timer = setTimeout(onClose, 500);
      return () => clearTimeout(timer);
    }
  }, [loadedLevels, onClose]);

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
      </IonContent>
    </IonModal>
  );
}
