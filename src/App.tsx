import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, IonToast, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { useEffect, useState, useRef } from 'react';
import Home from './pages/Home';
import Game from './pages/Game/Game';
import Builder from './pages/Builder/Builder';
import Menu from './components/Menu';
import { MenuProvider } from './context/MenuContext';

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
import '@ionic/react/css/palettes/dark.class.css';
/* import '@ionic/react/css/palettes/dark.system.css'; */

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const updateListenerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Vite PWA automatically generates sw.js, no need to provide a custom path
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        console.log('Service worker registered');
        
        // Check if there's already a waiting service worker on first load
        if (registration.waiting) {
          console.log('Waiting service worker found on registration');
          setUpdateAvailable(true);
        }

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('New service worker installed and waiting');
                setUpdateAvailable(true);
              }
            });
          }
        });

        // Listen for controller change
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('Service worker controller changed');
          window.location.reload();
        });
      }).catch((error) => {
        console.error('Service worker registration failed:', error);
      });
    }

    return () => {
      if (updateListenerRef.current) {
        updateListenerRef.current();
      }
    };
  }, []);

  const reloadApp = () => {
    console.log('Reload triggered');
    setUpdateAvailable(false);
    
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg?.waiting) {
          console.log('Sending SKIP_WAITING to service worker');
          // Tell the waiting service worker to skip the waiting period
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      }).catch((error) => {
        console.error('Failed to get service worker registration:', error);
      });
    }
  };

  const dismissUpdate = () => {
    setUpdateAvailable(false);
  };

  return (
    <IonApp>
      <MenuProvider>
        <IonReactRouter>
          <Menu />
          <IonRouterOutlet id="main-content">
            <Route exact path="/home">
              <Home />
            </Route>
            <Route exact path="/game">
              <Game />
            </Route>
            <Route exact path="/builder">
              <Builder />
            </Route>
            <Route exact path="/">
              <Redirect to="/home" />
            </Route>
          </IonRouterOutlet>
        </IonReactRouter>
      </MenuProvider>
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
