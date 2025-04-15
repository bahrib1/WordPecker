import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { lightTheme, darkTheme } from './src/styles/theme';
import HomeScreen from './src/screens/HomeScreen';
import { LoginScreen, RegisterScreen, ForgotPasswordScreen, ProfileScreen } from './src/screens/auth';
import { WordListsScreen, CreateListScreen } from './src/screens/lists';
import { AddWordScreen } from './src/screens/words';
import { LearningModeScreen } from './src/screens/learning';
import { TestModeScreen } from './src/screens/test';
import { ListDetailsScreen } from './src/screens/details';
import { ProgressTrackingScreen } from './src/screens/progress';
import { SearchScreen } from './src/screens/search';
import { SettingsScreen } from './src/screens/settings';
import { CameraScanScreen } from './src/screens/camera';
import { VoiceCommandsScreen } from './src/screens/voice';
import { RootStackParamList } from './src/types';

const Stack = createStackNavigator<RootStackParamList>();

// Navigation options with dynamic theme colors
const getScreenOptions = (isDark: boolean) => ({
  headerStyle: {
    backgroundColor: isDark ? '#1E293B' : '#FFFFFF', // slate.800 or white
  },
  headerTintColor: isDark ? '#FFFFFF' : '#0F172A', // white or slate.900
  headerTitleStyle: {
    fontWeight: 'bold',
  },
});

// Auth Navigator
const AuthNavigator = () => {
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';
  
  return (
    <Stack.Navigator screenOptions={getScreenOptions(isDark)}>
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Giriş Yap' }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Kayıt Ol' }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Şifremi Unuttum' }} />
    </Stack.Navigator>
  );
};

// Main App Navigator
const AppNavigator = () => {
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';
  
  return (
    <Stack.Navigator screenOptions={getScreenOptions(isDark)}>
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'WordPecker' }} />
      <Stack.Screen name="Lists" component={WordListsScreen} options={{ title: 'Kelime Listeleri' }} />
      <Stack.Screen name="CreateList" component={CreateListScreen} options={{ title: 'Liste Oluştur' }} />
      <Stack.Screen name="AddWord" component={AddWordScreen} options={{ title: 'Kelime Ekle' }} />
      <Stack.Screen name="Learning" component={LearningModeScreen} options={{ title: 'Öğrenme Modu' }} />
      <Stack.Screen name="Test" component={TestModeScreen} options={{ title: 'Test Modu' }} />
      <Stack.Screen name="ListDetails" component={ListDetailsScreen} options={{ title: 'Liste Detayları' }} />
      <Stack.Screen name="Progress" component={ProgressTrackingScreen} options={{ title: 'İlerleme Takibi' }} />
      <Stack.Screen name="Search" component={SearchScreen} options={{ title: 'Arama' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Ayarlar' }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
      <Stack.Screen name="CameraScan" component={CameraScanScreen} options={{ title: 'Kamera ile Tarama' }} />
      <Stack.Screen name="VoiceCommands" component={VoiceCommandsScreen} options={{ title: 'Sesli Komutlar' }} />
    </Stack.Navigator>
  );
};

// Root Navigator with Auth State
const RootNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { currentTheme } = useTheme();

  if (isLoading) {
    // You could show a splash screen or loading indicator here
    return null;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

// Theme Container Component
const ThemeContainer = () => {
  const { currentTheme } = useTheme();
  const theme = currentTheme === 'dark' ? darkTheme : lightTheme;
  
  return (
    <PaperProvider theme={theme}>
      <RootNavigator />
    </PaperProvider>
  );
};

// Main App Component
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ThemeContainer />
      </AuthProvider>
    </ThemeProvider>
  );
}
