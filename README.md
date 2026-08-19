# Araç İşlem Merkezi — Kurumsal V9 Canlı İzleme

Yeni:
- Admin panelinde `Canlı İzleme` sekmesi
- Supabase Realtime Presence ile anlık online ziyaretçi sayısı
- Ana Sayfa / HGS / KM / Hasar / Talep Bilgisi / Tamamlandı aşama sayıları
- Anlık yüzde dağılım grafikleri
- Kişisel veri taşımayan anonim presence payload
- Sayfa yenilemeden canlı güncelleme
- Yeni SQL migration gerektirmez; mevcut V8 Supabase bağlantısı yeterlidir.


Yeni:
- Talep kodu 18 hane: `1234 5678 9012 3456 78`
- Talep AA/YY alanı: `12/26`
- Admin talepler tablosunda AA/YY mor rozet
- Talep sayfasında 4 küçük logo
- 4 logo admin CMS üzerinden yüklenebilir/değiştirilebilir/silinebilir
- Talep sayfasındaki metin ve buton yazıları CMS üzerinden yönetilir
- V6 kullanan mevcut Supabase için `supabase/v7-migration.sql`


Bu sürümde iki ana çalışma yapıldı:

## 1. Tam mobil uyumluluk
- Body yatay taşmaları kapatıldı.
- Grid/flex elemanlarına `min-width: 0` uygulandı.
- Hero, header, hizmet kartları, form ekranları, talep özeti ve footer mobilde yeniden düzenlendi.
- Admin tablosu yalnızca kendi kutusu içinde yatay kayar; bütün sayfayı taşırmaz.
- 600 px ve 370 px için ayrı mobil kırılımları bulunur.

## 2. Admin içinde mini CMS
`#admin` adresinden:
- Logo yükleme / silme
- Header / banner görseli yükleme / silme
- Marka adı ve header metinleri
- Hero başlıkları, açıklamalar ve butonlar
- Güven şeridi
- Hizmet alanının tüm başlıkları
- HGS / KM / Hasar kartlarının başlık, açıklama ve görselleri
- Hizmet kartlarını tek tek gizleme
- Değerlendirme bölümü
- Bilgilendirme kutusu
- İşlem sayfasındaki metinler
- Talep sayfasındaki tüm metinler
- Başarı ekranındaki metinler
- Footer içerikleri
- Bölümleri görünür / gizli yapma
- Tema renkleri ve kart köşe yuvarlaklığı
değiştirilebilir.

Görseller prototipte tarayıcının localStorage alanında Base64 olarak tutulur. Bu yüzden panel 1.8 MB'tan büyük görselleri kabul etmez.

## Üretime geçiş
Canlı kullanımda içerikler ve görseller localStorage yerine Supabase/PostgreSQL + Storage veya kurumun içerik yönetim altyapısında tutulmalıdır. Admin paneli mutlaka kimlik doğrulama ve rol bazlı erişim ile korunmalıdır.

## Çalıştırma
```bash
npm install
npm run dev
```
