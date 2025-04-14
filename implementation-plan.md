# WordPecker Uygulama Geliştirme Planı

## Genel Bakış
Bu doküman, WordPecker dil öğrenme uygulamasının geliştirilmesi için kapsamlı bir plan sunmaktadır. Uygulama, React Native ve Expo kullanılarak geliştirilecek ve kullanıcıların kendi kelime listelerini oluşturup yönetebilecekleri, bu kelimelerle alıştırma yapabilecekleri ve öğrenme ilerlemelerini takip edebilecekleri bir mobil uygulama olacaktır.

## Özellik Gereksinimleri ve Uygulama Planı

### 1. Kullanıcı Girişi
**Beklenen İşlevsellikler:**
- E-posta/şifre ile kullanıcı kaydı
- E-posta/şifre ile giriş
- Şifre kurtarma
- Kullanıcı profili görüntüleme ve yönetimi
- Oturum yönetimi
- Güvenli token saklama

**Uygulama Planı:**
1. AuthContext oluşturma (oturum durumu yönetimi için)
2. AsyncStorage entegrasyonu (token saklama için)
3. Giriş ekranı geliştirme
4. Kayıt ekranı geliştirme
5. Şifre sıfırlama ekranı geliştirme
6. Profil ekranı geliştirme
7. API servisi entegrasyonu

### 2. Kelime Listeleri
**Beklenen İşlevsellikler:**
- Tüm listeleri önizleme bilgileriyle gösterme
- Liste sıralama ve filtreleme seçenekleri
- Hızlı eylemler (öğrenme, test, detaylar)
- İlerleme göstergeleri
- Yenileme ve sayfalama

**Uygulama Planı:**
1. Kelime listesi veri modelini oluşturma
2. API servisi entegrasyonu (liste getirme)
3. Liste kartı bileşeni geliştirme
4. Filtreleme ve sıralama bileşenleri geliştirme
5. Arama bileşeni geliştirme
6. Yenileme ve sayfalama mekanizması ekleme
7. İlerleme göstergeleri ekleme

### 3. Liste Oluştur
**Beklenen İşlevsellikler:**
- Doğrulama ile liste oluşturma formu
- İsteğe bağlı kaynak belirtme alanı
- Liste için dil seçimi
- Oluşturma sonrası kelime ekleme seçeneği
- Yaygın liste türleri için şablonlar

**Uygulama Planı:**
1. Liste oluşturma formunu geliştirme
2. Form doğrulama mekanizması ekleme
3. Dil seçimi bileşeni geliştirme
4. Şablon seçimi bileşeni geliştirme
5. API servisi entegrasyonu (liste oluşturma)
6. Oluşturma sonrası yönlendirme mekanizması ekleme

### 4. Kelime Ekle
**Beklenen İşlevsellikler:**
- Otomatik tamamlama önerileriyle kelime ekleme formu
- API ile otomatik anlam getirme
- Toplu kelime ekleme özelliği
- Bağlam örneği alanı
- Resim/telaffuz ilişkilendirme (opsiyonel)

**Uygulama Planı:**
1. Kelime ekleme formunu geliştirme
2. Otomatik tamamlama mekanizması ekleme
3. Çeviri API entegrasyonu
4. Toplu kelime ekleme arayüzü geliştirme
5. API servisi entegrasyonu (kelime ekleme)
6. Resim/telaffuz ekleme mekanizması geliştirme (opsiyonel)

### 5. Öğrenme Modu
**Beklenen İşlevsellikler:**
- Çoktan seçmeli alıştırmalar
- Oturum sırasında ilerleme takibi
- Motivasyon için seri sayacı
- Cevaplara geri bildirim
- Oturum devamı ve geçmişi
- Çeşitli alıştırma türleri

**Uygulama Planı:**
1. Alıştırma veri modelini oluşturma
2. Çoktan seçmeli alıştırma bileşeni geliştirme
3. İlerleme takibi mekanizması ekleme
4. Seri sayacı ve puan sistemi geliştirme
5. Geri bildirim mekanizması ekleme
6. Oturum geçmişi saklama mekanizması geliştirme
7. API servisi entegrasyonu (alıştırma getirme)

