import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import apiService from '../api/apiService';

// Define theme types
export type ThemeType = 'light' | 'dark' | 'system';

// Define theme context type
interface ThemeContextType {
  theme: ThemeType;
  currentTheme: 'light' | 'dark'; // The actual theme being applied (resolved from system if needed)
  setTheme: (theme: ThemeType) => void;
}

// Create context with default values
const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  currentTheme: 'dark',
  setTheme: () => {},
});

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);

// Provider component
interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeType>('system');
  const systemColorScheme = useColorScheme() || 'dark';
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>(
    theme === 'system' ? systemColorScheme : theme as 'light' | 'dark'
  );

  // Load theme from settings on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const settings = await apiService.getSettings();
        if (settings && settings.theme) {
          setThemeState(settings.theme as ThemeType);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    };

    loadTheme();
  }, []);

  // Update current theme when theme or system theme changes
  useEffect(() => {
    if (theme === 'system') {
      setCurrentTheme(systemColorScheme);
    } else {
      setCurrentTheme(theme as 'light' | 'dark');
    }
  }, [theme, systemColorScheme]);

  // Set theme function
  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, currentTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
