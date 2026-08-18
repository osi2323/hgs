# Araç İşlem Merkezi — Kurumsal V5 CMS

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
