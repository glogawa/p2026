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
          
          {/* Fancy Score Display */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.3) 0%, rgba(255, 235, 59, 0.1) 100%)',
            border: '2px solid rgba(255, 193, 7, 0.6)',
            borderRadius: '15px',
            padding: '25px',
            marginBottom: '20px',
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
          
          <IonButton className="glass-button" onClick={onPlayAgain}>
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
