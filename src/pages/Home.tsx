import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonRow, IonCol, IonGrid, IonIcon, IonBadge } from '@ionic/react';
import { gameControllerOutline, personOutline, linkOutline } from 'ionicons/icons';
import ToggleLightDark from '../components/utils/toggleLightDark';
import PageHeader from '../components/PageHeader';
import './Home.css';

const Home: React.FC = () => {
  const credits = [
    { name: 'LaSalle College Jakarta'},
  ];

  return (
    <IonPage>
      <PageHeader title="Home" />
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Home</IonTitle>
          </IonToolbar>
        </IonHeader>

        <div className="home-container">
          {/* Header Section */}
          <div className="hero-section">
            <div className="logo-container">
              <img src="/ggj2026logo.svg" alt="GGJ 2026 Logo" className="ggj-logo" />
            </div>
            <h1 className="app-title">GGJ 2026 Submission</h1>
            <p className="app-subtitle">A Game Created for Global Game Jam 2026</p>
            <IonBadge color="success" className="jam-badge">
              January 26 - February 1, 2026
            </IonBadge>
          </div>

          {/* About Section */}
          <IonCard className="info-card">
            <IonCardHeader>
              <IonCardTitle>
                <IonIcon icon={gameControllerOutline} slot="start" />
                About This Game
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p>
                This game was created as part of the Global Game Jam 2026, a worldwide event where game developers, artists, and designers come together to create games in just 48 hours.
              </p>
              <p>
                2026 GGJ theme: <strong>"Mask"</strong>
              </p>
            </IonCardContent>
          </IonCard>

          {/* Game Info Section */}
          <IonCard className="info-card game-card">
            <IonCardHeader>
              <IonCardTitle>
                <IonIcon icon={gameControllerOutline} slot="start" />
                Play the Game
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonRow className="button-row">
                <IonCol size="12" sizeMd="6" className="button-col">
                  <IonButton expand="block" color="primary" routerLink="/game">
                    Play Game
                  </IonButton>
                </IonCol>
                <IonCol size="12" sizeMd="6" className="button-col">
                  <IonButton expand="block" color="secondary" routerLink="/builder">
                    Level Builder
                  </IonButton>
                </IonCol>
              </IonRow>
            </IonCardContent>
          </IonCard>

          {/* Credits Section */}
          <IonCard className="info-card">
            <IonCardHeader>
              <IonCardTitle>
                <IonIcon icon={personOutline} slot="start" />
                Credits & Team
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonGrid>
                {credits.map((member, index) => (
                  <IonRow key={index} className="credit-row">
                    <IonCol size="12">
                      <div className="credit-item">
                        <p className="credit-name">{member.name}</p>
                      </div>
                    </IonCol>
                  </IonRow>
                ))}
              </IonGrid>
              <img src="/nuon.png" alt="Nuon Logo" className="nuon-logo" style={{ width: '80px', height: 'auto' }} />
              <p className="credit-note">
                Thank you to all team members who contributed their time, passion and talent to this project during the 48-hour jam!
              </p>
            </IonCardContent>
          </IonCard>

          {/* Links Section */}
          <IonCard className="info-card">
            <IonCardHeader>
              <IonCardTitle>
                <IonIcon icon={linkOutline} slot="start" />
                Resources & Links
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonButton 
                expand="block" 
                fill="outline" 
                color="primary"
                href="https://globalgamejam.org" 
                target="_blank"
                className="link-button"
              >
                <IonIcon icon={linkOutline} slot="start" />
                Global Game Jam Website
              </IonButton>
              <IonButton 
                expand="block" 
                fill="outline" 
                color="primary"
                href="https://globalgamejam.org/2026/" 
                target="_blank"
                className="link-button"
              >
                <IonIcon icon={linkOutline} slot="start" />
                GGJ 2026 Main Page
              </IonButton>
            </IonCardContent>
          </IonCard>

          {/* Footer */}
          <div className="footer-section">
            <p className="footer-text">
              Global Game Jam 2026
            </p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;