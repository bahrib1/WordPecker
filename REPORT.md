# WordPecker Uygulama Geliştirme Raporu

## Özet

Bu rapor, WordPecker dil öğrenme uygulamasının geliştirilmesi sürecini ve uygulanan özellikleri detaylandırmaktadır. Proje, React Native ve Expo kullanılarak geliştirilmiş olup, kullanıcıların kendi kelime listelerini oluşturup yönetebilecekleri, bu kelimelerle alıştırma yapabilecekleri ve öğrenme ilerlemelerini takip edebilecekleri bir mobil uygulama sunmaktadır.

## Uygulanan Özellikler

### 1. Kullanıcı Girişi

Kullanıcı girişi özelliği, kullanıcıların uygulamaya güvenli bir şekilde erişmesini sağlayan kapsamlı bir kimlik doğrulama sistemi içerir:

- **E-posta/şifre ile kullanıcı kaydı**: Kullanıcılar ad, e-posta ve şifre bilgileriyle kayıt olabilir.
- **E-posta/şifre ile giriş**: Kayıtlı kullanıcılar e-posta ve şifreleriyle giriş yapabilir.
- **Şifre kurtarma**: Kullanıcılar şifrelerini unuttukları durumda e-posta yoluyla sıfırlama yapabilir.
- **Kullanıcı profili yönetimi**: Kullanıcı bilgileri güvenli bir şekilde saklanır ve yönetilir.
- **Oturum yönetimi**: Kullanıcı oturumları güvenli bir şekilde yönetilir.
- **Güvenli token saklama**: Kimlik doğrulama token'ları AsyncStorage kullanılarak güvenli bir şekilde saklanır.

### 2. Kelime Listeleri

Kelime listeleri özelliği, kullanıcıların kelime listelerini görüntülemesini ve yönetmesini sağlar:

- **Tüm listeleri önizleme bilgileriyle gösterme**: Kullanıcının tüm kelime listeleri, isim, açıklama, kelime sayısı ve oluşturulma tarihi gibi bilgilerle görüntülenir.
- **Liste sıralama ve filtreleme seçenekleri**: Listeler isme, tarihe veya kelime sayısına göre sıralanabilir.
- **Hızlı eylemler**: Her liste için öğrenme, test ve detaylar gibi hızlı erişim butonları bulunur.
- **İlerleme göstergeleri**: Her liste için kullanıcının öğrenme ilerlemesi görsel olarak gösterilir.
- **Yenileme ve sayfalama**: Kullanıcılar listeleri yenileyebilir ve büyük liste setlerinde gezinebilir.

## Teknik Detaylar

### Kullanılan Teknolojiler

- **React Native & Expo**: Mobil uygulama geliştirme çerçevesi
- **TypeScript**: Tip güvenliği için programlama dili
- **React Navigation**: Ekranlar arası gezinme
- **React Native Paper**: UI bileşenleri
- **AsyncStorage**: Yerel veri depolama
- **Context API**: Durum yönetimi
- **Axios**: HTTP istekleri

### Mimari Yapı

Uygulama, aşağıdaki mimari yapıyı takip etmektedir:

```
WordPecker/
├── assets/              # Uygulama ikonları ve görselleri
├── src/
│   ├── api/             # API servisi ve veri çekme
│   ├── components/      # Yeniden kullanılabilir UI bileşenleri
│   ├── context/         # React Context sağlayıcıları
│   ├── hooks/           # Özel React hook'ları
│   ├── navigation/      # Navigasyon yapılandırması
│   ├── screens/         # Ana uygulama ekranları
│   │   ├── auth/        # Kimlik doğrulama ekranları
│   │   ├── lists/       # Liste ekranları
│   │   └── placeholders/# Geliştirme için yer tutucu ekranlar
│   ├── services/        # İş mantığı servisleri
│   ├── styles/          # Stil ve tema
│   ├── types/           # TypeScript tip tanımlamaları
│   └── utils/           # Yardımcı fonksiyonlar
└── App.tsx              # Ana uygulama bileşeni
```

### Uygulama Akışı

