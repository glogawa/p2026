
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton } from '@ionic/react';
import './Home.css';
import PageHeader from '../components/PageHeader';
import { useHistory } from 'react-router-dom';

const Home: React.FC = () => {
  const history = useHistory();
  // Ganti sinopsis di bawah sesuai cerita Anda
  const synopsis = `Kamu merupakan seorang polisi yang sedang menyamar diantara sekumpulan orang di sebuah pameran topeng. Kamu dalam misi rahasia untuk menangkap seorang penjahat yang berhasil kabur dari penjara dan sedang berusaha untuk mencuri topeng di
      pameran ini. Tangkap pencuri ini tanpa menimbulkan kegaduhan di acara pameran! Hati-hati agar tidak ketahuan oleh sang penjahat, karena dia dapat membahayakan pengunjung pameran yang hadir!`;
  return (
    <IonPage>
      <PageHeader title="Home" />
      <IonContent fullscreen style={{
        background: `url('/assets/bg-home.jpg') center center/cover no-repeat fixed`,
        minHeight: '100vh',
        position: 'relative',
      }}>
        {/* Bubble chat sinopsis */}
        <div style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 240,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.85)',
            borderRadius: '50px',
            boxShadow: '0 20px 12px rgba(0,0,0,0.10)',
            padding: '24px 20px',
            maxWidth: 1200,
            fontSize: 18,
            position: 'relative',
          }}>
            <span style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 600,
              color: '#222',
              fontSize: '20px',
              textDecoration: 'underline',
            }}>Sinopsis</span>
            
            <span className="synopsis-font" style={{ color: '#333' }}>{synopsis}</span>
            <span style={{
              position: 'absolute',
              left: 40,
              bottom: -18,
              width: 0,
              height: 0,
              borderLeft: '16px solid transparent',
              borderRight: '16px solid transparent',
              borderTop: '18px solid rgba(255,255,255,0.85)',
            }}></span>
          </div>
        </div>
        <div style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 150,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
        }}>
            <IonButton size="large" color="primary" style={{ width: 210, fontSize: 20, borderRadius: 80, boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}
            onClick={() => history.push('/game')}
          >
            Start Game
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
