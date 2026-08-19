# V9.2 Sabit Sorgulama Ücretleri

- KM Sorgulama: 125 TL
- Hasar Sorgulama: 90 TL
- HGS: Kullanıcının seçtiği yükleme tutarı

KM ve Hasar ücretleri:
- hizmet kartında görünür,
- plaka/sorgulama ekranında görünür,
- Talep Sayfası özet kartında görünür,
- Supabase `requests.amount` alanına kaydedilir,
- Admin Talepler tablosunda Tutar sütununda görünür.

Admin > Site İçeriği > Hizmet Kartları bölümünden KM ve Hasar sabit tutarları sonradan değiştirilebilir.

Yeni SQL migration gerekmez; mevcut `amount` kolonu kullanılır.
