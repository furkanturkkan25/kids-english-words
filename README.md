# Kelime Bahçesi

Dinle, bak, söyle. Doğru kelimede bahçe parası birikir. Parayla Tomo’ya yiyecek, oyuncak, renk ve şapka alınır.

![Karşılama](ekran/ana.png)

![Keşif haritası](ekran/harita.png)

![Kelime](ekran/kelime.png)

![Tomo](ekran/tomo.png)

![Market](ekran/market.png)

## Kurulum

```bash
cd kids-english-words
node server/gateway.mjs
```

Aç: http://127.0.0.1:5174

`PORT` portu değiştirir. `npm start` aynı kapıyı açar.

İlk açılışta kelime listesi disk önbelleğinden gelir. Önbellek yoksa servis listeyi ağdan kurmayı dener; olmazsa gömülü yedek seviyeler kullanılır.

## Nasıl kuruldu

Tek **Node** süreci üç işi bir kapıdan verir:

| Yol | İş |
| --- | --- |
| `GET /api/levels` | Cambridge YLE seviyeleri. Disk önbelleği `cache/levels.json`. |
| `GET /api/media?word=cat` | Kelime görseli ve Türkçe karşılık. Görsel Wikipedia’dan, çeviri gömülü sözlükten ya da ağdan. |
| `GET /api/shop` | Market kataloğu ve ödül sabitleri. |
| `GET /api/health` | Kapı ayakta mı. |

İstemci `public/` altında çerçevesiz ES modülleri: `api.js`, `state.js`, `speech.js`, `screens/`. Konuşma tanıma tarayıcının Web Speech API’si ile çalışır; Chrome veya Edge daha sorunsuzdur. İlerleme bu tarayıcının kendi kaydında durur.

## iOS

Aynı akışın SwiftUI kopyası `KelimeBahcesi-iOS/` içindedir.

```bash
open KelimeBahcesi-iOS/KelimeBahcesi.xcodeproj
```
