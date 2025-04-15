# Kelime Kartları (Flashcards) Özelliği

## Genel Bakış
Kelime Kartları özelliği, kullanıcıların kelime listelerindeki kelimeleri etkileşimli kartlar aracılığıyla öğrenmelerini sağlar. Kullanıcılar kelime kartını görebilir ve karta dokunarak kelimenin anlamını görebilirler.

## Özellikler

### Temel İşlevler
- Kullanıcıların mevcut kelime listelerinden seçim yapabilmesi
- Seçilen listedeki kelimelerin kartlar halinde gösterilmesi
- Karta dokunarak ön yüzden (kelime) arka yüze (anlam) geçiş yapabilme
- Kartlar arasında ileri ve geri gezinebilme
- İlerleme durumunu takip edebilme

### Kullanıcı Arayüzü
- Animasyonlu kart çevirme efekti
- İlerleme çubuğu ile mevcut durumu görüntüleme
- Listeyi tamamladıktan sonra tebrik mesajı ve yeniden başlatma seçeneği
- Boş liste durumunda uygun geribildirim ve kelime ekleme seçeneği

## Kullanım
1. Ana ekrandan veya Arama ekranından "Kelime Kartları" seçeneğine tıklayın
2. Çalışmak istediğiniz kelime listesini seçin
3. Kelime kartını göreceksiniz, kartın ön yüzünde kelime bulunur
4. Kartın anlamını görmek için karta dokunun
5. Sonraki karta geçmek için sağ ok butonuna, önceki karta dönmek için sol ok butonuna basın
6. Tüm kartları tamamladığınızda, yeniden başlatabilir veya listelere dönebilirsiniz

## Teknik Detaylar
- React Native Animated API kullanılarak kart çevirme animasyonu
- Dokunmatik ekran etkileşimleri için TouchableOpacity bileşeni
- Kelime listesi ve kelime verilerini almak için apiService entegrasyonu
- İlerleme takibi için durum yönetimi
- Duyarlı tasarım için Dimensions API kullanımı

## Gelecek Geliştirmeler
- Kelime öğrenme performansını kaydetme
- Zorluk çekilen kelimeleri işaretleme ve tekrar etme
- Sesli okuma özelliği
- Özelleştirilebilir kart tasarımları
- Öğrenme algoritmalarıyla akıllı tekrar zamanlaması