### 6. Test Modu
**Beklenen İşlevsellikler:**
- Öğrenme modundan daha zorlu sorular
- Puan takibi ve geçmişi
- Süre sınırı seçeneği
- Yanlış cevapları gözden geçirme
- Test sonuç özeti
- Sonuçları paylaşma özelliği

**Uygulama Planı:**
1. Test veri modelini oluşturma
2. Zorlu soru türleri geliştirme
3. Süre sınırı mekanizması ekleme
4. Puan takibi sistemi geliştirme
5. Sonuç özeti ekranı geliştirme
6. Paylaşım mekanizması ekleme
7. API servisi entegrasyonu (test getirme)

### 7. Liste Detayları
**Beklenen İşlevsellikler:**
- Listedeki tüm kelimeleri anlamlarıyla gösterme
- Kelime düzenleme ve silme
- Liste bilgilerini düzenleme
- İlerleme istatistikleri
- Öğrenme/Test modu başlatma seçenekleri
- Kelime sıralama ve filtreleme

**Uygulama Planı:**
1. Liste detay ekranını geliştirme
2. Kelime listesi bileşeni geliştirme
3. Kelime düzenleme/silme mekanizması ekleme
4. Liste bilgileri düzenleme formunu geliştirme
5. İlerleme istatistikleri bileşeni geliştirme
6. Sıralama ve filtreleme mekanizması ekleme
7. API servisi entegrasyonu (liste detayları getirme)

### 8. İlerleme Takibi
**Beklenen İşlevsellikler:**
- Genel öğrenme istatistikleri
- Liste bazında ilerleme görünümü
- Kelime hakimiyet göstergeleri
- İlerleme geçmişi grafikleri
- Öğrenme serileri ve başarılar
- Önerilen tekrar kelimeleri

**Uygulama Planı:**
1. İlerleme veri modelini oluşturma
2. Genel istatistikler ekranını geliştirme
3. Liste bazında ilerleme bileşeni geliştirme
4. Grafik bileşenleri geliştirme
5. Başarı sistemi geliştirme
6. Kelime önerme algoritması geliştirme
7. API servisi entegrasyonu (ilerleme verileri getirme)

### 9. Arama
**Beklenen İşlevsellikler:**
- Tüm içerikte genel arama
- Liste, tarih, ilerleme seviyesine göre filtreleme
- Son aramalar geçmişi
- Sesli arama özelliği
- Önerilen arama terimleri
- Arama sonuçlarından doğrudan eylemler

**Uygulama Planı:**
1. Arama ekranını geliştirme
2. Filtreleme mekanizması ekleme
3. Arama geçmişi saklama mekanizması geliştirme
4. Sesli arama entegrasyonu
5. Öneri algoritması geliştirme
6. Hızlı eylem menüsü geliştirme
7. API servisi entegrasyonu (arama)

### 10. Ayarlar
**Beklenen İşlevsellikler:**
- Tema ve görünüm ayarları
- Bildirim tercihleri
- Varsayılan liste seçenekleri
- Öğrenme oturumu yapılandırmaları
- Veri yönetimi (dışa/içe aktarma/temizleme)
- Hesap ayarları entegrasyonu

**Uygulama Planı:**
1. Ayarlar ekranını geliştirme
2. Tema değiştirme mekanizması ekleme
3. Bildirim yönetimi geliştirme
4. Varsayılan seçenekler yönetimi geliştirme
5. Veri dışa/içe aktarma mekanizması geliştirme
6. Hesap ayarları bileşeni geliştirme
7. API servisi entegrasyonu (ayarlar)

### 11. Yenilikçi Özellik 1: Kamera ile Kelime Tarama
**Beklenen İşlevsellikler:**
- Temel uygulamada olmayan benzersiz değer önerisi
- Mobil özelliklerin kullanımı
- Mevcut özelliklerle entegrasyon
- Kullanıcı dostu deneyim
- Performans değerlendirmesi

