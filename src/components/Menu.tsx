import { IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonIcon, IonLabel } from '@ionic/react';
import { homeOutline, buildOutline, gameControllerOutline } from 'ionicons/icons';

const Menu: React.FC = () => {
  return (
    <IonMenu contentId="main-content" style={{ width: '200px' }}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Menu</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          <IonItem routerLink="/home" routerDirection="root">
            <IonIcon icon={homeOutline} slot="start" />
            <IonLabel>Home</IonLabel>
          </IonItem>
          <IonItem routerLink="/builder" routerDirection="root">
            <IonIcon icon={buildOutline} slot="start" />
            <IonLabel>Builder</IonLabel>
          </IonItem>
          <IonItem routerLink="/game" routerDirection="root">
            <IonIcon icon={gameControllerOutline} slot="start" />
            <IonLabel>Game</IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonMenu>
  );
};

export default Menu;
