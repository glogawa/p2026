import { IonCard, IonCardContent, IonButton } from '@ionic/react';
import '../ui.css';

interface WinScreenProps {
  onPlayAgain: () => void;
  score?: number;
}

export function WinScreen({ onPlayAgain, score = 0 }: WinScreenProps) {
  return (
    <div style={{ margin: '20px auto', maxWidth: '400px' }}>
      <IonCard className="glass-card">
        <IonCardContent>
          <p style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.5em', fontWeight: 'bold' }}>
            🎉 You Win!
          </p>
          <p style={{ textAlign: 'center', marginBottom: '20px', fontSize: '1.2em' }}>
            {score}
          </p>
          <IonButton className="glass-button" onClick={onPlayAgain}>
            Play Again
          </IonButton>
        </IonCardContent>
      </IonCard>
    </div>
  );
}
