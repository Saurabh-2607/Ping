'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';

const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    const attrTheme = document.documentElement.getAttribute('data-theme');
    const savedTheme = localStorage.getItem('theme');
    return attrTheme || savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';

    const applyThemeChange = () => {
      setTheme(nextTheme);
      document.documentElement.setAttribute('data-theme', nextTheme);
      localStorage.setItem('theme', nextTheme);
    };

    if (typeof document === 'undefined' || !document.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      applyThemeChange();
      return;
    }

    const transition = document.startViewTransition(() => {
      flushSync(() => {
        applyThemeChange();
      });
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        [
          { clipPath: 'inset(0 0 100% 0)' },
          { clipPath: 'inset(0 0 0 0)' }
        ],
        {
          duration: 650,
          easing: 'ease-in-out',
          pseudoElement: '::view-transition-new(root)'
        }
      );
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
