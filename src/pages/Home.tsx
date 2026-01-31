import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonButtons, IonCard, IonCardContent, IonMenuToggle, IonIcon } from '@ionic/react';
import { menuOutline } from 'ionicons/icons';
import ToggleLightDark from '../components/utils/toggleLightDark';
import PageHeader from '../components/PageHeader';

const Home: React.FC = () => {
  return (
    <IonPage>
      <PageHeader title="Home" />
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Home</IonTitle>
          </IonToolbar>
        </IonHeader>
        <div style={{ margin: '20px auto', maxWidth: '400px' }}>
            <IonCardContent>
            </IonCardContent>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
