import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { Text, Card, Divider, Button, RadioButton, List, IconButton, Dialog, Portal, Paragraph } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Settings } from '../../types';
import apiService from '../../api/apiService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Settings'>;

const SettingsScreen = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { theme, setTheme } = useTheme();
  
  // State
  const [settings, setSettings] = useState<Settings>({
    theme: 'system',
    notifications: true,
    defaultLanguage: 'en',
    sessionLength: 15,
    autoPlayPronunciation: true
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showClearDataDialog, setShowClearDataDialog] = useState(false);
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);
  const [showSessionLengthDialog, setShowSessionLengthDialog] = useState(false);
  
  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);
  
  // Load settings from API
  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userSettings = await apiService.getSettings();
      setSettings(userSettings);
      
      setLoading(false);
    } catch (error) {
      console.error('Load settings error:', error);
      setError('Ayarlar yüklenirken bir hata oluştu.');
      setLoading(false);
    }
  };
  
  // Save settings to API
  const saveSettings = async (updatedSettings: Settings) => {
    try {
      setLoading(true);
      setError(null);
      
      await apiService.updateSettings(updatedSettings);
      setSettings(updatedSettings);
      
      setLoading(false);
    } catch (error) {
      console.error('Save settings error:', error);
      setError('Ayarlar kaydedilirken bir hata oluştu.');
      setLoading(false);
    }
  };
  
  // Handle theme change
  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    // Update app theme using ThemeContext
    setTheme(newTheme);
    
    // Also save to settings API for persistence
    const updatedSettings = { ...settings, theme: newTheme };
    saveSettings(updatedSettings);
  };
  
  // Handle notifications toggle
  const handleNotificationsToggle = () => {
    const updatedSettings = { ...settings, notifications: !settings.notifications };
    saveSettings(updatedSettings);
  };
  
  // Handle language change
  const handleLanguageChange = (defaultLanguage: string) => {
    const updatedSettings = { ...settings, defaultLanguage };
    saveSettings(updatedSettings);
    setShowLanguageDialog(false);
  };
  
  // Handle session length change
  const handleSessionLengthChange = (sessionLength: number) => {
    const updatedSettings = { ...settings, sessionLength };
    saveSettings(updatedSettings);
    setShowSessionLengthDialog(false);
  };
  
  // Handle auto play pronunciation toggle
  const handleAutoPlayPronunciationToggle = () => {
    const updatedSettings = { ...settings, autoPlayPronunciation: !settings.autoPlayPronunciation };
    saveSettings(updatedSettings);
  };
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await apiService.logout();
      setShowLogoutDialog(false);
      // Navigation will be handled by AuthContext
    } catch (error) {
      console.error('Logout error:', error);
      setError('Çıkış yapılırken bir hata oluştu.');
    }
  };
  
  // Handle clear data
  const handleClearData = async () => {
    try {
      setLoading(true);
      
      // Clear all user data
      await apiService.clearUserData();
      
      setLoading(false);
      setShowClearDataDialog(false);
    } catch (error) {
      console.error('Clear data error:', error);
      setError('Veriler temizlenirken bir hata oluştu.');
      setLoading(false);
    }
  };
  
  // Get language name
  const getLanguageName = (code: string) => {
    const languages: Record<string, string> = {
      'en': 'İngilizce',
      'de': 'Almanca',
      'fr': 'Fransızca',
      'es': 'İspanyolca',
      'it': 'İtalyanca',
      'tr': 'Türkçe'
    };
    
    return languages[code] || code;
  };
  
  // Render theme options
  const renderThemeOptions = () => (
    <Card style={[styles.card, { backgroundColor: theme === 'light' ? '#FFFFFF' : '#1E293B', borderColor: theme === 'light' ? '#E2E8F0' : '#334155' }]}>
      <Card.Content>
        <Text style={[styles.cardTitle, { color: theme === 'light' ? '#0F172A' : '#FFFFFF' }]}>Tema</Text>
        <RadioButton.Group onValueChange={(value) => handleThemeChange(value as 'light' | 'dark' | 'system')} value={settings.theme}>
          <View style={styles.radioItem}>
            <RadioButton value="light" />
            <Text style={[styles.radioLabel, { color: theme === 'light' ? '#0F172A' : '#FFFFFF' }]}>Açık Tema</Text>
          </View>
          <View style={styles.radioItem}>
            <RadioButton value="dark" />
            <Text style={[styles.radioLabel, { color: theme === 'light' ? '#0F172A' : '#FFFFFF' }]}>Koyu Tema</Text>
          </View>
          <View style={styles.radioItem}>
            <RadioButton value="system" />
            <Text style={[styles.radioLabel, { color: theme === 'light' ? '#0F172A' : '#FFFFFF' }]}>Sistem Teması</Text>
          </View>
        </RadioButton.Group>
      </Card.Content>
    </Card>
  );
  
  // Render notification settings
  const renderNotificationSettings = () => (
    <Card style={[styles.card, { backgroundColor: theme === 'light' ? '#FFFFFF' : '#1E293B', borderColor: theme === 'light' ? '#E2E8F0' : '#334155' }]}>
      <Card.Content>
        <Text style={[styles.cardTitle, { color: theme === 'light' ? '#0F172A' : '#FFFFFF' }]}>Bildirimler</Text>
        <View style={styles.switchItem}>
          <Text style={[styles.switchLabel, { color: theme === 'light' ? '#0F172A' : '#FFFFFF' }]}>Bildirimleri Etkinleştir</Text>
          <Switch
            value={settings.notifications}
            onValueChange={handleNotificationsToggle}
            color="#4CAF50"
          />
        </View>
        {settings.notifications && (
          <>
            <Divider style={[styles.divider, { backgroundColor: theme === 'light' ? '#E2E8F0' : '#334155' }]} />
            <Text style={[styles.description, { color: theme === 'light' ? '#64748B' : '#94A3B8' }]}>
              Bildirimler, düzenli çalışmanızı hatırlatmak ve öğrenme hedeflerinize ulaşmanıza yardımcı olmak için kullanılır.
            </Text>
          </>
        )}
      </Card.Content>
    </Card>
  );
  
  // Render language settings
  const renderLanguageSettings = () => (
    <Card style={[styles.card, { backgroundColor: theme === 'light' ? '#FFFFFF' : '#1E293B', borderColor: theme === 'light' ? '#E2E8F0' : '#334155' }]}>
      <Card.Content>
        <Text style={[styles.cardTitle, { color: theme === 'light' ? '#0F172A' : '#FFFFFF' }]}>Dil Ayarları</Text>
        <List.Item
          title="Varsayılan Öğrenme Dili"
          description={getLanguageName(settings.defaultLanguage)}
          onPress={() => setShowLanguageDialog(true)}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          style={styles.listItem}
          titleStyle={{ color: theme === 'light' ? '#0F172A' : '#FFFFFF' }}
          descriptionStyle={{ color: theme === 'light' ? '#64748B' : '#94A3B8' }}
        />
        <List.Item
          title="Oturum Süresi"
          description={`${settings.sessionLength} dakika`}
          onPress={() => setShowSessionLengthDialog(true)}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          style={styles.listItem}
          titleStyle={{ color: theme === 'light' ? '#0F172A' : '#FFFFFF' }}
          descriptionStyle={{ color: theme === 'light' ? '#64748B' : '#94A3B8' }}
        />
        <View style={styles.switchItem}>
          <Text style={[styles.switchLabel, { color: theme === 'light' ? '#0F172A' : '#FFFFFF' }]}>Otomatik Telaffuz</Text>
          <Switch
            value={settings.autoPlayPronunciation}
            onValueChange={handleAutoPlayPronunciationToggle}
            color="#4CAF50"
          />
        </View>
      </Card.Content>
    </Card>
  );
  
  // Render account settings
  const renderAccountSettings = () => (
    <Card style={[styles.card, { backgroundColor: theme === 'light' ? '#FFFFFF' : '#1E293B', borderColor: theme === 'light' ? '#E2E8F0' : '#334155' }]}>
      <Card.Content>
        <Text style={[styles.cardTitle, { color: theme === 'light' ? '#0F172A' : '#FFFFFF' }]}>Hesap</Text>
        <List.Item
          title="Profil"
          description="Profil bilgilerinizi düzenleyin"
          onPress={() => navigation.navigate('Profile')}
          left={props => <List.Icon {...props} icon="account" color={theme === 'light' ? '#0F172A' : '#FFFFFF'} />}
          right={props => <List.Icon {...props} icon="chevron-right" color={theme === 'light' ? '#64748B' : '#94A3B8'} />}
          style={styles.listItem}
          titleStyle={{ color: theme === 'light' ? '#0F172A' : '#FFFFFF' }}
          descriptionStyle={{ color: theme === 'light' ? '#64748B' : '#94A3B8' }}
        />
        <List.Item
          title="Verileri Temizle"
          description="Tüm kullanıcı verilerinizi sıfırlayın"
          onPress={() => setShowClearDataDialog(true)}
          left={props => <List.Icon {...props} icon="delete" color="#EF4444" />}
          style={styles.listItem}
          titleStyle={{ color: theme === 'light' ? '#0F172A' : '#FFFFFF' }}
          descriptionStyle={{ color: theme === 'light' ? '#64748B' : '#94A3B8' }}
        />
        <List.Item
          title="Çıkış Yap"
          description="Hesabınızdan güvenli çıkış yapın"
          onPress={() => setShowLogoutDialog(true)}
          left={props => <List.Icon {...props} icon="logout" color="#EF4444" />}
          style={styles.listItem}
          titleStyle={{ color: theme === 'light' ? '#0F172A' : '#FFFFFF' }}
          descriptionStyle={{ color: theme === 'light' ? '#64748B' : '#94A3B8' }}
        />
      </Card.Content>
    </Card>
  );
  
  // Render about section
  const renderAboutSection = () => (
    <Card style={[styles.card, { backgroundColor: theme === 'light' ? '#FFFFFF' : '#1E293B', borderColor: theme === 'light' ? '#E2E8F0' : '#334155' }]}>
      <Card.Content>
        <Text style={[styles.cardTitle, { color: theme === 'light' ? '#0F172A' : '#FFFFFF' }]}>Hakkında</Text>
        <List.Item
          title="Uygulama Versiyonu"
          description="1.0.0"
          left={props => <List.Icon {...props} icon="information" color={theme === 'light' ? '#0F172A' : '#FFFFFF'} />}
          style={styles.listItem}
          titleStyle={{ color: theme === 'light' ? '#0F172A' : '#FFFFFF' }}
          descriptionStyle={{ color: theme === 'light' ? '#64748B' : '#94A3B8' }}
        />
        <List.Item
          title="Gizlilik Politikası"
          onPress={() => {/* Navigate to privacy policy */}}
          left={props => <List.Icon {...props} icon="shield-account" color={theme === 'light' ? '#0F172A' : '#FFFFFF'} />}
          right={props => <List.Icon {...props} icon="chevron-right" color={theme === 'light' ? '#64748B' : '#94A3B8'} />}
          style={styles.listItem}
          titleStyle={{ color: theme === 'light' ? '#0F172A' : '#FFFFFF' }}
        />
        <List.Item
          title="Kullanım Koşulları"
          onPress={() => {/* Navigate to terms of service */}}
          left={props => <List.Icon {...props} icon="file-document" color={theme === 'light' ? '#0F172A' : '#FFFFFF'} />}
          right={props => <List.Icon {...props} icon="chevron-right" color={theme === 'light' ? '#64748B' : '#94A3B8'} />}
          style={styles.listItem}
          titleStyle={{ color: theme === 'light' ? '#0F172A' : '#FFFFFF' }}
        />
        <List.Item
          title="Açık Kaynak Lisansları"
          onPress={() => {/* Navigate to open source licenses */}}
          left={props => <List.Icon {...props} icon="license" color={theme === 'light' ? '#0F172A' : '#FFFFFF'} />}
          right={props => <List.Icon {...props} icon="chevron-right" color={theme === 'light' ? '#64748B' : '#94A3B8'} />}
          style={styles.listItem}
          titleStyle={{ color: theme === 'light' ? '#0F172A' : '#FFFFFF' }}
        />
      </Card.Content>
    </Card>
  );
  
  return (
    <View style={[styles.container, { backgroundColor: theme === 'light' ? '#F8FAFC' : '#0F172A' }]}>
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Theme Options */}
        {renderThemeOptions()}
        
        {/* Notification Settings */}
        {renderNotificationSettings()}
        
        {/* Language Settings */}
        {renderLanguageSettings()}
        
        {/* Account Settings */}
        {renderAccountSettings()}
        
        {/* About Section */}
        {renderAboutSection()}
        
        {/* Error Message */}
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
      </ScrollView>
      
      {/* Language Dialog */}
      <Portal>
        <Dialog 
          visible={showLanguageDialog} 
          onDismiss={() => setShowLanguageDialog(false)}
          style={{ backgroundColor: theme === 'light' ? '#FFFFFF' : '#1E293B' }}
        >
          <Dialog.Title style={{ color: theme === 'light' ? '#0F172A' : '#FFFFFF' }}>Varsayılan Öğrenme Dili</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group onValueChange={(value) => handleLanguageChange(value)} value={settings.defaultLanguage}>
              <View style={styles.dialogRadioItem}>
                <RadioButton value="en" />
                <Text style={[styles.dialogRadioLabel, { color: theme === 'light' ? '#0F172A' : '#FFFFFF' }]}>İngilizce</Text>
              </View>
              <View style={styles.dialogRadioItem}>
                <RadioButton value="de" />
                <Text style={[styles.dialogRadioLabel, { color: theme === 'light' ? '#0F172A' : '#FFFFFF' }]}>Almanca</Text>
              </View>
              <View style={styles.dialogRadioItem}>
                <RadioButton value="fr" />
                <Text style={[styles.dialogRadioLabel, { color: theme === 'light' ? '#0F172A' : '#FFFFFF' }]}>Fransızca</Text>
              </View>
              <View style={styles.dialogRadioItem}>
                <RadioButton value="es" />
                <Text style={[styles.dialogRadioLabel, { color: theme === 'light' ? '#0F172A' : '#FFFFFF' }]}>İspanyolca</Text>
              </View>
              <View style={styles.dialogRadioItem}>
                <RadioButton value="it" />
                <Text style={[styles.dialogRadioLabel, { color: theme === 'light' ? '#0F172A' : '#FFFFFF' }]}>İtalyanca</Text>
              </View>
              <View style={styles.dialogRadioItem}>
                <RadioButton value="tr" />
                <Text style={[styles.dialogRadioLabel, { color: theme === 'light' ? '#0F172A' : '#FFFFFF' }]}>Türkçe</Text>
              </View>
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowLanguageDialog(false)}>İptal</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      {/* Session Length Dialog */}
      <Portal>
        <Dialog 
          visible={showSessionLengthDialog} 
          onDismiss={() => setShowSessionLengthDialog(false)}
          style={{ backgroundColor: theme === 'light' ? '#FFFFFF' : '#1E293B' }}
        >
          <Dialog.Title style={{ color: theme === 'light' ? '#0F172A' : '#FFFFFF' }}>Oturum Süresi</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group onValueChange={(value) => handleSessionLengthChange(parseInt(value))} value={settings.sessionLength.toString()}>
              <View style={styles.dialogRadioItem}>
                <RadioButton value="5" />
                <Text style={[styles.dialogRadioLabel, { color: theme === 'light' ? '#0F172A' : '#FFFFFF' }]}>5 dakika</Text>
              </View>
              <View style={styles.dialogRadioItem}>
                <RadioButton value="10" />
                <Text style={[styles.dialogRadioLabel, { color: theme === 'light' ? '#0F172A' : '#FFFFFF' }]}>10 dakika</Text>
              </View>
              <View style={styles.dialogRadioItem}>
                <RadioButton value="15" />
                <Text style={[styles.dialogRadioLabel, { color: theme === 'light' ? '#0F172A' : '#FFFFFF' }]}>15 dakika</Text>
              </View>
              <View style={styles.dialogRadioItem}>
                <RadioButton value="20" />
                <Text style={[styles.dialogRadioLabel, { color: theme === 'light' ? '#0F172A' : '#FFFFFF' }]}>20 dakika</Text>
              </View>
              <View style={styles.dialogRadioItem}>
                <RadioButton value="30" />
                <Text style={[styles.dialogRadioLabel, { color: theme === 'light' ? '#0F172A' : '#FFFFFF' }]}>30 dakika</Text>
              </View>
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowSessionLengthDialog(false)}>İptal</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      {/* Logout Dialog */}
      <Portal>
        <Dialog 
          visible={showLogoutDialog} 
          onDismiss={() => setShowLogoutDialog(false)}
          style={{ backgroundColor: theme === 'light' ? '#FFFFFF' : '#1E293B' }}
        >
          <Dialog.Title style={{ color: theme === 'light' ? '#0F172A' : '#FFFFFF' }}>Çıkış Yap</Dialog.Title>
          <Dialog.Content>
            <Paragraph style={{ color: theme === 'light' ? '#0F172A' : '#FFFFFF' }}>Hesabınızdan çıkış yapmak istediğinize emin misiniz?</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowLogoutDialog(false)}>İptal</Button>
            <Button onPress={handleLogout} color="#EF4444">Çıkış Yap</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      {/* Clear Data Dialog */}
      <Portal>
        <Dialog 
          visible={showClearDataDialog} 
          onDismiss={() => setShowClearDataDialog(false)}
          style={{ backgroundColor: theme === 'light' ? '#FFFFFF' : '#1E293B' }}
        >
          <Dialog.Title style={{ color: theme === 'light' ? '#0F172A' : '#FFFFFF' }}>Verileri Temizle</Dialog.Title>
          <Dialog.Content>
            <Paragraph style={{ color: theme === 'light' ? '#0F172A' : '#FFFFFF' }}>
              Tüm kullanıcı verileriniz silinecek. Bu işlem geri alınamaz. Devam etmek istediğinize emin misiniz?
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowClearDataDialog(false)}>İptal</Button>
            <Button onPress={handleClearData} color="#EF4444">Temizle</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // slate.900
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    marginBottom: 16,
    backgroundColor: '#1E293B', // slate.800
    borderColor: '#334155', // slate.700
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioLabel: {
    color: '#FFFFFF',
    marginLeft: 8,
  },
  switchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  switchLabel: {
    color: '#FFFFFF',
  },
  divider: {
    marginVertical: 12,
    backgroundColor: '#334155', // slate.700
  },
  description: {
    color: '#94A3B8', // slate.400
    fontSize: 14,
    marginTop: 8,
  },
  listItem: {
    paddingLeft: 0,
    paddingRight: 0,
  },
  errorText: {
    color: '#EF4444', // Red
    marginTop: 16,
    textAlign: 'center',
  },
  dialogRadioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dialogRadioLabel: {
    marginLeft: 8,
  },
});

export default SettingsScreen;
