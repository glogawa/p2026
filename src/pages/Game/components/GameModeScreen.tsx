import { IonCard, IonCardContent, IonButton } from '@ionic/react';

interface GameModeScreenProps {
  onStoryMode: () => void;
  onCustomMode: () => void;
  onSandboxMode: () => void;
}

export function GameModeScreen({
  onStoryMode,
  onCustomMode,
  onSandboxMode,
}: GameModeScreenProps) {
  return (
    <div style={{ margin: '20px auto', maxWidth: '400px' }}>
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h1 style={{ margin: '0 0 10px 0', color: 'white', fontSize: '28px' }}>Masked Out</h1>
        <p style={{ margin: '0', color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>Select a Game Mode</p>
      </div>

      <IonCard className="glass-card" style={{ marginBottom: '15px', cursor: 'pointer' }} onClick={onStoryMode}>
        <IonCardContent>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>📖 Story Mode</h2>
          <p style={{ margin: '0', fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)' }}>
            Follow the narrative with carefully crafted levels
          </p>
        </IonCardContent>
      </IonCard>

      <IonCard className="glass-card" style={{ marginBottom: '15px', cursor: 'pointer' }} onClick={onCustomMode}>
        <IonCardContent>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>⚙️ Custom Game</h2>
          <p style={{ margin: '0', fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)' }}>
            Load your own custom level configuration
          </p>
        </IonCardContent>
      </IonCard>

      <IonCard className="glass-card" style={{ cursor: 'pointer' }} onClick={onSandboxMode}>
        <IonCardContent>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>🎮 Sandbox Mode</h2>
          <p style={{ margin: '0', fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)' }}>
            Generate random levels for endless fun
          </p>
        </IonCardContent>
      </IonCard>
    </div>
  );
}
