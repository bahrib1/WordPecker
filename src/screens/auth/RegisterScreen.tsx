import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';

type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;

const RegisterScreen = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const { register, isLoading, error } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [secureConfirmTextEntry, setSecureConfirmTextEntry] = useState(true);
  
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const validateName = (name: string) => {
    if (!name) {
      setNameError('Ad gereklidir');
      return false;
    } else if (name.length < 2) {
      setNameError('Ad en az 2 karakter olmalıdır');
      return false;
    }
    setNameError('');
    return true;
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('E-posta adresi gereklidir');
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Geçerli bir e-posta adresi giriniz');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError('Şifre gereklidir');
      return false;
    } else if (password.length < 6) {
      setPasswordError('Şifre en az 6 karakter olmalıdır');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const validateConfirmPassword = (confirmPassword: string) => {
    if (!confirmPassword) {
      setConfirmPasswordError('Şifre tekrarı gereklidir');
      return false;
    } else if (confirmPassword !== password) {
      setConfirmPasswordError('Şifreler eşleşmiyor');
      return false;
    }
    setConfirmPasswordError('');
    return true;
  };

  const handleRegister = async () => {
    const isNameValid = validateName(name);
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);

    if (isNameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid) {
      try {
        await register(name, email, password);
        // Navigation will be handled by the App.tsx based on isAuthenticated state
      } catch (error) {
        console.error('Registration error:', error);
      }
    }
  };

  const toggleSecureTextEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  const toggleSecureConfirmTextEntry = () => {
    setSecureConfirmTextEntry(!secureConfirmTextEntry);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          <Text style={styles.title}>Hesap Oluştur</Text>
          <Text style={styles.subtitle}>WordPecker'a kaydolun ve kelime öğrenmeye başlayın</Text>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TextInput
            label="Ad"
            value={name}
            onChangeText={setName}
            onBlur={() => validateName(name)}
            style={styles.input}
            autoCapitalize="words"
            left={<TextInput.Icon icon="account" />}
            error={!!nameError}
          />
          {!!nameError && <HelperText type="error">{nameError}</HelperText>}

          <TextInput
            label="E-posta"
            value={email}
            onChangeText={setEmail}
            onBlur={() => validateEmail(email)}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            left={<TextInput.Icon icon="email" />}
            error={!!emailError}
          />
          {!!emailError && <HelperText type="error">{emailError}</HelperText>}

          <TextInput
            label="Şifre"
            value={password}
            onChangeText={setPassword}
            onBlur={() => validatePassword(password)}
            style={styles.input}
            secureTextEntry={secureTextEntry}
            autoCapitalize="none"
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon
                icon={secureTextEntry ? 'eye' : 'eye-off'}
                onPress={toggleSecureTextEntry}
              />
            }
            error={!!passwordError}
          />
          {!!passwordError && <HelperText type="error">{passwordError}</HelperText>}

          <TextInput
            label="Şifre Tekrarı"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            onBlur={() => validateConfirmPassword(confirmPassword)}
            style={styles.input}
            secureTextEntry={secureConfirmTextEntry}
            autoCapitalize="none"
            left={<TextInput.Icon icon="lock-check" />}
            right={
              <TextInput.Icon
                icon={secureConfirmTextEntry ? 'eye' : 'eye-off'}
                onPress={toggleSecureConfirmTextEntry}
              />
            }
            error={!!confirmPasswordError}
          />
          {!!confirmPasswordError && <HelperText type="error">{confirmPasswordError}</HelperText>}

          <Button
            mode="contained"
            onPress={handleRegister}
            style={styles.button}
            loading={isLoading}
            disabled={isLoading}
          >
            Kayıt Ol
          </Button>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Zaten hesabınız var mı? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Giriş Yap</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // slate.900
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  formContainer: {
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    color: '#94A3B8', // slate.400
  },
  input: {
    marginBottom: 8,
    backgroundColor: '#1E293B', // slate.800
  },
  button: {
    marginTop: 16,
    paddingVertical: 8,
    backgroundColor: '#4CAF50', // Green
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    color: '#94A3B8', // slate.400
  },
  loginLink: {
    color: '#4CAF50', // Green
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2', // red.100
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626', // red.600
  },
});

export default RegisterScreen;
