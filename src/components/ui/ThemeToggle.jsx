import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import useUIStore from '../../store/uiStore';

const ThemeToggle = ({ className }) => {
  const { theme, toggleTheme } = useUIStore();
  const isDark = theme === 'dark';

  // Theme application is handled by ThemeInitializer.jsx

  return (
    <button
      type="button"
      onClick={() => {
        console.log('ThemeToggle: toggling theme from', theme);
        toggleTheme();
      }}
      className={`relative p-2 rounded-lg hover:bg-white/10 dark:hover:bg-white/10 transition-colors ${className}`}
      aria-label="Toggle theme"
    >
      <div className="relative w-6 h-6">
        <motion.div
          initial={false}
          animate={{
            scale: isDark ? 0 : 1,
            opacity: isDark ? 0 : 1,
            rotate: isDark ? 90 : 0,
          }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Sun size={20} className="text-yellow-500" />
        </motion.div>
        
        <motion.div
          initial={false}
          animate={{
            scale: isDark ? 1 : 0,
            opacity: isDark ? 1 : 0,
            rotate: isDark ? 0 : -90,
          }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Moon size={20} className="text-blue-400" />
        </motion.div>
      </div>
    </button>
  );
};

export default ThemeToggle;
