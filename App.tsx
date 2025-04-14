import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { AuthProvider, useAuth } from './src/context/AuthContext';
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

// Define custom theme
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4CAF50', // Green
    accent: '#2196F3', // Blue
    background: '#0F172A', // slate.900
    surface: '#1E293B', // slate.800
    text: '#FFFFFF',
    error: '#EF4444', // red.500
  },
};

// Navigation options
const screenOptions = {
  headerStyle: {
    backgroundColor: '#1E293B', // slate.800
  },
  headerTintColor: '#FFFFFF',
  headerTitleStyle: {
    fontWeight: 'bold',
  },
};

// Auth Navigator
const AuthNavigator = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Giriş Yap' }} />
    <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Kayıt Ol' }} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Şifremi Unuttum' }} />
  </Stack.Navigator>
);

// Main App Navigator
const AppNavigator = () => (
  <Stack.Navigator screenOptions={screenOptions}>
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

// Root Navigator with Auth State
const RootNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

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

// Main App Component
export default function App() {
  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </PaperProvider>
  );
}
