import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonButtons, IonCard, IonCardContent } from '@ionic/react';
import ToggleLightDark from '../components/utils/toggleLightDark';

const Home: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Home</IonTitle>
          <IonButtons slot="end">
            <ToggleLightDark />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
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
