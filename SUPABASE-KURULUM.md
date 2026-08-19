# Supabase Tam Kurulum

1. Supabase'de yeni proje aç.
2. Dashboard > SQL Editor bölümünde `supabase/setup.sql` dosyasının tamamını çalıştır.
3. Authentication > Users > Add user ile admin e-posta/şifreni oluştur.
4. SQL Editor'da şu sorguyu kendi e-postanla çalıştır:

```sql
insert into public.admin_profiles(user_id,email,role)
select id,email,'admin' from auth.users
where email='SENIN-ADMIN-EMAILIN@example.com'
on conflict(user_id) do update set email=excluded.email,role='admin';
```

5. Project URL ve publishable/anon key değerlerini al. Proje kökünde `.env` oluştur:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxxxxx
```

**Service role key'i frontend'e koyma.**

6. Çalıştır:

```bash
npm install
npm run dev
```

Admin adresi: `http://localhost:5173/#admin`

## Vercel
Vercel > Project > Settings > Environment Variables içine:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

ekle ve yeniden deploy et.

## Bu sürümde
- CMS içeriği: PostgreSQL `site_content`
- Talepler: PostgreSQL `requests`
- Logo/banner/görseller: Storage `site-assets`
- Admin giriş: Supabase Auth
- Yetki: `admin_profiles` + RLS

Vatandaşlar talep ekleyebilir fakat talepleri listeleyemez. CMS düzenleme, talepleri görme/güncelleme ve görsel yükleme yalnızca admin hesabına açıktır.


## V7'ye V6'dan geçiyorsan

Supabase Dashboard → SQL Editor → New query bölümünde bir kez:

`supabase/v7-migration.sql`

dosyasını çalıştır.

Bu migration:
- `request_expiry` kolonunu ekler,
- yeni taleplerde talep kodunu 18 hane olarak doğrular,
- AA/YY alanını `12/26` formatında doğrular.

Sonra Vercel'e V7 kodunu deploy et.


## V8 güncellemesi

V7 kurulu mevcut Supabase projesinde `supabase/v8-migration.sql` dosyasını SQL Editor'da bir kez çalıştır.

Bu işlem `six_digit_code` alanını ekler ve yeni taleplerde tam 6 rakam olmasını zorunlu tutar.