**Uygulama Planı:**
1. Kamera erişimi ve OCR (Optik Karakter Tanıma) entegrasyonu
2. Metin tanıma algoritması geliştirme
3. Kelime seçme ve düzenleme arayüzü geliştirme
4. Tanınan kelimeleri listeye ekleme mekanizması
5. Performans optimizasyonu

### 12. Yenilikçi Özellik 2: Sesli Komut ve Telaffuz
**Beklenen İşlevsellikler:**
- Öğrenme etkinliğini artıran özgün fikir
- Mobil öncelikli tasarım yaklaşımı
- Uygulama iş akışıyla entegrasyon
- Erişilebilir ve sezgisel arayüz
- Kaynak verimli uygulama

**Uygulama Planı:**
1. Ses tanıma API entegrasyonu
2. Sesli komut sistemi geliştirme
3. Telaffuz değerlendirme mekanizması geliştirme
4. Sesli geri bildirim sistemi geliştirme
5. Erişilebilirlik özelliklerini ekleme

## Teknik Mimari

### Veri Modelleri
1. **User**: Kullanıcı bilgileri
2. **WordList**: Kelime listesi bilgileri
3. **Word**: Kelime bilgileri
4. **Exercise**: Alıştırma bilgileri
5. **Test**: Test bilgileri
6. **Progress**: İlerleme bilgileri
7. **Settings**: Ayar bilgileri

### Servisler
1. **AuthService**: Kimlik doğrulama işlemleri
2. **ListService**: Liste işlemleri
3. **WordService**: Kelime işlemleri
4. **ExerciseService**: Alıştırma işlemleri
5. **TestService**: Test işlemleri
6. **ProgressService**: İlerleme takibi işlemleri
7. **SearchService**: Arama işlemleri
8. **SettingsService**: Ayar işlemleri
9. **TranslationService**: Çeviri işlemleri
10. **OCRService**: Optik karakter tanıma işlemleri
11. **SpeechService**: Ses tanıma ve sentezleme işlemleri

### Bileşenler
1. **AuthComponents**: Kimlik doğrulama bileşenleri
2. **ListComponents**: Liste bileşenleri
3. **WordComponents**: Kelime bileşenleri
4. **ExerciseComponents**: Alıştırma bileşenleri
5. **TestComponents**: Test bileşenleri
6. **ProgressComponents**: İlerleme takibi bileşenleri
7. **SearchComponents**: Arama bileşenleri
8. **SettingsComponents**: Ayar bileşenleri
9. **UIComponents**: Genel UI bileşenleri

## Test Stratejisi
1. **Birim Testleri**: Temel bileşenler ve servisler için
2. **Entegrasyon Testleri**: Bileşenler arası etkileşimler için
3. **UI Testleri**: Kullanıcı arayüzü için
4. **Performans Testleri**: Özellikle yenilikçi özellikler için

## Zaman Çizelgesi
1. **Hafta 1**: Temel altyapı ve kullanıcı girişi
2. **Hafta 2**: Kelime listeleri ve liste oluşturma
3. **Hafta 3**: Kelime ekleme ve öğrenme modu
4. **Hafta 4**: Test modu ve liste detayları
5. **Hafta 5**: İlerleme takibi ve arama
6. **Hafta 6**: Ayarlar ve yenilikçi özellikler
7. **Hafta 7**: Test, hata düzeltme ve optimizasyon
8. **Hafta 8**: Dokümantasyon ve teslim

## Sonuç
Bu plan, WordPecker uygulamasının tüm gereksinimlerini karşılayacak şekilde tasarlanmıştır. Her özellik için detaylı bir uygulama planı sunulmuş ve genel mimari yapı belirlenmiştir. Bu plan doğrultusunda geliştirme süreci sistematik bir şekilde ilerleyecek ve tüm özellikler başarıyla uygulanacaktır.
