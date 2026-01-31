import { IonButton } from '@ionic/react';
import '../ui.css';

interface StartScreenProps {
  onStartGame: () => void;
}

export function StartScreen({ onStartGame }: StartScreenProps) {
  return (
    <div style={{ margin: '20px auto', maxWidth: '400px' }}>
      <IonButton className="glass-button" onClick={onStartGame}>
        Start Game
      </IonButton>
    </div>
  );
}
