import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, Platform, Dimensions, Image } from 'react-native';
import { Button, Card, Title, Paragraph, Avatar, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

// Ana özellikler - daha basit ve kullanıcı dostu bir arayüz için
const mainFeatures = [
  {
    id: 1,
    name: 'Kelime Listeleri',
    description: 'Tüm kelime listelerinizi görüntüleyin ve yönetin',
    icon: 'format-list-bulleted',
    route: 'Lists',
    color: '#4CAF50' // Yeşil
  },
  {
    id: 2,
    name: 'Liste Oluştur',
    description: 'Yeni bir kelime listesi oluşturun',
    icon: 'playlist-plus',
    route: 'CreateList',
    color: '#2196F3' // Mavi
  },
  {
    id: 3,
    name: 'Kelime Ekle',
    description: 'Mevcut listeye anlamları ve bağlam örnekleriyle yeni kelimeler ekleyin',
    icon: 'plus-circle',
    route: 'AddWord',
    params: { listId: '1' },
    color: '#E91E63' // Pembe
  },
  {
    id: 4,
    name: 'Öğrenme Modu',
    description: 'Kelimelerinizi interaktif alıştırmalarla öğrenin',
    icon: 'school',
    route: 'Learning',
    params: { listId: '1' },
    color: '#FF9800' // Turuncu
  },
  {
    id: 5,
    name: 'Test Modu',
    description: 'Bilginizi test edin ve ilerlemenizi ölçün',
    icon: 'clipboard-check',
    route: 'Test',
    params: { listId: '1' },
    color: '#9C27B0' // Mor
  }
];

// İkincil özellikler
const secondaryFeatures = [
  {
    id: 5,
    name: 'İlerleme Takibi',
    icon: 'chart-line',
    route: 'Progress',
    color: '#00BCD4' // Açık Mavi
  },
  {
    id: 6,
    name: 'Arama',
    icon: 'magnify',
    route: 'Search',
    color: '#607D8B' // Mavi Gri
  },
  {
    id: 7,
    name: 'Kamera Tarama',
    icon: 'camera',
    route: 'CameraScan',
    color: '#E91E63' // Pembe
  },
  {
    id: 8,
    name: 'Sesli Komutlar',
    icon: 'microphone',
    route: 'VoiceCommands',
    color: '#FF5722' // Turuncu Kırmızı
  }
];

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  
  const isDark = currentTheme === 'dark';
  
  // Kullanıcı adını al
  const userName = user?.name || 'Kullanıcı';
  
  // İlerleme durumu için state
  const [wordsLearned, setWordsLearned] = useState(0);
  const [progressPercentage, setProgressPercentage] = useState(0);
  
  // İlerleme durumunu yükle
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const storedWordsLearned = await AsyncStorage.getItem('words_learned');
        const storedProgressPercentage = await AsyncStorage.getItem('progress_percentage');
        
        // Yeni kullanıcılar için ilerleme durumunu sıfırla
        if (storedWordsLearned === null) {
          await AsyncStorage.setItem('words_learned', '0');
          setWordsLearned(0);
        } else {
          setWordsLearned(parseInt(storedWordsLearned, 10));
        }
        
        if (storedProgressPercentage === null) {
          await AsyncStorage.setItem('progress_percentage', '0');
          setProgressPercentage(0);
        } else {
          setProgressPercentage(parseInt(storedProgressPercentage, 10));
        }
      } catch (error) {
        console.error('İlerleme durumu yüklenirken hata oluştu:', error);
      }
    };
    
    loadProgress();
  }, []);
  
  // Kelime öğrenme simülasyonu için yardımcı fonksiyon (demo amaçlı)
  const simulateLearnWord = async () => {
    try {
      // Mevcut değerleri artır
      const newWordsLearned = wordsLearned + 1;
      const newProgressPercentage = Math.min(100, progressPercentage + 5);
      
      // State'i güncelle
      setWordsLearned(newWordsLearned);
      setProgressPercentage(newProgressPercentage);
      
      // AsyncStorage'a kaydet
      await AsyncStorage.setItem('words_learned', newWordsLearned.toString());
      await AsyncStorage.setItem('progress_percentage', newProgressPercentage.toString());
    } catch (error) {
      console.error('İlerleme kaydedilirken hata oluştu:', error);
    }
  };
  
  // İlerlemeyi sıfırlama fonksiyonu (test amaçlı)
  const resetProgress = async () => {
    try {
      // State'i sıfırla
      setWordsLearned(0);
      setProgressPercentage(0);
      
      // AsyncStorage'dan sil
      await AsyncStorage.removeItem('words_learned');
      await AsyncStorage.removeItem('progress_percentage');
    } catch (error) {
      console.error('İlerleme sıfırlanırken hata oluştu:', error);
    }
  };

  // Navigate to feature screen
  const navigateToFeature = (route: keyof RootStackParamList, params?: any) => {
    navigation.navigate(route, params);
  };
  
  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}
      contentContainerStyle={styles.scrollViewContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Üst Kısım - Karşılama ve Profil */}
      <View style={styles.header}>
        <View style={styles.welcomeSection}>
          <Text style={[styles.greeting, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
            Merhaba, {userName}!
          </Text>
          <Text style={[styles.subGreeting, { color: isDark ? '#94A3B8' : '#64748B' }]}>
            Bugün yeni kelimeler öğrenmeye hazır mısın?
          </Text>
        </View>
        <IconButton
          icon="account-circle"
          size={40}
          color={isDark ? '#4CAF50' : '#4CAF50'}
          onPress={() => navigation.navigate('Profile')}
          style={styles.profileButton}
        />
      </View>
      
      {/* İlerleme Özeti */}
      <Card style={[styles.progressCard, { 
        backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
        borderColor: isDark ? '#334155' : '#E2E8F0'
      }]}>
        <Card.Content style={styles.progressContent}>
          <View style={styles.progressTextContainer}>
            <Title style={[styles.progressTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
              Haftalık İlerleme
            </Title>
            <Paragraph style={[styles.progressDescription, { color: isDark ? '#94A3B8' : '#64748B' }]}>
              Bu hafta {wordsLearned} kelime öğrendiniz. Hedefinize %{progressPercentage} ulaştınız!
            </Paragraph>
          </View>
          <View style={[styles.progressCircle, { backgroundColor: progressPercentage > 0 ? '#4CAF50' : '#9E9E9E' }]}>
            <Text style={styles.progressPercentage}>{progressPercentage}%</Text>
          </View>
        </Card.Content>
        <Card.Actions style={styles.progressActions}>
          <Button 
            mode="text" 
            onPress={() => navigation.navigate('Progress')}
            color="#4CAF50"
          >
            Detayları Gör
          </Button>
        </Card.Actions>
      </Card>
      
      {/* Ana Özellikler */}
      <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
        Kelime Öğrenme
      </Text>
      <View style={styles.mainFeaturesGrid}>
        {mainFeatures.map((feature) => (
          <Card 
            key={feature.id} 
            style={[styles.featureCard, { 
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              borderColor: isDark ? '#334155' : '#E2E8F0'
            }]}
            onPress={() => navigateToFeature(feature.route, feature.params)}
          >
            <Card.Content style={styles.featureContent}>
              <Avatar.Icon 
                size={50} 
                icon={feature.icon} 
                style={[styles.featureIcon, { backgroundColor: feature.color }]} 
              />
              <Title style={[styles.featureTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                {feature.name}
              </Title>
              <Paragraph style={[styles.featureDescription, { color: isDark ? '#94A3B8' : '#64748B' }]} numberOfLines={2}>
                {feature.description}
              </Paragraph>
            </Card.Content>
          </Card>
        ))}
      </View>
      
      {/* İkincil Özellikler */}
      <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
        Araçlar
      </Text>
      <View style={styles.secondaryFeaturesGrid}>
        {secondaryFeatures.map((feature) => (
          <Card 
            key={feature.id} 
            style={[styles.secondaryFeatureCard, { 
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              borderColor: isDark ? '#334155' : '#E2E8F0'
            }]}
            onPress={() => navigateToFeature(feature.route, feature.params)}
          >
            <Card.Content style={styles.secondaryFeatureContent}>
              <Avatar.Icon 
                size={36} 
                icon={feature.icon} 
                style={[styles.secondaryFeatureIcon, { backgroundColor: feature.color }]} 
              />
              <Text style={[styles.secondaryFeatureTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                {feature.name}
              </Text>
            </Card.Content>
          </Card>
        ))}
      </View>
      
      {/* Ayarlar Butonu */}
      <View style={styles.settingsContainer}>
        <Button 
          mode="outlined" 
          icon="cog" 
          onPress={() => navigation.navigate('Settings')}
          style={[styles.settingsButton, { 
            borderColor: isDark ? '#4CAF50' : '#4CAF50' 
          }]}
          color="#4CAF50"
        >
          Ayarlar
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeSection: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subGreeting: {
    fontSize: 16,
    marginTop: 4,
  },
  profileButton: {
    margin: 0,
  },
  progressCard: {
    marginBottom: 24,
    borderWidth: 1,
    borderRadius: 12,
    elevation: 2,
  },
  progressContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressTextContainer: {
    flex: 1,
    paddingRight: 16,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressDescription: {
    fontSize: 14,
    marginTop: 4,
  },
  progressCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercentage: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  progressActions: {
    justifyContent: 'flex-end',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 8,
  },
  mainFeaturesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  featureCard: {
    width: '48%',
    marginBottom: 16,
    borderWidth: 1,
    borderRadius: 12,
    elevation: 2,
  },
  featureContent: {
    alignItems: 'center',
    padding: 16,
  },
  featureIcon: {
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    textAlign: 'center',
  },
  secondaryFeaturesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  secondaryFeatureCard: {
    width: '48%',
    marginBottom: 12,
    borderWidth: 1,
    borderRadius: 12,
    elevation: 1,
  },
  secondaryFeatureContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  secondaryFeatureIcon: {
    marginRight: 12,
  },
  secondaryFeatureTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  settingsContainer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  settingsButton: {
    borderWidth: 1,
    paddingHorizontal: 16,
  },
});

export default HomeScreen;
