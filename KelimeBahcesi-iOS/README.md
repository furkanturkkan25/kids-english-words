# Kelime Bahçesi — iOS (SwiftUI)

Web ile aynı özellikler: kelime öğrenme, TTS, konuşma tanıma, harita, Tomo + market.

## Kurulum (bu makinede hazır)

- Xcode 26.6 (`/Applications/Xcode.app`)
- xcodegen (Homebrew)
- Proje `xcodegen` ile üretildi ve **simülatör build başarılı**
- Uygulama iPhone 17 simülatörüne kuruldu

### Tekrar çalıştır

```bash
cd kids-english-words/KelimeBahcesi-iOS
./setup-and-run.sh
```

veya:

```bash
open KelimeBahcesi.xcodeproj
```

Xcode’da Run ▶ (Signing’de Team seçmen gerekebilir; simülatörde `CODE_SIGNING_ALLOWED=NO` ile de çalışır).

### API (400+ kelime)

```bash
cd kids-english-words
npm start
```

Simülatör `http://127.0.0.1:5174` kullanır. API yoksa çevrimdışı yedek seviyeler açılır.

### (İsteğe bağlı) Sistem Xcode yolu

Terminalde kalıcı olsun diye bir kez (şifre ister):

```bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
```

Scriptler `DEVELOPER_DIR` ile zaten Xcode’u kullanır.
