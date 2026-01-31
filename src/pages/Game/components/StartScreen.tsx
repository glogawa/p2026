import { IonCard, IonCardContent, IonButton } from '@ionic/react';

interface StartScreenProps {
  onStartGame: () => void;
}

export function StartScreen({ onStartGame }: StartScreenProps) {
  return (
    <div style={{ margin: '20px auto', maxWidth: '400px' }}>
      <IonCard className="glass-card">
        <IonCardContent>
          <p>The game is about wearing a mask to blend with crowds and find the exit. Movement is WASD.</p>
          <IonButton className="glass-button" onClick={onStartGame}>
            Start Game
          </IonButton>
        </IonCardContent>
      </IonCard>
    </div>
  );
}
