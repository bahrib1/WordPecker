import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';

type ForgotPasswordScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen = () => {
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const { forgotPassword, isLoading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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

  const handleForgotPassword = async () => {
    setSuccessMessage('');
    setErrorMessage('');
    
    const isEmailValid = validateEmail(email);

    if (isEmailValid) {
      try {
        const result = await forgotPassword(email);
        if (result.success) {
          setSuccessMessage(result.message);
          setEmail('');
        } else {
          setErrorMessage('Şifre sıfırlama işlemi başarısız oldu. Lütfen tekrar deneyin.');
        }
      } catch (error) {
        setErrorMessage('Bir hata oluştu. Lütfen tekrar deneyin.');
        console.error('Forgot password error:', error);
      }
    }
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
          <Text style={styles.title}>Şifremi Unuttum</Text>
          <Text style={styles.subtitle}>
            E-posta adresinizi girin ve şifre sıfırlama talimatlarını size gönderelim
          </Text>

          {successMessage ? (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          ) : null}

          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

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

          <Button
            mode="contained"
            onPress={handleForgotPassword}
            style={styles.button}
            loading={isLoading}
            disabled={isLoading}
          >
            Şifre Sıfırlama Talimatlarını Gönder
          </Button>

          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={styles.backToLoginContainer}
          >
            <Text style={styles.backToLoginText}>Giriş Ekranına Dön</Text>
          </TouchableOpacity>
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
    marginBottom: 16,
    backgroundColor: '#1E293B', // slate.800
  },
  button: {
    marginTop: 8,
    paddingVertical: 8,
    backgroundColor: '#4CAF50', // Green
  },
  backToLoginContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  backToLoginText: {
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
  successContainer: {
    backgroundColor: '#DCFCE7', // green.100
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  successText: {
    color: '#16A34A', // green.600
  },
});

export default ForgotPasswordScreen;
