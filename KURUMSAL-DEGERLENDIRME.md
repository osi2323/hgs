# Kurumsal Değerlendirme Sürümü — V2

Bu sürüm, kurumsal değerlendirmeye sunulabilecek görsel ve işlevsel prototip olarak hazırlanmıştır.

## Sunumda öne çıkarılacak noktalar
- Vatandaş odaklı 3 hizmet akışı: HGS bakiye yükleme, KM sorgulama, hasar sorgulama
- Tutarlı mobil/masaüstü kullanıcı deneyimi
- Talep özeti, durum yönetimi ve merkezi admin paneli
- Kurumsal API entegrasyonuna uygun servis yaklaşımı
- Üretim öncesi güvenlik kontrol listesi: rol bazlı yetki, audit log, rate limit, sunucu tarafı doğrulama
- KVKK açısından veri minimizasyonu ve açık bilgilendirme yaklaşımı

## Değerlendirme modu
Arayüz üzerinde “Kurumsal Değerlendirme Prototipi • Canlı Hizmet Değildir” ibaresi bulunur.
Resmî kurum logosu, resmî alan adı ve kurum destek/entegrasyon beyanları yalnızca yazılı yetkilendirme sonrası eklenmelidir.

## Üretim öncesi teknik işler
1. Supabase/PostgreSQL veya kurum içi veritabanı
2. Admin kimlik doğrulaması ve rol bazlı erişim
3. RLS / backend authorization
4. Audit log ve merkezi loglama
5. Rate limiting ve kötüye kullanım koruması
6. KVKK aydınlatma metinleri ve gerekiyorsa açık rıza
7. Gerçek kurum API entegrasyonları
8. Penetrasyon testi ve güvenlik gözden geçirmesi
