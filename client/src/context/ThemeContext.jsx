import React, { createContext, useContext, useEffect } from 'react';

/**
 * ThemeContext — Strictly enforces Light theme across the entire application.
 * Dark mode is permanently disabled as per design specification.
 */
const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.classList.remove('dark');
    try {
      localStorage.removeItem('pp-theme');
      localStorage.setItem('pp-theme', 'light');
    } catch {}
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: 'light', toggleTheme: () => {}, isDark: false }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) return { theme: 'light', toggleTheme: () => {}, isDark: false };
  return ctx;
};
