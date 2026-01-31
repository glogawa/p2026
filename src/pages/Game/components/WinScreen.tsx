import { IonCard, IonCardContent, IonButton } from '@ionic/react';

interface WinScreenProps {
  onPlayAgain: () => void;
}

export function WinScreen({ onPlayAgain }: WinScreenProps) {
  return (
    <div style={{ margin: '20px auto', maxWidth: '400px' }}>
      <IonCard className="glass-card">
        <IonCardContent>
          <p>You Win!</p>
          <IonButton className="glass-button" onClick={onPlayAgain}>
            Play Again
          </IonButton>
        </IonCardContent>
      </IonCard>
    </div>
  );
}
