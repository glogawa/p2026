import { IonCard, IonCardContent, IonButton } from '@ionic/react';
import '../ui.css';

interface LoseScreenProps {
  onPlayAgain: () => void;
}

export function LoseScreen({ onPlayAgain }: LoseScreenProps) {
  return (
    <div style={{ margin: '20px auto', maxWidth: '400px' }}>
      <IonCard className="glass-card">
        <IonCardContent>
          <p>You Lose! A thief escaped with an objective.</p>
          <IonButton className="glass-button" onClick={onPlayAgain}>
            Play Again
          </IonButton>
        </IonCardContent>
      </IonCard>
    </div>
  );
}
