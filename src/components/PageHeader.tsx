import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon } from '@ionic/react';
import { menuOutline } from 'ionicons/icons';
import { useMenu } from '../context/MenuContext';
import ToggleLightDark from './utils/toggleLightDark';

interface PageHeaderProps {
  title: string;
  children?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, children }) => {
  const { toggleMenu } = useMenu();

  return (
    <IonHeader>
      <IonToolbar>
        <IonTitle>{title}</IonTitle>
        <IonButtons slot="start">
          <IonButton onClick={toggleMenu}>
            <IonIcon icon={menuOutline} size="large" />
          </IonButton>
        </IonButtons>
        <IonButtons slot="end">
          <ToggleLightDark />
          {children}
        </IonButtons>
      </IonToolbar>
    </IonHeader>
  );
};

export default PageHeader;
