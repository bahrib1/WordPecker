# WordPecker Ayarlar Ekranı Sorunu Düzeltme Raporu

## Sorun Özeti
Ayarlar ekranına telefondan tıklandığında şu hata alınıyordu:
```
(NOBRIDGE) ERROR  Load settings error: [TypeError: _apiService.default.getSettings is not a function (it is undefined)] [Component Stack]
```

## Sorunun Analizi
Sorunu analiz ettiğimde, `SettingsScreen.tsx` dosyasında `apiService.getSettings` fonksiyonunun çağrıldığını, ancak `apiService.ts` dosyasında bu fonksiyonun farklı bir isimle tanımlandığını tespit ettim. Ayarlar ekranı, aşağıdaki fonksiyonları kullanmaya çalışıyordu:

1. `getSettings`: Kullanıcı ayarlarını getirmek için
2. `updateSettings`: Kullanıcı ayarlarını güncellemek için
3. `clearUserData`: Kullanıcı verilerini temizlemek için

Ancak `apiService.ts` dosyasında bu fonksiyonlar farklı isimlerle tanımlanmıştı veya hiç tanımlanmamıştı:
- `getSettings` yerine `getUserSettings` tanımlanmıştı
- `updateSettings` yerine `updateUserSettings` tanımlanmıştı
- `clearUserData` fonksiyonu hiç tanımlanmamıştı

## Yapılan Değişiklikler

### 1. Fonksiyon Takma Adlarının Eklenmesi
`apiService.ts` dosyasındaki export ifadesine, mevcut fonksiyonlar için takma adlar ekledim:

```javascript
export default {
  // ... diğer fonksiyonlar ...
  
  // Settings
  getUserSettings,
  updateUserSettings,
  getSettings: getUserSettings,    // Takma ad eklendi
  updateSettings: updateUserSettings,  // Takma ad eklendi
  clearUserData
};
```

Bu değişiklik, `SettingsScreen` bileşeninin `getSettings` ve `updateSettings` fonksiyonlarını çağırdığında, aslında `getUserSettings` ve `updateUserSettings` fonksiyonlarının çalıştırılmasını sağlar.

### 2. Eksik clearUserData Fonksiyonunun Eklenmesi
`apiService.ts` dosyasına eksik olan `clearUserData` fonksiyonunu ekledim:

```javascript
// Clear user data
const clearUserData = async (): Promise<void> => {
  try {
    const token = await getToken();
    
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    // In a real app, this would be an API call
    // await axios.delete(`${API_URL}/user/data`, {
    //   headers: { Authorization: `Bearer ${token}` }
    // });
    
    // For demo, simulate API call
    return simulateApiCall(undefined, 1000);
  } catch (error) {
    console.error('Clear user data error:', error);
    throw error;
  }
};
```

Bu fonksiyon, kullanıcının tüm verilerini temizlemek için bir API çağrısı simüle eder.

## Sonuç
Bu değişikliklerle, ayarlar ekranındaki `_apiService.default.getSettings is not a function` hatası çözülmüştür. Artık ayarlar ekranı düzgün bir şekilde yüklenecek ve kullanıcılar ayarlarını görüntüleyebilecek, değiştirebilecek ve verilerini temizleyebileceklerdir.

Yapılan değişiklikler, mevcut kod yapısını bozmadan ve minimum değişiklikle sorunu çözmek için takma ad (alias) yaklaşımını kullanmıştır. Bu, kodun geri kalanının değiştirilmesine gerek kalmadan sorunun çözülmesini sağlar.
