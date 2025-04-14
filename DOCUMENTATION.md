# WordPecker Uygulama Dokümantasyonu

## Genel Bakış
WordPecker, kullanıcıların kendi kelime listelerini oluşturup yönetebilecekleri, bu kelimelerle alıştırma yapabilecekleri ve öğrenme ilerlemelerini takip edebilecekleri kapsamlı bir dil öğrenme uygulamasıdır. Uygulama, React Native ve Expo kullanılarak geliştirilmiştir ve hem iOS hem de Android platformlarında çalışmaktadır.

## Özellikler

### 1. Kullanıcı Girişi
Kullanıcıların uygulamaya güvenli bir şekilde giriş yapmasını ve kişisel verilerini yönetmesini sağlar.

- E-posta/şifre ile kullanıcı kaydı
- E-posta/şifre ile giriş
- Şifre kurtarma
- Kullanıcı profili görüntüleme ve yönetimi
- Oturum yönetimi
- Güvenli token saklama

### 2. Kelime Listeleri
Kullanıcının oluşturduğu tüm kelime listelerini detayları ve yönetim seçenekleriyle görüntüleme.

- Tüm listeleri önizleme bilgileriyle gösterme
- Liste sıralama ve filtreleme seçenekleri
- Hızlı eylemler (öğrenme, test, detaylar)
- İlerleme göstergeleri
- Yenileme ve sayfalama

### 3. Liste Oluştur
İsim, açıklama ve bağlam bilgileriyle yeni kelime listesi oluşturma.

- Doğrulama ile liste oluşturma formu
- İsteğe bağlı kaynak belirtme alanı
- Liste için dil seçimi
- Oluşturma sonrası kelime ekleme seçeneği
- Yaygın liste türleri için şablonlar

### 4. Kelime Ekle
Mevcut listeye anlamları ve bağlam örnekleriyle yeni kelimeler ekleme.

- Otomatik tamamlama önerileriyle kelime ekleme formu
- API ile otomatik anlam getirme
- Toplu kelime ekleme özelliği
- Bağlam örneği alanı
- Resim/telaffuz ilişkilendirme

### 5. Öğrenme Modu
Duolingo tarzı alıştırmalarla liste kelimelerini öğrenme deneyimi.

- Çoktan seçmeli alıştırmalar
- Oturum sırasında ilerleme takibi
- Motivasyon için seri sayacı
- Cevaplara geri bildirim
- Oturum devamı ve geçmişi
- Çeşitli alıştırma türleri

### 6. Test Modu
Öğrenilen kelimeleri test etme ve bilgi seviyesini ölçme.

- Öğrenme modundan daha zorlu sorular
- Puan takibi ve geçmişi
- Süre sınırı seçeneği
- Yanlış cevapları gözden geçirme
- Test sonuç özeti
- Sonuçları paylaşma özelliği

### 7. Liste Detayları
Kelime listesinin tüm detaylarını görüntüleme ve yönetme.

- Listedeki tüm kelimeleri anlamlarıyla gösterme
- Kelime düzenleme ve silme
- Liste bilgilerini düzenleme
- İlerleme istatistikleri
- Öğrenme/Test modu başlatma seçenekleri
- Kelime sıralama ve filtreleme

### 8. İlerleme Takibi
Kullanıcının öğrenme performansını takip etme ve analiz etme.

- Genel öğrenme istatistikleri
- Liste bazında ilerleme görünümü
- Kelime hakimiyet göstergeleri
- İlerleme geçmişi grafikleri
- Öğrenme serileri ve başarılar
- Önerilen tekrar kelimeleri

### 9. Arama
Uygulama içeriğinde arama yapma ve sonuçları filtreleme.

- Tüm içerikte genel arama
- Liste, tarih, ilerleme seviyesine göre filtreleme
- Son aramalar geçmişi
- Sesli arama özelliği
- Önerilen arama terimleri
- Arama sonuçlarından doğrudan eylemler

### 10. Ayarlar
Uygulama ayarlarını kişiselleştirme ve yönetme.

- Tema ve görünüm ayarları
- Bildirim tercihleri
- Varsayılan liste seçenekleri
- Öğrenme oturumu yapılandırmaları
- Veri yönetimi (dışa/içe aktarma/temizleme)
- Hesap ayarları entegrasyonu

### 11. Kamera ile Kelime Tarama (Yenilikçi Özellik)
Kamera kullanarak basılı metinlerden kelime tarama ve listeye ekleme.

