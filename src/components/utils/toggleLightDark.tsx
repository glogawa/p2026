import { IonIcon } from '@ionic/react';
import { moon, sunny } from 'ionicons/icons';
import { useState, useEffect } from 'react';

const ToggleLightDark: React.FC = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDark = stored === 'dark' || (!stored && prefersDark);
    setIsDark(initialDark);
    if (initialDark) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    if (newIsDark) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <IonIcon
      icon={isDark ? sunny : moon}
      onClick={toggleTheme}
      color="medium"
      style={{ cursor: 'pointer', fontSize: '24px' }}
    />
  );
};

export default ToggleLightDark;
