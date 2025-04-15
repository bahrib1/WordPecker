import { DefaultTheme } from 'react-native-paper';

// Define light theme
export const lightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4CAF50', // Green
    accent: '#2196F3', // Blue
    background: '#F8FAFC', // slate.50
    surface: '#FFFFFF', // white
    text: '#0F172A', // slate.900
    error: '#EF4444', // red.500
    onSurface: '#1E293B', // slate.800
    disabled: '#94A3B8', // slate.400
    placeholder: '#64748B', // slate.500
    backdrop: 'rgba(0, 0, 0, 0.5)',
    notification: '#F59E0B', // amber.500
  },
  dark: false,
};

// Define dark theme
export const darkTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4CAF50', // Green
    accent: '#2196F3', // Blue
    background: '#0F172A', // slate.900
    surface: '#1E293B', // slate.800
    text: '#FFFFFF', // white
    error: '#EF4444', // red.500
    onSurface: '#E2E8F0', // slate.200
    disabled: '#64748B', // slate.500
    placeholder: '#94A3B8', // slate.400
    backdrop: 'rgba(0, 0, 0, 0.5)',
    notification: '#F59E0B', // amber.500
  },
  dark: true,
};
