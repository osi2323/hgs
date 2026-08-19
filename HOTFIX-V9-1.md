# V9.1 Hotfix

Düzeltilen iki kritik konu:

1. V8'de eklenen 6 haneli talep alanında kullanılan `Hash` lucide ikonu import edilmemişti.
   Bu nedenle Talep Sayfası render edildiğinde React hata veriyor ve sayfa beyaz kalıyordu.

2. Canlı İzleme ve normal ziyaretçi tracker'ı aynı browser session içerisinde aynı Presence key/topic
   yaşam döngüsünü paylaşabiliyordu. V9.1'de:
   - admin ve ziyaretçi presence key'leri ayrıldı,
   - admin sayfasında public visitor tracker çalıştırılmıyor,
   - Realtime status/error yakalanıyor,
   - bağlantı hatası admin ekranını çökertmiyor.

Yeni SQL migration gerekmez.
V8 veritabanı kolon migration'ı daha önce çalıştırılmış olmalıdır.
