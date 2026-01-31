import { IonCard, IonCardContent, IonButton } from '@ionic/react';
import '../ui.css';

interface LoseScreenProps {
  onPlayAgain: () => void;
  loseReason?: 'thief' | 'recognized';
}

export function LoseScreen({ onPlayAgain, loseReason = 'thief' }: LoseScreenProps) {
  const getTitle = () => {
    return 'You Lose!';
  };

  const getMessage = () => {
    if (loseReason === 'recognized') {
      return (
        <>
          <p style={{ marginBottom: '10px', fontSize: '1.1em', fontWeight: 'bold' }}>
            💔 You have been recognized by the criminals...
          </p>
          <p style={{ marginBottom: '0' }}>
            Your cover is blown. Criminal gangs converge on you from all directions. Before you can react, they beat you down and drag you away into the shadows. Your mission ends here.
          </p>
        </>
      );
    }
    return (
      <p>A thief escaped with an objective.</p>
    );
  };

  return (
    <div style={{ margin: '20px auto', maxWidth: '400px' }}>
      <IonCard className="glass-card">
        <IonCardContent>
          <h2 style={{ marginTop: 0, marginBottom: '15px' }}>{getTitle()}</h2>
          {getMessage()}
          <IonButton className="glass-button" onClick={onPlayAgain} style={{ marginTop: '20px' }}>
            Play Again
          </IonButton>
        </IonCardContent>
      </IonCard>
    </div>
  );
}
