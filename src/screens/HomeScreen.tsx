import React from 'react';
import { View, StyleSheet, ScrollView, Text, Platform, Dimensions } from 'react-native';
import { Button, Card, Title, Paragraph } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { commonStyles } from '../styles/theme';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

// Özellik tanımlamaları
const features = [
  {
    id: 1,
    name: 'Kullanıcı Girişi',
    description: 'E-posta/şifre ve sosyal medya ile güvenli ve kullanıcı dostu giriş/kayıt sistemi.',
    expectedFunctionality: [
      'E-posta/şifre ile kullanıcı kaydı',
      'E-posta/şifre ile giriş',
      'Şifre kurtarma',
      'Kullanıcı profili görüntüleme ve yönetimi',
      'Oturum yönetimi',
      'Güvenli token saklama'
    ]
  },
  {
    id: 2,
    name: 'Kelime Listeleri',
    description: 'Kullanıcının oluşturduğu tüm kelime listelerini detayları ve yönetim seçenekleriyle görüntüleme.',
    expectedFunctionality: [
      'Tüm listeleri önizleme bilgileriyle gösterme',
      'Liste sıralama ve filtreleme seçenekleri',
      'Hızlı eylemler (öğrenme, test, detaylar)',
      'İlerleme göstergeleri',
      'Yenileme ve sayfalama'
    ]
  },
  {
    id: 3,
    name: 'Liste Oluştur',
    description: 'İsim, açıklama ve bağlam bilgileriyle yeni kelime listesi oluşturma.',
    expectedFunctionality: [
      'Doğrulama ile liste oluşturma formu',
      'İsteğe bağlı kaynak belirtme alanı',
      'Liste için dil seçimi',
      'Oluşturma sonrası kelime ekleme seçeneği',
      'Yaygın liste türleri için şablonlar'
    ]
  },
  {
    id: 4,
    name: 'Kelime Ekle',
    description: 'Mevcut listeye anlamları ve bağlam örnekleriyle yeni kelimeler ekleme.',
    expectedFunctionality: [
      'Otomatik tamamlama önerileriyle kelime ekleme formu',
      'API ile otomatik anlam getirme',
      'Toplu kelime ekleme özelliği',
      'Bağlam örneği alanı',
      'Resim/telaffuz ilişkilendirme (opsiyonel)'
    ]
  },
  {
    id: 5,
    name: 'Öğrenme Modu',
    description: 'Duolingo tarzı alıştırmalarla liste kelimelerini öğrenme deneyimi.',
    expectedFunctionality: [
      'Çoktan seçmeli alıştırmalar',
      'Oturum sırasında ilerleme takibi',
      'Motivasyon için seri sayacı',
      'Cevaplara geri bildirim',
      'Oturum devamı ve geçmişi',
      'Çeşitli alıştırma türleri'
    ]
  },
  {
    id: 6,
    name: 'Test Modu',
    description: 'Liste kelimelerini daha zorlu bir test formatıyla sınama.',
    expectedFunctionality: [
      'Öğrenme modundan daha zorlu sorular',
      'Puan takibi ve geçmişi',
      'Süre sınırı seçeneği',
      'Yanlış cevapları gözden geçirme',
      'Test sonuç özeti',
      'Sonuçları paylaşma özelliği'
    ]
  },
  {
    id: 7,
    name: 'Liste Detayları',
    description: 'Tüm kelimeleri ve yönetim seçenekleriyle kelime listesinin detaylı görünümü.',
    expectedFunctionality: [
      'Listedeki tüm kelimeleri anlamlarıyla gösterme',
      'Kelime düzenleme ve silme',
      'Liste bilgilerini düzenleme',
      'İlerleme istatistikleri',
      'Öğrenme/Test modu başlatma seçenekleri',
      'Kelime sıralama ve filtreleme'
    ]
  },
  {
    id: 8,
    name: 'İlerleme Takibi',
    description: 'Tüm listeler ve kelimeler için istatistikler ve görselleştirmelerle öğrenme ilerlemesini takip etme.',
    expectedFunctionality: [
      'Genel öğrenme istatistikleri',
      'Liste bazında ilerleme görünümü',
      'Kelime hakimiyet göstergeleri',
      'İlerleme geçmişi grafikleri',
      'Öğrenme serileri ve başarılar',
      'Önerilen tekrar kelimeleri'
    ]
  },
  {
    id: 9,
    name: 'Arama',
    description: 'Listeler ve kelimeler arasında filtreleme seçenekleriyle arama işlevi.',
    expectedFunctionality: [
      'Tüm içerikte genel arama',
      'Liste, tarih, ilerleme seviyesine göre filtreleme',
      'Son aramalar geçmişi',
      'Sesli arama özelliği',
      'Önerilen arama terimleri',
      'Arama sonuçlarından doğrudan eylemler'
    ]
  },
  {
    id: 10,
    name: 'Ayarlar',
    description: 'Öğrenme deneyimini özelleştirmek için uygulama ayarları ve tercihler.',
    expectedFunctionality: [
      'Tema ve görünüm ayarları',
      'Bildirim tercihleri',
      'Varsayılan liste seçenekleri',
      'Öğrenme oturumu yapılandırmaları',
      'Veri yönetimi (dışa/içe aktarma/temizleme)',
      'Hesap ayarları entegrasyonu'
    ]
  },
  {
    id: 11,
    name: 'Kamera ile Kelime Tarama',
    description: 'Kamera kullanarak basılı metinlerden kelime tarama ve listeye ekleme.',
    expectedFunctionality: [
      'Kamera erişimi ve OCR entegrasyonu',
      'Metin tanıma algoritması',
      'Kelime seçme ve düzenleme arayüzü',
      'Tanınan kelimeleri listeye ekleme mekanizması',
      'Performans optimizasyonu'
    ]
  },
  {
    id: 12,
    name: 'Sesli Komut ve Telaffuz',
    description: 'Sesli komutlarla uygulamayı kontrol etme ve telaffuz pratiği yapma.',
    expectedFunctionality: [
      'Ses tanıma API entegrasyonu',
      'Sesli komut sistemi',
      'Telaffuz değerlendirme mekanizması',
      'Sesli geri bildirim sistemi',
      'Erişilebilirlik özellikleri'
    ]
  }
];

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const navigateToFeature = (feature: typeof features[0]) => {
    // Navigate directly to implemented features
    switch (feature.id) {
      case 1: // Kullanıcı Girişi
        navigation.navigate('Profile');
        break;
      case 2: // Kelime Listeleri
        navigation.navigate('Lists');
        break;
      case 3: // Liste Oluştur
        navigation.navigate('CreateList');
        break;
      case 4: // Kelime Ekle
        // For AddWord, we need a listId, so we'll navigate to Lists first
        navigation.navigate('Lists');
        break;
      case 5: // Öğrenme Modu
        // For Learning, we need a listId, so we'll navigate to Lists first
        navigation.navigate('Lists');
        break;
      case 6: // Test Modu
        // For Test, we need a listId, so we'll navigate to Lists first
        navigation.navigate('Lists');
        break;
      case 7: // Liste Detayları
        // For ListDetails, we need a listId, so we'll navigate to Lists first
        navigation.navigate('Lists');
        break;
      case 8: // İlerleme Takibi
        navigation.navigate('Progress');
        break;
      case 9: // Arama
        navigation.navigate('Search');
        break;
      case 10: // Ayarlar
        navigation.navigate('Settings');
        break;
      case 11: // Kamera ile Kelime Tarama
        navigation.navigate('CameraScan');
        break;
      case 12: // Sesli Komut ve Telaffuz
        navigation.navigate('VoiceCommands');
        break;
      default:
        // This should never happen with our current feature set
        console.warn(`No navigation defined for feature ID ${feature.id}`);
        break;
    }
  };

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Text style={styles.instructions}>
          WordPecker dil öğrenme uygulamasına hoş geldiniz. Aşağıdaki özelliklerden birini seçerek başlayabilirsiniz.
        </Text>
        
        <View style={styles.grid}>
          {features.map((feature) => (
            <Card key={feature.id} style={styles.card}>
              <Card.Content>
                <Title style={styles.cardTitle}>{feature.name}</Title>
                <Paragraph style={styles.cardDescription} numberOfLines={2}>
                  {feature.description}
                </Paragraph>
              </Card.Content>
              <Card.Actions>
                <Button 
                  mode="contained" 
                  onPress={() => navigateToFeature(feature)}
                  style={styles.button}
                >
                  İncele
                </Button>
              </Card.Actions>
            </Card>
          ))}
        </View>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollViewContent}
      showsVerticalScrollIndicator={true}
    >
      {/* Mobil için mevcut içerik */}
      <Text style={styles.instructions}>
        WordPecker dil öğrenme uygulamasına hoş geldiniz. Aşağıdaki özelliklerden birini seçerek başlayabilirsiniz.
      </Text>
      
      <View style={styles.grid}>
        {features.map((feature) => (
          <Card key={feature.id} style={styles.card}>
            <Card.Content>
              <Title style={styles.cardTitle}>{feature.name}</Title>
              <Paragraph style={styles.cardDescription} numberOfLines={2}>
                {feature.description}
              </Paragraph>
            </Card.Content>
            <Card.Actions>
              <Button 
                mode="contained" 
                onPress={() => navigateToFeature(feature)}
                style={styles.button}
              >
                İncele
              </Button>
            </Card.Actions>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: Platform.select({
    web: {
      height: Dimensions.get('window').height,
      overflow: 'scroll',
      padding: 16,
      backgroundColor: '#0F172A',
    },
    default: {
      flex: 1,
      padding: 16,
      backgroundColor: '#0F172A',
    },
  }),
  scrollViewContent: {
    ...(Platform.OS === 'web' ? {
      minHeight: '100%',
    } : {
      flexGrow: 1,
    }),
  },
  instructions: {
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 24,
    color: '#94A3B8',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 20,
    ...(Platform.OS === 'web' ? {
      maxWidth: 1200,
      marginHorizontal: 'auto',
    } : {}),
  },
  card: {
    width: Platform.OS === 'web' ? '31%' : '48%',
    marginBottom: 16,
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
    ...(Platform.OS === 'web' ? {
      minWidth: 280,
    } : {}),
  },
  cardTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  cardDescription: {
    color: '#94A3B8', // slate.400
    fontSize: 14,
  },
  button: {
    backgroundColor: '#4CAF50', // Green
  }
});

export default HomeScreen;
