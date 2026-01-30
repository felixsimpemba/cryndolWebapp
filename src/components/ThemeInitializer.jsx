import React from 'react';
import useUIStore from '../store/uiStore';

/**
 * Theme initializer component
 * Applies the stored theme on app mount
 */
const ThemeInitializer = () => {
  const theme = useUIStore((state) => state.theme);

  React.useEffect(() => {
    const root = document.documentElement;
    console.log('ThemeInitializer: Applying theme:', theme);
    
    // Apply theme
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    console.log('ThemeInitializer: Current classes on html:', root.className);
  }, [theme]);

  return null; // This component doesn't render anything
};

export default ThemeInitializer;
