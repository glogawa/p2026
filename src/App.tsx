import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, IonToast, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { useEffect, useState } from 'react';
import { Workbox } from 'workbox-window';
import Home from './pages/Home';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const wb = new Workbox('/sw.js');
      wb.addEventListener('waiting', () => {
        setUpdateAvailable(true);
      });
      wb.register();
    }
  }, []);

  const reloadApp = () => {
    const wb = new Workbox('/sw.js');
    wb.messageSW({ type: 'SKIP_WAITING' }).then(() => {
      window.location.reload();
    });
  };

  const dismissUpdate = () => {
    setUpdateAvailable(false);
  };

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route exact path="/home">
            <Home />
          </Route>
          <Route exact path="/">
            <Redirect to="/home" />
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
      <IonToast
        isOpen={updateAvailable}
        message="A new version is available. Reload to update."
        position="bottom"
        buttons={[
          {
            text: 'Reload',
            role: 'cancel',
            handler: () => reloadApp(),
          },
          {
            text: 'Dismiss',
            role: 'cancel',
            handler: () => dismissUpdate(),
          },
        ]}
      />
    </IonApp>
  );
};

export default App;