- Kamera erişimi ve OCR entegrasyonu
- Metin tanıma algoritması
- Kelime seçme ve düzenleme arayüzü
- Tanınan kelimeleri listeye ekleme mekanizması
- Performans optimizasyonu

### 12. Sesli Komut ve Telaffuz (Yenilikçi Özellik)
Sesli komutlarla uygulamayı kontrol etme ve telaffuz pratiği yapma.

- Ses tanıma API entegrasyonu
- Sesli komut sistemi
- Telaffuz değerlendirme mekanizması
- Sesli geri bildirim sistemi
- Erişilebilirlik özellikleri

## Teknik Mimari

### Kullanılan Teknolojiler
- **React Native**: Mobil uygulama geliştirme çerçevesi
- **Expo**: React Native geliştirme araçları ve kütüphaneleri
- **TypeScript**: Tip güvenliği sağlayan JavaScript üst kümesi
- **React Navigation**: Ekranlar arası gezinme
- **React Native Paper**: UI bileşenleri
- **AsyncStorage**: Yerel veri depolama
- **Axios**: HTTP istekleri
- **Tesseract.js**: OCR (Optik Karakter Tanıma)
- **Expo Camera**: Kamera erişimi
- **Expo Speech**: Metin-konuşma dönüşümü
- **Expo AV**: Ses kayıt ve oynatma

### Proje Yapısı
```
wordpecker/
├── App.tsx                # Ana uygulama bileşeni
├── src/
│   ├── api/               # API servisleri
│   │   └── apiService.ts  # API istekleri
│   ├── context/           # React Context
│   │   └── AuthContext.tsx # Kimlik doğrulama context'i
│   ├── screens/           # Ekran bileşenleri
│   │   ├── auth/          # Kimlik doğrulama ekranları
│   │   ├── camera/        # Kamera tarama ekranları
│   │   ├── details/       # Liste detay ekranları
│   │   ├── learning/      # Öğrenme modu ekranları
│   │   ├── lists/         # Liste ekranları
│   │   ├── progress/      # İlerleme takibi ekranları
│   │   ├── search/        # Arama ekranları
│   │   ├── settings/      # Ayarlar ekranları
│   │   ├── test/          # Test modu ekranları
│   │   ├── voice/         # Sesli komut ekranları
│   │   └── words/         # Kelime yönetimi ekranları
│   ├── styles/            # Stil tanımları
│   ├── types/             # TypeScript tip tanımları
│   └── utils/             # Yardımcı fonksiyonlar
│       ├── ocrService.ts  # OCR servisi
│       └── speechService.ts # Konuşma servisi
└── assets/                # Resimler, fontlar vb.
```

### Veri Modelleri

#### User
```typescript
interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
}
```

#### WordList
```typescript
interface WordList {
  id: string;
  name: string;
  description: string;
  context?: string;
  source?: string;
  language?: string;
  createdAt: string;
  wordCount: number;
  progress: number;
}
```

#### Word
```typescript
interface Word {
  id: string;
  listId: string;
  value: string;
  meaning: string;
  context?: string;
  createdAt: string;
  imageUrl?: string;
  pronunciationUrl?: string;
}
```

#### Exercise
```typescript
interface Exercise {
  id: string;
  type: 'multiple_choice' | 'fill_blank' | 'match' | 'write';
  question: string;
  options?: string[];
  correctAnswer: string;
}
```

#### Test
```typescript
interface Test {
  id: string;
  listId: string;
  exercises: Exercise[];
  timeLimit?: number;
  createdAt: string;
}
```

#### Progress
```typescript
interface Progress {
  userId: string;
  listId: string;
  wordId?: string;
  score: number;
  lastPracticed: string;
  streak: number;
  masteryLevel: number; // 0-5 scale
}
```

#### Settings
```typescript
interface Settings {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  defaultLanguage: string;
  sessionLength: number;
  autoPlayPronunciation: boolean;
}
```

## Kullanım Kılavuzu

### Başlangıç
1. Uygulamayı açın
2. Kayıt ol butonuna tıklayarak yeni bir hesap oluşturun veya mevcut hesabınızla giriş yapın
3. Ana ekrandan istediğiniz özelliğe erişebilirsiniz

