import { IonCard, IonCardContent, IonButton } from '@ionic/react';
import '../ui.css';

interface LoseScreenProps {
  onPlayAgain: () => void;
  loseReason?: 'thief' | 'recognized';
  score?: number;
}

export function LoseScreen({ onPlayAgain, loseReason = 'thief', score = 0 }: LoseScreenProps) {
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
          
          {/* Fancy Score Display */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.3) 0%, rgba(255, 235, 59, 0.1) 100%)',
            border: '2px solid rgba(255, 193, 7, 0.6)',
            borderRadius: '15px',
            padding: '25px',
            margin: '20px 0',
            textAlign: 'center',
            boxShadow: '0 0 20px rgba(255, 193, 7, 0.3), inset 0 0 20px rgba(255, 193, 7, 0.1)',
            backdropFilter: 'blur(10px)'
          }}>
            <p style={{ margin: '0 0 10px 0', fontSize: '0.9em', color: 'rgba(255, 193, 7, 0.8)', fontWeight: 'bold', letterSpacing: '1px' }}>
              FINAL SCORE
            </p>
            <p style={{
              margin: 0,
              fontSize: '3.5em',
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #FFD700, #FFA500)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 0 30px rgba(255, 193, 7, 0.5)',
              animation: 'pulse 1.5s ease-in-out infinite'
            }}>
              {score}
            </p>
          </div>
          
          <IonButton className="glass-button" onClick={onPlayAgain} style={{ marginTop: '20px' }}>
            Play Again
          </IonButton>
        </IonCardContent>
      </IonCard>
      
      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  );
}