1. **Başlangıç**: Uygulama başlatıldığında, AuthContext kullanıcının oturum durumunu kontrol eder.
2. **Kimlik Doğrulama**: Kullanıcı oturum açmamışsa, giriş ekranına yönlendirilir.
3. **Ana Ekran**: Kullanıcı oturum açtıktan sonra, ana ekrana yönlendirilir.
4. **Kelime Listeleri**: Kullanıcı, kelime listeleri ekranında tüm listelerini görüntüleyebilir.
5. **Liste İşlemleri**: Kullanıcı, listelerle ilgili çeşitli işlemleri gerçekleştirebilir (öğrenme, test, detaylar).

## Test Sonuçları

Uygulanan özellikler, aşağıdaki test senaryoları kullanılarak doğrulanmıştır:

### Kullanıcı Girişi Testleri

- **Kayıt**: Yeni kullanıcı kaydı başarıyla oluşturulabilir.
- **Giriş**: Kayıtlı kullanıcılar başarıyla giriş yapabilir.
- **Doğrulama**: Form doğrulama kuralları düzgün çalışır.
- **Hata Yönetimi**: Hatalı giriş denemeleri uygun şekilde ele alınır.
- **Şifre Sıfırlama**: Şifre sıfırlama işlemi başarıyla çalışır.

### Kelime Listeleri Testleri

- **Liste Görüntüleme**: Tüm listeler başarıyla görüntülenir.
- **Sıralama ve Filtreleme**: Listeler farklı kriterlere göre sıralanabilir.
- **Arama**: Liste araması düzgün çalışır.
- **Yenileme**: Liste yenileme işlevi düzgün çalışır.
- **Hızlı Eylemler**: Liste eylemleri (öğrenme, test, detaylar) düzgün çalışır.

## Kullanım Kılavuzu

### Kullanıcı Girişi

1. Uygulamayı açın
2. Giriş ekranında e-posta ve şifrenizi girin
3. "Giriş Yap" butonuna tıklayın
4. Hesabınız yoksa "Kayıt Ol" bağlantısına tıklayın
5. Şifrenizi unuttuysanız "Şifremi Unuttum" bağlantısına tıklayın

### Kelime Listeleri

1. Giriş yaptıktan sonra kelime listeleri ekranına yönlendirileceksiniz
2. Mevcut listelerinizi görüntüleyin
3. Listeleri isme, tarihe veya kelime sayısına göre sıralayın
4. Arama çubuğunu kullanarak listelerde arama yapın
5. Her liste kartındaki butonları kullanarak:
   - "Öğren" butonu ile öğrenme modunu başlatın
   - "Test Et" butonu ile test modunu başlatın
   - "Detaylar" butonu ile liste detaylarını görüntüleyin
6. Sağ alt köşedeki "+" butonu ile yeni liste oluşturun

## Sonuç ve Öneriler

WordPecker uygulamasının ilk iki temel özelliği (Kullanıcı Girişi ve Kelime Listeleri) başarıyla uygulanmıştır. Bu özellikler, kullanıcıların uygulamaya güvenli bir şekilde erişmesini ve kelime listelerini etkili bir şekilde yönetmesini sağlar.

### Gelecek Geliştirmeler

1. **Liste Oluşturma**: Kullanıcıların yeni kelime listeleri oluşturabilmesi
2. **Kelime Ekleme**: Mevcut listelere kelime ekleme işlevselliği
3. **Öğrenme Modu**: Kelimelerle interaktif alıştırmalar yapma
4. **Test Modu**: Öğrenilen kelimeleri test etme
5. **İlerleme Takibi**: Öğrenme ilerlemesini görselleştirme

### Yenilikçi Özellik Önerileri

1. **Kamera ile Kelime Tarama**: Kullanıcıların kitap veya makalelerden kamera kullanarak kelime tarayabilmesi
2. **Sesli Komut ve Telaffuz**: Sesli komutlarla uygulama kontrolü ve kelimelerin doğru telaffuzunu öğrenme

## Ekler

- Detaylı teknik dokümantasyon: [DOCUMENTATION.md](/home/ubuntu/wordpecker/DOCUMENTATION.md)
- Kaynak kodu: [GitHub Repository](https://github.com/aigile-era/WordPecker)