### Kelime Listesi Oluşturma
1. Ana ekrandan "Liste Oluştur" butonuna tıklayın
2. Liste adı, açıklama ve dil seçimi gibi bilgileri girin
3. İsterseniz şablonlardan birini seçin
4. "Oluştur" butonuna tıklayın

### Kelime Ekleme
1. Kelime listesi ekranından bir liste seçin
2. "Kelime Ekle" butonuna tıklayın
3. Kelime, anlam ve isteğe bağlı olarak bağlam bilgilerini girin
4. "Ekle" butonuna tıklayın
5. Toplu kelime eklemek için "Toplu Ekle" seçeneğini kullanabilirsiniz

### Öğrenme Modu
1. Kelime listesi ekranından bir liste seçin
2. "Öğren" butonuna tıklayın
3. Çoktan seçmeli sorulara cevap verin
4. İlerlemenizi takip edin ve oturum sonunda sonuçlarınızı görün

### Test Modu
1. Kelime listesi ekranından bir liste seçin
2. "Test Et" butonuna tıklayın
3. Süre sınırını ve zorluk seviyesini ayarlayın
4. Soruları cevaplayın
5. Test sonunda sonuçlarınızı görün ve isterseniz paylaşın

### Kamera ile Kelime Tarama
1. Ana ekrandan "Kamera ile Tara" butonuna tıklayın
2. Kamera izni verin
3. Taramak istediğiniz metni çerçeve içine alın ve fotoğraf çekin
4. Tanınan kelimeler listelenecektir
5. İstediğiniz kelimeleri seçin ve bir listeye ekleyin

### Sesli Komut ve Telaffuz
1. Ana ekrandan "Sesli Komutlar" butonuna tıklayın
2. Mikrofon izni verin
3. Mikrofon butonuna tıklayarak komut verin (örn. "listeleri göster")
4. Telaffuz pratiği için "Telaffuz Moduna Geç" butonuna tıklayın
5. Bir kelime seçin, "Dinle" butonuna tıklayarak doğru telaffuzu dinleyin
6. "Telaffuz Et" butonuna tıklayarak kendi telaffuzunuzu kaydedin ve değerlendirin

## Sorun Giderme

### Uygulama Açılmıyor
- Cihazınızın işletim sisteminin güncel olduğundan emin olun
- Uygulamayı kaldırıp yeniden yükleyin
- Cihazınızı yeniden başlatın

### Giriş Yapılamıyor
- İnternet bağlantınızı kontrol edin
- E-posta ve şifrenizi doğru girdiğinizden emin olun
- Şifremi unuttum seçeneğini kullanarak şifrenizi sıfırlayın

### Kamera Çalışmıyor
- Kamera izinlerini kontrol edin
- Uygulamayı yeniden başlatın
- Cihazınızın kamerasının çalıştığından emin olun

### Sesli Komutlar Tanınmıyor
- Mikrofon izinlerini kontrol edin
- Sessiz bir ortamda tekrar deneyin
- Daha yavaş ve net konuşun

## Geliştirici Notları

### Yeni Özellik Ekleme
Yeni bir özellik eklemek için:
1. `src/screens` altında yeni bir klasör oluşturun
2. Ekran bileşenlerini geliştirin
3. `src/types/index.ts` dosyasına gerekli tipleri ekleyin
4. `App.tsx` dosyasında navigasyon yapısına ekleyin
5. Gerekirse `src/api/apiService.ts` dosyasına yeni API fonksiyonları ekleyin

### API Entegrasyonu
Gerçek bir backend ile entegrasyon için:
1. `src/api/apiService.ts` dosyasındaki simüle edilmiş API çağrılarını gerçek API çağrılarıyla değiştirin
2. Token yönetimini gerçek API'ye uygun şekilde güncelleyin
3. Hata yönetimini geliştirin

### Performans İyileştirmeleri
- Büyük listelerde sayfalama kullanın
- Görüntüleri optimize edin
- Gereksiz yeniden render'ları önleyin
- Memo ve useCallback kullanın

## Sürüm Geçmişi

### v1.0.0 (14 Nisan 2025)
- İlk sürüm
- Tüm temel özellikler uygulandı
- Kamera ile Kelime Tarama özelliği eklendi
- Sesli Komut ve Telaffuz özelliği eklendi

## İletişim ve Destek
Sorularınız veya geri bildirimleriniz için:
- E-posta: support@wordpecker.example.com
- Web sitesi: https://wordpecker.example.com
- GitHub: https://github.com/aigile-era/WordPecker
