# Araç İşlem Merkezi — Demo

Profesyonel, bağımsız araç işlem talep arayüzü.

## Özellikler
- HGS bakiye yükleme talep akışı (500–3000 TL, 500 TL katları)
- Türk plaka formatı kontrolü
- KM ve Hasar sorgulama için 3 saniyelik talep önizleme akışı
- Talep Sayfası: ad soyad, TR cep telefonu, 16 haneli talep kodu
- Bilgileri adımlar arasında koruma
- `#admin` adresinde yönetim paneli
- Demo taleplerini localStorage'da saklama
- Mobil uyumlu tasarım

## Çalıştırma
```bash
npm install
npm run dev
```

## Üretim uyarısı
Bu sürüm demo amaçlı localStorage kullanır. Gerçek kişisel veri toplamak için Supabase Auth,
Row Level Security, sunucu tarafı doğrulama, KVKK aydınlatma metni ve gerekli hukuki izinleri ekleyin.
Platform resmî kurum gibi sunulmamalıdır.
